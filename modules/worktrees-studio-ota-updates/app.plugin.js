const fs = require("fs");
const path = require("path");
const {
  AndroidConfig,
  withAndroidManifest,
  withAppBuildGradle,
  withAppDelegate,
  withDangerousMod,
  withInfoPlist,
  withMainApplication,
} = require("@expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");

const TAG = "worktrees-studio-ota-updates";
const META_API_URL = "expo.modules.worktreesstudiootaupdates.API_URL";
const META_OTA_APP_KEY = "expo.modules.worktreesstudiootaupdates.OTA_APP_KEY";

function escapeGradleString(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

/** Remove legacy OTA_ENABLED injections (signingConfigs + buildTypes) from older plugin versions. */
function stripLegacyOtaBuildGradleBlocks(contents) {
  return contents.replace(
    /\n?\/\/ @generated begin worktrees-studio-ota-updates-(?:debug|release)-enabled[\s\S]*?\/\/ @generated end worktrees-studio-ota-updates-(?:debug|release)-enabled\n?/g,
    "\n",
  );
}

function withWorktreesStudioOtaBuildConfig(config, props) {
  const apiUrl = escapeGradleString(props.apiUrl ?? "");
  const otaAppKey = escapeGradleString(props.otaAppKey ?? "");

  return withAppBuildGradle(config, (mod) => {
    let contents = stripLegacyOtaBuildGradleBlocks(mod.modResults.contents);

    if (!contents.includes(`${TAG}-default-config`)) {
      contents = mergeContents({
        tag: `${TAG}-default-config`,
        src: contents,
        newSrc: [
          `        buildConfigField "String", "OTA_API_URL", "\\"${apiUrl}\\""`,
          `        buildConfigField "String", "OTA_APP_KEY", "\\"${otaAppKey}\\""`,
        ].join("\n"),
        anchor: /defaultConfig\s*\{/,
        offset: 1,
        comment: "//",
      }).contents;
    }

    mod.modResults.contents = contents;
    return mod;
  });
}

function withWorktreesStudioOtaAndroidManifest(config, props) {
  const apiUrl = props.apiUrl ?? "";
  const otaAppKey = props.otaAppKey ?? "";

  return withAndroidManifest(config, (mod) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      mod.modResults,
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      META_API_URL,
      apiUrl,
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      META_OTA_APP_KEY,
      otaAppKey,
    );
    return mod;
  });
}

function withWorktreesStudioOtaMainApplication(config) {
  return withMainApplication(config, (mod) => {
    let contents = mod.modResults.contents;

    if (!contents.includes(`${TAG}-imports`)) {
      contents = mergeContents({
        tag: `${TAG}-imports`,
        src: contents,
        newSrc: [
          "import expo.modules.worktreesstudiootaupdates.OtaBundleLoader",
          "import expo.modules.worktreesstudiootaupdates.WorktreesStudioOtaBootstrap",
        ].join("\n"),
        anchor: /import expo\.modules\.ApplicationLifecycleDispatcher/,
        offset: 0,
        comment: "//",
      }).contents;
    }

    if (!contents.includes(`${TAG}-react-host`)) {
      contents = mergeContents({
        tag: `${TAG}-react-host`,
        src: contents,
        newSrc: "      jsBundleFilePath = null,",
        anchor: /context = applicationContext,/,
        offset: 1,
        comment: "//",
      }).contents;
    }

    if (!contents.includes(`${TAG}-react-host-factory`)) {
      contents = contents.replace(
        /ExpoReactHostFactory\.getDefaultReactHost\(/g,
        "WorktreesStudioExpoReactHostFactory.getDefaultReactHost(",
      );
      contents = mergeContents({
        tag: `${TAG}-react-host-factory`,
        src: contents,
        newSrc:
          "import expo.modules.worktreesstudiootaupdates.WorktreesStudioExpoReactHostFactory",
        anchor: /import expo\.modules\.ExpoReactHostFactory/,
        offset: 1,
        comment: "//",
      }).contents;
    }

    if (!contents.includes(`${TAG}-on-create`)) {
      contents = mergeContents({
        tag: `${TAG}-on-create`,
        src: contents,
        newSrc: [
          "    WorktreesStudioOtaBootstrap.configureOta(this)",
          "    DefaultNewArchitectureEntryPoint.releaseLevel = try {",
          "      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())",
          "    } catch (e: IllegalArgumentException) {",
          "      ReleaseLevel.STABLE",
          "    }",
          "    WorktreesStudioOtaBootstrap.logColdStartIfReady(this)",
        ].join("\n"),
        anchor: /super\.onCreate\(\)/,
        offset: 1,
        comment: "//",
      }).contents;
    }

    if (!contents.includes(`${TAG}-resources`)) {
      contents = mergeContents({
        tag: `${TAG}-resources`,
        src: contents,
        newSrc: [
          "  override fun getResources(): android.content.res.Resources {",
          "    return OtaBundleLoader.peekOtaResources() ?: super.getResources()",
          "  }",
          "",
          "  override fun getAssets(): android.content.res.AssetManager {",
          "    return OtaBundleLoader.peekOtaAssetManager() ?: super.getAssets()",
          "  }",
        ].join("\n"),
        anchor: /override fun onConfigurationChanged/,
        offset: 0,
        comment: "//",
      }).contents;
    }

    mod.modResults.contents = contents;
    return mod;
  });
}

function withWorktreesStudioOtaGradleSync(config) {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;
    if (!contents.includes(`${TAG}-gradle-sync`)) {
      contents = mergeContents({
        tag: `${TAG}-gradle-sync`,
        src: contents,
        newSrc: [
          'tasks.register("syncWorktreesStudioOtaKotlin") {',
          "    doLast {",
          "        def repoRoot = rootDir.getAbsoluteFile().getParentFile()",
          "        def templateCandidates = [",
          '            new File(repoRoot, "modules/worktrees-studio-ota-updates/android/app-templates"),',
          '            new File(repoRoot, "../../modules/worktrees-studio-ota-updates/android/app-templates"),',
          '            new File(repoRoot, "node_modules/worktrees-studio-ota-updates/android/app-templates"),',
          "        ]",
          "        def templatesDir = templateCandidates.find { it.isDirectory() }",
          "        if (templatesDir == null) {",
          '            throw new GradleException("Worktrees Studio OTA Kotlin templates not found under node_modules or modules/")',
          "        }",
          '        def destDir = new File(projectDir, "src/main/java/expo/modules/worktreesstudiootaupdates")',
          "        destDir.mkdirs()",
          "        [",
          '            "OtaAwareReleaseDevSupportManager.kt",',
          '            "OtaDevSupportManagerFactory.kt",',
          '            "WorktreesStudioExpoReactHostFactory.kt",',
          "        ].each { name ->",
          "            ant.copy(",
          "                file: new File(templatesDir, name),",
          "                tofile: new File(destDir, name),",
          "                overwrite: true,",
          "            )",
          "        }",
          "    }",
          "}",
          'preBuild.dependsOn("syncWorktreesStudioOtaKotlin")',
        ].join("\n"),
        anchor: /apply plugin: 'com\.google\.gms\.google-services'/,
        offset: 0,
        comment: "//",
      }).contents;
    }
    mod.modResults.contents = contents;
    return mod;
  });
}

function withWorktreesStudioOtaMainActivity(config) {
  // Splash hide is handled in WorktreesStudioExpoReactHostFactory.onReactContextInitialized + JS hideAsync.
  return config;
}

function withWorktreesStudioOtaAppKotlin(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const templatesDir = [
        path.join(
          projectRoot,
          "node_modules",
          "worktrees-studio-ota-updates",
          "android",
          "app-templates",
        ),
        path.join(
          projectRoot,
          "..",
          "..",
          "modules",
          "worktrees-studio-ota-updates",
          "android",
          "app-templates",
        ),
      ].find((candidate) => fs.existsSync(candidate));
      if (!templatesDir) {
        throw new Error(
          "Worktrees Studio OTA Kotlin templates not found under node_modules or modules/",
        );
      }
      const destDir = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "java",
        "expo",
        "modules",
        "worktreesstudiootaupdates",
      );
      fs.mkdirSync(destDir, { recursive: true });
      for (const fileName of [
        "OtaAwareReleaseDevSupportManager.kt",
        "OtaDevSupportManagerFactory.kt",
        "WorktreesStudioExpoReactHostFactory.kt",
      ]) {
        fs.copyFileSync(
          path.join(templatesDir, fileName),
          path.join(destDir, fileName),
        );
      }
      return config;
    },
  ]);
}

function withWorktreesStudioOtaAppDelegate(config) {
  return withAppDelegate(config, (mod) => {
    let contents = mod.modResults.contents;

    contents = contents.replace(
      /\n?\/\/ @generated begin worktrees-studio-ota-updates-apply-observer[\s\S]*?\/\/ @generated end worktrees-studio-ota-updates-apply-observer\n?/g,
      "\n",
    );

    if (!contents.includes(`${TAG}-swift-import`)) {
      contents = mergeContents({
        tag: `${TAG}-swift-import`,
        src: contents,
        newSrc: "internal import WorktreesStudioOtaUpdates",
        anchor: /import ReactAppDependencyProvider/,
        offset: 1,
        comment: "//",
      }).contents;
    }

    if (!contents.includes(`${TAG}-app-delegate-init`)) {
      contents = mergeContents({
        tag: `${TAG}-app-delegate-init`,
        src: contents,
        newSrc: "    OtaBundleLoader.onApplicationCreate()",
        anchor: /let delegate = ReactNativeDelegate\(\)/,
        offset: 0,
        comment: "//",
      }).contents;
    }

    if (!contents.includes(`${TAG}-bundle-url`)) {
      contents = mergeContents({
        tag: `${TAG}-bundle-url`,
        src: contents,
        newSrc: [
          "    if let otaURL = OtaBundleLoader.resolveOtaBundleURL() {",
          "      return otaURL",
          "    }",
        ].join("\n"),
        anchor:
          /return Bundle\.main\.url\(forResource: "main", withExtension: "jsbundle"\)/,
        offset: 0,
        comment: "//",
      }).contents;
    }

    mod.modResults.contents = contents;
    return mod;
  });
}

function withWorktreesStudioOtaInfoPlist(config, pluginProps) {
  return withInfoPlist(config, (mod) => {
    mod.modResults.OTA_API_URL = pluginProps.apiUrl;
    mod.modResults.OTA_APP_KEY = pluginProps.otaAppKey;
    return mod;
  });
}

function withWorktreesStudioOtaUpdates(config, props = {}) {
  const pluginProps = {
    apiUrl: props.apiUrl ?? "",
    otaAppKey: props.otaAppKey ?? "",
  };

  config = {
    ...config,
    extra: {
      ...config.extra,
      worktrees-studioOtaUpdates: pluginProps,
    },
  };

  config = withWorktreesStudioOtaBuildConfig(config, pluginProps);
  config = withWorktreesStudioOtaAndroidManifest(config, pluginProps);
  config = withWorktreesStudioOtaMainApplication(config);
  config = withWorktreesStudioOtaMainActivity(config);
  config = withWorktreesStudioOtaAppKotlin(config);
  config = withWorktreesStudioOtaGradleSync(config);
  config = withWorktreesStudioOtaInfoPlist(config, pluginProps);
  config = withWorktreesStudioOtaAppDelegate(config);
  return config;
}

module.exports = withWorktreesStudioOtaUpdates;
