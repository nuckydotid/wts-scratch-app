package expo.modules.worktreesstudiootaupdates

import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability

class DownloadUpdateOptions : Record {
  @Field
  val zipUrl: String = ""

  @Field
  val bundleId: Double = 0.0

  @Field
  val zipSize: Double = 0.0

  @Field
  val zipSha256: String = ""
}

class WorktreesStudioOtaUpdatesModule : Module() {
  private val mainHandler = Handler(Looper.getMainLooper())

  private val context
    get() = appContext.reactContext ?: throw Exceptions.AppContextLost()

  override fun definition() = ModuleDefinition {
    Name("WorktreesStudioOtaUpdates")

    Events("downloadProgress")

    OnCreate {
      try {
        val appInfo = context.applicationContext.packageManager.getApplicationInfo(
          context.applicationContext.packageName,
          android.content.pm.PackageManager.GET_META_DATA,
        )
        val meta = appInfo.metaData
        OtaManager.appKey =
          meta?.getString(META_OTA_APP_KEY)?.trim().orEmpty().ifBlank {
            readBuildConfigString("OTA_APP_KEY")
          }
        OtaManager.apiUrl =
          meta?.getString(META_API_URL)?.trim().orEmpty().ifBlank {
            readBuildConfigString("OTA_API_URL")
          }
        OtaManager.otaEnabled = !readBuildConfigBoolean("DEBUG")
      } catch (_: Exception) {
        // reactContext may not be ready on first launch.
        // Bootstrap (configureOta) already set initial values.
      }
    }

    AsyncFunction("getRuntimeConfig") {
      // Safety re-read matching iOS configureFromBundle in getRuntimeConfig
      try {
        val appInfo = context.applicationContext.packageManager.getApplicationInfo(
          context.applicationContext.packageName,
          android.content.pm.PackageManager.GET_META_DATA,
        )
        val meta = appInfo.metaData
        OtaManager.otaEnabled = !readBuildConfigBoolean("DEBUG")
        OtaManager.apiUrl = meta?.getString(META_API_URL)?.trim().orEmpty().ifBlank {
          readBuildConfigString("OTA_API_URL")
        }
        OtaManager.appKey = meta?.getString(META_OTA_APP_KEY)?.trim().orEmpty().ifBlank {
          readBuildConfigString("OTA_APP_KEY")
        }
      } catch (_: Exception) { /* keep values from bootstrap/OnCreate */ }

      val otaManager = OtaManager(context.applicationContext)
      mapOf(
        "bundleId" to otaManager.getCurrentBundleId().toDouble(),
        "nativeVersion" to (context.applicationContext.packageManager
          .getPackageInfo(context.applicationContext.packageName, 0)
          .versionName ?: "0.0.0"),
        "otaEnabled" to OtaManager.otaEnabled,
        "apiUrl" to OtaManager.apiUrl,
        "otaAppKey" to OtaManager.appKey,
      )
    }

    AsyncFunction("getCurrentBundleId") {
      OtaManager(context.applicationContext).getCurrentBundleId().toDouble()
    }

    AsyncFunction("getPendingBundleId") {
      OtaManager(context.applicationContext).getPendingBundleId().toDouble()
    }

    AsyncFunction("clearAppCacheAndStorage") { promise: Promise ->
      val success = OtaManager.clearAppCacheAndStorage(context.applicationContext, markPendingStoreWipe = true)
      promise.resolve(success)
    }

    AsyncFunction("markStartupSuccess") { promise: Promise ->
      OtaBundleLoader.markStartupSuccess(context.applicationContext)
      promise.resolve(true)
    }

    AsyncFunction("startPlayStoreInAppUpdate") { promise: Promise ->
      val activity = appContext.currentActivity
      if (activity == null) {
        Log.w(TAG, "Cannot start in-app update: currentActivity is null")
        promise.resolve(false)
        return@AsyncFunction
      }

      try {
        val appUpdateManager = AppUpdateManagerFactory.create(activity)
        val appUpdateInfoTask = appUpdateManager.appUpdateInfo

        appUpdateInfoTask.addOnSuccessListener { appUpdateInfo ->
          val updateAvailability = appUpdateInfo.updateAvailability()
          val isImmediateAllowed = appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)

          Log.i(
            TAG,
            "In-app update check: availability=$updateAvailability, immediateAllowed=$isImmediateAllowed",
          )

          if (updateAvailability == UpdateAvailability.UPDATE_AVAILABLE && isImmediateAllowed) {
            try {
              appUpdateManager.startUpdateFlowForResult(
                appUpdateInfo,
                AppUpdateType.IMMEDIATE,
                activity,
                IN_APP_UPDATE_REQUEST_CODE,
              )
              promise.resolve(true)
            } catch (flowErr: Exception) {
              Log.w(TAG, "Failed to start in-app update flow: ${flowErr.message}", flowErr)
              promise.resolve(false)
            }
          } else {
            promise.resolve(false)
          }
        }.addOnFailureListener { error ->
          Log.w(TAG, "In-app update info task failed: ${error.message}")
          promise.resolve(false)
        }
      } catch (e: Exception) {
        Log.w(TAG, "In-app update initiation error: ${e.message}")
        promise.resolve(false)
      }
    }

    AsyncFunction("downloadUpdateAsync") { options: DownloadUpdateOptions, promise: Promise ->
      val zipUrl = options.zipUrl.trim()
      if (zipUrl.isEmpty()) {
        promise.reject("MISSING_ZIP_URL", "zipUrl is required", null)
        return@AsyncFunction
      }

      val bundleId = options.bundleId.toLong()
      if (bundleId <= 0) {
        promise.reject("INVALID_BUNDLE_ID", "bundleId must be positive", null)
        return@AsyncFunction
      }

      val otaManager = OtaManager(context.applicationContext)
      otaManager.onProgress = { downloaded, total, percent ->
        sendEvent(
          "downloadProgress",
          mapOf(
            "downloaded" to downloaded.toDouble(),
            "total" to total.toDouble(),
            "percent" to percent.toDouble(),
          ),
        )
      }

      otaManager.downloadAndApplyFromUrl(
        zipUrl = zipUrl,
        bundleId = bundleId,
        zipSize = options.zipSize.toLong(),
        expectedZipSha256 = options.zipSha256.trim(),
      ) { result ->
        otaManager.onProgress = null
        result.fold(
          onSuccess = { promise.resolve(it) },
          onFailure = { error ->
            promise.reject("DOWNLOAD_FAILED", error.message ?: "download_failed", error)
          },
        )
      }
    }

    AsyncFunction("applyUpdateAsync") { promise: Promise ->
      val applicationContext = context.applicationContext
      val otaManager = OtaManager(applicationContext)

      val pendingId = otaManager.getPendingBundleId()
      if (pendingId <= 0) {
        promise.reject("NO_PENDING_UPDATE", "No pending OTA bundle to apply", null)
        return@AsyncFunction
      }

      val bundlePath = otaManager.getOtaBundlePath(pendingId)
      if (bundlePath.isNullOrBlank()) {
        promise.reject("BUNDLE_NOT_FOUND", "Pending OTA bundle file not found", null)
        return@AsyncFunction
      }

      if (!otaManager.applyPendingBundle()) {
        promise.reject("NO_PENDING_UPDATE", "No pending OTA bundle to apply", null)
        return@AsyncFunction
      }

      OtaBundleLoader.refreshOtaAssets(applicationContext)
      OtaBundleLoader.clearEmbeddedMatchCache(applicationContext)
      val committedPath =
        OtaBundleLoader.resolveJsBundlePathForApply(applicationContext) ?: bundlePath

      val reactHost = (applicationContext as? ReactApplication)?.reactHost
      if (reactHost == null) {
        promise.reject("RELOAD_FAILED", "ReactHost unavailable", null)
        return@AsyncFunction
      }

      mainHandler.post {
        OtaBundleLoader.hideSplashScreenFallback()
        if (runOtaReload(reactHost, committedPath)) {
          Log.i(TAG, "Applied OTA bundle $pendingId via in-process reload")
          promise.resolve(null)
        } else {
          Log.e(TAG, "In-process OTA reload failed for bundle $pendingId")
          promise.reject("RELOAD_FAILED", "Failed to reload with OTA bundle", null)
        }
      }
    }
  }

  /**
   * Applies the committed OTA bundle via in-process reload.
   *
   * With native C++ GPU modules removed, ReactHost.reload safely recreates
   * the Hermes runtime without killing the process or Activity.
   */
  private fun runOtaReload(reactHost: ReactHost, bundlePath: String): Boolean {
    return try {
      val filePath = bundlePath.trim().takeIf { it.isNotEmpty() }
      reactHost.devSupportManager?.bundleFilePath = filePath
      reactHost.reload("Worktrees Studio OTA apply")
      true
    } catch (e: Exception) {
      Log.w(TAG, "ReactHost.reload failed", e)
      false
    }
  }

  private fun readBuildConfigString(fieldName: String): String {
    return try {
      val buildConfigClass = Class.forName("${context.applicationContext.packageName}.BuildConfig")
      val field = buildConfigClass.getField(fieldName)
      field.get(null)?.toString()?.trim().orEmpty()
    } catch (_: Exception) {
      ""
    }
  }

  private fun readBuildConfigBoolean(fieldName: String): Boolean {
    return try {
      val buildConfigClass = Class.forName("${context.applicationContext.packageName}.BuildConfig")
      val field = buildConfigClass.getField(fieldName)
      field.getBoolean(null)
    } catch (_: Exception) {
      false
    }
  }

  companion object {
    private const val TAG = "WorktreesStudioOtaUpdates"
    const val IN_APP_UPDATE_REQUEST_CODE = 4209
    const val META_API_URL = "expo.modules.worktreesstudiootaupdates.API_URL"
    const val META_OTA_APP_KEY = "expo.modules.worktreesstudiootaupdates.OTA_APP_KEY"
  }
}
