# Workflow: Bilingual i18n Synchronization

Audit and synchronize translation keys across all 21 domain dictionaries:

1. **Run i18n Parity Checker**:

   ```bash
   python3 .agents/skills/i18n-parity-checker/scripts/check_i18n_parity.py
   ```

2. **Add Missing Translation Keys**:
   Ensure every key in `id` has an exact corresponding translation in `en`.

3. **Run Localization Unit Tests**:
   ```bash
   bun --filter 'app' test:ci src/i18n
   ```
