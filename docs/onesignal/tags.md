# OneSignal Tags

Tags are key-value pairs of string data attached to a user's device record. They enable segmentation for targeted messaging and personalization.

## Value Formatting Rules

| Data Type | Format                    | Example           |
| --------- | ------------------------- | ----------------- |
| String    | As-is                     | `"hello"`         |
| Number    | String representation     | `"42"`, `"3.14"`  |
| Timestamp | Unix timestamp in seconds | `"1698765432"`    |
| Boolean   | `"true"` or `"false"`     | `"true"`          |
| Array     | Stringified JSON          | `"[\"a\",\"b\"]"` |

- Values must be **strings only**
- Maximum of **256 tags** per user
- Tag key max: **32 characters**
- Tag value max: **256 characters**

## Restricted Keywords

These keywords cannot be used as tag keys:

- `id`
- `tag`
- `email`
- `sms`
- `language`
- `location`
- `first_active`
- `last_active`

## API

### Add Tags

```typescript
// Single tag
OneSignal.User.addTag("favorite_color", "blue");

// Multiple tags
OneSignal.User.addTags({
  favorite_color: "blue",
  plan: "premium",
  score: "100",
});
```

### Remove Tags

```typescript
// Single tag
OneSignal.User.removeTag("favorite_color");

// Multiple tags
OneSignal.User.removeTags(["favorite_color", "plan"]);
```

### Get Tags

```typescript
const tags = await OneSignal.User.getTags();
// Returns: { favorite_color: 'blue', plan: 'premium' }
```

## Tags vs Custom Events

| Feature             | Tags                                   | Custom Events                     |
| ------------------- | -------------------------------------- | --------------------------------- |
| Data type           | Key-value strings                      | Key-value with flexible values    |
| Historical tracking | No                                     | Yes — can see when event occurred |
| Best for            | Current state attributes               | Actions and behaviors             |
| Examples            | `plan: "premium"`, `signed_up: "true"` | `purchase`, `login`, `page_view`  |
| Overwrites          | Yes — each update replaces             | No — events are additive          |

## Recommended Tagging Strategies

### Event-Based

Track user actions or milestones:

```typescript
OneSignal.User.addTags({
  onboarding_complete: "true",
  first_purchase: "true",
  last_active: "1698765432",
});
```

### Game Activity

Track game state and achievements:

```typescript
OneSignal.User.addTags({
  level: "15",
  high_score: "25000",
  last_played: "1698765432",
  favorite_character: "warrior",
});
```

### Account Status

Track subscription and account state:

```typescript
OneSignal.User.addTags({
  account_type: "premium",
  subscription_status: "active",
  company_size: "50-100",
});
```

### Personalization

Enable targeted messaging based on preferences:

```typescript
OneSignal.User.addTags({
  interests: "sports,tech",
  preferred_language: "en",
  notification_preference: "daily",
});
```

### Location / Demographic

Geographic and demographic segmentation:

```typescript
OneSignal.User.addTags({
  country: "us",
  city: "new_york",
  age_group: "25-34",
  device_type: "ios",
});
```

## Segment Tags

Tags can be used to create audience segments in the OneSignal dashboard:

1. Go to **Audience > Segments**
2. Create a new segment
3. Add tag-based filters:
   - Tag key: `plan`
   - Condition: `is`
   - Tag value: `premium`
4. Save and use for targeting campaigns
