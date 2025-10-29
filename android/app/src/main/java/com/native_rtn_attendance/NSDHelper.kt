package com.native_rtn_attendance

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import androidx.core.content.getSystemService
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class NSDHelper(context: Context) {
    companion object {
        private const val TAG = "NSDHelper"
        private const val SHUTDOWN_TIMEOUT_SECONDS = 5L
    }

    private val nsd: NsdManager = context.getSystemService(Context.NSD_SERVICE) as? NsdManager?: throw IllegalStateException("NSD service not available")
    private val lock = Any()
    private var regListener: NsdManager.RegistrationListener ?= null
    private var disListener: NsdManager.DiscoveryListener ?= null
    private val activeCallback = mutableSetOf<NsdManager.ServiceInfoCallback>()
    private val resolveExecutor: ExecutorService by lazy { Executors.newSingleThreadExecutor() }

    fun normalizeType(type: String): String {
        require(type.isNotBlank()) { "Service type cannot be blank" }
        return if (type.endsWith(".")) type else "$type."
    }

    private fun mapNsdError(errorCode: Int): String {
        return when (errorCode) {
            NsdManager.FAILURE_ALREADY_ACTIVE -> "FAILURE_ALREADY_ACTIVE"
            NsdManager.FAILURE_INTERNAL_ERROR -> "FAILURE_INTERNAL_ERROR"
            NsdManager.FAILURE_MAX_LIMIT -> "FAILURE_MAX_LIMIT"
            else -> "UNKNOWN_ERROR: $errorCode"
        }
    }

    fun register(serviceName: String, serviceType: String, port: Int, onRegistered: (String) -> Unit, onError: (String) -> Unit) {
        synchronized(lock) {
            if (regListener != null) {
                runCatching { nsd.unregisterService(regListener) }
            }
            val info = NsdServiceInfo().apply {
                this.serviceName = serviceName
                this.serviceType = normalizeType(serviceType)
                this.port = port
            }
            regListener = object : NsdManager.RegistrationListener {
                override fun onServiceRegistered(serviceInfo: NsdServiceInfo?) {
                    onRegistered(serviceInfo!!.serviceName)
                }

                override fun onRegistrationFailed(serviceInfo: NsdServiceInfo?, errorCode: Int) {
                    onError("Registration failed: ${mapNsdError(errorCode)}")
                }

                override fun onServiceUnregistered(serviceInfo: NsdServiceInfo?) {
                }

                override fun onUnregistrationFailed(serviceInfo: NsdServiceInfo?, errorCode: Int) {
                    onError("Unregistration failed: ${mapNsdError(errorCode)}")
                }
            }
            try {
                nsd.registerService(info, NsdManager.PROTOCOL_DNS_SD, regListener)
            } catch (e: Exception) {
                onError("Exception during registration: ${e.message}")
            }
        }
    }

    fun unregister() {
        synchronized(lock) {
            regListener?.let { runCatching { nsd.unregisterService(it) } }
            regListener = null
        }
    }

    fun discover(serviceType: String, onFound: (NsdServiceInfo) -> Unit, onLost: (NsdServiceInfo) -> Unit, onError: (String) -> Unit) {
        synchronized(lock) {
            if (disListener != null) {
                runCatching { nsd.stopServiceDiscovery(disListener) }
            }
            val type = normalizeType(serviceType)
            disListener = object : NsdManager.DiscoveryListener {
                override fun onDiscoveryStarted(serviceType: String?) {}

                override fun onServiceFound(serviceInfo: NsdServiceInfo?) {
                    serviceInfo?.let { onFound(it) }
                }

                override fun onServiceLost(serviceInfo: NsdServiceInfo?) {
                    serviceInfo?.let { onLost(it) }
                }

                override fun onDiscoveryStopped(serviceType: String?) {
                }

                override fun onStartDiscoveryFailed(serviceType: String?, errorCode: Int) {
                    onError("START_DISCOVERY_FAILED: ${mapNsdError(errorCode)}")
                }

                override fun onStopDiscoveryFailed(serviceType: String?, errorCode: Int) {
                    onError("STOP_DISCOVERY_FAILED: ${mapNsdError(errorCode)}")
                }
            }
            try {
                nsd.discoverServices(type, NsdManager.PROTOCOL_DNS_SD, disListener)
            } catch (e: Exception) {
                onError("START_DISCOVERY_FAILED: ${e.message}")
            }
        }
    }

    fun stopDiscovery() {
        synchronized(lock) {
            disListener?.let { runCatching { nsd.stopServiceDiscovery(it) } }
            disListener = null
        }
    }

    fun resolve(serviceInfo: NsdServiceInfo?, onResolved: (NsdServiceInfo) -> Unit, onError: (String) -> Unit) {
        if (serviceInfo == null) {
            onError("ServiceInfo is null")
            return
        }
        synchronized(lock) {
            activeCallback.forEach { runCatching { nsd.unregisterServiceInfoCallback(it) } }
            activeCallback.clear()

            val sdk = android.os.Build.VERSION.SDK_INT
            if (sdk >= 34) {
                val cb = object : NsdManager.ServiceInfoCallback {
                    override fun onServiceInfoCallbackRegistrationFailed(errorCode: Int) {
                        onError("RESOLVE_FAILED: ${mapNsdError(errorCode)}")
                        synchronized(lock) { activeCallback.remove(this) }
                    }

                    override fun onServiceInfoCallbackUnregistered() {
                        synchronized(lock) { activeCallback.remove(this) }
                    }

                    override fun onServiceUpdated(serviceInfo: NsdServiceInfo) {
                        if (serviceInfo.hostAddresses.isEmpty()) {
                            onError("RESOLVE_FAILED: No host addresses found")
                            synchronized(lock) { activeCallback.remove(this) }
                            return
                        }
                        onResolved(serviceInfo)
                        synchronized(lock) { activeCallback.remove(this) }
                    }

                    override fun onServiceLost() {
                        onError("RESOLVE_FAILED: SERVICE_LOST")
                        synchronized(lock) { activeCallback.remove(this) }
                    }
                }
                activeCallback.add(cb)
                try {
                    nsd.registerServiceInfoCallback(serviceInfo, resolveExecutor, cb)
                } catch (e: Exception) {
                    onError("RESOLVE_FAILED: ${e.message}")
                    synchronized(lock) { activeCallback.remove(cb) }
                }
            } else {
                val resolveListener =  object : NsdManager.ResolveListener {
                    override fun onResolveFailed(serviceInfo: NsdServiceInfo?, errorCode: Int) {
                        onError("RESOLVE_FAILED: ${mapNsdError(errorCode)}")
                    }

                    override fun onServiceResolved(serviceInfo: NsdServiceInfo) {
                        if (serviceInfo.host == null) {
                            onError("RESOLVE_FAILED: No host address found")
                            return
                        }
                        onResolved(serviceInfo)
                    }
                }
                @Suppress("DEPRECATION")
                try {
                    nsd.resolveService(serviceInfo, resolveListener)
                } catch (e: Exception) {
                    onError("RESOLVE_FAILED: ${e.message}")
                }
            }
        }
    }

    fun shutdown() {
        synchronized(lock) {
            unregister()
            stopDiscovery()
            activeCallback.forEach { runCatching { nsd.unregisterServiceInfoCallback(it) } }
            activeCallback.clear()
            runCatching {
                resolveExecutor.shutdown()
                if (!resolveExecutor.awaitTermination(SHUTDOWN_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
                    resolveExecutor.shutdownNow()
                }
            }
        }
    }
}