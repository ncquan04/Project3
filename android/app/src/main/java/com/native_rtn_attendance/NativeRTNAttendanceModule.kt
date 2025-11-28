package com.native_rtn_attendance

import android.net.nsd.NsdServiceInfo
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.Inet4Address
import java.net.NetworkInterface
import java.net.ServerSocket
import java.net.Socket
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class NativeRTNAttendanceModule(
    reactContext: ReactApplicationContext
) : NativeRTNAttendanceSpec(reactContext) {
    companion object {
        const val NAME = "NativeRTNAttendance"
        private const val TAG = "NativeRTNAttendance"
        private const val SHUTDOWN_TIMEOUT_SECONDS = 5L
        const val SERVICE_TYPE = "_rtnattendance._tcp."
    }

    override fun getName() = NAME

    private val nsd = NSDHelper(reactContext)
    private var serverSocket: ServerSocket? = null
    private val serverPool = Executors.newCachedThreadPool()
    
    // Multi-client support
    private data class ClientConnection(
        val socket: Socket,
        val writer: PrintWriter,
        val reader: BufferedReader,
        val connectedAt: Long = System.currentTimeMillis()
    )
    
    private val connectedClients = ConcurrentHashMap<String, ClientConnection>()
    private val clientsLock = Any()
    
    // Single client for outgoing connections (when acting as client)
    private val clientLock = Any()
    private var clientSocket: Socket? = null
    private var clientReader: BufferedReader? = null
    private var clientWriter: PrintWriter? = null
    
    private var sessionSecret: String? = null
    private var registeredServiceName: String? = null
    private val foundServices = ConcurrentHashMap<String, NsdServiceInfo>()
    
    private var discoveryPromise: Promise? = null
    private var discoveryTimeoutRunnable: Runnable? = null
    private val discoveryHandler = Handler(Looper.getMainLooper())

    private fun svcKey(name: String, type: String) = "${name}|${nsd.normalizeType(type)}"
    private fun svcKey(info: NsdServiceInfo) = svcKey(info.serviceName, info.serviceType)

    private fun getLocalIPv4(): String {
        try {
            val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
            for (iface in interfaces) {
                if (!iface.isUp || iface.isLoopback) continue
                val addresses = Collections.list(iface.inetAddresses)
                for (addr in addresses) {
                    val host = addr.hostAddress ?: continue
                    if (!host.contains(":") && addr.isSiteLocalAddress) return host
                }
            }
            Log.w(TAG, "No site-local IPv4 address found, falling back to localhost")
            return "127.0.0.1"
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get local IPv4 address", e)
            return "127.0.0.1"
        }
    }

    private fun closeClientConnection() {
        synchronized(clientLock) {
            runCatching { clientWriter?.close() }
            runCatching { clientReader?.close() }
            runCatching { clientSocket?.close() }
            clientWriter = null
            clientReader = null
            clientSocket = null
        }
    }
    
    private fun closeServerClientConnection(clientId: String) {
        val conn = synchronized(clientsLock) {
            connectedClients.remove(clientId)
        }
        
        conn?.let {
            runCatching { it.writer.close() }
            runCatching { it.reader.close() }
            runCatching { it.socket.close() }
            Log.d(TAG, "Closed connection for client: $clientId (Total clients: ${connectedClients.size})")
        }
    }
    
    private fun closeAllServerConnections() {
        val clientsToClose = synchronized(clientsLock) {
            val clients = connectedClients.toMap()
            connectedClients.clear()
            clients
        }
        
        clientsToClose.forEach { (clientId, conn) ->
            runCatching { conn.writer.close() }
            runCatching { conn.reader.close() }
            runCatching { conn.socket.close() }
            Log.d(TAG, "Closed connection for client: $clientId")
        }
        
        Log.d(TAG, "Closed all client connections (${clientsToClose.size} total)")
    }

    override fun setSessionSecret(sessionSecret: String?) {
        this.sessionSecret = sessionSecret
    }

    override fun startServer(promise: Promise) {
        try {
            if (serverSocket?.isClosed == false) {
                promise.resolve(Arguments.createMap().apply {
                    putString("ip", getLocalIPv4())
                    putInt("port", serverSocket!!.localPort)
                    putString("status", "already_running")
                })
                return
            }

            val ss = ServerSocket(0).apply { reuseAddress = true }
            serverSocket = ss
            serverPool.execute {
                try {
                    while (!ss.isClosed) {
                        val sock = ss.accept()
                        val clientId = "${sock.inetAddress.hostAddress}:${sock.port}"
                        
                        try {
                            val writer = PrintWriter(sock.getOutputStream(), true)
                            val reader = BufferedReader(InputStreamReader(sock.getInputStream()))
                            val connection = ClientConnection(sock, writer, reader)
                            
                            val totalClients = synchronized(clientsLock) {
                                connectedClients[clientId] = connection
                                connectedClients.size
                            }
                            
                            Log.d(TAG, "New client connected: $clientId (Total: $totalClients)")
                            serverPool.execute { handleClient(clientId, connection) }
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to setup client connection: $clientId", e)
                            runCatching { sock.close() }
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Server loop terminated", e)
                    closeAllServerConnections()
                } finally {
                    // Ensure serverSocket reference is cleared if loop exits
                    if (serverSocket == ss) {
                        serverSocket = null
                    }
                }
            }
            promise.resolve(Arguments.createMap().apply {
                putString("ip", getLocalIPv4())
                putInt("port", ss.localPort)
                putString("status", "started")
            })
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start server", e)
            promise.reject("START_SERVER_FAILED", "Failed to start server: ${e.message}", e)
        }
    }

    private fun handleClient(clientId: String, connection: ClientConnection) {
        try {
            while (connection.socket.isConnected && !connection.socket.isClosed) {
                val line = connection.reader.readLine() ?: break
                
                // Validate session secret if set
                val secret = sessionSecret
                if (secret != null) {
                    if (!line.startsWith("AUTH:$secret:")) {
                        Log.w(TAG, "Invalid session secret from $clientId: ${line.take(20)}...")
                        continue
                    }
                }
                
                Log.d(TAG, "Message from $clientId: $line")
            }
        } catch (e: Exception) {
            Log.w(TAG, "Client $clientId disconnected or error occurred", e)
        } finally {
            closeServerClientConnection(clientId)
        }
    }

    override fun stopServer(promise: Promise) {
        try {
            val clientCount = connectedClients.size
            closeAllServerConnections()
            serverSocket?.close()
            serverSocket = null
            promise.resolve(Arguments.createMap().apply {
                putString("status", "stopped")
                putInt("disconnectedClients", clientCount)
            })
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop server", e)
            promise.reject("STOP_SERVER_FAILED", "Failed to stop server: ${e.message}", e)
        }
    }

    override fun registerService(promise: Promise) {
        val ss = serverSocket
        if (ss == null || ss.isClosed) {
            promise.reject("NO_SERVER", "Server not started")
            return
        }
        try {
            nsd.register(
                serviceName = "RTNAttendance",
                serviceType = SERVICE_TYPE,
                port = ss.localPort,
                onRegistered = { actual ->
                    registeredServiceName = actual
                    promise.resolve(Arguments.createMap().apply {
                        putString("serviceName", actual)
                        putString("status", "registered")
                    })
                },
                onError = { err ->
                    Log.e(TAG, "Failed to register service: $err")
                    promise.reject("REGISTER_FAILED", err)
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to register service", e)
            promise.reject("REGISTER_FAILED", "Failed to register service: ${e.message}", e)
        }
    }

    override fun unregisterService(promise: Promise) {
        try {
            nsd.unregister()
            registeredServiceName = null
            promise.resolve(Arguments.createMap().apply {
                putString("status", "unregistered")
            })
        } catch (e: Exception) {
            Log.e(TAG, "Failed to unregister service", e)
            promise.reject("UNREGISTER_FAILED", "Failed to unregister service: ${e.message}", e)
        }
    }

    override fun findService(timeoutMs: Double, promise: Promise) {
        try {
            if (discoveryPromise != null) {
                promise.reject("BUSY", "Discovery already in progress")
                return
            }
            
            // Cancel any pending timeout (just in case)
            discoveryTimeoutRunnable?.let { discoveryHandler.removeCallbacks(it) }
            
            discoveryPromise = promise
            val type = SERVICE_TYPE
            
            nsd.discover(
                serviceType = type,
                onFound = { serviceInfo ->
                    val p = discoveryPromise
                    if (p != null) {
                        foundServices[svcKey(serviceInfo)] = serviceInfo
                        p.resolve(Arguments.createMap().apply {
                            putString("serviceName", serviceInfo.serviceName)
                        })
                        discoveryPromise = null
                        
                        // Stop discovery and timeout
                        discoveryTimeoutRunnable?.let { discoveryHandler.removeCallbacks(it) }
                        discoveryTimeoutRunnable = null
                        runCatching { nsd.stopDiscovery() }
                    }
                },
                onLost = { serviceInfo ->
                    foundServices.remove(svcKey(serviceInfo))
                },
                onError = { err ->
                    Log.e(TAG, "Discovery error: $err")
                    val p = discoveryPromise
                    if (p != null) {
                        p.reject("DISCOVERY_ERROR", err)
                        discoveryPromise = null
                        discoveryTimeoutRunnable?.let { discoveryHandler.removeCallbacks(it) }
                        discoveryTimeoutRunnable = null
                    }
                }
            )
            
            // Schedule timeout
            discoveryTimeoutRunnable = Runnable {
                val p = discoveryPromise
                if (p != null) {
                    p.reject("TIMEOUT", "No service found within timeout")
                    discoveryPromise = null
                    runCatching { nsd.stopDiscovery() }
                }
            }
            discoveryHandler.postDelayed(discoveryTimeoutRunnable!!, timeoutMs.toLong())
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start discovery", e)
            promise.reject("START_DISCOVERY_FAILED", "Failed to start discovery: ${e.message}", e)
            discoveryPromise = null
        }
    }

    override fun stopDiscovery(promise: Promise) {
        try {
            // Cancel timeout if exists
            discoveryTimeoutRunnable?.let { 
                discoveryHandler.removeCallbacks(it)
                discoveryTimeoutRunnable = null
            }
            
            if (discoveryPromise != null) {
                discoveryPromise?.reject("CANCELLED", "Discovery stopped manually")
                discoveryPromise = null
            }
            
            nsd.stopDiscovery()
            promise.resolve(Arguments.createMap().apply {
                putString("status", "stopped")
            })
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop discovery", e)
            promise.reject("STOP_DISCOVERY_FAILED", "Failed to stop discovery: ${e.message}", e)
        }
    }

    override fun resolveAndConnect(serviceName: String, promise: Promise) {
        val entry = foundServices.entries.firstOrNull { it.key.startsWith("$serviceName|") }
        val serviceInfo = entry?.value
        if (serviceInfo == null) {
            promise.reject("NOT_FOUND", "Service not found: $serviceName")
            return
        }
        nsd.resolve(
            serviceInfo = serviceInfo,
            onResolved = { info ->
                val host = if (android.os.Build.VERSION.SDK_INT >= 34) {
                    info.hostAddresses.firstOrNull { it is Inet4Address }?.hostAddress
                        ?: info.hostAddresses.firstOrNull()?.hostAddress
                } else {
                    @Suppress("DEPRECATION")
                    info.host?.hostAddress
                } ?: run {
                    promise.reject("NO_HOST", "No valid host address found")
                    return@resolve
                }
                try {
                    val sock = Socket(host, info.port)
                    try {
                        val writer = PrintWriter(sock.getOutputStream(), true)
                        val reader = BufferedReader(InputStreamReader(sock.getInputStream()))
                        
                        synchronized(clientLock) {
                            closeClientConnection()
                            clientSocket = sock
                            clientWriter = writer
                            clientReader = reader
                        }
                        
                        promise.resolve(Arguments.createMap().apply {
                            putString("ip", host)
                            putInt("port", info.port)
                            putString("status", "connected")
                        })
                    } catch (e: Exception) {
                        // Close socket if stream creation fails
                        runCatching { sock.close() }
                        throw e
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to connect to service", e)
                    promise.reject("CONNECT_FAILED", "Failed to connect: ${e.message}", e)
                }
            },
            onError = { err ->
                Log.e(TAG, "Failed to resolve service: $err")
                promise.reject("RESOLVE_FAILED", err)
            }
        )
    }

    override fun sendCheckin(payload: String, promise: Promise) {
        synchronized(clientLock) {
            val w = clientWriter
            if (w == null || clientSocket?.isConnected != true || clientSocket?.isClosed == true) {
                promise.reject("NO_CONNECTION", "No client connected")
                return
            }
            try {
                w.println(payload)
                w.flush()
                promise.resolve(Arguments.createMap().apply {
                    putString("status", "ok")
                })
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send check-in", e)
                promise.resolve(Arguments.createMap().apply {
                    putString("status", "error")
                    putString("message", e.message ?: "Send error")
                })
            }
        }
    }

    override fun disconnect(promise: Promise) {
        try {
            synchronized(clientLock) { closeClientConnection() }
            promise.resolve(Arguments.createMap().apply {
                putString("status", "disconnected")
            })
        } catch (e: Exception) {
            Log.e(TAG, "Failed to disconnect", e)
            promise.reject("DISCONNECT_FAILED", "Failed to disconnect: ${e.message}", e)
        }
    }

    override fun invalidate() {
        super.invalidate()
        
        // Cancel discovery timeout
        discoveryTimeoutRunnable?.let { 
            discoveryHandler.removeCallbacks(it)
            discoveryTimeoutRunnable = null
        }
        
        // Reject pending promise
        discoveryPromise?.reject("INVALIDATED", "Module invalidated")
        discoveryPromise = null
        
        runCatching { nsd.stopDiscovery() }
        runCatching { nsd.unregister() }
        closeAllServerConnections()
        synchronized(clientLock) { closeClientConnection() }
        runCatching { serverSocket?.close() }
        serverSocket = null
        runCatching {
            serverPool.shutdown()
            if (!serverPool.awaitTermination(SHUTDOWN_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
                serverPool.shutdownNow()
            }
        }
    }
}