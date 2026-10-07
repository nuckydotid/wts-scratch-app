---
description: Run Maestro E2E suite against Android staging
agent: maestro-e2e-qa
---

<!-- OpenCode command mirror of .agents/workflows/e2e-maestro.md. Keep in sync. -->

# Workflow: Maestro E2E Test Suite

Execute Maestro E2E test suites against the Android staging build:

1. **Run All Maestro E2E Tests**:
   ```bash
   bun run e2e:maestro
   ```
2. **Run OTP Login Flow**:
   ```bash
   bun run e2e:maestro:otp
   ```
3. **Run Google Login Flow**:
   ```bash
   bun run e2e:maestro:google
   ```
4. Inspect output logs in `.artifacts/logs/`.
