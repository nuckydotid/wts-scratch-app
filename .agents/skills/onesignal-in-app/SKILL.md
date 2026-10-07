---
name: onesignal-in-app
description: In-app message setup, triggers, display rules, audience targeting, and lifecycle listeners.
---

# OneSignal In-App Messages Skill

Use this skill when setting up, targeting, or debugging in-app messages (IAM) in a mobile app.

Your documentation references:

- In-app messages: `docs/onesignal/in-app-messages.md`
- Mobile SDK reference: `docs/onesignal/mobile-sdk-reference.md`

## Quick Reference

### SDK Requirements

In-app messages require the OneSignal SDK. No additional code needed — messages are configured in the OneSignal dashboard.

### Trigger Types

| Trigger            | Description                        |
| ------------------ | ---------------------------------- |
| On app open        | Display when user launches the app |
| Session duration   | Delay N seconds after app open     |
| Since last message | Delay after last IAM was shown     |
| Custom triggers    | Via `addTrigger()` SDK method      |

### Programmatic Triggers

```typescript
// Add triggers
OneSignal.InAppMessages.addTrigger("subscription_tier", "premium");
OneSignal.InAppMessages.addTriggers({
  onboarding_step: "completed",
  items_viewed: "5",
});

// Remove triggers
OneSignal.InAppMessages.removeTrigger("onboarding_step");
OneSignal.InAppMessages.removeAllTriggers();

// Pause/resume IAM display
OneSignal.InAppMessages.pause(true); // pause
OneSignal.InAppMessages.pause(false); // resume
```

### Click Listener

```typescript
OneSignal.InAppMessages.addEventListener("click", (event) => {
  const actionId = event.result.actionId;
  // Route based on action ID
});
```

### Lifecycle Listener

```typescript
OneSignal.InAppMessages.addEventListener("lifecycle", (event) => {
  const messageType = event.messageId;
  const eventType = event.eventType; // "displayed", "clicked", "dismissed"
});
```

### Display Rules

- User must match audience **before** a new session starts
- New session = app opened after 30+ seconds in background
- Segment criteria changes require app restart
- Messages NOT shown to users who already subscribed when using Push Permission Prompt action
