package expo.modules.worktreesstudiootaupdates

import android.content.Context
import android.util.Log
import com.facebook.react.ReactHost
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.ReactPackage
import com.facebook.react.ReactPackageTurboModuleManagerDelegate
import com.facebook.react.bridge.JSBundleLoader
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.annotations.UnstableReactNativeAPI
import com.facebook.react.common.build.ReactBuildConfig
import com.facebook.react.defaults.DefaultComponentsRegistry
import com.facebook.react.defaults.DefaultTurboModuleManagerDelegate
import com.facebook.react.fabric.ComponentFactory
import com.facebook.react.runtime.BindingsInstaller
import com.facebook.react.runtime.JSRuntimeFactory
import com.facebook.react.runtime.ReactHostDelegate
import com.facebook.react.runtime.ReactHostImpl
import com.facebook.react.runtime.hermes.HermesInstance
import expo.modules.ExpoModulesPackage
import expo.modules.core.interfaces.ReactNativeHostHandler
import java.lang.ref.WeakReference

/** Expo [expo.modules.ExpoReactHostFactory] fork with [OtaDevSupportManagerFactory] for release OTA reload. */
object WorktreesStudioExpoReactHostFactory {
  private const val TAG = "WorktreesStudioExpoReactHostFactory"

  private var reactHost: ReactHost? = null

  @UnstableReactNativeAPI
  private class WorktreesStudioReactHostDelegate(
    private val weakContext: WeakReference<Context>,
    private val packageList: List<ReactPackage>,
    override val jsMainModulePath: String,
    private val jsBundleAssetPath: String?,
    private val jsBundleFilePath: String? = null,
    private val useDevSupport: Boolean,
    override val bindingsInstaller: BindingsInstaller? = null,
    override val turboModuleManagerDelegateBuilder: ReactPackageTurboModuleManagerDelegate.Builder =
      DefaultTurboModuleManagerDelegate.Builder(),
    private val hostHandlers: List<ReactNativeHostHandler>,
  ) : ReactHostDelegate {

    val hostDelegateJsBundleFilePath: String?
      get() =
        hostHandlers.asSequence()
          .mapNotNull { it.getJSBundleFile(useDevSupport) }
          .firstOrNull() ?: jsBundleFilePath

    val hostDelegateJSBundleAssetPath: String?
      get() =
        hostHandlers.asSequence()
          .mapNotNull { it.getBundleAssetName(useDevSupport) }
          .firstOrNull() ?: jsBundleAssetPath

    val hostDelegateUseDeveloperSupport: Boolean
      get() =
        hostHandlers.asSequence()
          .mapNotNull { it.useDeveloperSupport }
          .firstOrNull() ?: useDevSupport

    private fun resolveJsPathAtLoadTime(context: Context): String? {
      hostDelegateJsBundleFilePath?.trim()?.takeIf { it.isNotEmpty() }?.let { return it }
      return OtaBundleLoader.mountOtaSessionForColdStart(context)
    }

    private var _jsBundleLoader: JSBundleLoader? = null
    override val jsBundleLoader: JSBundleLoader
      get() {
        val backingJSBundleLoader = _jsBundleLoader
        if (backingJSBundleLoader != null) {
          return backingJSBundleLoader
        }
        val context = weakContext.get()
          ?: throw IllegalStateException("Unable to get concrete Context")
        val jsBundleFile = resolveJsPathAtLoadTime(context)
        if (jsBundleFile != null) {
          if (jsBundleFile.startsWith("assets://")) {
            return JSBundleLoader.createAssetLoader(context, jsBundleFile, true)
          }
          Log.i(TAG, "Loading JS bundle from OTA file: $jsBundleFile")
          return JSBundleLoader.createFileLoader(jsBundleFile)
        }

        return JSBundleLoader.createAssetLoader(context, "assets://$hostDelegateJSBundleAssetPath", true)
      }

    override val jsRuntimeFactory: JSRuntimeFactory
      get() = HermesInstance()

    override val reactPackages: List<ReactPackage>
      get() = packageList

    override fun handleInstanceException(error: Exception) {
      // Never throw from JNI — ReactHostImpl.handleHostException has no try-catch around us.
      Log.e(TAG, "ReactInstance exception: ${error.message}", error)
      val context = weakContext.get()
      if (context != null) {
        val bundleId = OtaBundleLoader.getCommittedBundleId(context)
        if (bundleId > 0L) {
          Log.e(TAG, "OTA bundle $bundleId crashed in ReactInstance! Initiating automatic rollback to embedded bundle...")
          OtaBundleLoader.recordFailedBundle(context, bundleId)
          OtaBundleLoader.clearCommittedBundleAndAssets(context)
          OtaBundleLoader.hideSplashScreenFallback()
          try {
            reactHost?.devSupportManager?.bundleFilePath = null
            reactHost?.reload("OTA crash self-healing fallback")
          } catch (re: Exception) {
            Log.e(TAG, "Failed to reload ReactHost after OTA crash", re)
          }
        }
      }
      if (hostHandlers.isEmpty()) {
        return
      }
      hostHandlers.forEach { handler ->
        try {
          handler.onReactInstanceException(hostDelegateUseDeveloperSupport, error)
        } catch (e: Exception) {
          Log.e(TAG, "Host handler threw in onReactInstanceException", e)
        }
      }
    }
  }

  private fun resolveOtaJsPathForDevSupport(context: Context, jsBundleFilePath: String?): String? {
    return jsBundleFilePath?.trim()?.takeIf { it.isNotEmpty() }
      ?: OtaBundleLoader.mountOtaSessionForColdStart(context)
  }

  private fun syncOtaBundlePathToDevSupport(host: ReactHostImpl, path: String?) {
    val filePath = path?.trim()?.takeIf { it.isNotEmpty() && !it.startsWith("assets://") }
    host.devSupportManager?.bundleFilePath = filePath
    if (filePath != null) {
      Log.i(TAG, "Synced OTA bundle path for ReactHost load: $filePath")
    }
  }

  @OptIn(UnstableReactNativeAPI::class)
  @JvmStatic
  fun getDefaultReactHost(
    context: Context,
    packageList: List<ReactPackage>,
    jsMainModulePath: String = ".expo/.virtual-metro-entry",
    jsBundleAssetPath: String = "index.android.bundle",
    jsBundleFilePath: String? = null,
    jsRuntimeFactory: JSRuntimeFactory? = null,
    useDevSupport: Boolean = ReactBuildConfig.DEBUG,
    bindingsInstaller: BindingsInstaller? = null,
  ): ReactHost {
    reactHost?.let { return it }

    val otaJsPath = resolveOtaJsPathForDevSupport(context, jsBundleFilePath)
    val hostHandlers =
      ExpoModulesPackage.packageList.flatMap { it.createReactNativeHostHandlers(context) }

    val reactHostDelegate =
      WorktreesStudioReactHostDelegate(
        WeakReference(context),
        packageList,
        jsMainModulePath,
        jsBundleAssetPath,
        jsBundleFilePath,
        useDevSupport,
        bindingsInstaller,
        hostHandlers = hostHandlers,
      )
    val componentFactory = ComponentFactory()
    DefaultComponentsRegistry.register(componentFactory)

    hostHandlers.forEach { handler ->
      handler.onWillCreateReactInstance(useDevSupport)
    }

    val reactHostImpl =
      ReactHostImpl(
        context = context,
        reactHostDelegate = reactHostDelegate,
        componentFactory = componentFactory,
        allowPackagerServerAccess = true,
        useDevSupport = useDevSupport,
        devSupportManagerFactory = OtaDevSupportManagerFactory(),
      )

    hostHandlers.forEach { handler ->
      handler.onDidCreateReactHost(context, reactHostImpl)
      handler.onDidCreateDevSupportManager(reactHostImpl.devSupportManager)
    }

    reactHostImpl.addReactInstanceEventListener(
      object : ReactInstanceEventListener {
        override fun onReactContextInitialized(context: ReactContext) {
          OtaBundleLoader.hideSplashScreenFallback()
          OtaBundleLoader.markStartupSuccess(context)
          hostHandlers.forEach { handler ->
            handler.onDidCreateReactInstance(useDevSupport, context)
          }
        }
      },
    )

    syncOtaBundlePathToDevSupport(reactHostImpl, otaJsPath)
    reactHost = reactHostImpl
    return reactHostImpl
  }
}
