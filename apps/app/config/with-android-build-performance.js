const fs = require("fs");
const path = require("path");

const {
  withDangerousMod,
  withGradleProperties,
  withProjectBuildGradle,
} = require("expo/config-plugins");

/**
 * Persists Android build tunings across `expo prebuild --clean`.
 *
 * Matches the worker/expo monorepo setup:
 * - arm64 + x86_64 only (skip armeabi-v7a / x86)
 * - More Gradle heap + metaspace for Reanimated / lint
 * - Cap parallel workers to reduce peak memory
 * - Skip release lint vital checks (expo run already passes -x lint, but AGP
 *   still runs lintVitalAnalyzeRelease and can OOM on large dependency graphs)
 * - Strip Expo's --configure-on-demand (breaks New Arch codegen before CMake)
 * - Codegen-before-CMake guard for New Architecture autolinking
 */
const OVERRIDES = [
  { key: "reactNativeArchitectures", value: "arm64-v8a,x86_64" },
  {
    key: "org.gradle.jvmargs",
    value: "-Xmx4096m -XX:MaxMetaspaceSize=1024m -Dfile.encoding=UTF-8",
  },
  { key: "org.gradle.workers.max", value: "2" },
  { key: "android.lint.checkReleaseBuilds", value: "false" },
  { key: "org.gradle.configureondemand", value: "false" },
  // Disable the Gradle build cache: the expo CLI's `bun run android` passes
  // `--build-cache`, and a stale cache entry can serve the expo module's AAR
  // without the generated `ExpoModulesPackageList` class (the app then fails
  // at startup with a NativeModulesProxy NPE → stuck splash). With caching
  // off, every build regenerates the packages list from source.
  { key: "org.gradle.caching", value: "false" },
  // Enable R8 code shrinking and resource shrinking in release builds:
  // Strips unused Jetpack Compose, ExoPlayer, Camera, Guava, Tink, and AndroidX
  // classes, reducing DEX size from ~58 MB down to ~12-15 MB.
  { key: "android.enableMinifyInReleaseBuilds", value: "true" },
  { key: "android.enableShrinkResourcesInReleaseBuilds", value: "true" },
];

const CODEGEN_GUARD_MARKER =
  "config/with-android-build-performance.js — New Arch codegen before CMake";

const SYSTEM_BARS_MARKER =
  "<!-- @generated config/with-android-build-performance.js — system bar appearance -->";

const GRADLEW_PATCH_MARKER =
  "config/with-android-build-performance.js — Expo passes --configure-on-demand";

const GRADLEW_PATCH = `# @generated ${GRADLEW_PATCH_MARKER}
# which skips New Architecture library codegen before app CMake (react-native-svg headers).
if [ "\${WORKTREES_STUDIO_KEEP_CONFIGURE_ON_DEMAND:-}" != "1" ]; then
  _worktrees_studio_gradle_args=
  for _worktrees_studio_arg in "$@"; do
    if [ "$_worktrees_studio_arg" = "--configure-on-demand" ]; then
      _worktrees_studio_arg="--no-configure-on-demand"
    fi
    _worktrees_studio_gradle_args="$_worktrees_studio_gradle_args '$(printf '%s' "$_worktrees_studio_arg" | sed "s/'/'\\\\''/g")'"
  done
  eval "set -- $_worktrees_studio_gradle_args"
fi

`;

const CODEGEN_CMAKE_GUARD = `
// @generated ${CODEGEN_GUARD_MARKER}
gradle.projectsEvaluated {
    def codegenTasks = rootProject.subprojects.collectMany { sub ->
        sub.tasks.matching { it.name == 'generateCodegenArtifactsFromSchema' }.toList()
    }
    def appProject = rootProject.findProject(':app')
    if (appProject != null && !codegenTasks.isEmpty()) {
        appProject.tasks.matching { task ->
            task.name.startsWith('buildCMake') || task.name.startsWith('configureCMake')
        }.configureEach { cmakeTask ->
            cmakeTask.dependsOn(codegenTasks)
        }
    }
}
`;

function patchGradlew(contents) {
  if (contents.includes(GRADLEW_PATCH_MARKER)) {
    return contents;
  }

  const shebang = "#!/bin/sh\n";
  if (!contents.startsWith(shebang)) {
    return contents;
  }

  return contents.replace(shebang, `${shebang}\n${GRADLEW_PATCH}`);
}

function withAndroidBuildPerformance(config) {
  config = withGradleProperties(config, (c) => {
    for (const { key, value } of OVERRIDES) {
      c.modResults = c.modResults.filter((item) => !(item.type === "property" && item.key === key));
      c.modResults.push({ type: "property", key, value });
    }
    return c;
  });

  config = withProjectBuildGradle(config, (c) => {
    if (!c.modResults.contents.includes(CODEGEN_GUARD_MARKER)) {
      c.modResults.contents += CODEGEN_CMAKE_GUARD;
    }
    return c;
  });

  config = withDangerousMod(config, [
    "android",
    async (c) => {
      const gradlewPath = path.join(c.modRequest.platformProjectRoot, "gradlew");
      const contents = fs.readFileSync(gradlewPath, "utf8");
      const next = patchGradlew(contents);
      if (next !== contents) {
        fs.writeFileSync(gradlewPath, next);
      }
      return c;
    },
  ]);

  // System-bar appearance: the app implements dark mode at the React level
  // (AppCompat night mode flips via Appearance.setColorScheme → DayNight
  // resolves values-night), but the theme never declared the bar appearances,
  // so the status bar icons and the 3-button nav bar stayed at the
  // system-light defaults regardless of the app theme. Declare them per mode.
  config = withDangerousMod(config, [
    "android",
    async (c) => {
      const resDir = path.join(c.modRequest.platformProjectRoot, "app/src/main/res");
      const lightStylesPath = path.join(resDir, "values/styles.xml");
      const nightStylesPath = path.join(resDir, "values-night/styles.xml");

      const lightStyles = fs.readFileSync(lightStylesPath, "utf8");
      if (!lightStyles.includes(SYSTEM_BARS_MARKER)) {
        const anchor = '<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">';
        if (lightStyles.includes(anchor)) {
          fs.writeFileSync(
            lightStylesPath,
            lightStyles.replace(
              anchor,
              `${anchor}\n    ${SYSTEM_BARS_MARKER}\n    <item name="android:windowLightStatusBar">true</item>\n    <item name="android:windowLightNavigationBar">true</item>\n    <item name="android:defaultFocusHighlightEnabled">false</item>`,
            ),
          );
        }
      }

      const nightDir = path.dirname(nightStylesPath);
      if (!fs.existsSync(nightDir)) {
        fs.mkdirSync(nightDir, { recursive: true });
      }
      if (
        !fs.existsSync(nightStylesPath) ||
        !fs.readFileSync(nightStylesPath, "utf8").includes(SYSTEM_BARS_MARKER)
      ) {
        fs.writeFileSync(
          nightStylesPath,
          `<resources xmlns:tools="http://schemas.android.com/tools">\n  <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">\n    ${SYSTEM_BARS_MARKER}\n    <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>\n    <item name="colorPrimary">@color/colorPrimary</item>\n    <item name="android:statusBarColor">@android:color/transparent</item>\n    <item name="android:navigationBarColor">@android:color/transparent</item>\n    <item name="android:windowLightStatusBar">false</item>\n    <item name="android:windowLightNavigationBar">false</item>\n    <item name="android:defaultFocusHighlightEnabled">false</item>\n  </style>\n</resources>\n`,
        );
      }
      return c;
    },
  ]);

  // Ensure ProGuard / R8 rules are persisted across `expo prebuild --clean`
  config = withDangerousMod(config, [
    "android",
    async (c) => {
      const proguardPath = path.join(c.modRequest.platformProjectRoot, "app/proguard-rules.pro");
      if (fs.existsSync(proguardPath)) {
        const contents = fs.readFileSync(proguardPath, "utf8");
        if (!contents.includes(PROGUARD_RULES_MARKER)) {
          fs.writeFileSync(proguardPath, `${contents.trim()}\n${PROGUARD_RULES}\n`);
        }
      }
      return c;
    },
  ]);

  return config;
}

const PROGUARD_RULES_MARKER =
  "# @generated config/with-android-build-performance.js — R8 minification rules";

const PROGUARD_RULES = `
${PROGUARD_RULES_MARKER}
# React Native & JNI
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# React Native Reanimated & Worklets
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }

# Custom Worktrees Studio Monorepo Expo Modules
-keep class expo.modules.worktreesstudiootaupdates.** { *; }
-keep class expo.modules.worktreesstudiommkv.** { *; }
-keep class expo.modules.worktreesstudiosystembars.** { *; }
-keep class expo.modules.worktreesstudiogooglesignin.** { *; }
-keep class expo.modules.worktreesstudioassetcache.** { *; }

# Expo Core & Kotlin Module Reflection
-keepclassmembers class * extends expo.modules.kotlin.modules.Module {
    public <methods>;
}
-keep class * implements expo.modules.core.interfaces.Package {
    public *;
}

# Google Play In-App Updates
-keep class com.google.android.play.core.appupdate.** { *; }

# OneSignal & Firebase Messaging
-keep class com.onesignal.** { *; }
-dontwarn com.onesignal.**
-keep class com.google.firebase.messaging.** { *; }

# Google MLKit & Camera
-keep class com.google.mlkit.** { *; }
-keep class androidx.camera.** { *; }

# General Reflection Attributes
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Don't warn on missing optional references from third-party libraries
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn com.google.crypto.tink.**
-dontwarn org.checkerframework.**
`;

module.exports = withAndroidBuildPerformance;
