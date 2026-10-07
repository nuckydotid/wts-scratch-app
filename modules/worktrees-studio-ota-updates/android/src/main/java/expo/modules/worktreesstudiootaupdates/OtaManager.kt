package expo.modules.worktreesstudiootaupdates

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicLong
import java.util.zip.ZipFile

private fun sha256File(file: File): String {
  val digest = MessageDigest.getInstance("SHA-256")
  val buf = ByteArray(65536)
  file.inputStream().use { input ->
    var read: Int
    while (input.read(buf).also { read = it } != -1) {
      digest.update(buf, 0, read)
    }
  }
  return digest.digest().joinToString("") { "%02x".format(it) }
}

/**
 * Downloads OTA zip bundles, verifies SHA-256, and extracts on device.
 * JS handles check-update; this class only downloads from a known URL.
 */
class OtaManager(private val context: Context) {
  private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
  private val otaDir = File(context.filesDir, "ota").apply { mkdirs() }
  private val executor: ExecutorService = Executors.newSingleThreadExecutor()
  private val mainHandler = Handler(Looper.getMainLooper())

  var onProgress: ((downloaded: Long, total: Long, percent: Int) -> Unit)? = null

  fun getCurrentBundleId(): Long = prefs.getLong(KEY_BUNDLE_ID, 0L)

  fun getPendingBundleId(): Long = prefs.getLong(KEY_PENDING_BUNDLE_ID, 0L)

  fun getOtaBundleDir(forBundleId: Long = getCurrentBundleId()): File? {
    if (forBundleId <= 0) return null
    val dir = File(otaDir, "bundle_$forBundleId")
    return if (dir.exists() && File(dir, "index.android.bundle").exists()) dir else null
  }

  fun getOtaBundlePath(forBundleId: Long = getCurrentBundleId()): String? =
    getOtaBundleDir(forBundleId)?.let { File(it, "index.android.bundle").absolutePath }

  fun getOtaZipPath(forBundleId: Long = getCurrentBundleId()): String? {
    if (forBundleId <= 0) return null
    val zipFile = File(otaDir, "bundle_$forBundleId.zip")
    return if (zipFile.exists()) zipFile.absolutePath else null
  }

  fun getOtaBundleSha256(forBundleId: Long = getCurrentBundleId()): String? {
    val key =
      if (forBundleId == getPendingBundleId() && getPendingBundleId() > 0) {
        KEY_PENDING_BUNDLE_SHA256
      } else {
        KEY_BUNDLE_SHA256
      }
    return prefs.getString(key, null)?.takeIf { it.isNotBlank() }
  }

  fun downloadAndApplyFromUrl(
    zipUrl: String,
    bundleId: Long,
    zipSize: Long,
    expectedZipSha256: String = "",
    callback: (Result<Boolean>) -> Unit,
  ) {
    executor.execute {
      val result = runDownloadAndApply(zipUrl, bundleId, zipSize, expectedZipSha256)
      mainHandler.post { callback(result) }
    }
  }

  fun applyPendingBundle(): Boolean {
    val pendingId = getPendingBundleId()
    if (pendingId <= 0) return false
    val bundleDir = getOtaBundleDir(pendingId) ?: return false
    val bundleFile = File(bundleDir, "index.android.bundle")
    val bundleSha256 = sha256File(bundleFile)
    prefs
      .edit()
      .putLong(KEY_BUNDLE_ID, pendingId)
      .putString(KEY_BUNDLE_SHA256, bundleSha256)
      .remove(KEY_PENDING_BUNDLE_ID)
      .remove(KEY_PENDING_BUNDLE_SHA256)
      .commit()
    return true
  }

  private fun sanitizeZipEntryName(name: String): String? {
    var safe = name.replace('\\', '/').trimStart('/')
    if (safe.contains("..") || safe.startsWith("/")) return null
    return safe.ifBlank { null }
  }

  private fun runDownloadAndApply(
    zipUrl: String,
    newBundleId: Long,
    zipSize: Long,
    expectedZipSha256: String = "",
  ): Result<Boolean> {
    val targetZipFile = File(otaDir, "bundle_$newBundleId.zip")
    val tempZipFile = File(otaDir, "bundle_${newBundleId}_tmp.zip")
    val targetDir = File(otaDir, "bundle_$newBundleId")
    val downloaded = AtomicLong(0)

    if (isBundleMarkedFailed(context, newBundleId)) {
      Log.w(TAG, "Refusing to download bundle $newBundleId: marked as failed/blacklisted")
      return Result.failure(Exception("Bundle $newBundleId is blacklisted due to startup failure"))
    }

    return try {
      tempZipFile.delete()
      val conn = URL(zipUrl).openConnection() as HttpURLConnection
      conn.requestMethod = "GET"
      conn.connectTimeout = 30_000
      conn.readTimeout = 120_000
      conn.connect()

      val effectiveZipSize = if (zipSize > 0) zipSize else conn.contentLengthLong.coerceAtLeast(0)

      conn.inputStream.use { input ->
        tempZipFile.outputStream().use { output ->
          val buffer = ByteArray(8192)
          var read: Int
          while (input.read(buffer).also { read = it } != -1) {
            output.write(buffer, 0, read)
            val prev = downloaded.addAndGet(read.toLong())
            val pct =
              if (effectiveZipSize > 0) ((prev * 100) / effectiveZipSize).toInt() else 0
            mainHandler.post {
              onProgress?.invoke(prev, effectiveZipSize, pct.coerceIn(0, 100))
            }
          }
        }
      }
      conn.disconnect()

      tempZipFile.renameTo(targetZipFile)
      if (!targetZipFile.exists()) {
        tempZipFile.copyTo(targetZipFile, overwrite = true)
        tempZipFile.delete()
      }

      if (expectedZipSha256.isNotBlank()) {
        val actualSha256 = sha256File(targetZipFile)
        if (!actualSha256.equals(expectedZipSha256, ignoreCase = true)) {
          targetZipFile.delete()
          Log.e(TAG, "ZIP SHA-256 mismatch: expected=${expectedZipSha256.take(16)}… got=${actualSha256.take(16)}…")
          return Result.failure(Exception("OTA zip SHA-256 mismatch — bundle rejected"))
        }
        Log.d(TAG, "ZIP SHA-256 verified OK")
      }

      if (targetDir.exists()) {
        targetDir.listFiles()?.forEach { it.deleteRecursively() }
      }
      targetDir.mkdirs()

      ZipFile(targetZipFile).use { zip ->
        for (entry in zip.entries()) {
          val safeName = sanitizeZipEntryName(entry.name) ?: continue
          val destFile = File(targetDir, safeName)
          if (entry.isDirectory) {
            destFile.mkdirs()
          } else {
            destFile.parentFile?.mkdirs()
            zip.getInputStream(entry).use { input ->
              FileOutputStream(destFile).use { output ->
                val buf = ByteArray(8192)
                var len: Int
                while (input.read(buf).also { len = it } != -1) {
                  output.write(buf, 0, len)
                }
              }
            }
          }
        }
      }

      val bundleFile = File(targetDir, "index.android.bundle")
      if (!bundleFile.exists() || bundleFile.length() <= 0L) {
        targetDir.deleteRecursively()
        targetZipFile.delete()
        Log.e(TAG, "OTA zip missing index.android.bundle after extract")
        return Result.failure(Exception("OTA bundle missing index.android.bundle after extract"))
      }

      val bundleSha256 = sha256File(bundleFile)
      prefs
        .edit()
        .putLong(KEY_PENDING_BUNDLE_ID, newBundleId)
        .putString(KEY_PENDING_BUNDLE_SHA256, bundleSha256)
        .apply()
      Log.i(TAG, "OTA bundle $newBundleId downloaded (pending apply). sha256=${bundleSha256.take(16)}…")
      Result.success(true)
    } catch (e: Exception) {
      Log.e(TAG, "OTA download failed", e)
      Result.failure(e)
    }
  }

  companion object {
    private const val TAG = "OtaManager"
    const val PREFS_NAME = "ota_prefs"
    const val KEY_BUNDLE_ID = "bundle_id"
    const val KEY_BUNDLE_SHA256 = "bundle_sha256"
    const val KEY_PENDING_BUNDLE_ID = "pending_bundle_id"
    private const val KEY_PENDING_BUNDLE_SHA256 = "pending_bundle_sha256"

    const val KEY_LAST_NATIVE_VERSION_CODE = "last_native_version_code"
    const val KEY_LAST_NATIVE_VERSION_NAME = "last_native_version_name"
    const val KEY_PENDING_STORE_UPDATE_WIPE = "pending_store_update_wipe"
    const val KEY_STARTUP_BUNDLE_IN_FLIGHT = "startup_bundle_in_flight"
    const val KEY_STARTUP_CRASH_COUNT = "startup_crash_count"
    const val KEY_FAILED_BUNDLE_IDS = "failed_bundle_ids"

    var appKey: String = ""
    var apiUrl: String = ""
    var otaEnabled: Boolean = false

    fun isBundleMarkedFailed(context: Context, bundleId: Long): Boolean {
      if (bundleId <= 0) return false
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      val failed = prefs.getStringSet(KEY_FAILED_BUNDLE_IDS, emptySet()) ?: emptySet()
      return failed.contains(bundleId.toString())
    }

    fun markBundleFailed(context: Context, bundleId: Long) {
      if (bundleId <= 0) return
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      val current = prefs.getStringSet(KEY_FAILED_BUNDLE_IDS, emptySet())?.toMutableSet() ?: mutableSetOf()
      current.add(bundleId.toString())
      prefs.edit().putStringSet(KEY_FAILED_BUNDLE_IDS, current).apply()
      Log.w(TAG, "Marked bundle $bundleId as failed / blacklisted from future downloads")
    }

    fun clearAppCacheAndStorage(context: Context, markPendingStoreWipe: Boolean = true): Boolean {
      return try {
        // 1. Purge OTA bundle directory
        val otaDir = File(context.filesDir, "ota")
        if (otaDir.exists()) {
          otaDir.deleteRecursively()
        }

        // 2. Clear application cache directory
        try {
          context.cacheDir?.deleteRecursively()
          context.codeCacheDir?.deleteRecursively()
          context.externalCacheDir?.deleteRecursively()
        } catch (e: Exception) {
          Log.w(TAG, "Failed to completely clear cache dirs: ${e.message}")
        }

        // 3. Clear OTA preferences
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val editor = prefs.edit()
          .remove(KEY_BUNDLE_ID)
          .remove(KEY_BUNDLE_SHA256)
          .remove(KEY_PENDING_BUNDLE_ID)
          .remove(KEY_PENDING_BUNDLE_SHA256)
          .remove(KEY_STARTUP_BUNDLE_IN_FLIGHT)
          .remove(KEY_STARTUP_CRASH_COUNT)

        if (markPendingStoreWipe) {
          editor.putBoolean(KEY_PENDING_STORE_UPDATE_WIPE, true)
        } else {
          editor.remove(KEY_PENDING_STORE_UPDATE_WIPE)
        }
        editor.commit()

        OtaBundleLoader.clearOtaAssets()
        OtaBundleLoader.clearEmbeddedMatchCache(context)

        Log.i(TAG, "Automated clearAppCacheAndStorage completed (markPendingStoreWipe=$markPendingStoreWipe)")
        true
      } catch (e: Exception) {
        Log.e(TAG, "Failed to clear app cache and storage", e)
        false
      }
    }
  }
}
