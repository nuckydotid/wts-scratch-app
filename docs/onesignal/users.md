# Users

The OneSignal User model represents an end user who can receive messages across multiple channels.

## User Identity

| ID               | Description                                                         |
| ---------------- | ------------------------------------------------------------------- |
| **OneSignal ID** | Auto-generated UUID when a user is created. Always present.         |
| **External ID**  | Developer-assigned identifier (e.g., database ID, email). Optional. |

## Anonymous vs Identified Users

| State          | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| **Anonymous**  | User has a OneSignal ID but no External ID. Created on first app open or API call. |
| **Identified** | User has an External ID assigned via `login()` or API. Subscriptions linked.       |

## External ID

The External ID links subscriptions across channels. It allows you to:

- Associate a mobile device, email, and phone number with one user
- Send messages across channels using a single identifier
- Import users from your own database

### Restricted External ID Values

These values cannot be used as External IDs:

- `NA`
- `NULL`
- `null`
- `undefined`
- Empty string

### Setting External ID

```javascript
// Login assigns an External ID
await OneSignal.login("user-123");

// Logout removes the External ID
await OneSignal.logout();
```

Or via REST API:

```
POST https://onesignal.com/api/v1/players/{player_id}
{
  "app_id": "YOUR_APP_ID",
  "external_user_id": "user-123"
}
```

## User Lifecycle

| Event                | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| **Created**          | On first app open (SDK) or via REST API (`/players`)                  |
| **Deleted manually** | Deleted through dashboard or API                                      |
| **Auto-deleted**     | When the last subscription is removed AND the user has no External ID |

## Multiple Users on Same Device

When multiple users share a device (e.g., family tablet), call `login()` and `logout()` to switch:

```javascript
// User A logs in
await OneSignal.login("user-a");

// ... send messages to user A ...

// User A logs out
await OneSignal.logout();

// User B logs in
await OneSignal.login("user-b");
```

Each login/logout cycle reassigns the device subscription to the correct user profile.

## MAU (Monthly Active Users) Billing

MAU is calculated based on:

- **Mobile subscriptions** that have an active session within the billing period
- Sessions are tracked automatically by the SDK on each app open
- Only push-enabled mobile subscriptions count toward MAU

Web, email, and SMS subscriptions do **not** count toward MAU billing.
