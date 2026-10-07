"use strict";

const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");

const minorRules = require("../rules/minor-rules");

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

// S7787 - Empty import/export specifier lists
ruleTester.run("S7787", minorRules.S7787, {
  valid: [
    "import 'side-effect-module';",
    "import { value } from './module';\nconsole.log(value);",
    "export { value };",
  ],
  invalid: [
    {
      code: "import {} from './module';",
      errors: [
        {
          message: "Remove the empty import specifier list. [typescript:S7787]",
        },
      ],
    },
    {
      code: "export {};",
      errors: [
        {
          message: "Remove the empty export specifier list. [typescript:S7787]",
        },
      ],
    },
  ],
});
