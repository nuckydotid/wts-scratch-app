Antigravity supports the full suite of **IntelliJ-based IDEs**—including IntelliJ IDEA, PyCharm, WebStorm, GoLand, CLion, Rider, and more—starting with version **2026.2.1+**.

---

## Prerequisites

- **IntelliJ-based IDE**: Any IntelliJ-based IDE version 2026.2.1 or later on macOS, Linux, or Windows.
- **Antigravity Entitlement**: A Google Account with any Antigravity plan (including the free tier) or **Gemini Enterprise** (Enterprise support in Preview).

---

## Installation & Setup

1.  Open your IntelliJ-based IDE.
2.  Open **JetBrains AI** > **Settings** > **Agents**.
3.  Search for **Antigravity**.
4.  Click **Install**.

![Antigravity in JetBrains IDEs](/assets/image/blog/jetbrains-extension-marketplace.png)

---

## Authentication & Licensing

Note

Gemini Enterprise authentication for JetBrains IDEs is currently in **Preview**.

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
