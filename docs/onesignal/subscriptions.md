# Subscriptions

A subscription is a specific push token, email address, or phone number associated with a device or user. Each subscription represents a single destination you can send messages to.

## Key Concepts

- A subscription is a **single destination** (email, phone number, browser, or device)
- A user can have up to **20 subscriptions** across all channels
- Subscriptions are the foundation of messaging in OneSignal

## Subscription Types

| Type     | Includes                                 | Notes                       |
| -------- | ---------------------------------------- | --------------------------- |
| Mobile   | Push + In-App Messages + Live Activities | iOS and Android devices     |
| Web Push | Browser push notifications               | Desktop and mobile browsers |
| Email    | Email messages                           | Requires email address      |
| SMS      | Text messages                            | Requires phone number       |

## Subscription Statuses

| Status           | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| Subscribed       | Receiving notifications (push token registered and active) |
| Unsubscribed     | Opted out or push token invalidated                        |
| Never Subscribed | User exists but has not subscribed to this channel         |

Status is tracked **per channel**. A user may be subscribed to email but unsubscribed from push.

## notification_types Values

| Value | Meaning              |
| ----- | -------------------- |
| `1`   | Subscribed           |
| `-2`  | Opted out            |
| `-10` | Uninstalled          |
| `-18` | Never prompted (iOS) |

## Mobile Subscriptions

Mobile subscriptions are **auto-created** on first app open. The OneSignal SDK generates a push token and registers the device.

Handling uninstalls:

- **iOS**: The `onesignalIdReceived` listener fires on each open; uninstalls are inferred when the token becomes invalid
- **Android**: Use the `setNotificationWillShowInForegroundHandler` and track token changes; uninstalls are detected server-side when delivery fails

```javascript
OneSignal.initialize({ appId: "YOUR_APP_ID" });

// Listen for subscription changes
OneSignal.User.pushSubscription.addEventListener("change", (event) => {
  console.log("Subscription changed:", event);
});
```

## Email & SMS Subscriptions

Email and SMS subscriptions are **created explicitly** via the SDK or REST API:

```javascript
// Add email subscription
await OneSignal.User.addEmail("user@example.com");

// Add SMS subscription
await OneSignal.User.addSms("+15551234567");

// Remove
await OneSignal.User.removeEmail("user@example.com");
await OneSignal.User.removeSms("+15551234567");
```

Or via the REST API:

```
POST https://onesignal.com/api/v1/players
{
  "app_id": "YOUR_APP_ID",
  "email": "user@example.com",
  "email_auth_hash": "optional_hash"
}
```
