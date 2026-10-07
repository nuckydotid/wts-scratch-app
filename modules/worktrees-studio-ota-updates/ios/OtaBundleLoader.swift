import CryptoKit
import Foundation

public enum OtaBundleLoader {
  public static func onApplicationCreate() {
    checkAndHandleNativeBinaryUpdate()
    configureOtaManagerFromBundle()
    // NOTE: Do NOT call resolveOtaBundleURL() here — it has watchdog side-effects
    // (sets startupBundleInFlight). The single source of truth for OTA bundle
    // resolution is ReactNativeDelegate.bundleURL() -> resolveOtaBundleURL(),
    // which is called once per launch. Calling it here would set inFlight
    // twice per launch and trigger a false crash rollback on the next cold start
    // (and on the immediate reload after applyUpdateAsync).
    // Keep onApplicationCreate to only handle binary-update purge and config.
  }

  public static func checkAndHandleNativeBinaryUpdate() {
    let currentBuild = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? ""
    let currentAppVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
    guard !currentBuild.isEmpty else { return }

    let prefs = UserDefaults(suiteName: OtaManager.prefsSuiteName) ?? .standard
    let savedBuild = prefs.string(forKey: OtaManager.lastNativeBuildVersionKey)
    let pendingStoreWipe = prefs.bool(forKey: OtaManager.pendingStoreUpdateWipeKey)
    let currentBundleId = Int64(prefs.integer(forKey: OtaManager.bundleIdKey))

    let isFirstTrackedRun = savedBuild == nil
    let isBinaryUpdated = savedBuild != nil && savedBuild != currentBuild
    let shouldPurge = isBinaryUpdated || pendingStoreWipe || (isFirstTrackedRun && currentBundleId > 0)

    if shouldPurge {
      NSLog("[WorktreesStudioOta] Store update / build change detected (saved=%@, current=%@, pendingWipe=%d). Performing automated purge.", savedBuild ?? "nil", currentBuild, pendingStoreWipe ? 1 : 0)
      OtaManager.shared.clearAppCacheAndStorage(markPendingStoreWipe: false)
    }

    prefs.set(currentBuild, forKey: OtaManager.lastNativeBuildVersionKey)
    prefs.set(currentAppVersion, forKey: OtaManager.lastNativeAppVersionKey)
  }

  private static func configureOtaManagerFromBundle() {
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

  public static func resolveOtaBundleURL() -> URL? {
    guard OtaManager.otaEnabled else { return nil }

    let prefs = UserDefaults(suiteName: OtaManager.prefsSuiteName) ?? .standard
    let bundleId = Int64(prefs.integer(forKey: OtaManager.bundleIdKey))
    guard bundleId > 0 else { return nil }

    let inFlightBundle = Int64(prefs.integer(forKey: OtaManager.startupBundleInFlightKey))
    let crashCount = prefs.integer(forKey: OtaManager.startupCrashCountKey)

    if inFlightBundle == bundleId {
      let newCount = crashCount + 1
      prefs.set(newCount, forKey: OtaManager.startupCrashCountKey)
      NSLog("[WorktreesStudioOta] Bundle %lld startup crash watchdog: attempt=%d", bundleId, newCount)
      if newCount >= 1 {
        NSLog("[WorktreesStudioOta] Bundle %lld crashed or stalled during startup! Rolling back to embedded bundle.", bundleId)
        rollbackToEmbedded(failedBundleId: bundleId)
        return nil
      }
    } else {
      prefs.set(Int(bundleId), forKey: OtaManager.startupBundleInFlightKey)
      prefs.set(1, forKey: OtaManager.startupCrashCountKey)
    }

    let dir = otaDirectory.appendingPathComponent("bundle_\(bundleId)", isDirectory: true)
    let bundleURL = dir.appendingPathComponent("main.jsbundle")
    guard FileManager.default.fileExists(atPath: bundleURL.path) else { return nil }

    let expectedSha256 = prefs.string(forKey: OtaManager.bundleSha256Key) ?? ""
    if !expectedSha256.isEmpty {
      guard let actual = sha256Hex(of: bundleURL), actual.lowercased() == expectedSha256.lowercased() else {
        NSLog("[WorktreesStudioOta] Bundle SHA-256 mismatch — falling back to embedded bundle")
        return nil
      }
    }

    return bundleURL
  }

  public static func markStartupSuccess() {
    let prefs = UserDefaults(suiteName: OtaManager.prefsSuiteName) ?? .standard
    prefs.removeObject(forKey: OtaManager.startupBundleInFlightKey)
    prefs.removeObject(forKey: OtaManager.startupCrashCountKey)
    NSLog("[WorktreesStudioOta] Startup success confirmed; watchdog reset")
  }

  public static func rollbackToEmbedded(failedBundleId: Int64) {
    OtaManager.shared.markBundleFailed(bundleId: failedBundleId)
    let prefs = UserDefaults(suiteName: OtaManager.prefsSuiteName) ?? .standard
    prefs.removeObject(forKey: OtaManager.bundleIdKey)
    prefs.removeObject(forKey: OtaManager.bundleSha256Key)
    prefs.removeObject(forKey: OtaManager.startupBundleInFlightKey)
    prefs.removeObject(forKey: OtaManager.startupCrashCountKey)
    if failedBundleId > 0 {
      let targetDir = otaDirectory.appendingPathComponent("bundle_\(failedBundleId)", isDirectory: true)
      let zipFile = otaDirectory.appendingPathComponent("bundle_\(failedBundleId).zip")
      try? FileManager.default.removeItem(at: targetDir)
      try? FileManager.default.removeItem(at: zipFile)
    }
    NSLog("[WorktreesStudioOta] Rolled back to embedded bundle (bundle %lld rejected)", failedBundleId)
  }

  public static func getOtaBundlePath() -> String? {
    resolveOtaBundleURL()?.deletingLastPathComponent().path
  }

  public static func getOtaZipPath() -> String? {
    guard OtaManager.otaEnabled else { return nil }
    let prefs = UserDefaults(suiteName: OtaManager.prefsSuiteName) ?? .standard
    let bundleId = Int64(prefs.integer(forKey: OtaManager.bundleIdKey))
    guard bundleId > 0 else { return nil }
    let zipURL = otaDirectory.appendingPathComponent("bundle_\(bundleId).zip")
    return FileManager.default.fileExists(atPath: zipURL.path) ? zipURL.path : nil
  }

  private static var otaDirectory: URL {
    FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("ota", isDirectory: true)
  }

  private static func sha256Hex(of url: URL) -> String? {
    guard let handle = try? FileHandle(forReadingFrom: url) else { return nil }
    defer { try? handle.close() }
    var hasher = SHA256()
    while true {
      let chunk = handle.readData(ofLength: 65536)
      if chunk.isEmpty { break }
      hasher.update(data: chunk)
    }
    return hasher.finalize().map { String(format: "%02x", $0) }.joined()
  }
}
