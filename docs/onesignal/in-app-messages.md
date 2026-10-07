# OneSignal In-App Messages

In-app messages (IAM) are customizable, targeted messages displayed inside your app. They do not require notification permissions and can be used to engage all users.

## Prerequisites

- OneSignal SDK installed and initialized
- Messages created via OneSignal dashboard or Journeys

## Creating Messages

- **Dashboard**: Create and send one-time in-app messages
- **Journeys**: Build multi-step automated message sequences

## Click Actions

In-app messages support click actions:

- **Deep link**: Navigate to a specific screen or URL
- **In-app action**: Trigger a custom action
- **Dismiss**: Close the message

## Triggers

IAM are triggered based on conditions:

| Trigger                | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| **On app open**        | Displayed when the app launches                            |
| **Session duration**   | Displayed after a set number of seconds in the app         |
| **Since last message** | Displayed if enough time has passed since the last message |
| **Custom event**       | Displayed when a specific event occurs in your app         |

## Dismiss Behavior

- Users can dismiss messages by tapping the close button
- Messages can be set to require interaction (no dismiss option)
- Dismissed messages are tracked to avoid repeat display

## Schedule & Frequency

- Set start and end dates for message campaigns
- Control how often a user sees a message
- Set session-based frequency caps

## How IAM Are Shown

> **IAM are pulled by the device, not pushed from the server.**

When the app opens, the SDK checks for available in-app messages that match the current triggers. The device determines which messages to display — there is no real-time push to the user.

### 30-Second Rule

When testing in-app messages:

- **Wait at least 30 seconds** after triggering a condition before opening the app
- This ensures the trigger data has synced with the server
- Opening the app immediately may not show the message

## Event Listeners

### Click Listener

```typescript
OneSignal.InAppMessages.addEventListener("click", (event) => {
  console.log("Message clicked:", event);
});
```

### Lifecycle Listener

```typescript
OneSignal.InAppMessages.addEventListener("lifecycle", (event) => {
  console.log("Message lifecycle:", event);
});
```

## Triggers API

### Set Triggers

```typescript
// Single trigger
OneSignal.InAppMessages.addTrigger("level", "10");

// Multiple triggers
OneSignal.InAppMessages.addTriggers({
  level: "10",
  status: "active",
  last_action: "purchase",
});
```

### Remove Triggers

```typescript
// Single trigger
OneSignal.InAppMessages.removeTrigger("level");

// Multiple triggers
OneSignal.InAppMessages.removeTriggers(["level", "status"]);
```

## Pause / Resume

```typescript
// Pause all in-app messages
OneSignal.InAppMessages.pause(true);

// Resume all in-app messages
OneSignal.InAppMessages.pause(false);

// Pause message display
OneSignal.InAppMessages.pauseMessages(true);

// Resume message display
OneSignal.InAppMessages.resumeMessages();
```

## Best Practices

1. **Use IAM for non-critical engagement** — reserve push for urgent notifications
2. **Set meaningful triggers** — target users based on behavior and context
3. **Respect frequency** — don't over-message your users
4. **Test with real users** — monitor engagement and dismiss rates
5. **Use Journeys for automation** — build multi-step engagement flows
