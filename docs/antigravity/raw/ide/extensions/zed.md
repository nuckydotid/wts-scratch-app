Antigravity integrates directly into **The Zed editor** for high-performance, agentic editing within your native Rust-powered workflow.

---

## Prerequisites

- **Zed**: Version 0.140.0 or later on macOS or Linux.
- **Antigravity Entitlement**: A Google Account with any Antigravity plan (including the free tier) or **Gemini Enterprise** (Enterprise support in Preview).

---

## Installation & Setup

1.  Open Zed.
2.  Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Linux/Windows).
3.  Type `agent: open settings` and press **Enter**.
4.  Navigate to **External Agents** > **Add** > **Install from Registry**.
5.  Search for **Antigravity**.
6.  Click **Install**.

![Antigravity in Zed](/assets/image/blog/zed-extension-marketplace.png)

---

## Authentication & Licensing

Note

Gemini Enterprise authentication for Zed is currently in **Preview**.

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
