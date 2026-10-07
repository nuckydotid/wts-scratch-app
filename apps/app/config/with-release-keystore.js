const fs = require("fs");
const path = require("path");
const { withDangerousMod, withAppBuildGradle } = require("expo/config-plugins");
const { mergeContents } = require("@expo/config-plugins/build/utils/generateCode");

const TAG = "with-release-keystore";

function withCopyKeystoreFiles(config) {
  return withDangerousMod(config, [
    "android",
    async (c) => {
      const projectRoot = c.modRequest.projectRoot;
      const androidRoot = c.modRequest.platformProjectRoot;

      const srcJks = path.join(projectRoot, "release.jks");
      if (fs.existsSync(srcJks)) {
        fs.copyFileSync(srcJks, path.join(androidRoot, "release.jks"));
      }

      const srcProps = path.join(projectRoot, "keystore.properties");
      if (fs.existsSync(srcProps)) {
        fs.copyFileSync(srcProps, path.join(androidRoot, "keystore.properties"));
      }

      return c;
    },
  ]);
}

function withKeystoreSigningConfig(config) {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    // 1. Insert keystore Properties loader after the react plugin line
    if (!contents.includes(`${TAG}-props`)) {
      contents = mergeContents({
        tag: `${TAG}-props`,
        src: contents,
        newSrc: [
          'def keystorePropertiesFile = rootProject.file("keystore.properties")',
          "def keystoreProperties = new Properties()",
          "if (keystorePropertiesFile.exists()) {",
          "  keystoreProperties.load(new FileInputStream(keystorePropertiesFile))",
          "}",
        ].join("\n"),
        anchor: /apply plugin: "com\.facebook\.react"/,
        offset: 1,
        comment: "//",
      }).contents;
    }

    // 2. Insert create("release") signing config after the debug block
    if (!contents.includes(`${TAG}-signing`)) {
      contents = mergeContents({
        tag: `${TAG}-signing`,
        src: contents,
        newSrc: [
          '        create("release") {',
          '            storeFile = keystoreProperties.getProperty("storeFile") ? rootProject.file(keystoreProperties.getProperty("storeFile")) : null',
          '            storePassword = keystoreProperties.getProperty("storePassword") ?: ""',
          '            keyAlias = keystoreProperties.getProperty("keyAlias") ?: ""',
          '            keyPassword = keystoreProperties.getProperty("keyPassword") ?: ""',
          "        }",
        ].join("\n"),
        anchor: /signingConfigs\s*\{/,
        offset: 7,
        comment: "//",
      }).contents;
    }

    // 3. Change release build type to use release signing config
    const releaseDebugRef = "signingConfig signingConfigs.debug";
    const releaseReleaseRef = "signingConfig signingConfigs.release";
    if (contents.includes(releaseDebugRef) && !contents.includes(releaseReleaseRef)) {
      const lines = contents.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (/^\s+release\s*\{/.test(lines[i]) && !lines[i].includes("//")) {
          for (let j = i; j < lines.length; j++) {
            if (/\}/.test(lines[j])) break;
            if (lines[j].includes(releaseDebugRef)) {
              lines[j] = lines[j].replace(releaseDebugRef, releaseReleaseRef);
              break;
            }
          }
        }
      }
      contents = lines.join("\n");
    }

    // 4. Change debug build type to also use release signing config
    if (contents.includes("signingConfig signingConfigs.debug")) {
      const lines = contents.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (/^\s+debug\s*\{/.test(lines[i]) && !lines[i].includes("//")) {
          for (let j = i; j < lines.length; j++) {
            if (/\}/.test(lines[j])) break;
            if (lines[j].includes("signingConfig signingConfigs.debug")) {
              lines[j] = lines[j].replace(
                "signingConfig signingConfigs.debug",
                "signingConfig signingConfigs.release",
              );
              break;
            }
          }
        }
      }
      contents = lines.join("\n");
    }

    mod.modResults.contents = contents;
    return mod;
  });
}

function withReleaseKeystore(config) {
  config = withCopyKeystoreFiles(config);
  config = withKeystoreSigningConfig(config);
  return config;
}

module.exports = withReleaseKeystore;
