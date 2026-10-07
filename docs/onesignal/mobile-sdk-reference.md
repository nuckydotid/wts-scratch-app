# OneSignal React Native SDK Reference

## Initialization

```typescript
import OneSignal from "react-native-onesignal";

OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");
```

## Logging

```typescript
OneSignal.setLogLevel(OneSignal.LOG_LEVEL.VERBOSE, OneSignal.LOG_LEVEL.NONE);
```

## User Identity

### Login / Logout

```typescript
// Associate user with an external ID
await OneSignal.login("EXTERNAL_USER_ID");

// Disassociate user
OneSignal.logout();
```

### Get IDs

```typescript
const onesignalId = await OneSignal.getOnesignalId();
const externalId = await OneSignal.getExternalId();
```

### User Change Listener

```typescript
const listener = (event: { exiting: boolean; user: any }) => {
  console.log("User changed:", event.user);
};

OneSignal.User.addEventListener("change", listener);
```

To remove:

```typescript
OneSignal.User.removeEventListener("change", listener);
```

## Aliases

```typescript
// Add a single alias
OneSignal.User.addAlias("label", "external_id_123");

// Add multiple aliases
OneSignal.User.addAliases({
  label1: "external_id_123",
  label2: "external_id_456",
});

// Remove a single alias
OneSignal.User.removeAlias("label");
```

## Language

```typescript
OneSignal.User.setLanguage("en");
```

## Events

```typescript
OneSignal.User.trackEvent("event_name", { key: "value" });
```

## Tags

```typescript
// Add a single tag
OneSignal.User.addTag("key", "value");

// Add multiple tags
OneSignal.User.addTags({
  key1: "value1",
  key2: "value2",
});

// Remove a single tag
OneSignal.User.removeTag("key");

// Remove multiple tags
OneSignal.User.removeTags(["key1", "key2"]);

// Get all tags
const tags = await OneSignal.User.getTags();
```

## Consent

```typescript
// Require consent before data is sent
OneSignal.setConsentRequired(true);

// Grant or revoke consent
OneSignal.setConsentGiven(true);
OneSignal.setConsentGiven(false);
```

## Location

```typescript
// Enable location sharing
OneSignal.Location.setShared(true);

// Prompt for location permission
OneSignal.Location.requestPermission();
```

## Push Subscriptions

### Properties

```typescript
const subscriptionId = OneSignal.User.pushSubscription.id;
const pushToken = OneSignal.User.pushSubscription.token;
```

### Change Listener

```typescript
OneSignal.User.pushSubscription.addEventListener("change", (subscription) => {
  console.log("Push subscription changed:", subscription);
});
```

### Opt-in / Opt-out

```typescript
// Opt out of push notifications
OneSignal.User.pushSubscription.optOut();

// Opt back in to push notifications
OneSignal.User.pushSubscription.optIn();

// Check opt-in status
const isOptedIn = OneSignal.User.pushSubscription.optedIn;
```

## Email Subscriptions

```typescript
OneSignal.User.addEmail("user@example.com");
OneSignal.User.removeEmail("user@example.com");
```

## SMS Subscriptions

```typescript
OneSignal.User.addSms("+15551234567");
OneSignal.User.removeSms("+15551234567");
```

## Notifications

### Request Permission

```typescript
const granted = await OneSignal.Notifications.requestPermission(
  true, // fallbackToSettings - opens settings if denied
);
```

### Permission Observer

```typescript
const observer = (permission) => {
  console.log("Permission state changed:", permission);
};

OneSignal.Notifications.addPermissionObserver(observer);
```

### Click Handler

```typescript
OneSignal.Notifications.addEventListener("click", (event) => {
  console.log("Notification clicked:", event.notification);
});
```

### Foreground Display

```typescript
OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
  console.log("Notification received in foreground:", event.notification);
  // Optional: prevent default display
  event.getNotification().display();
});
```

## In-App Messages

### Click Handler

```typescript
OneSignal.InAppMessages.addEventListener("click", (event) => {
  console.log("IAM clicked:", event);
});
```

### Lifecycle Handler

```typescript
OneSignal.InAppMessages.addEventListener("lifecycle", (event) => {
  console.log("IAM lifecycle event:", event);
});
```

### Triggers

```typescript
// Add a single trigger
OneSignal.InAppMessages.addTrigger("key", "value");

// Add multiple triggers
OneSignal.InAppMessages.addTriggers({
  key1: "value1",
  key2: "value2",
});

// Remove a single trigger
OneSignal.InAppMessages.removeTrigger("key");

// Remove multiple triggers
OneSignal.InAppMessages.removeTriggers(["key1", "key2"]);
```

### Pause / Resume

```typescript
// Pause all in-app messages
OneSignal.InAppMessages.pause(true);

// Resume in-app messages
OneSignal.InAppMessages.pause(false);

// Pause message display specifically
OneSignal.InAppMessages.pauseMessages(true);
OneSignal.InAppMessages.pauseMessages(false);

// Resume message display
OneSignal.InAppMessages.resumeMessages();
```
