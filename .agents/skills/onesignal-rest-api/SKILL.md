---
name: onesignal-rest-api
description: Server-side OneSignal REST API for sending push notifications, managing users, segments, and custom events from Google Cloud Workers.
---

# OneSignal REST API Skill

Use this skill when sending push notifications, managing users, or tracking events from the backend (Google Cloud Workers).

Your documentation references:

- Send messages: `docs/onesignal/rest-api-send.md`
- Segmentation: `docs/onesignal/segmentation.md`
- Localization: `docs/onesignal/localization.md`
- Keys & IDs: `docs/onesignal/keys-and-ids.md`

## Quick Reference

### Authentication

```
Authorization: Key YOUR_APP_API_KEY
```

API keys start with `os_v2_app_`. Store in Google Cloud Worker secrets.

### Send Push Notification

```typescript
POST https://api.onesignal.com/notifications
Content-Type: application/json
Authorization: Key YOUR_API_KEY

{
  "app_id": "YOUR_APP_ID",
  "target_channel": "push",
  "included_segments": ["Subscribed Users"],
  "contents": {
    "en": "Hello!",
    "id": "Halo!"
  },
  "headings": {
    "en": "Welcome",
    "id": "Selamat Datang"
  },
  "data": {
    "screen": "announcement",
    "id": "ann_123"
  }
}
```

### Target by User IDs

```typescript
{
  "include_aliases": {
    "external_id": ["user_1", "user_2"]
  },
  "target_channel": "push"
}
```

### Target by Tags

```typescript
{
  "filters": [
    { "field": "tag", "key": "role", "relation": "=", "value": "teacher" },
    { "operator": "AND" },
    { "field": "tag", "key": "semester", "relation": "=", "value": "2026-1" }
  ]
}
```

### Scheduled Send

```typescript
{
  "send_after": "2026-09-01T09:00:00+07:00",
  "delayed_option": "timezone",
  "delivery_time_of_day": "9:00AM"
}
```

### Rate Limits

- Free plan: 30 messages/second
- Paid plans: higher limits
- Use `throttle_rate_per_minute` for batch sends

### Response Handling

- `200` with `id`: Message created successfully
- `200` without `id`: Valid request but no subscriptions matched
- Save the `id` for tracking via View Message API
