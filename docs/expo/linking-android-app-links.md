# Android App Links

Android App Links allow you to associate your app with a domain so that clicking a link opens your app instead of the browser. This requires a two-way association between your website and your app.

## Setup Overview

1. Add intent filters in your app config
2. Create an `assetlinks.json` file on your website
3. Host the file on HTTPS
4. Deploy and verify

## App Config: Intent Filters

Add `android.intentFilters` with `autoVerify: true` in your app config:

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "myapp.com",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

The `autoVerify: true` flag is added automatically by Expo when you define intent filters with the `https` scheme.

## Two-Way Association

Android App Links require verification from both directions:

1. **Website → App**: The `assetlinks.json` file on your website lists your app's package name and signing certificate fingerprint
2. **App → Website**: Your app declares the domain in intent filters with `autoVerify: true`

Both must match for verification to succeed.

## Create `assetlinks.json`

Create the file at `public/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.mycompany.myapp",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

Replace:
- `package_name` with your app's package name from `app.json` (`android.package`)
- `sha256_cert_fingerprints` with your app's signing certificate fingerprint

For multiple apps (debug + release), add multiple entries:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.mycompany.myapp",
      "sha256_cert_fingerprints": [
        "DEBUG_FINGERPRINT",
        "RELEASE_FINGERPRINT"
      ]
    }
  }
]
```

## Getting the SHA256 Fingerprint

### From EAS Build

Run the EAS diagnostics command to see your credentials:

```bash
eas credentials
```

Or check the build logs on the [EAS Build website](https://expo.dev).

### From Google Play Console

1. Go to **Release** > **App signing** in the Google Play Console
2. Find the **SHA-256 certificate fingerprint** under the "App integrity" section

### From a Local Keystore

If you have the keystore file:

```bash
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```

## Hosting the File

The `assetlinks.json` file must be:

- Hosted on **HTTPS**
- Served at `https://<your-domain>/.well-known/assetlinks.json`
- Accessible without authentication
- Served with `Content-Type: application/json`

### With Expo Router (Static)

If using Expo Router, place the file in the `public/.well-known/` directory. It will be served at `https://<domain>/.well-known/assetlinks.json` after deployment.

### Custom Server

If using a custom server:

```nginx
location /.well-known/assetlinks.json {
  default_type application/json;
  alias /var/www/public/.well-known/assetlinks.json;
}
```

## Debugging

### Test with `--tunnel`

When developing locally, use the `--tunnel` flag to expose your local server to the internet:

```bash
npx expo start --tunnel
```

This generates a public URL that Android can reach for verification.

### Verify with adb

Check if your app is set as the default handler for a URL:

```bash
adb shell am start -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "https://myapp.com/some/path"
```

Check verification status:

```bash
adb shell pm verify-connections
```

### Common Issues

| Problem | Solution |
| --- | --- |
| Verification fails | Ensure `assetlinks.json` is accessible over HTTPS without redirects |
| Wrong fingerprint | Use the correct signing certificate fingerprint for your build environment |
| Missing intent filters | Verify `android.intentFilters` is configured in `app.json` |
| Path mismatch | The `pathPrefix` must match the URL path you are testing |
| Redirect issues | Do not redirect `.well-known` paths — serve the file directly |
