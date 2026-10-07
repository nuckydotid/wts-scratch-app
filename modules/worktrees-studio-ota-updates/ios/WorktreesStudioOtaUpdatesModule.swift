import ExpoModulesCore
import Foundation

@Record
struct DownloadUpdateOptions {
  var zipUrl: String = ""

  var bundleId: Double = 0

  var zipSize: Double = 0

  var zipSha256: String = ""
}

public class WorktreesStudioOtaUpdatesModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WorktreesStudioOtaUpdates")

    Events("downloadProgress")

    OnCreate {
      Self.configureFromBundle()
      // Do NOT auto-clear startup watchdog here — let JS call markStartupSuccess()
      // after the React tree mounts (useAssetCache). Auto-clearing here masks
      // real JS startup crashes and, together with the double resolve in
      // onApplicationCreate, caused false rollbacks after applyUpdateAsync.
    }

    AsyncFunction("getRuntimeConfig") { () -> [String: Any] in
      Self.configureFromBundle()
      let nativeVersion =
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "0.0.0"
      return [
        "bundleId": Double(OtaManager.shared.currentBundleId),
        "nativeVersion": nativeVersion,
        "otaEnabled": OtaManager.otaEnabled,
        "apiUrl": OtaManager.apiUrl,
        "otaAppKey": OtaManager.appKey,
      ]
    }

    AsyncFunction("getCurrentBundleId") { () -> Double in
      Double(OtaManager.shared.currentBundleId)
    }

    AsyncFunction("downloadUpdateAsync") { (options: DownloadUpdateOptions) -> Bool in
      let zipUrl = options.zipUrl.trimmingCharacters(in: .whitespacesAndNewlines)
      if zipUrl.isEmpty {
        throw Exception(name: "MISSING_ZIP_URL", description: "zipUrl is required")
      }

      let bundleId = Int64(options.bundleId)
      if bundleId <= 0 {
        throw Exception(name: "INVALID_BUNDLE_ID", description: "bundleId must be positive")
      }

      OtaManager.shared.onProgress = { [weak self] downloaded, total, percent in
        self?.sendEvent(
          "downloadProgress",
          [
            "downloaded": Double(downloaded),
            "total": Double(total),
            "percent": Double(percent),
          ]
        )
      }

      let ok = await OtaManager.shared.downloadFromUrl(
        zipUrl: zipUrl,
        bundleId: bundleId,
        zipSize: Int64(options.zipSize),
        expectedZipSha256: options.zipSha256.trimmingCharacters(in: .whitespacesAndNewlines)
      )
      OtaManager.shared.onProgress = nil
      return ok
    }

    AsyncFunction("getPendingBundleId") { () -> Double in
      Double(OtaManager.shared.pendingBundleId)
    }

    AsyncFunction("clearAppCacheAndStorage") { () -> Bool in
      OtaManager.shared.clearAppCacheAndStorage(markPendingStoreWipe: true)
      return true
    }

    AsyncFunction("markStartupSuccess") { () -> Bool in
      OtaBundleLoader.markStartupSuccess()
      return true
    }

    AsyncFunction("startPlayStoreInAppUpdate") { () -> Bool in
      // In-App Updates are an Android / Google Play feature; iOS falls back to App Store URL
      return false
    }

    AsyncFunction("applyUpdateAsync") { () in
      guard OtaManager.shared.applyPendingBundle() else {
        throw Exception(name: "NO_PENDING_UPDATE", description: "No pending OTA bundle to apply")
      }
      // Verify bundle file exists without triggering watchdog side-effects.
      // resolveOtaBundleURL() sets startupBundleInFlight and would cause a
      // false rollback on the next launch (apply sets inFlight, then the
      // subsequent cold start's onApplicationCreate+ bundleURL would see
      // inFlight==bundleId and rollback). Use direct file check instead.
      guard let bundlePath = OtaManager.shared.otaBundlePath,
        FileManager.default.fileExists(atPath: bundlePath)
      else {
        throw Exception(name: "BUNDLE_NOT_FOUND", description: "OTA bundle file not found")
      }

      await MainActor.run {
        appContext?.reloadAppAsync("Worktrees Studio OTA apply")
      }
    }
  }

  private static func configureFromBundle() {
    #if DEBUG
    OtaManager.otaEnabled = false
    #else
    OtaManager.otaEnabled = true
    #endif

    if let enabled = Bundle.main.object(forInfoDictionaryKey: "OTA_ENABLED") as? Bool {
      OtaManager.otaEnabled = enabled
    } else if let enabledString = Bundle.main.object(forInfoDictionaryKey: "OTA_ENABLED") as? String {
      OtaManager.otaEnabled = (enabledString as NSString).boolValue
    }

    OtaManager.apiUrl =
      (Bundle.main.object(forInfoDictionaryKey: "OTA_API_URL") as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    OtaManager.appKey =
      (Bundle.main.object(forInfoDictionaryKey: "OTA_APP_KEY") as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
  }
}
