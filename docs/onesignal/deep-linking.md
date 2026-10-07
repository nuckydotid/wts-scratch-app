# Deep Linking

Route users to specific content when they tap a notification or in-app message.

## Link Types

| Type               | Platform | Use Case                |
| ------------------ | -------- | ----------------------- |
| Universal Links    | iOS      | Recommended for iOS     |
| App Links          | Android  | Recommended for Android |
| Custom URI Schemes | Both     | Push/in-app only        |

## Push Notifications

### Launch URL (`url` / `app_url`)

```json
{
  "url": "https://example.com/article/123",
  "app_url": "myapp://article/123"
}
```

> **Note:** On iOS, Launch URL opens Safari first (visible flash to the user). To suppress this, add `OneSignal_suppress_launch_urls = true` to your app's `Info.plist`, or use `data` with a click listener instead.

### Additional Data (`data`) — Recommended for Mobile

```json
{
  "data": {
    "article_id": "123",
    "deep_link": "myapp://article/123"
  }
}
```

Handle in the click listener:

```javascript
Notifications.addEventListener("click", (event) => {
  const { article_id } = event.notification.additionalData;
  // Navigate based on data
});
```

## In-App Messages

### URL Action

Set a URL in the action button or set the entire message as a link.

### Custom Action ID

```json
{
  "action_id": "open_article",
  "url": "https://example.com/article/123"
}
```

Handle in the click listener:

```javascript
InAppMessages.addEventListener("click", (event) => {
  if (event.action.actionId === "open_article") {
    // Navigate based on action
  }
});
```

## Email

Disable click tracking for deep links to preserve the URL:

```json
{
  "email_body": "<a href='https://example.com/article' data-track='false'>Read more</a>"
}
```

## SMS

SMS messages contain raw https links only. No trackable links — include the full URL directly in the message body.

```
Check this out: https://example.com/article/123
```

## Click Listeners

### Push Notifications

```javascript
Notifications.addEventListener("click", (event) => {
  const url = event.notification.launchURL;
  const data = event.notification.additionalData;
  // Route user
});
```

### In-App Messages

```javascript
InAppMessages.addEventListener("click", (event) => {
  const url = event.action.url;
  const actionId = event.action.actionId;
  // Route user
});
```
