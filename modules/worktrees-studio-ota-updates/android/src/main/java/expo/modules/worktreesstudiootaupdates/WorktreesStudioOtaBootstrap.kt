package expo.modules.worktreesstudiootaupdates

import android.app.Application
import android.util.Log

/** OTA-specific Application.onCreate hooks; React bootstrap stays in MainApplication. */
object WorktreesStudioOtaBootstrap {
  private const val TAG = "WorktreesStudioOtaBootstrap"

  fun configureOta(application: Application) {
    // Brownfield parity: WebView/CookieManager must init while Application still serves
    // APK resources. OTA getResources() override breaks Chromium ICU if CookieManager
    // is first touched after OTA assets mount (OkHttp → ForwardingCookieHandler crash).
    warmUpWebViewCookieManager()
    OtaManager.apiUrl = readBuildConfigString(application, "OTA_API_URL")
    OtaManager.appKey = readBuildConfigString(application, "OTA_APP_KEY")
    OtaManager.otaEnabled = !readBuildConfigBoolean(application, "DEBUG")
    OtaBundleLoader.onApplicationCreate(application)
  }

  private fun warmUpWebViewCookieManager() {
    try {
      android.webkit.CookieManager.getInstance()
      Log.i(TAG, "CookieManager warmed up before OTA asset mount")
    } catch (e: Exception) {
      Log.w(TAG, "Failed to initialize CookieManager before OTA mount", e)
    }
  }

  fun logColdStartIfReady(application: Application) {
    if (OtaManager.otaEnabled && OtaBundleLoader.isOtaColdStartReady(application)) {
      OtaBundleLoader.logColdStartState(application)
    } else if (OtaManager.otaEnabled && OtaBundleLoader.getCommittedBundleId(application) > 0) {
      Log.w(TAG, "Committed OTA bundle present but cold start mount not ready")
    }
  }

  private fun readBuildConfigString(application: Application, fieldName: String): String {
    return try {
      val buildConfigClass = Class.forName("${application.packageName}.BuildConfig")
      val field = buildConfigClass.getField(fieldName)
      field.get(null)?.toString()?.trim().orEmpty()
    } catch (_: Exception) {
      ""
    }
  }

  private fun readBuildConfigBoolean(application: Application, fieldName: String): Boolean {
    return try {
      val buildConfigClass = Class.forName("${application.packageName}.BuildConfig")
      val field = buildConfigClass.getField(fieldName)
      field.getBoolean(null)
    } catch (_: Exception) {
      false
    }
  }
}
