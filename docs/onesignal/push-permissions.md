# Push Notification Permissions Strategy

## System Prompt Limits

- **iOS**: System push prompt can only be shown **once** per app install
- **Android**: System push prompt can only be shown **twice** per app install

Once a user declines and hits the system limit, they cannot be prompted again unless they manually enable notifications in settings.

## Best Practices

1. **Ask after a value moment** — request permission after the user has experienced value from your app
2. **Use provisional notifications on iOS first** — shows notifications silently in the notification center without interrupting the user
3. **Use a soft prompt via in-app message** — pre-permission dialogs explain why you're asking before triggering the system prompt
4. **Re-ask users who declined the soft prompt** — target them later with a different approach
5. **Iterate on copy and timing** — test different wording and trigger points

## Three Approaches

### 1. In-App Soft Prompt (Recommended)

Display a custom in-app message before triggering the system prompt. This gives context for why notifications are useful.

**Advantages**:

- Increases opt-in rates significantly
- Users feel informed before being asked
- Can be customized with your app's branding

### 2. Programmatic Prompt

Trigger `requestPermission()` directly in code at a strategic moment.

```typescript
import OneSignal from "react-native-onesignal";

OneSignal.Notifications.requestPermission(true);
```

**Advantages**:

- Simple to implement
- No design resources needed
- Works well after a value moment

### 3. Provisional Notifications (iOS Only)

Request permission provisionally — notifications are delivered silently to the notification center without a system prompt.

```typescript
// On iOS, use provisional permission
OneSignal.Notifications.requestPermission(true);
```

**Advantages**:

- No system prompt interruption
- User can decide later whether to fully opt in
- Good for apps that need time to demonstrate value

## Onboarding Opt-In Strategy

### Phase 1: Provisional Permission (Onboarding)

Ask for provisional notification permission during onboarding. This allows silent delivery without a system prompt.

- Show an explanation screen about notifications
- Call `requestPermission()` with provisional flag
- Users receive notifications in the notification center silently

### Phase 2: Soft Prompt (First Value Moment)

After the user completes a key action (e.g., creates first item, completes a task):

- Display a custom in-app message explaining the benefit of push notifications
- Example: "Get notified when your items are ready — tap to enable"
- If they accept, trigger the full system prompt

### Phase 3: Re-engagement (Later Session)

For users who declined the soft prompt:

- Wait for another value moment or session milestone
- Show a different message with new copy
- Example: "Never miss an update — turn on notifications in settings"
- Provide a deep link to notification settings

## Measuring Success

- Track opt-in rate per prompt type
- A/B test different copy and timing
- Monitor notification engagement (open rates, conversion)
- Compare opt-in rates across iOS and Android
