package expo.modules.worktreesstudiootaupdates

import android.content.Context
import android.content.res.AssetManager
import android.content.res.Resources
import android.util.Log
import java.io.File
import java.security.MessageDigest

object OtaBundleLoader {
  private const val TAG = "OtaBundleLoader"
  private const val NATIVE_BUILD_STAMP = "2025-06-09-coldstart-v4"

  @Volatile
  private var otaAssetManager: AssetManager? = null

  @Volatile
  private var otaResources: Resources? = null

  fun onApplicationCreate(context: Context) {
    Log.i(TAG, "Worktrees Studio OTA native build: $NATIVE_BUILD_STAMP")
    checkAndHandleNativeBinaryUpdate(context)
    if (!OtaManager.otaEnabled) {
      clearOtaAssets()
      return
    }
    clearInvalidCommittedBundle(context)
    if (getOtaBundlePath(context) == null) {
      clearOtaAssets()
      return
    }
    addAssetPathIfNeeded(context)
  }

  private fun getNativeVersionCode(context: Context): Long {
    return try {
      val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
        pInfo.longVersionCode
      } else {
        @Suppress("DEPRECATION")
        pInfo.versionCode.toLong()
      }
    } catch (_: Exception) {
      -1L
    }
  }

  private fun getNativeVersionName(context: Context): String {
    return try {
      context.packageManager.getPackageInfo(context.packageName, 0).versionName ?: ""
    } catch (_: Exception) {
      ""
    }
  }

  fun checkAndHandleNativeBinaryUpdate(context: Context) {
    val currentVersionCode = getNativeVersionCode(context)
    val currentVersionName = getNativeVersionName(context)
    if (currentVersionCode <= 0L) return

    val prefs = context.getSharedPreferences(OtaManager.PREFS_NAME, Context.MODE_PRIVATE)
    val savedVersionCode = prefs.getLong(OtaManager.KEY_LAST_NATIVE_VERSION_CODE, -1L)
    val pendingStoreWipe = prefs.getBoolean(OtaManager.KEY_PENDING_STORE_UPDATE_WIPE, false)
    val currentBundleId = prefs.getLong(OtaManager.KEY_BUNDLE_ID, 0L)

    val isFirstTrackedRun = savedVersionCode == -1L
    val isBinaryUpdated = savedVersionCode != -1L && savedVersionCode != currentVersionCode
    val shouldPurge = isBinaryUpdated || pendingStoreWipe || (isFirstTrackedRun && currentBundleId > 0L)

    if (shouldPurge) {
      Log.i(
        TAG,
        "Store update / version change detected: savedCode=$savedVersionCode, currentCode=$currentVersionCode, pendingWipe=$pendingStoreWipe. Performing automated purge.",
      )
      OtaManager.clearAppCacheAndStorage(context, markPendingStoreWipe = false)
    }

    prefs.edit()
      .putLong(OtaManager.KEY_LAST_NATIVE_VERSION_CODE, currentVersionCode)
      .putString(OtaManager.KEY_LAST_NATIVE_VERSION_NAME, currentVersionName)
      .apply()
  }

  fun getCommittedBundleId(context: Context): Long {
    if (!OtaManager.otaEnabled) return 0L
    val prefs = context.getSharedPreferences(OtaManager.PREFS_NAME, Context.MODE_PRIVATE)
    return prefs.getLong(OtaManager.KEY_BUNDLE_ID, 0L)
  }

  fun mountOtaSessionForColdStart(context: Context): String? {
    if (!OtaManager.otaEnabled) return null

    val bundleId = getCommittedBundleId(context)
    if (bundleId <= 0) return null

    val prefs = context.getSharedPreferences(OtaManager.PREFS_NAME, Context.MODE_PRIVATE)
    val inFlightBundle = prefs.getLong(OtaManager.KEY_STARTUP_BUNDLE_IN_FLIGHT, 0L)
    val crashCount = prefs.getInt(OtaManager.KEY_STARTUP_CRASH_COUNT, 0)

    if (inFlightBundle == bundleId) {
      val newCount = crashCount + 1
      prefs.edit().putInt(OtaManager.KEY_STARTUP_CRASH_COUNT, newCount).commit()
      Log.w(TAG, "OTA bundle $bundleId startup crash watchdog: attempt=$newCount")
      if (newCount >= 1) {
        Log.e(TAG, "OTA bundle $bundleId crashed or stalled during startup! Rolling back to embedded bundle.")
        recordFailedBundle(context, bundleId)
        clearCommittedBundleAndAssets(context)
        prefs.edit()
          .remove(OtaManager.KEY_STARTUP_BUNDLE_IN_FLIGHT)
          .remove(OtaManager.KEY_STARTUP_CRASH_COUNT)
          .commit()
        return null
      }
    } else {
      prefs.edit()
        .putLong(OtaManager.KEY_STARTUP_BUNDLE_IN_FLIGHT, bundleId)
        .putInt(OtaManager.KEY_STARTUP_CRASH_COUNT, 1)
        .commit()
    }

    val jsPath = getOtaBundlePath(context)
    val zipPath = getOtaZipPath(context)
    if (jsPath == null || zipPath == null) {
      logColdStartMountFailure(context, bundleId, "missing bundle or zip file")
      return null
    }
    if (!File(jsPath).isFile || !File(zipPath).isFile) {
      logColdStartMountFailure(context, bundleId, "bundle or zip path not a file")
      return null
    }

    if (peekOtaAssetManager() == null) {
      addAssetPathIfNeeded(context)
    }
    if (peekOtaAssetManager() == null) {
      logColdStartMountFailure(context, bundleId, "asset mount failed")
      return null
    }

    if (otaJsMatchesEmbeddedCached(context, File(jsPath))) {
      Log.i(TAG, "OTA bundle matches embedded — using asset loader")
      return null
    }
    return jsPath
  }

  private fun logColdStartMountFailure(context: Context, bundleId: Long, reason: String) {
    if (bundleId > 0) {
      Log.w(TAG, "OTA cold start mount failed (bundle_id=$bundleId): $reason — using embedded bundle")
    }
  }

  /**
   * Brownfield parity: OTA cold start requires committed bundle file, zip, and mounted assets.
   */
  fun isOtaColdStartReady(context: Context): Boolean {
    if (!OtaManager.otaEnabled) return false
    if (getCommittedBundleId(context) <= 0) return false
    val jsPath = getOtaBundlePath(context) ?: return false
    val zipPath = getOtaZipPath(context) ?: return false
    if (!File(jsPath).isFile || !File(zipPath).isFile) return false
    if (peekOtaAssetManager() == null) {
      addAssetPathIfNeeded(context)
    }
    return peekOtaAssetManager() != null
  }

  fun logColdStartState(context: Context) {
    val jsPath = getOtaBundlePath(context)
    val zipPath = getOtaZipPath(context)
    val assetsReady = peekOtaAssetManager() != null
    val embeddedMatch =
      jsPath?.let { path ->
        otaJsMatchesEmbeddedCached(context, File(path))
      } ?: false
    Log.i(
      TAG,
      "Cold start state: ready=${isOtaColdStartReady(context)} jsPath=$jsPath zipPath=$zipPath assetsReady=$assetsReady embeddedMatch=$embeddedMatch",
    )
  }

  /** Native fallback when JS has not called SplashScreen.hideAsync yet (OTA cold start). */
  fun hideSplashScreenFallback() {
    try {
      Class.forName("expo.modules.splashscreen.SplashScreenManager")
        .getMethod("hide")
        .invoke(null)
    } catch (_: Exception) {
      // expo-splash-screen not linked
    }
  }

  /** Drop committed OTA state and in-memory asset overrides (e.g. after load failure). */
  fun clearCommittedBundleAndAssets(context: Context) {
    val prefs = context.getSharedPreferences(OtaManager.PREFS_NAME, Context.MODE_PRIVATE)
    val bundleId = prefs.getLong(OtaManager.KEY_BUNDLE_ID, 0L)
    prefs
      .edit()
      .remove(OtaManager.KEY_BUNDLE_ID)
      .remove(OtaManager.KEY_BUNDLE_SHA256)
      .remove(OtaManager.KEY_STARTUP_BUNDLE_IN_FLIGHT)
      .remove(OtaManager.KEY_STARTUP_CRASH_COUNT)
      .commit()
    if (bundleId > 0) {
      try {
        File(context.filesDir, "ota/bundle_$bundleId").deleteRecursively()
        File(context.filesDir, "ota/bundle_$bundleId.zip").delete()
      } catch (_: Exception) {}
    }
    clearOtaAssets()
    Log.w(TAG, "Cleared committed OTA bundle (load failure recovery)")
  }

  fun markStartupSuccess(context: Context) {
    val prefs = context.getSharedPreferences(OtaManager.PREFS_NAME, Context.MODE_PRIVATE)
    prefs
      .edit()
      .remove(OtaManager.KEY_STARTUP_BUNDLE_IN_FLIGHT)
      .remove(OtaManager.KEY_STARTUP_CRASH_COUNT)
      .apply()
    Log.i(TAG, "Startup success confirmed; watchdog reset")
  }

  fun recordFailedBundle(context: Context, bundleId: Long) {
    OtaManager.markBundleFailed(context, bundleId)
  }

  private fun bundleFileForId(context: Context, bundleId: Long): File =
    File(context.filesDir, "ota/bundle_$bundleId/index.android.bundle")

  private fun sha256Hex(file: File): String? {
    if (!file.exists() || file.length() <= 0L) return null
    return try {
      val digest = MessageDigest.getInstance("SHA-256")
      val buf = ByteArray(65536)
      file.inputStream().use { input ->
        var read: Int
        while (input.read(buf).also { read = it } != -1) {
          digest.update(buf, 0, read)
        }
      }
      digest.digest().joinToString("") { "%02x".format(it) }
    } catch (e: Exception) {
      Log.w(TAG, "Failed to hash bundle file", e)
      null
    }
  }

  /** Clear prefs when committed bundle is missing, empty, or SHA-256 mismatches. */
  private fun clearInvalidCommittedBundle(context: Context) {
    val prefs = context.getSharedPreferences(OtaManager.PREFS_NAME, Context.MODE_PRIVATE)
    val bundleId = prefs.getLong(OtaManager.KEY_BUNDLE_ID, 0L)
    if (bundleId <= 0) return

    val bundleFile = bundleFileForId(context, bundleId)
    if (!bundleFile.exists() || bundleFile.length() <= 0L) {
      clearCommittedBundlePrefs(prefs, "missing or empty bundle file")
      return
    }

    val expectedSha256 = prefs.getString(OtaManager.KEY_BUNDLE_SHA256, null)?.trim().orEmpty()
    if (expectedSha256.isEmpty()) return

    val actualSha256 = sha256Hex(bundleFile)
    if (actualSha256 == null || !actualSha256.equals(expectedSha256, ignoreCase = true)) {
      clearCommittedBundlePrefs(prefs, "bundle SHA-256 mismatch")
    }
  }

  private fun clearCommittedBundlePrefs(
    prefs: android.content.SharedPreferences,
    reason: String,
  ) {
    prefs
      .edit()
      .remove(OtaManager.KEY_BUNDLE_ID)
      .remove(OtaManager.KEY_BUNDLE_SHA256)
      .commit()
    Log.w(TAG, "Cleared invalid OTA bundle_id ($reason)")
  }

  fun getOtaBundlePath(context: Context): String? {
    if (!OtaManager.otaEnabled) return null
    val prefs = context.getSharedPreferences(OtaManager.PREFS_NAME, Context.MODE_PRIVATE)
    val bundleId = prefs.getLong(OtaManager.KEY_BUNDLE_ID, 0L)
    if (bundleId <= 0) return null

    val bundleFile = bundleFileForId(context, bundleId)
    if (!bundleFile.exists() || bundleFile.length() <= 0L) return null

    val expectedSha256 = prefs.getString(OtaManager.KEY_BUNDLE_SHA256, null)?.trim().orEmpty()
    if (expectedSha256.isNotEmpty()) {
      val actualSha256 = sha256Hex(bundleFile)
      if (actualSha256 == null || !actualSha256.equals(expectedSha256, ignoreCase = true)) {
        Log.w(TAG, "Bundle SHA-256 mismatch — falling back to embedded bundle")
        return null
      }
    }

    return bundleFile.absolutePath
  }

  private const val PREFS_EMBEDDED_MATCH = "worktrees_studio_ota_embedded_match"
  private const val KEY_OTA_JS_PATH = "ota_js_path"
  private const val KEY_OTA_JS_SIZE = "ota_js_size"

  private fun inputStreamsMatch(a: java.io.InputStream, b: java.io.InputStream): Boolean {
    val bufA = ByteArray(8192)
    val bufB = ByteArray(8192)
    while (true) {
      val na = a.read(bufA)
      val nb = b.read(bufB)
      if (na != nb) return false
      if (na == -1) return true
      for (i in 0 until na) {
        if (bufA[i] != bufB[i]) return false
      }
    }
  }

  private fun otaJsMatchesEmbeddedAsset(context: Context, otaFile: File): Boolean {
    if (!otaFile.isFile) return false
    return try {
      context.assets.openFd("index.android.bundle").use { afd ->
        if (otaFile.length() != afd.length) return@use false
        afd.createInputStream().use { assetIn ->
          otaFile.inputStream().use { otaIn -> inputStreamsMatch(assetIn, otaIn) }
        }
      }
    } catch (_: Exception) {
      false
    }
  }

  private fun otaJsMatchesEmbeddedCached(context: Context, otaFile: File): Boolean {
    if (!otaFile.isFile) return false
    val prefs = context.getSharedPreferences(PREFS_EMBEDDED_MATCH, Context.MODE_PRIVATE)
    val path = otaFile.absolutePath
    val size = otaFile.length()
    if (prefs.getString(KEY_OTA_JS_PATH, null) == path && prefs.getLong(KEY_OTA_JS_SIZE, -1L) == size) {
      return true
    }
    val match = otaJsMatchesEmbeddedAsset(context, otaFile)
    prefs.edit().apply {
      if (match) {
        putString(KEY_OTA_JS_PATH, path)
        putLong(KEY_OTA_JS_SIZE, size)
      } else {
        remove(KEY_OTA_JS_PATH)
        remove(KEY_OTA_JS_SIZE)
      }
      apply()
    }
    return match
  }

  fun clearEmbeddedMatchCache(context: Context) {
    context
      .getSharedPreferences(PREFS_EMBEDDED_MATCH, Context.MODE_PRIVATE)
      .edit()
      .clear()
      .apply()
  }

  /** Cold start: mount OTA session atomically; null means use embedded loader. */
  fun resolveJsBundlePathForColdStart(context: Context): String? {
    return mountOtaSessionForColdStart(context)
  }

  /** In-process apply reload: always prefer on-disk OTA file (no embedded shortcut). */
  fun resolveJsBundlePathForApply(context: Context): String? {
    return getOtaBundlePath(context)
  }

  fun getOtaZipPath(context: Context): String? {
    if (!OtaManager.otaEnabled) return null
    val prefs = context.getSharedPreferences(OtaManager.PREFS_NAME, Context.MODE_PRIVATE)
    val bundleId = prefs.getLong(OtaManager.KEY_BUNDLE_ID, 0L)
    if (bundleId <= 0) return null
    val zipFile = File(context.filesDir, "ota/bundle_$bundleId.zip")
    return if (zipFile.exists()) zipFile.absolutePath else null
  }

  fun addAssetPathIfNeeded(context: Context) {
    if (!OtaManager.otaEnabled) {
      clearOtaAssets()
      return
    }

    try {
      val zipPath = getOtaZipPath(context) ?: run {
        clearOtaAssets()
        return
      }

      val zipFile = File(zipPath)
      val extractedDir = File(zipFile.parentFile, zipFile.nameWithoutExtension)
      val pathResult = createAssetManagerWithOtaPath(context, zipFile, extractedDir)
      val assetManager = pathResult.assetManager
      if (assetManager == null) {
        Log.w(TAG, "OTA asset path unavailable for zip=$zipPath")
        clearOtaAssets()
        return
      }

      otaAssetManager = assetManager
      otaResources =
        try {
          Resources(assetManager, context.resources.displayMetrics, context.resources.configuration)
        } catch (e: Exception) {
          Log.e(TAG, "Failed to create OTA Resources", e)
          null
        }
      if (otaResources != null) {
        Log.i(TAG, "OTA assets enabled: path=${pathResult.enabledPath}")
      }
    } catch (e: Exception) {
      Log.e(TAG, "Failed to configure OTA assets", e)
      clearOtaAssets()
    }
  }

  /** Read cached OTA resources without loading. Safe to call from Application.getResources(). */
  fun peekOtaResources(): Resources? = otaResources

  /** Read cached OTA asset manager without loading. Safe to call from Application.getAssets(). */
  fun peekOtaAssetManager(): AssetManager? = otaAssetManager

  fun refreshOtaAssets(context: Context) {
    clearOtaAssets()
    addAssetPathIfNeeded(context)
  }

  fun clearOtaAssets() {
    otaAssetManager = null
    otaResources = null
  }

  private data class OtaAssetPathResult(
    val assetManager: AssetManager?,
    val enabledPath: String?,
  )

  private fun createAssetManagerWithOtaPath(
    context: Context,
    zipFile: File,
    extractedDir: File?,
  ): OtaAssetPathResult {
    return try {
      val assetManagerClass = AssetManager::class.java
      val constructor = assetManagerClass.getDeclaredConstructor().apply { isAccessible = true }
      val addAssetPathMethod =
        assetManagerClass.getDeclaredMethod("addAssetPath", String::class.java).apply {
          isAccessible = true
        }

      fun tryAddPath(path: String): AssetManager? {
        return try {
          val am = constructor.newInstance() as AssetManager
          val cookie = addAssetPathMethod.invoke(am, path) as? Int
          if (cookie != null && cookie != 0) {
            context.applicationInfo.sourceDir?.let { addAssetPathMethod.invoke(am, it) }
            return am
          }
          null
        } catch (e: Exception) {
          Log.w(TAG, "addAssetPath failed for $path: ${e.message}")
          null
        }
      }

      // Prefer zip: addAssetPath works reliably with .zip; extracted dir often fails.
      if (zipFile.exists() && zipFile.isFile) {
        tryAddPath(zipFile.absolutePath)?.let {
          return OtaAssetPathResult(it, zipFile.absolutePath)
        }
      }
      if (extractedDir != null && extractedDir.exists() && File(extractedDir, "assets").exists()) {
        tryAddPath(extractedDir.absolutePath)?.let {
          return OtaAssetPathResult(it, extractedDir.absolutePath)
        }
      }
      OtaAssetPathResult(null, null)
    } catch (e: Exception) {
      Log.e(TAG, "createAssetManagerWithOtaPath failed", e)
      OtaAssetPathResult(null, null)
    }
  }
}
