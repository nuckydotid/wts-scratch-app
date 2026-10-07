# iOS Universal Links

iOS Universal Links allow you to associate your app with a domain so that tapping a link opens your app directly instead of Safari. This requires a two-way association between your website and your app.

## Setup Overview

1. Create an Apple App Site Association (AASA) file
2. Host it on your website
3. Configure `ios.associatedDomains` in your app
4. Deploy and verify

## Two-Way Association

1. **Website → App**: The AASA file on your website lists your app's bundle ID and supported paths
2. **App → Website**: Your app declares the associated domain in `ios.associatedDomains`

Both must match for universal links to work.

## Create the AASA File

Create the file at `public/.well-known/apple-app-site-association` (no file extension):

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": [
          "TEAM_ID.com.mycompany.myapp"
        ],
        "components": [
          {
            "/": "/help/*",
            "comment": "Matches /help/* paths"
          },
          {
            "/": "/settings/*",
            "comment": "Matches /settings/* paths"
          }
        ]
      }
    ]
  },
  "activitycontinuation": {
    "apps": [
      "TEAM_ID.com.mycompany.myapp"
    ]
  },
  "webcredentials": {
    "apps": [
      "TEAM_ID.com.mycompany.myapp"
    ]
  }
}
```

### File Details

The `applinks` section handles universal links. The `details` array contains objects with:

| Field | Description |
| --- | --- |
| `appIDs` | Array of app identifiers in `TEAM_ID.bundleId` format |
| `components` | Array of path patterns to match |

The `components` field uses path patterns:

| Pattern | Matches |
| --- | --- |
| `"/"` | Only the root path |
| `"/help/*"` | Any path under `/help/` |
| `"/"` with `"comment"` | Path with a description for readability |

### Activity Continuation

The `activitycontinuation` section allows your app to continue user activities from the website (Handoff):

```json
"activitycontinuation": {
  "apps": [
    "TEAM_ID.com.mycompany.myapp"
  ]
}
```

### Web Credentials

The `webcredentials` section allows your app to share credentials with the website via iCloud Keychain:

```json
"webcredentials": {
  "apps": [
    "TEAM_ID.com.mycompany.myapp"
  ]
}
```

## Hosting the AASA File

The file must be:

- Hosted on **HTTPS**
- Served at `https://<your-domain>/.well-known/apple-app-site-association`
- Accessible without authentication
- Served with `Content-Type: application/json`

> **Note:** The file has no extension. Do not serve it as `.json` — the URL path should end exactly at `apple-app-site-association`.

### With Expo Router (Static)

Place the file in `public/.well-known/` in your project. It will be served at the correct path after deployment.

### With Vercel

Create a `vercel.json` rewrite to ensure proper serving:

```json
{
  "rewrites": [
    {
      "source": "/.well-known/apple-app-site-association",
      "destination": "/.well-known/apple-app-site-association"
    }
  ],
  "headers": [
    {
      "source": "/.well-known/apple-app-site-association",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    }
  ]
}
```

## App Config: Associated Domains

Add the `ios.associatedDomains` field in your `app.json`:

```json
{
  "expo": {
    "ios": {
      "associatedDomains": [
        "applinks:myapp.com",
        "applinks:www.myapp.com"
      ]
    }
  }
}
```

The `applinks:` prefix tells iOS this is a universal link association. Add the domain without the `https://` protocol prefix.

## Smart Apple Banner

Add an Apple Smart Banner meta tag to your website so users see an "Open in App" banner in Safari:

```html
<meta name="apple-itunes-app" content="app-id=YOUR_APP_STORE_ID, app-argument=https://myapp.com/some/path" />
```

Replace `YOUR_APP_STORE_ID` with your app's numeric App Store ID.

## Setup Safari for Development

Run the following command to configure Safari and your development device for universal links:

```bash
npx setup-safari
```

This command:
- Enables the **Web Inspector** in Safari on your Mac
- Enables **Web Inspector** on your connected iOS device
- Configures the necessary provisioning profiles for universal links

## Debugging

### Test with `--tunnel`

When developing locally, use the `--tunnel` flag to expose your local server to the internet:

```bash
npx expo start --tunnel
```

This generates a public URL that your iOS device can reach for verification.

### Test Universal Links

1. Open **Notes** or **Messages** on your iOS device
2. Paste the full URL (e.g., `https://myapp.com/help/something`)
3. Long-press the link — you should see "Open in [App Name]" in the context menu
4. Tap the link — it should open your app

### Verify AASA File

Use Apple's [App Site Association validation tool](https://search.developer.apple.com/appsearch-validation/) or check the file directly:

```bash
curl -s https://myapp.com/.well-known/apple-app-site-association | python3 -m json.tool
```

### Common Issues

| Problem | Solution |
| --- | --- |
| Link opens Safari instead of app | Verify the AASA file is valid and hosted on HTTPS |
| Link opens app but not the right screen | Check `components` paths match your routing setup |
| Changes not taking effect | iOS caches AASA files — re-deploy and wait up to 24 hours, or uninstall and reinstall the app |
| Missing team ID | Use your Apple Developer Team ID (10-character alphanumeric) prefixed to the bundle ID |
| Certificate issues | Ensure the domain is using a valid SSL certificate |
| Local development issues | Use `--tunnel` and verify the AASA file is accessible at the public URL |
