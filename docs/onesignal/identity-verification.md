# Identity Verification

JWT-based identity verification prevents user impersonation when calling `OneSignal.login()`.

## Overview

When enabled, every `OneSignal.login()` call requires a valid JSON Web Token signed with ES256. The JWT proves the request originates from your backend, not a malicious actor spoofing an external ID.

## Algorithm

ES256 (ECDSA using P-256 and SHA-256).

## JWT Payload

```json
{
  "iss": "YOUR_APP_ID",
  "exp": 1693500000,
  "identity": {
    "external_id": "user_123"
  },
  "subscriptions": [{ "onesignal_id": "uuid-1" }, { "onesignal_id": "uuid-2" }]
}
```

| Claim           | Description                               |
| --------------- | ----------------------------------------- |
| `iss`           | Your OneSignal App ID                     |
| `exp`           | Expiration timestamp (Unix)               |
| `identity`      | The external ID to authenticate           |
| `subscriptions` | Optional — array of onesignal_ids to link |

## Generate JWT on Backend

```javascript
const jwt = require("jsonwebtoken");

const privateKey = process.env.ONESIGNAL_PRIVATE_KEY;

function generateOneSignalJWT(appId, externalId, onesignalIds) {
  return jwt.sign(
    {
      iss: appId,
      identity: { external_id: externalId },
      subscriptions: onesignalIds.map((id) => ({ onesignal_id: id })),
    },
    privateKey,
    {
      algorithm: "ES256",
      expiresIn: "24h",
    },
  );
}
```

## Pass JWT to SDK

```javascript
const jwt = generateOneSignalJWT(appId, "user_123", ["uuid-1"]);
OneSignal.login("user_123", jwt);
```

## Handle JWT Lifecycle

```javascript
OneSignal.addUserJwtInvalidatedListener(({ jwtInvalidatedEvent }) => {
  // JWT expired or revoked — generate a new one and call updateUserJwt
  const newJwt = generateOneSignalJWT(appId, "user_123", ["uuid-1"]);
  OneSignal.updateUserJwt(newJwt);
});
```

## Enable in Dashboard

Navigate to **Settings > Keys & IDs** and enable Identity Verification.

## REST API

When Identity Verification is enabled, REST API calls require:

```
Authorization: Bearer YOUR_JWT
```

For user-scoped operations, the JWT must contain the correct `external_id` in the `identity` claim.
