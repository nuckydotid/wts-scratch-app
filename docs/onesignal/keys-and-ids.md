# Keys and IDs

OneSignal uses several identifiers and API keys for authentication and access control.

## Identifiers

| ID                  | Type        | Description                                               |
| ------------------- | ----------- | --------------------------------------------------------- |
| **App ID**          | Public UUID | Identifies your OneSignal app. Safe for client-side code. |
| **Organization ID** | Public UUID | Identifies your OneSignal organization.                   |

## API Keys

| Key                      | Scope      | Description                                 |
| ------------------------ | ---------- | ------------------------------------------- |
| **App API Key**          | Single app | Full access to one app's data and settings. |
| **Organization API Key** | Org-wide   | Access to all apps in the organization.     |

### Key Format

- App API keys start with `os_v2_app_`
- Organization API keys start with `os_v2_org_`

```
os_v2_app_12345678-abcd-efgh-ijkl-1234567890ab
os_v2_org_12345678-abcd-efgh-ijkl-1234567890ab
```

## IP Allowlist

Restrict API key access to specific IP addresses:

1. Go to **Settings > Keys & IDs**
2. Click **Manage** next to the key
3. Add allowed IPs
4. Save changes

If no IPs are added, the key is allowed from any IP (not recommended for production).

## Key Management

| Action     | Description                                                |
| ---------- | ---------------------------------------------------------- |
| **Create** | Generate new keys in Settings > Keys & IDs                 |
| **Rotate** | Replaces the key; old value is **invalidated immediately** |
| **Delete** | Permanently removes the key                                |

## Security Best Practices

| Practice                          | Why                                         |
| --------------------------------- | ------------------------------------------- |
| Never expose in client code       | Keys grant full API access to your app data |
| Use environment variables         | Keeps secrets out of source control         |
| Rotate periodically               | Limits exposure if a key is compromised     |
| Use IP allowlist                  | Restricts where the key can be used         |
| Use separate keys per environment | Isolates dev/staging/prod access            |

### Example: Using Environment Variables

```bash
# .env
ONESIGNAL_APP_ID=your-app-id
ONESIGNAL_API_KEY=os_v2_app_your-key-here
```

```javascript
const appId = process.env.ONESIGNAL_APP_ID;
const apiKey = process.env.ONESIGNAL_API_KEY;
```

```javascript
// React Native / Expo
import Constants from "expo-constants";
const appId = Constants.expoConfig?.extra?.onesignalAppId;
```

```swift
// iOS
let appId = Bundle.main.object(forInfoDictionaryKey: "ONESIGNAL_APP_ID") as? String
```

```kotlin
// Android
val appId = context.getString(R.string.ONESIGNAL_APP_ID)
```
