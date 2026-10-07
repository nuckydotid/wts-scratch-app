const fs = require("fs");
const path = require("path");

const { withDangerousMod, withXcodeProject } = require("expo/config-plugins");

/**
 * Copies the seedable app assets raw into the app bundle at prebuild time:
 *  - Android: android/app/src/main/assets/worktrees-studio-assets/ — read at runtime
 *    via `Paths.bundle` (the AssetManager root, asset://);
 *  - iOS:     ios/<app>/worktrees-studio-assets/ added as an Xcode folder reference
 *    (lands in the .app bundle root, paths preserved) — read at runtime via
 *    `Paths.bundle` (Bundle.main.bundlePath).
 *
 * App assets are deliberately NOT Metro-bundled: worktrees-studio-asset-cache seeds
 * the cache from these raw files, avoiding Android resource packaging
 * (res/drawable) entirely. `launcher/` is excluded (launcher/splash only).
 */
const isProd = process.env.APP_VARIANT === "production";
const SEED_DIRS = isProd
  ? ["bottom-tab", "characters", "fonts", "images"]
  : ["bottom-tab", "characters", "fonts", "images", "e2e"];
const EXCLUDE = new Set(["launcher"]);

function copySeedDirs(assetsRoot, destRoot) {
  fs.rmSync(destRoot, { recursive: true, force: true });

  const copyDir = (srcDir, destDir) => {
    fs.mkdirSync(destDir, { recursive: true });
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || EXCLUDE.has(entry.name)) continue;
      const src = path.join(srcDir, entry.name);
      const dest = path.join(destDir, entry.name);
      if (entry.isDirectory()) {
        copyDir(src, dest);
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  };

  for (const dir of SEED_DIRS) {
    copyDir(path.join(assetsRoot, dir), path.join(destRoot, dir));
  }
}

function withAndroidRawAssets(config) {
  return withDangerousMod(config, [
    "android",
    async (c) => {
      const projectRoot = c.modRequest.projectRoot;
      const destRoot = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "assets",
        "worktrees-studio-assets",
      );
      copySeedDirs(path.join(projectRoot, "assets"), destRoot);
      return c;
    },
  ]);
}

function withIosRawAssets(config) {
  config = withDangerousMod(config, [
    "ios",
    async (c) => {
      const projectRoot = c.modRequest.projectRoot;
      const appDir = c.modRequest.platformProjectRoot;
      const destRoot = path.join(appDir, c.modRequest.projectName, "worktrees-studio-assets");
      copySeedDirs(path.join(projectRoot, "assets"), destRoot);
      return c;
    },
  ]);

  config = withXcodeProject(config, (c) => {
    const pbx = c.modResults;
    try {
      // The main group has no path, so a reference resolves relative to the
      // project dir — mirror the template's "myappstaging/Supporting"
      // pattern with the full app-dir prefix.
      const folderPath = `${c.modRequest.projectName}/worktrees-studio-assets`;
      if (!pbx.hasFile(folderPath)) {
        // Use addFile (NOT addResourceFile): the generated project has no
        // "Resources" group, and addResourceFile's correctForResourcesPath
        // dereferences it (xcode lib TypeError). addFile + the resources
        // build phase replicate the folder reference + .app bundle copy.
        const file = pbx.addFile(folderPath, pbx.getFirstProject().firstProject.mainGroup, {
          lastKnownFileType: "folder",
        });
        if (!file) {
          console.warn(
            "[with-raw-assets] could not add worktrees-studio-assets folder reference — iOS seeding will fall back to downloads.",
          );
          return c;
        }
        file.uuid = pbx.generateUuid();
        pbx.addToPbxBuildFileSection(file);
        pbx.addToPbxResourcesBuildPhase(file);
      }
    } catch (error) {
      console.warn(
        "[with-raw-assets] failed to add worktrees-studio-assets folder reference — iOS seeding will fall back to downloads.",
        error,
      );
    }
    return c;
  });

  return config;
}

module.exports = function withRawAssets(config) {
  config = withAndroidRawAssets(config);
  config = withIosRawAssets(config);
  return config;
};
