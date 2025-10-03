package com.native_rtn_attendance

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo

class NSDHelper(context: Context) {
    private val nsd = context.getSystemService(Context.NSD_SERVICE) as NsdManager
    private var regListener: NsdManager.RegistrationListener? = null
    private var disListener: NsdManager.DiscoveryListener? = null

    fun normalizeType(type: String): String {
        val t = type.trim()
        val withDot = if (t.endsWith(".")) t else "$t."
        return withDot
    }

    fun register(serviceName: String, serviceType: String, port: Int, onRegistered: (String) -> Unit, onError: (String) -> Unit) {
        val info = NsdServiceInfo().apply {
            this.serviceName = serviceName
            this.serviceType = normalizeType(serviceType)
            this.port = port
        }

        regListener = object : NsdManager.RegistrationListener {
            override fun onServiceRegistered(serviceInfo: NsdServiceInfo?) = onRegistered(serviceInfo!!.serviceName)
            override fun onRegistrationFailed(serviceInfo: NsdServiceInfo?, errorCode: Int) = onError("REG_FAILED: $errorCode")
            override fun onServiceUnregistered(serviceInfo: NsdServiceInfo?) {}
            override fun onUnregistrationFailed(serviceInfo: NsdServiceInfo?, errorCode: Int) = onError("UNREG_FAILED: $errorCode")
        }

        nsd.registerService(info, NsdManager.PROTOCOL_DNS_SD, regListener)
    }

    fun unregister() {
        regListener?.let { runCatching { nsd.unregisterService(it) } }
        regListener = null
    }

    fun discover(serviceType: String, onFound: (NsdServiceInfo) -> Unit, onLost: (NsdServiceInfo) -> Unit, onError: (String) -> Unit) {
        val type = if (serviceType.endsWith(".")) serviceType else "$serviceType."
        disListener = object : NsdManager.DiscoveryListener {
            override fun onDiscoveryStarted(serviceType: String?) {}
            override fun onServiceFound(serviceInfo: NsdServiceInfo?) { serviceInfo?.let { onFound(it) } }
            override fun onServiceLost(serviceInfo: NsdServiceInfo?) { serviceInfo?.let { onLost(it) } }
            override fun onDiscoveryStopped(serviceType: String?) {}
            override fun onStartDiscoveryFailed(serviceType: String?, errorCode: Int) = onError("START_DISC_FAILED: $errorCode")
            override fun onStopDiscoveryFailed(serviceType: String?, errorCode: Int) = onError("STOP_DISC_FAILED: $errorCode")
        }

        nsd.discoverServices(type, NsdManager.PROTOCOL_DNS_SD, disListener)
    }

    fun stopDiscovery() {
        disListener?.let { runCatching { nsd.stopServiceDiscovery(it) } }
        disListener = null
    }

    fun resolve(serviceInfo: NsdServiceInfo?, onResolved: (NsdServiceInfo) -> Unit, onError: (String) -> Unit) {
        if (serviceInfo == null) {
            onError("RESOLVE_INPUT_NULL")
            return
        }
        val sdk = android.os.Build.VERSION.SDK_INT
        if (sdk >= 34) {
            val exec = java.util.concurrent.Executors.newSingleThreadExecutor()
            val cb = object : NsdManager.ServiceInfoCallback {
                override fun onServiceInfoCallbackRegistrationFailed(errorCode: Int) {
                    try {
                        onError("RESOLVE_FAILED: $errorCode")
                    } finally {
                        runCatching { nsd.unregisterServiceInfoCallback(this) }
                        exec.shutdown()
                    }
                }

                override fun onServiceInfoCallbackUnregistered() {}

                override fun onServiceUpdated(serviceInfo: NsdServiceInfo) {
                    try {
                        onResolved(serviceInfo)
                    } finally {
                        runCatching { nsd.unregisterServiceInfoCallback(this) }
                        exec.shutdown()
                    }
                }

                override fun onServiceLost() {
                    try {
                        onError("RESOLVE_FAILED: SERVICE_LOST")
                    } finally {
                        runCatching { nsd.unregisterServiceInfoCallback(this) }
                        exec.shutdown()
                    }
                }
            }

            try {
                nsd.registerServiceInfoCallback(serviceInfo, exec, cb)
            } catch (e: Exception) {
                onError("RESOLVE_FAILED: ${e.message}")
                runCatching { nsd.unregisterServiceInfoCallback(cb) }
                exec.shutdown()
            }
        } else {
            val resolveListener = object : NsdManager.ResolveListener {
                override fun onResolveFailed(serviceInfo: NsdServiceInfo?, errorCode: Int) {
                    onError("RESOLVE_FAILED: $errorCode")
                }
                override fun onServiceResolved(serviceInfo: NsdServiceInfo) {
                    onResolved(serviceInfo)
                }
            }
            @Suppress("DEPRECATION")
            nsd.resolveService(serviceInfo, resolveListener)
        }
    }
}