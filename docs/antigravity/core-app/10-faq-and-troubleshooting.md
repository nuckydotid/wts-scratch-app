# FAQ & Troubleshooting Guide

Common questions, account authentication diagnostics, network proxy configurations, and troubleshooting steps for Antigravity 2.0.

---

## 1. Frequently Asked Questions

### Why can I not authenticate into Google Antigravity?

1. Ensure your browser allows popups for `antigravity.google`.
2. If using a corporate VPN or proxy, ensure `accounts.google.com` and `*.antigravity.google` are allowlisted.
3. In the CLI, run `agy auth login --force` to clear cached tokens and refresh OAuth credentials.

### What is Google Antigravity’s geographical availability?

Antigravity is available in over 180 countries and territories where Google Gemini API services operate. If you receive a region unsupported notice, verify your Google Cloud organization location settings.

### How does Antigravity handle private corporate repositories?

Antigravity operates locally on your machine. File reads, edits, and terminal commands execute on your local workstation. Only model prompt contexts and relevant code snippets are transmitted securely over TLS to Google frontier reasoning models.

---

## 2. Diagnostic & Troubleshooting Checklist

| Symptom                                      | Probable Cause                                           | Resolution                                                                                            |
| :------------------------------------------- | :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Agent fails to execute terminal commands** | Permission policy denylist or strict mode enabled.       | Check `~/.gemini/antigravity/settings.json` and ensure the command is not blocked by your denylist.   |
| **MCP Server not connecting**                | Missing environment variables or invalid command path.   | Test the MCP command directly in your terminal; verify `env` block in `mcp.json`.                     |
| **High latency on model responses**          | Reasoning effort set to maximum on large prompt context. | Switch between Gemini 3.7 Flash and Gemini 3.1 Pro; reduce prompt size or use `/compact`.             |
| **Subagent fails with workspace conflict**   | Concurrent file modifications on same branch.            | Use `"workspace": "branch"` or `"workspace": "share"` in `invoke_subagent` to isolate subagent edits. |
