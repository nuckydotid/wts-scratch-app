const { globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const globals = require("globals");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

/**
 * Shared flat config for every `modules/*` TurboModule workspace.
 *
 * Run per module (`bun run lint` inside the module) — ESLint walks up to this
 * file via ancestor config lookup. Type-aware linting uses `modules/tsconfig.json`
 * (each module's src globs), so `tsconfigRootDir` is fixed to this directory
 * regardless of cwd.
 */
module.exports = [
  globalIgnores([
    "**/node_modules/**",
    "**/ios/**",
    "**/android/**",
    "**/build/**",
    "**/.expo/**",
    "**/dist/**",
  ]),
  ...expoConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ["eslint.config.js", "**/app.plugin.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintPluginPrettierRecommended,
];
