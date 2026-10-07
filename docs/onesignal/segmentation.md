# Segments

Segments are dynamic groups of users defined by filters. They automatically update as users enter or leave the defined criteria.

## Segment Types

| Type               | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| Subscription-based | Filters applied to individual subscriptions (push, email, SMS) |
| User-based         | Filters applied at the user level across all subscriptions     |

## Available Filters

### User & Session Filters

| Filter           | Description                              |
| ---------------- | ---------------------------------------- |
| `first_session`  | Date of user's first session             |
| `last_session`   | Date of user's last session              |
| `session_count`  | Total number of sessions                 |
| `usage_duration` | Total time spent in app (seconds)        |
| `language`       | Device language setting                  |
| `app_version`    | App version installed                    |
| `device_type`    | Platform (iOS, Android, Web, Email, SMS) |

### Tag & Location Filters

| Filter     | Description                           |
| ---------- | ------------------------------------- |
| `user_tag` | Custom tag key/value pair on the user |
| `location` | Geographic radius from a point        |
| `country`  | Country code (ISO 3166-1)             |

### Special Filters

| Filter          | Description                                   |
| --------------- | --------------------------------------------- |
| `test_users`    | Includes users flagged as test users          |
| `message_event` | Based on message delivery/interaction history |
| `custom_event`  | Based on tracked custom events                |

## AND / OR Logic

Filters within a segment use **AND** logic by default — all conditions must be met. You can create **OR** groups for alternative conditions.

```
Filter Group 1 (AND):
  device_type = iOS
  session_count >= 5

Filter Group 2 (OR):
  country = US
  country = CA
```

## Event-Based Filters

### Message Events

Filter users based on their interaction with past messages:

| Event     | Description                         |
| --------- | ----------------------------------- |
| Delivered | Message was delivered to the device |
| Clicked   | User clicked/tapped the message     |
| Failed    | Message delivery failed             |

### Custom Events

Filter users based on custom events they have triggered. Supports property filtering:

```
Event: purchase
Properties:
  amount >= 50
  category = "electronics"
```

## Audience Counts

When building a segment, OneSignal displays:

- **Subscribed count**: Users currently subscribed to the target channel
- **Total count**: All users matching the filters (including unsubscribed)

This helps estimate campaign reach before sending.

## Segment Limits

Segment limits vary by plan:

| Plan         | Limit                            |
| ------------ | -------------------------------- |
| Free         | Limited number of segments       |
| Growth       | More segments + advanced filters |
| Professional | Higher limits                    |
| Enterprise   | Custom limits                    |

Check your plan limits in the OneSignal dashboard under **Audience > Segments**.
