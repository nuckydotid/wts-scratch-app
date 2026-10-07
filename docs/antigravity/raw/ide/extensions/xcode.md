You can now access Antigravity directly inside Apple’s **Xcode** to build across Apple platforms (including macOS, iOS, iPadOS, watchOS, and visionOS) without leaving your native development environment.

---

## Prerequisites

- **Xcode**: Xcode 27 beta 6 or later on macOS.
- **Antigravity Entitlement**: A Google Account with any Antigravity plan (including the free tier) or **Gemini Enterprise** (Enterprise support in Preview).

---

## Installation & Setup

1.  Open **Xcode** (Xcode 27 beta 6 or later).
2.  Navigate to **Xcode** > **Settings** (or press `Cmd+,`).
3.  Select the **Intelligence** settings panel.
4.  Install Antigravity by clicking **Get**.
5.  After Antigravity installs, select **Antigravity** and use the **…** button to start authentication.

![Antigravity in Xcode](/assets/image/blog/xcode-extension-marketplace.png)

---

## Authentication & Licensing

Note

Gemini Enterprise authentication for Xcode is currently in **Preview**.

Google AccountsGemini EnterpriseGemini APIAgent Platform

Google Accounts (Individual)Gemini Enterprise (OAuth - Preview)Gemini API (API Key)Gemini Enterprise Agent Platform (Preview)expand\_more

For individual Google AI subscription plans (including Free, Pro, and Ultra):

```
{
  "auth": {
    "type": "oauth-personal"
  }
}
```

Reach out to your cloud administrator for your GCP Project ID and Region (Enterprise support for JetBrains, Zed, and Xcode is currently in Preview):

```
{
  "auth": {
    "type": "oauth-business"
  },
  "gcp": {
    "project": "<YOUR_GCP_PROJECT_ID>",
    "location": "<YOUR_GCP_REGION>"
  }
}
```

Authenticate using a Gemini API key:

```
{
  "auth": {
    "type": "gemini-api-key"
  }
}
```

Authenticate with Gemini Enterprise Agent Platform using a Google API Key or Application Default Credentials (ADC) (Preview). When using ADC, specify your GCP Project ID and Region:

```
{
  "auth": {
    "type": "agent-platform"
  },
  "gcp": {
    "project": "<YOUR_GCP_PROJECT_ID>",
    "location": "<YOUR_GCP_REGION>"
  }
}
```
