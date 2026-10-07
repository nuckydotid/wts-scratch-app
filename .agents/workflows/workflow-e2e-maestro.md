# Workflow: Maestro E2E Test Execution

Execute, isolate, and debug Maestro mobile flows against Android staging build:

1. **Verify Emulator / Device is Connected**:

   ```bash
   adb devices
   ```

2. **Run Targeted Flow**:

   ```bash
   # Run OTP login flow
   bun run e2e:maestro:otp

   # Run Google login flow
   bun run e2e:maestro:google
   ```

3. **Run Entire Suite**:

   ```bash
   bun run e2e:maestro
   ```

4. **Inspect Hierarchy on Failure**:
   ```bash
   maestro hierarchy
   ```
