---
description: Prepare and deploy OTA bundle
agent: monorepo-tooling-sheriff
---

<!-- OpenCode command mirror of .agents/workflows/workflow-ota-release.md. Keep in sync. -->

# Workflow: OTA JavaScript Bundle Release

Prepare, bundle, and deploy an over-the-air (OTA) update via `worktrees-studio-ota-updates`:

1. **Pre-flight Quality Check**:

   ```bash
   bun run typecheck && bun --filter 'app' test:ci
   ```

2. **Export JS Bundle**:

   ```bash
   bun --filter 'app' export:ota
   ```

3. **Calculate Hash & Create Manifest**:
   Generate sha256 checksum and asset manifest for cold-start verification.

4. **Upload to Google Cloud Cloud Storage / Update Server**:
   Deploy bundle to `/api/ota/v1/update` endpoint.
