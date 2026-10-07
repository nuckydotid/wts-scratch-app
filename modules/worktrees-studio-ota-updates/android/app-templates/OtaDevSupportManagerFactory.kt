package expo.modules.worktreesstudiootaupdates

import android.content.Context
import com.facebook.react.common.SurfaceDelegateFactory
import com.facebook.react.common.build.ReactBuildConfig
import com.facebook.react.devsupport.DevSupportManagerFactory
import com.facebook.react.devsupport.ReactInstanceDevHelper
import com.facebook.react.devsupport.interfaces.DevBundleDownloadListener
import com.facebook.react.devsupport.interfaces.DevLoadingViewManager
import com.facebook.react.devsupport.interfaces.DevSupportManager
import com.facebook.react.devsupport.interfaces.PausedInDebuggerOverlayManager
import com.facebook.react.devsupport.interfaces.RedBoxHandler
import com.facebook.react.packagerconnection.RequestHandler

/**
 * Release builds use [OtaAwareReleaseDevSupportManager] so OTA reload can set [bundleFilePath].
 * Debug builds delegate to RN's default factory via reflection (internal classes are not importable).
 */
class OtaDevSupportManagerFactory : DevSupportManagerFactory {
  private val defaultFactory: DevSupportManagerFactory by lazy {
    val clazz = Class.forName("com.facebook.react.devsupport.DefaultDevSupportManagerFactory")
    clazz.getDeclaredConstructor().newInstance() as DevSupportManagerFactory
  }

  @Suppress("DEPRECATION")
  override fun create(
    applicationContext: Context,
    reactInstanceManagerHelper: ReactInstanceDevHelper,
    packagerPathForJSBundleName: String?,
    enableOnCreate: Boolean,
    redBoxHandler: RedBoxHandler?,
    devBundleDownloadListener: DevBundleDownloadListener?,
    minNumShakes: Int,
    customPackagerCommandHandlers: Map<String, RequestHandler>?,
    surfaceDelegateFactory: SurfaceDelegateFactory?,
    devLoadingViewManager: DevLoadingViewManager?,
    pausedInDebuggerOverlayManager: PausedInDebuggerOverlayManager?,
  ): DevSupportManager {
    if (!enableOnCreate) {
      return OtaAwareReleaseDevSupportManager()
    }
    return defaultFactory.create(
      applicationContext,
      reactInstanceManagerHelper,
      packagerPathForJSBundleName,
      enableOnCreate,
      redBoxHandler,
      devBundleDownloadListener,
      minNumShakes,
      customPackagerCommandHandlers,
      surfaceDelegateFactory,
      devLoadingViewManager,
      pausedInDebuggerOverlayManager,
    )
  }

  override fun create(
    applicationContext: Context,
    reactInstanceManagerHelper: ReactInstanceDevHelper,
    packagerPathForJSBundleName: String?,
    enableOnCreate: Boolean,
    redBoxHandler: RedBoxHandler?,
    devBundleDownloadListener: DevBundleDownloadListener?,
    minNumShakes: Int,
    customPackagerCommandHandlers: Map<String, RequestHandler>?,
    surfaceDelegateFactory: SurfaceDelegateFactory?,
    devLoadingViewManager: DevLoadingViewManager?,
    pausedInDebuggerOverlayManager: PausedInDebuggerOverlayManager?,
    useDevSupport: Boolean,
  ): DevSupportManager {
    if (ReactBuildConfig.UNSTABLE_ENABLE_FUSEBOX_RELEASE) {
      return instantiateDevSupportManager(
        "com.facebook.react.devsupport.PerftestDevSupportManager",
        applicationContext,
      )
    }
    if (useDevSupport) {
      return defaultFactory.create(
        applicationContext,
        reactInstanceManagerHelper,
        packagerPathForJSBundleName,
        enableOnCreate,
        redBoxHandler,
        devBundleDownloadListener,
        minNumShakes,
        customPackagerCommandHandlers,
        surfaceDelegateFactory,
        devLoadingViewManager,
        pausedInDebuggerOverlayManager,
        useDevSupport,
      )
    }
    return OtaAwareReleaseDevSupportManager()
  }

  private fun instantiateDevSupportManager(
    className: String,
    applicationContext: Context,
  ): DevSupportManager {
    return try {
      val clazz = Class.forName(className)
      val ctor = clazz.getConstructor(Context::class.java)
      ctor.newInstance(applicationContext) as DevSupportManager
    } catch (_: Exception) {
      OtaAwareReleaseDevSupportManager()
    }
  }
}
