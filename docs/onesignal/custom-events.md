# Custom Events

Custom events are named user actions sent to OneSignal for targeting, segmentation, and analytics.

## Key Constraints

| Property     | Limit                            |
| ------------ | -------------------------------- |
| Event name   | Max 128 characters               |
| Payload size | Max 2024 bytes                   |
| Properties   | JSON object with key-value pairs |

## Sending Custom Events

### Via SDK

```javascript
// Track a simple event
await OneSignal.Session.addEvent("purchase");

// Track with properties
await OneSignal.Session.addEvent("purchase", {
  amount: 49.99,
  category: "electronics",
  item_count: 3,
});
```

### Via REST API

```
POST https://onesignal.com/api/v1/apps/{app_id}/events
{
  "name": "purchase",
  "external_user_id": "user-123",
  "properties": {
    "amount": 49.99,
    "category": "electronics"
  }
}
```

## Use Cases

| Use Case             | Description                                               |
| -------------------- | --------------------------------------------------------- |
| Trigger Journeys     | Start an automated workflow based on a user action        |
| Wait Until steps     | Pause a Journey until a specific event occurs             |
| Personalize messages | Use event properties in message content                   |
| Measure conversions  | Track if a message led to a desired action                |
| Segment users        | Filter audiences by events they have or haven't triggered |

## Tags vs Custom Events

| Feature   | Tags                         | Custom Events                             |
| --------- | ---------------------------- | ----------------------------------------- |
| Data type | Key-value strings            | Named events with JSON properties         |
| Storage   | Stored on user profile       | Sent as individual data points            |
| History   | Current value only           | Full event history retained               |
| Use case  | User attributes (name, plan) | Actions (purchased, completed_onboarding) |
| Filtering | Limited                      | Rich property-based filtering             |

**Rule of thumb**: Use tags for user attributes, custom events for user actions.

## Conversion Metrics

Track whether messages drive desired outcomes:

| Metric | Description                                                      |
| ------ | ---------------------------------------------------------------- |
| Count  | Number of times an event was triggered after receiving a message |
| Value  | Monetary or numeric value associated with the event              |

### Cross-Channel Attribution

Conversion events are attributed back to the message that drove them. OneSignal tracks:

- Which message channel (push, email, SMS) led to the event
- Time between message delivery and event
- First-touch and last-touch attribution

This data is available in the **Analytics > Conversion** section of the dashboard.
