const path = require("node:path");
const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const sonarjs = require("eslint-plugin-sonarjs");
const security = require("eslint-plugin-security");
const localSonarPlugin = require(
  path.resolve(__dirname, "../../plugins/local-sonar"),
);

// In-house SonarQube rules (416 active server rules)
// Activated via ENABLE_LOCAL_SONAR=true or bun run lint:sonar
const enableLocalSonar =
  process.env.ENABLE_LOCAL_SONAR === "true" ||
  process.env.LOCAL_SONAR === "true";

const localSonarRules = enableLocalSonar
  ? Object.fromEntries(
      Object.keys(localSonarPlugin.rules).map((ruleName) => [
        `local-sonar/${ruleName}`,
        "warn",
      ]),
    )
  : {};

module.exports = defineConfig([
  globalIgnores([
    "dist/*",
    ".expo/*",
    "node_modules/*",
    "expo-env.d.ts",
    "uniwind-types.d.ts",
    "src/data/screens-tree-data.ts",
    "*.js",
    "*.mjs",
  ]),
  expoConfig,
  eslintPluginPrettierRecommended,
  sonarjs.configs.recommended,
  security.configs.recommended,
  {
    files: [
      "src/**/__tests__/**",
      "src/**/__mocks__/**",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "import/first": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-identical-functions": "off",
      "sonarjs/no-clear-text-protocols": "off",
      "sonarjs/void-use": "off",
      "sonarjs/parameterized-tests": "off",
      "sonarjs/no-unused-vars": "off",
      "sonarjs/no-dead-store": "off",
      "sonarjs/unused-import": "off",
      "sonarjs/no-trivial-assertions": "off",
      "sonarjs/no-floating-point-equality": "off",
      "sonarjs/prefer-specific-assertions": "off",
      "security/detect-non-literal-fs-filename": "off",
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: [
      "src/**/__tests__/**",
      "src/**/__mocks__/**",
      "src/**/__snapshots__/**",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/data/screens-tree-data.ts",
    ],
    plugins: {
      "local-sonar": localSonarPlugin,
    },
    languageOptions: {
      parserOptions: { project: true, tsconfigRootDir: __dirname },
    },
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": [
        "warn",
        { checksVoidReturn: { attributes: false } },
      ],
      "sonarjs/prefer-read-only-props": "off",
      "sonarjs/no-nested-conditional": "warn",
      "sonarjs/no-nested-functions": ["warn", { threshold: 5 }],
      "sonarjs/cognitive-complexity": ["warn", 35],
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/unused-import": "warn",
      "sonarjs/no-dead-store": "warn",
      "sonarjs/no-unused-vars": "warn",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/pseudo-random": "warn",
      "sonarjs/no-small-switch": "off",
      "sonarjs/deprecation": "off",
      "sonarjs/todo-tag": "off",
      "sonarjs/slow-regex": "warn",
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "warn",
      ...localSonarRules,
    },
  },
  {
    files: ["scripts/**/*.ts", "scripts/**/*.js"],
    languageOptions: {
      globals: { ...require("globals").node, __DEV__: "readonly" },
    },
    rules: {
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/different-types-comparison": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-identical-functions": "off",
      "sonarjs/slow-regex": "off",
      "sonarjs/super-linear-regex": "off",
      "sonarjs/void-use": "off",
      "sonarjs/no-redundant-jump": "off",
      "sonarjs/no-nested-template-literals": "off",
      "sonarjs/concise-regex": "off",
      "security/detect-non-literal-regexp": "off",
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-object-injection": "off",
      "security/detect-unsafe-regex": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["eslint.config.js"],
    languageOptions: {
      globals: require("globals").node,
    },
  },
]);
