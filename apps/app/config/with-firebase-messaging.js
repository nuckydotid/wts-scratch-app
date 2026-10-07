const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * Injects firebase-messaging into the app-level build.gradle at a version
 * compatible with the OneSignal SDK.
 *
 * OneSignal SDK requires firebase-messaging:[23.0.8, 24.0.99]. The firebase-bom
 * resolves to 25.0.2 which is outside this range and causes FCM token registration
 * to fail with SERVICE_NOT_AVAILABLE. Pinning to 24.0.0 satisfies the range.
 */
module.exports = function withFirebaseMessaging(config) {
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes("firebase-messaging")) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {
    implementation 'com.google.firebase:firebase-messaging:24.0.0'`,
      );
    }
    return config;
  });
};
