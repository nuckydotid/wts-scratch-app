# AI Security & Secrets Management Rule

Rules for managing authentication tokens, API keys, and sensitive environment variables during AI-assisted development.

## 🚫 Core Anti-Patterns & Blocked Actions

- **NEVER** write or embed raw API keys, JWTs, or passwords directly into source code, test files, or scripts.
- **NEVER** attempt to read or modify `.env` files directly. Pre-tool safety gates in `hooks.json` will explicitly block this action.
- **NEVER** print sensitive environment variables (e.g., `echo $SECRET_KEY`) to the console, as this will leak them into the conversation transcript.

## ✅ Safe Development Practices

- Use mock data, placeholder keys (e.g., `sk-test-123...`), or `TODO` comments for local development when setting up new integrations.
- Always retrieve secrets at runtime via the environment (`process.env.MY_SECRET`) or through the configured secret manager.
- If you need to test a service requiring a real API key, explicitly ask the human Stakeholder to run the command locally on your behalf or to inject the key into a secure `.env` file that is excluded from Git tracking (`.gitignore`).
