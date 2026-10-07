"use strict";

const path = require("node:path");
const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");

const asyncRules = require("../rules/async-error-rules");
const typescriptRules = require("../rules/typescript-rules");
const codeSmellRules = require("../rules/code-smell-rules");
const controlFlowRules = require("../rules/control-flow-rules");
const minorRules = require("../rules/minor-rules");

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

/**
 * Type-aware rules need `projectService`. Virtual RuleTester files are not on
 * disk, so each rule gets its own `allowDefaultProject` pattern; TypeScript
 * rejects default projects with more than 8 files, hence one tester per rule.
 */
const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
      projectService: {
        allowDefaultProject: ["__rule-tester__.ts", "__rule-tester__.tsx"],
      },
      tsconfigRootDir: REPO_ROOT,
    },
  },
});

// S6544 - Promises should not be misused (type-aware)
ruleTester.run("S6544", asyncRules.S6544, {
  valid: [
    {
      filename: "__rule-tester__.ts",
      code: `
declare function useNavigation(options: { onFocus?: () => void }): void;
const checkTab = () => {};
useNavigation({ onFocus: checkTab });
`,
    },
    {
      filename: "__rule-tester__.ts",
      code: `
declare function useNavigation(options: { onFocus?: () => Promise<void> }): void;
const checkTab = async () => {};
useNavigation({ onFocus: checkTab });
`,
    },
    {
      // Sonar does not resolve JSX prop contextual types; mirror that.
      filename: "__rule-tester__.tsx",
      code: `
declare function useNavigation(options: { onFocus?: () => void }): void;
const checkTab = async () => {};
const Component = () => <div onFocus={checkTab} />;
export default Component;
`,
    },
    {
      filename: "__rule-tester__.ts",
      code: `
const promise = Promise.resolve(1);
promise.then(value => value);
`,
    },
  ],
  invalid: [
    {
      filename: "__rule-tester__.ts",
      code: `
declare function useNavigation(options: { onFocus?: () => void }): void;
const checkTab = async () => {};
useNavigation({ onFocus: checkTab });
`,
      errors: [
        {
          message:
            "Promise-returning function provided to property where a void return was expected. [typescript:S6544]",
        },
      ],
    },
    {
      filename: "__rule-tester__.ts",
      code: `
const promise = Promise.resolve(1);
if (promise) {
  console.log('always truthy');
}
`,
      errors: [{ message: /always truthy/ }],
    },
    {
      filename: "__rule-tester__.ts",
      code: `
new Promise(async resolve => {
  resolve(1);
});
`,
      errors: [{ message: /executor should not be an async function/ }],
    },
  ],
});

// S6759 - React props should be read-only (type-aware)
ruleTester.run("S6759", typescriptRules.S6759, {
  valid: [
    {
      filename: "__rule-tester__.tsx",
      code: `
interface Props {
  value: string;
}
const Card = (props: Readonly<Props>) => <div>{props.value}</div>;
export default Card;
`,
    },
    {
      filename: "__rule-tester__.tsx",
      code: `
interface Options {
  value: string;
}
const formatValue = (options: Options) => options.value;
export default formatValue;
`,
    },
  ],
  invalid: [
    {
      filename: "__rule-tester__.tsx",
      code: `
interface Props {
  value: string;
}
function Card(props: Props) {
  return <div>{props.value}</div>;
}
export default Card;
`,
      errors: [{ message: /Mark the props of the component as read-only/ }],
    },
  ],
});

// S3735 - "void" should not be used (type-aware floating-promise exception)
ruleTester.run("S3735", codeSmellRules.S3735, {
  valid: [
    {
      filename: "__rule-tester__.ts",
      code: `
declare const promise: Promise<void>;
void promise;
`,
    },
  ],
  invalid: [
    {
      filename: "__rule-tester__.ts",
      code: `
const value = 'x';
void value;
`,
      errors: [{ message: /Do not use the "void" operator/ }],
    },
  ],
});

// S2681 - Multiline blocks should be enclosed in curly braces
ruleTester.run("S2681", controlFlowRules.S2681, {
  valid: [
    {
      filename: "__rule-tester__.ts",
      code: `
declare const condition: boolean;
declare function firstAction(): void;
declare function secondAction(): void;
if (condition) firstAction();
secondAction();
`,
    },
    {
      filename: "__rule-tester__.ts",
      code: `
declare const condition: boolean;
declare function firstAction(): void;
declare function secondAction(): void;
if (condition)
  firstAction();
secondAction();
`,
    },
  ],
  invalid: [
    {
      filename: "__rule-tester__.ts",
      code: `
declare const condition: boolean;
declare function firstAction(): void;
declare function secondAction(): void;
if (condition)
  firstAction();
  secondAction();
`,
      errors: [{ message: /Enclose this multiline block in curly braces/ }],
    },
  ],
});

// S1128 - Unnecessary imports should be removed (React + JSX)
ruleTester.run("S1128", minorRules.S1128, {
  valid: [
    {
      filename: "__rule-tester__.tsx",
      code: `
import React from 'react';
const Component = () => <div />;
export default Component;
`,
    },
  ],
  invalid: [
    {
      filename: "__rule-tester__.ts",
      code: `
import { useState } from 'react';
const value = 1;
console.log(value);
`,
      errors: [{ message: /Remove the unused import "useState"/ }],
    },
  ],
});

// S1226 - Initial values should not be ignored
ruleTester.run("S1226", minorRules.S1226, {
  valid: [
    {
      filename: "__rule-tester__.ts",
      code: `
function readFirst(value: number) {
  console.log(value);
  value = 1;
  return value;
}
readFirst(0);
`,
    },
  ],
  invalid: [
    {
      filename: "__rule-tester__.ts",
      code: `
function overwriteFirst(value: number) {
  value = 1;
  return value;
}
overwriteFirst(0);
`,
      errors: [{ message: /initial value of "value" is never read/ }],
    },
  ],
});

// S7737 - Objects should not be used as default parameters
ruleTester.run("S7737", minorRules.S7737, {
  valid: [
    {
      filename: "__rule-tester__.ts",
      code: `
function withEmptyDefault(options: { flag?: boolean } = {}) {
  return options;
}
withEmptyDefault();
`,
    },
  ],
  invalid: [
    {
      filename: "__rule-tester__.ts",
      code: `
function withObjectDefault(options: { flag: boolean } = { flag: false }) {
  return options;
}
withObjectDefault();
`,
      errors: [{ message: /shared object literal as a default parameter/ }],
    },
  ],
});

// The project service keeps TypeScript programs alive; release them so Jest
// can exit cleanly after the type-aware suites.
afterAll(() => {
  tsParser.clearCaches();
});
