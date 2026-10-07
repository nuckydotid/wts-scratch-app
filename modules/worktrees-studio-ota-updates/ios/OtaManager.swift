import CryptoKit
import Foundation
import ZIPFoundation

private func sha256Hex(of url: URL) -> String? {
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

private final class DownloadProgressDelegate: NSObject, URLSessionTaskDelegate {
  private let onProgress: (Int64, Int64, Int) -> Void
  private var observation: NSKeyValueObservation?

  init(onProgress: @escaping (Int64, Int64, Int) -> Void) {
    self.onProgress = onProgress
  }

  func urlSession(_ session: URLSession, didCreateTask task: URLSessionTask) {
    observation = task.progress.observe(\.fractionCompleted, options: [.new]) { [weak self] progress, _ in
      guard let self else { return }
      let total = progress.totalUnitCount
      let completed = progress.completedUnitCount
      let percent = total > 0 ? Int((Double(completed) / Double(total)) * 100) : 0
      Task { @MainActor in
        self.onProgress(completed, total, min(100, percent))
      }
    }
  }
}

enum OtaResult {
  case updated
  case noUpdate
  case failure(Error)
}

final class OtaManager {
  static let shared = OtaManager()

  static let prefsSuiteName = "ota_prefs"
  static let bundleIdKey = "bundle_id"
  static let bundleSha256Key = "bundle_sha256"
  static let pendingBundleIdKey = "pending_bundle_id"
  static let pendingBundleSha256Key = "pending_bundle_sha256"

  static let lastNativeBuildVersionKey = "last_native_build_version"
  static let lastNativeAppVersionKey = "last_native_app_version"
  static let pendingStoreUpdateWipeKey = "pending_store_update_wipe"
  static let startupBundleInFlightKey = "startup_bundle_in_flight"
  static let startupCrashCountKey = "startup_crash_count"
  static let failedBundleIdsKey = "failed_bundle_ids"

  static var appKey: String = ""
  static var apiUrl: String = ""
  static var otaEnabled: Bool = false

  private let otaDirName = "ota"

  var onProgress: ((Int64, Int64, Int) -> Void)?

  func isBundleMarkedFailed(bundleId: Int64) -> Bool {
    guard bundleId > 0 else { return false }
    let list = prefs.stringArray(forKey: Self.failedBundleIdsKey) ?? []
    return list.contains(String(bundleId))
  }

  func markBundleFailed(bundleId: Int64) {
    guard bundleId > 0 else { return }
    var list = prefs.stringArray(forKey: Self.failedBundleIdsKey) ?? []
    let idStr = String(bundleId)
    if !list.contains(idStr) {
      list.append(idStr)
      prefs.set(list, forKey: Self.failedBundleIdsKey)
    }
    NSLog("[WorktreesStudioOta] Marked bundle %lld as failed / blacklisted from future downloads", bundleId)
  }

  func clearAppCacheAndStorage(markPendingStoreWipe: Bool = true) {
    // 1. Purge OTA bundle directory
    try? FileManager.default.removeItem(at: otaDirectory)

    // 2. Clear Caches directory
    if let cacheUrl = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first {
      if let items = try? FileManager.default.contentsOfDirectory(at: cacheUrl, includingPropertiesForKeys: nil) {
        for item in items {
          try? FileManager.default.removeItem(at: item)
        }
      }
    }

    // 3. Reset OTA prefs
    prefs.removeObject(forKey: Self.bundleIdKey)
    prefs.removeObject(forKey: Self.bundleSha256Key)
    prefs.removeObject(forKey: Self.pendingBundleIdKey)
    prefs.removeObject(forKey: Self.pendingBundleSha256Key)
    prefs.removeObject(forKey: Self.startupBundleInFlightKey)
    prefs.removeObject(forKey: Self.startupCrashCountKey)

    if markPendingStoreWipe {
      prefs.set(true, forKey: Self.pendingStoreUpdateWipeKey)
    } else {
      prefs.removeObject(forKey: Self.pendingStoreUpdateWipeKey)
    }

    NSLog("[WorktreesStudioOta] Cleared app cache and storage (markPendingStoreWipe=%d)", markPendingStoreWipe ? 1 : 0)
  }

  private init() {}

  private var prefs: UserDefaults {
    UserDefaults(suiteName: Self.prefsSuiteName) ?? .standard
  }

  var currentBundleId: Int64 {
    get { Int64(prefs.integer(forKey: Self.bundleIdKey)) }
    set { prefs.set(Int(newValue), forKey: Self.bundleIdKey) }
  }

  var pendingBundleId: Int64 {
    get { Int64(prefs.integer(forKey: Self.pendingBundleIdKey)) }
    set { prefs.set(Int(newValue), forKey: Self.pendingBundleIdKey) }
  }

  var otaBundleSha256: String? {
    get {
      let value = prefs.string(forKey: Self.bundleSha256Key) ?? ""
      return value.isEmpty ? nil : value
    }
    set { prefs.set(newValue ?? "", forKey: Self.bundleSha256Key) }
  }

  private var pendingBundleSha256: String? {
    get {
      let value = prefs.string(forKey: Self.pendingBundleSha256Key) ?? ""
      return value.isEmpty ? nil : value
    }
    set { prefs.set(newValue ?? "", forKey: Self.pendingBundleSha256Key) }
  }

  var otaBundleDir: URL? {
    let id = currentBundleId
    guard id > 0 else { return nil }
    let dir = otaDirectory.appendingPathComponent("bundle_\(id)", isDirectory: true)
    let bundlePath = dir.appendingPathComponent("main.jsbundle")
    return FileManager.default.fileExists(atPath: bundlePath.path) ? dir : nil
  }

  var otaBundlePath: String? {
    otaBundleDir?.appendingPathComponent("main.jsbundle").path
  }

  private var otaDirectory: URL {
    FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(otaDirName, isDirectory: true)
  }

  func downloadFromUrl(
    zipUrl: String,
    bundleId: Int64,
    zipSize: Int64,
    expectedZipSha256: String = ""
  ) async -> Bool {
    switch await downloadAndExtract(
      zipUrl: zipUrl,
      bundleId: bundleId,
      zipSize: zipSize,
      expectedZipSha256: expectedZipSha256
    ) {
    case .updated:
      return true
    case .noUpdate, .failure:
      return false
    }
  }

  func applyPendingBundle() -> Bool {
    let pendingId = pendingBundleId
    guard pendingId > 0 else { return false }

    let dir = otaDirectory.appendingPathComponent("bundle_\(pendingId)", isDirectory: true)
    let bundleFile = dir.appendingPathComponent("main.jsbundle")
    guard FileManager.default.fileExists(atPath: bundleFile.path) else { return false }

    currentBundleId = pendingId
    otaBundleSha256 = sha256Hex(of: bundleFile)
    pendingBundleId = 0
    pendingBundleSha256 = nil
    return true
  }

  private func downloadAndExtract(
    zipUrl: String,
    bundleId: Int64,
    zipSize: Int64,
    expectedZipSha256: String = ""
  ) async -> OtaResult {
    if isBundleMarkedFailed(bundleId: bundleId) {
      NSLog("[WorktreesStudioOta] Refusing to download bundle %lld: marked as failed/blacklisted", bundleId)
      return .failure(NSError(domain: "OtaManager", code: -3, userInfo: [NSLocalizedDescriptionKey: "Bundle is blacklisted due to startup failure"]))
    }

    guard let url = URL(string: zipUrl) else {
      return .failure(NSError(domain: "OtaManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid zip URL"]))
    }

    try? FileManager.default.createDirectory(at: otaDirectory, withIntermediateDirectories: true)

    let zipFile = otaDirectory.appendingPathComponent("bundle_\(bundleId).zip")
    let targetDir = otaDirectory.appendingPathComponent("bundle_\(bundleId)", isDirectory: true)

    do {
      var request = URLRequest(url: url)
      request.httpMethod = "GET"

      let delegate: URLSessionTaskDelegate? = onProgress.map { handler in
        DownloadProgressDelegate(onProgress: handler)
      }
      let (tempURL, response) = try await URLSession.shared.download(for: request, delegate: delegate)
      guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
        try? FileManager.default.removeItem(at: tempURL)
        return .failure(NSError(domain: "OtaManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "Download failed"]))
      }

      try? FileManager.default.removeItem(at: zipFile)
      try FileManager.default.moveItem(at: tempURL, to: zipFile)

      if !expectedZipSha256.isEmpty {
        guard let actual = sha256Hex(of: zipFile), actual.lowercased() == expectedZipSha256.lowercased() else {
          try? FileManager.default.removeItem(at: zipFile)
          return .failure(NSError(domain: "OtaManager", code: -2, userInfo: [NSLocalizedDescriptionKey: "OTA zip SHA-256 mismatch — bundle rejected"]))
        }
      }

      if FileManager.default.fileExists(atPath: targetDir.path) {
        try? FileManager.default.removeItem(at: targetDir)
      }
      try FileManager.default.createDirectory(at: targetDir, withIntermediateDirectories: true)

      try await extractZip(at: zipFile, to: targetDir)

      let bundleFile = targetDir.appendingPathComponent("main.jsbundle")
      pendingBundleSha256 = sha256Hex(of: bundleFile)
      pendingBundleId = bundleId
      return .updated
    } catch {
      return .failure(error)
    }
  }

  private func extractZip(at zipUrl: URL, to destDir: URL) async throws {
    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          try FileManager.default.unzipItem(at: zipUrl, to: destDir)
          continuation.resume()
        } catch {
          continuation.resume(throwing: error)
        }
      }
    }
  }
}
