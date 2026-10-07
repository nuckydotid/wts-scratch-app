---
name: onesignal-user-identity
description: OneSignal user identification with External ID, tags, login/logout, email/SMS subscriptions, and consent gating.
---

# OneSignal User Identity Skill

Use this skill when implementing user identification, setting tags for segmentation, managing email/SMS subscriptions, or configuring consent gating.

Your documentation references:

- Users: `docs/onesignal/users.md`
- Tags: `docs/onesignal/tags.md`
- Subscriptions: `docs/onesignal/subscriptions.md`
- Identity verification: `docs/onesignal/identity-verification.md`
- Custom events: `docs/onesignal/custom-events.md`

## Quick Reference

### User Identification

```typescript
// After authentication — call every app start
OneSignal.login(user.id); // External ID = your user.id

// On logout
OneSignal.logout();

// Get IDs
const onesignalId = await OneSignal.User.getOnesignalId();
const externalId = await OneSignal.User.getExternalId();
```

### Tags (Key-Value Strings)

```typescript
// Set tags for segmentation
OneSignal.User.addTags({
  role: "teacher",
  semester: "2026-1",
  grade: "5",
});

// Remove tags
OneSignal.User.removeTag("grade");

// Get local tags
const tags = await OneSignal.User.getTags();
```

### Tag Value Rules

- All values MUST be strings: `"42"`, `"true"`, `"1685400000"`
- No arrays, objects, or nested values
- Restricted keywords: `message`, `notification`, `subscription`, `user`, `template`, `app`, `org`

### Email & SMS Subscriptions

```typescript
// Add email (call after login)
OneSignal.User.addEmail("[email protected]");

// Add SMS (E.164 format)
OneSignal.User.addSms("+6281234567890");
```

### Consent Gating (GDPR)

```typescript
// BEFORE initialize
OneSignal.setConsentRequired(true);
OneSignal.initialize("APP_ID");

// After user grants consent
OneSignal.setConsentGiven(true);
```

### Language

```typescript
OneSignal.User.setLanguage("id"); // ISO 639-1 code
```

### Custom Events

```typescript
OneSignal.User.trackEvent("purchase", {
  item: "T-shirt",
  price: "24.99",
});
```
