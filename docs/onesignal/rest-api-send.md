# REST API — Send Messages

## Endpoint

```
POST https://api.onesignal.com/notifications
Authorization: Key YOUR_API_KEY
Content-Type: application/json
```

## Targeting

### Include/Exclude by ID

```json
{
  "include_aliases": [
    { "external_id": "user_123" },
    { "external_id": "user_456" }
  ]
}
```

Alias types: `external_id`, `onesignal_id`, `ip`, `email`, `phone_number`.

### Segments

```json
{
  "included_segments": ["Subscribers", "Active Users"],
  "excluded_segments": ["Inactive Users"]
}
```

### Filters (AND/OR Logic)

Filters use the `ods` operator: `AND` or `OR`.

```json
{
  "filters": [
    { "field": "tag", "key": "subscription", "relation": "=", "value": "pro" },
    { "field": "country", "relation": "=", "value": "US" },
    {
      "operator": {
        "OR": { "field": "last_session", "relation": ">", "value": "24" }
      }
    }
  ]
}
```

#### Available Filter Fields

| Field           | Description                       |
| --------------- | --------------------------------- |
| `tag`           | User tag key/value pair           |
| `country`       | ISO 3166-1 alpha-2 country code   |
| `last_session`  | Hours since last session          |
| `first_session` | Hours since first session         |
| `session_count` | Number of sessions                |
| `session_time`  | Total session duration in seconds |
| `language`      | ISO 639-1 language code           |
| `app_version`   | App version string                |
| `location`      | Lat/long with radius              |

## Message Fields

```json
{
  "contents": { "en": "Hello!", "es": "¡Hola!" },
  "headings": { "en": "New Message", "es": "Nuevo Mensaje" },
  "url": "https://example.com",
  "data": { "custom_key": "custom_value" },
  "ios_attachments": { "id": "https://example.com/image.png" },
  "big_picture": "https://example.com/image.png",
  "buttons": [{ "id": "btn1", "text": "Open", "icon": "icon.png" }],
  "priority": 10,
  "small_icon": "ic_onesignal_small_icon_default",
  "android_visibility": 1
}
```

> **Note:** `android_channel_id` must reference a channel that already exists in the OneSignal dashboard (Settings → Configure → Android → Notification Categories). Adding it before the channel exists returns `400 Could not find android_channel_id`. See [Troubleshooting → android_channel_id](troubleshooting.md#4-could-not-find-androidchannelid--channel-must-pre-exist-on-onesignal).

> **Auth header:** This project uses `os_v2_app_*` keys with `Authorization: Key ${key}` (see `api/src/lib/notifications.ts:20`). The legacy `Authorization: Basic REST_API_KEY` shown in some OneSignal docs will return `401` for `os_v2_` keys.

## Scheduling

```json
{
  "send_after": 1693500000,
  "delayed_option": "timezone",
  "delivery_time_of_day": "10:00AM"
}
```

| Parameter              | Description                     |
| ---------------------- | ------------------------------- |
| `send_after`           | Unix timestamp to send          |
| `delayed_option`       | `"timezone"` or `"last-active"` |
| `delivery_time_of_day` | `"10:00AM"` format              |

## Response

```json
{
  "id": "uuid",
  "recipients": 250,
  "external_id": null
}
```

`recipients` shows the number of devices that will receive the notification. Use the `id` to check status via the View Notifications endpoint.
