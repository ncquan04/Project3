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

class NativeRTNAttendanceModule(
    reactContext: ReactApplicationContext
) : NativeRTNAttendanceSpec(reactContext) {
    companion object {
        const val NAME = "NativeRTNAttendance"
    }

    override fun getName() = NAME

    private val nsd = NSDHelper(reactContext)
    private var serverSocket: ServerSocket? = null
    private val serverPool = Executors.newCachedThreadPool()

    @Volatile private var clientSocket: Socket? = null
    @Volatile private var clientReader: BufferedReader? = null
    @Volatile private var clientWriter: PrintWriter?= null

    private var sessionSecret: String? = null
    private var registeredServiceName: String? = null

    private val found = ConcurrentHashMap<String, NsdServiceInfo>()

    private fun svcKey(name: String, type: String) = "${name}|${nsd.normalizeType(type)}"
    private fun svcKey(info: NsdServiceInfo) = svcKey(info.serviceName, info.serviceType)

    private fun getLocalIPV4(): String {
        val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
        for (iface in interfaces) {
            if (!iface.isUp || iface.isLoopback) continue
            val address = Collections.list(iface.inetAddresses)
            for (addr in address) {
                val host = addr.hostAddress ?: continue
                if (!host.contains(":") && addr.isSiteLocalAddress) return host
            }
        }

        return "127.0.0.1"
    }

    override fun setSessionSecret(sessionSecret: String?) {
        this.sessionSecret = sessionSecret
        val m = Arguments.createMap().apply {
            putString("key", "sessionSecret")
            putString("value", "set")
        }
        emitOnKeyAdded(m)
    }

    override fun startServer(promise: Promise) {
        try {
            if (serverSocket == null || serverSocket?.isClosed == true) {
                val ss = ServerSocket(0)
                serverSocket = ss
                serverPool.execute {
                    while (!ss.isClosed) {
                        try {
                            val sock = ss.accept()
                            synchronized(this) {
                                clientSocket?.runCatching { close() }
                                clientSocket = sock
                                clientWriter = PrintWriter(sock.getOutputStream(), true)
                                clientReader = BufferedReader(InputStreamReader(sock.getInputStream()))
                            }

                            serverPool.execute {
                                try {
                                    var line: String?
                                    while (sock.isConnected && clientReader?.readLine().also { line = it } != null) {

                                    }
                                } catch (ignore: Exception) {}
                            }
                        } catch (e: Exception) {
                            break
                        }
                    }
                }
            }
            val map = Arguments.createMap().apply {
                putString("ip", getLocalIPV4())
                putInt("port", serverSocket!!.localPort)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("START_SERVER_FAILED", e)
        }
    }

    override fun stopServer(promise: Promise) {
        try {
            serverSocket?.close()
            serverSocket = null
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("STOP_SERVER_FAILED", e)
        }
    }

    override fun registerService(serviceType: String, promise: Promise) {
        val ss = serverSocket
        if (ss == null || ss.isClosed) {
            promise.reject("NO_SERVER", "Server not started")
            return
        }
        nsd.register(
            serviceName = "RTNAttendance",
            serviceType = nsd.normalizeType(serviceType),
            port = ss.localPort,
            onRegistered = { actual ->
                registeredServiceName = actual
                val m = Arguments.createMap().apply { putString("serviceName", actual) }
                promise.resolve(m)
            },
            onError = { err -> promise.reject("REGISTER_FAILED", err) }
        )
    }

    override fun unregisterService(promise: Promise) {
        try {
            nsd.unregister()
            registeredServiceName = null
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("UNREGISTER_FAILED", e)
        }
    }

    override fun startDiscovery(serviceType: String, timeoutMs: Double, promise: Promise) {
        val type = nsd.normalizeType(serviceType)
        nsd.discover(
            serviceType = type,
            onFound = { serviceInfo -> found[svcKey(serviceInfo)] = serviceInfo },
            onLost = { serviceInfo -> found.remove(svcKey(serviceInfo)) },
            onError = { err ->
                val m = Arguments.createMap().apply {
                    putString("key", "discoveryError")
                    putString("value", err)
                }
                emitOnKeyAdded(m)
            }
        )
        Handler(Looper.getMainLooper()).postDelayed(
            { runCatching { nsd.stopDiscovery() } },
            timeoutMs.toLong()
        )
        promise.resolve(null)
    }

    override fun stopDiscovery(promise: Promise) {
        try {
            nsd.stopDiscovery()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("STOP_DISCOVERY_FAILED", e)
        }
    }

    override fun resolveAndConnect(serviceName: String, promise: Promise) {
        val entry = found.entries.firstOrNull{ it.key.startsWith("$serviceName|") }
        val serviceInfo = entry?.value
        if (serviceInfo == null) {
            promise.reject("NOT_FOUND", "Service not found")
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
                } ?: "127.0.0.1"
                val port = info.port
                try {
                    val sock = Socket(host, port)
                    synchronized(this) {
                        clientSocket?.runCatching { close() }
                        clientSocket = sock
                        clientWriter = PrintWriter(sock.getOutputStream(), true)
                        clientReader = BufferedReader(InputStreamReader(sock.getInputStream()))
                    }
                    val m = Arguments.createMap().apply {
                        putString("ip", host)
                        putInt("port", port)
                    }
                    promise.resolve(m)
                } catch (e: Exception) {
                    promise.reject("CONNECT_FAILED", e)
                }
            },
            onError = { err -> promise.reject("RESOLVE_FAILED", err) }
        )
    }

    override fun sendCheckin(payload: String, promise: Promise) {
        val w = clientWriter
        if (w == null) {
            promise.reject("NO_CONNECTION", "No client connected")
            return
        }
        try {
            w.println(payload)
            w.flush()
            val ack = Arguments.createMap().apply {
                putString("status", "ok")
            }
            promise.resolve(ack)
        } catch (e: Exception) {
            val ack = Arguments.createMap().apply {
                putString("status", "error")
                putString("message", e.message ?: "Send error")
            }
            promise.resolve(ack)
        }
    }

    override fun disconnect(promise: Promise) {
        try {
            synchronized(this) {
                clientWriter?.close()
                clientReader?.close()
                clientSocket?.close()
                clientWriter = null
                clientReader = null
                clientSocket = null
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("DISCONNECT_FAILED", e)
        }
    }

    override fun invalidate() {
        super.invalidate()
        runCatching { nsd.stopDiscovery() }
        runCatching { nsd.unregister() }
        runCatching { clientSocket?.close() }
        runCatching { clientWriter?.close() }
        runCatching { clientReader?.close() }
        runCatching { serverSocket?.close() }
        serverPool.shutdown()
    }
}
