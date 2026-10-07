import ExpoModulesCore

public class WorktreesStudioMmkvModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WorktreesStudioMmkv")

    Function("getString") { (instanceId: String, key: String) -> String? in
      prefs(for: instanceId).string(forKey: key)
    }

    Function("set") { (instanceId: String, key: String, value: String) in
      prefs(for: instanceId).set(value, forKey: key)
    }

    Function("remove") { (instanceId: String, key: String) in
      prefs(for: instanceId).removeObject(forKey: key)
    }

    Function("contains") { (instanceId: String, key: String) -> Bool in
      prefs(for: instanceId).object(forKey: key) != nil
    }

    Function("clearAll") { (instanceId: String) in
      let suite = prefs(for: instanceId)
      if instanceId.isEmpty {
        let dict = suite.dictionaryRepresentation()
        for key in dict.keys {
          suite.removeObject(forKey: key)
        }
      } else {
        suite.removePersistentDomain(forName: suiteName(for: instanceId))
      }
    }
  }

  private let defaultSuite = UserDefaults.standard
  private var suiteCache: [String: UserDefaults] = [:]

  private func suiteName(for instanceId: String) -> String {
    instanceId.isEmpty ? "worktrees_studio_mmkv" : "worktrees_studio_mmkv_\(instanceId)"
  }

  private func prefs(for instanceId: String) -> UserDefaults {
    if instanceId.isEmpty { return defaultSuite }
    let name = suiteName(for: instanceId)
    if let cached = suiteCache[name] { return cached }
    let suite = UserDefaults(suiteName: name) ?? defaultSuite
    suiteCache[name] = suite
    return suite
  }
}
