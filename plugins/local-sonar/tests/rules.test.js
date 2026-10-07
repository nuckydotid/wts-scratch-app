"use strict";

const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");

const plugin = require("../index");

const securityRules = require("../rules/security-rules");
const modernRules = require("../rules/modern-js-rules");
const controlRules = require("../rules/control-flow-rules");
const collectionRules = require("../rules/collections-rules");
const asyncErrorRules = require("../rules/async-error-rules");
const testingRules = require("../rules/testing-rules");
const functionRules = require("../rules/functions-rules");
const typescriptRules = require("../rules/typescript-rules");
const reactRules = require("../rules/react-jsx-rules");
const regexRules = require("../rules/regex-rules");

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

// Test S5850 Anchor Precedence (Regex Domain)
ruleTester.run("S5850", regexRules.S5850, {
  valid: [
    { code: "const r = /(?:^_)|(?:_$)/g;" },
    { code: "const r = /^(?:a|b)$/;" },
  ],
  invalid: [
    {
      code: "const r = /^_|_$/g;",
      errors: [
        {
          message:
            "Group parts of the regex together to make the intended operator precedence explicit. [typescript:S5850]",
        },
      ],
    },
  ],
});

// Test S4782 Redundant Optional (TypeScript Domain)
ruleTester.run("S4782", typescriptRules.S4782, {
  valid: [{ code: "type A = { foo?: string; };" }],
  invalid: [
    {
      code: "type A = { foo?: string | undefined; };",
      errors: [
        {
          message:
            "Consider removing 'undefined' type or '?' specifier, one of them is redundant. [typescript:S4782]",
        },
      ],
    },
  ],
});

// Test S4323 Type Aliases Should Be Used (TypeScript Domain)
ruleTester.run("S4323", typescriptRules.S4323, {
  valid: [
    {
      code: 'type Platform = "both" | "insider" | "appsflyer"; function f(p: Platform) {}',
    },
    { code: "function f(a: string | number) {}" },
  ],
  invalid: [
    {
      code: 'function f(a: Record<"a" | "b" | "c", number>) {}\nfunction g(b: Record<"a" | "b" | "c", number>) {}\nfunction h(c: Record<"a" | "b" | "c", number>) {}',
      errors: [
        {
          message:
            "Replace this union type with a type alias. [typescript:S4323]",
        },
      ],
    },
  ],
});

// Test S1313 Hardcoded IP (Security Domain)
ruleTester.run("S1313", securityRules.S1313, {
  valid: [{ code: 'const ip = "127.0.0.1";' }],
  invalid: [
    {
      code: 'const ip = "192.168.1.100";',
      errors: [
        {
          message:
            "Using hardcoded IP addresses is security-sensitive. Make sure using this hardcoded IP address is safe here. [typescript:S1313]",
        },
      ],
    },
  ],
});

// Test S7781 Prefer ReplaceAll (Modern JS Domain)
ruleTester.run("S7781", modernRules.S7781, {
  valid: [
    { code: 'str.replaceAll("a", "b");' },
    { code: 'str.replace(/a/, "b");' },
  ],
  invalid: [
    {
      // eslint-disable-next-line local-sonar/S7780 -- intentional escape fixture
      code: 'str.replace(/[-\\s_]+/g, "_");',
      errors: [
        {
          message:
            'Prefer "String#replaceAll()" over "String#replace()" with global regex. [typescript:S7781]',
        },
      ],
    },
  ],
});

// Test S6959 Reduce Initial Value (Modern JS Domain)
ruleTester.run("S6959", modernRules.S6959, {
  valid: [{ code: "[1, 2, 3].reduce((acc, x) => acc + x, 0);" }],
  invalid: [
    {
      code: "[1, 2, 3].reduce((acc, x) => acc + x);",
      errors: [
        {
          message:
            'Provide an initial value when calling "Array.reduce()". [typescript:S6959]',
        },
      ],
    },
  ],
});

// Test S6437 Hardcoded Secrets (Security Domain)
ruleTester.run("S6437", securityRules.S6437, {
  valid: [{ code: "const apiKey = process.env.API_KEY;" }],
  invalid: [
    {
      code: 'const apiKey = "AIzaSyD98x72498234kjhsdf";',
      errors: [
        {
          message:
            'Revoke and remove this hardcoded credential "apiKey". Use environment variables or a secret vault instead. [typescript:S6437]',
        },
      ],
    },
  ],
});

// Test S5730 Mixed Content (Security Domain)
ruleTester.run("S5730", securityRules.S5730, {
  valid: [{ code: 'const url = "https://api.bri.co.id/v1";' }],
  invalid: [
    {
      code: 'const url = "http://insecure-api.example.com/v1";',
      errors: [
        {
          message:
            'Using unencrypted "http://" protocol is security-sensitive. Use "https://" to avoid mixed-content and man-in-the-middle attacks. [typescript:S5730]',
        },
      ],
    },
  ],
});

// Test S1764 Identical Expressions (Control Flow Domain)
ruleTester.run("S1764", controlRules.S1764, {
  valid: [{ code: "const res = a === b;" }, { code: "const res = x && y;" }],
  invalid: [
    {
      code: "const res = a === a;",
      errors: [
        {
          message:
            'Identical expression "a" is used on both sides of the "===" operator. [typescript:S1764]',
        },
      ],
    },
  ],
});

// Test S1125 Boolean Literals (Control Flow Domain)
ruleTester.run("S1125", controlRules.S1125, {
  valid: [{ code: "if (isValid) {}" }, { code: "if (!isValid) {}" }],
  invalid: [
    {
      code: "if (isValid === true) {}",
      errors: [
        {
          message:
            "Remove the redundant boolean literal comparison. [typescript:S1125]",
        },
      ],
    },
  ],
});

// Test S3923 Identical Branches (Control Flow Domain)
ruleTester.run("S3923", controlRules.S3923, {
  valid: [
    { code: "if (a) { doA(); } else { doB(); }" },
    { code: "const res = a ? 1 : 2;" },
  ],
  invalid: [
    {
      code: "if (a) { return 1; } else { return 1; }",
      errors: [
        {
          message:
            'This "if" structure has identical branches. Remove the condition or change one of the branches. [typescript:S3923]',
        },
      ],
    },
  ],
});

// Test S6443 No Redundant State Setter (React Domain)
ruleTester.run("S6443", reactRules.S6443, {
  valid: [
    { code: "setCount(prev => prev + 1);" },
    { code: "setCount(newCount);" },
  ],
  invalid: [
    {
      code: "setCount(count);",
      errors: [
        {
          message:
            'Calling state setter "setCount" with the existing state variable "count" is redundant and has no effect. [typescript:S6443]',
        },
      ],
    },
  ],
});

// Test S2068 Security Credentials (Security Domain)
ruleTester.run("S2068", securityRules.S2068, {
  valid: [{ code: "const password = process.env.DB_PASS;" }],
  invalid: [
    {
      code: 'const password = "mySecretPassword123";',
      errors: [
        {
          message: "Credentials should not be hard-coded. [typescript:S2068]",
        },
      ],
    },
  ],
});

// Test S7718 Catch Parameter Naming (Modern JS Domain)
ruleTester.run("S7718", modernRules.S7718, {
  valid: [
    { code: "try {} catch (err) {}" },
    { code: "try {} catch (error) {}" },
  ],
  invalid: [
    {
      code: "try {} catch (someRandomVar) {}",
      errors: [
        {
          message:
            'Catch parameter "someRandomVar" should follow standard naming (e.g. "error", "err", "e"). [typescript:S7718]',
        },
      ],
    },
  ],
});

// Test S888 For Loop Condition (Control Flow Domain)
ruleTester.run("S888", controlRules.S888, {
  valid: [{ code: "for (let i = 0; i < 10; i++) {}" }],
  invalid: [
    {
      code: "for (let i = 0; i != 10; i++) {}",
      errors: [
        {
          message:
            'Use relational operators (<, <=, >, >=) instead of "!=" in loop conditions. [typescript:S888]',
        },
      ],
    },
  ],
});

// Test S3358 Nested Ternary (Control Flow Domain)
ruleTester.run("S3358", controlRules.S3358, {
  valid: [
    { code: "const a = cond ? 1 : 2;" },
    { code: "function f() { const a = cond ? 1 : 2; return a; }" },
  ],
  invalid: [
    {
      code: "const a = cond1 ? (cond2 ? 1 : 2) : 3;",
      errors: [
        {
          message:
            "Extract this nested ternary operation into an independent statement. [typescript:S3358]",
        },
      ],
    },
    {
      code: "const a = cond1 ? `${cond2 ? 1 : 2}` : 3;",
      errors: [
        {
          message:
            "Extract this nested ternary operation into an independent statement. [typescript:S3358]",
        },
      ],
    },
  ],
});

// Test S4624 Nested Template Literals (Modern JS Domain)
ruleTester.run("S4624", modernRules.S4624, {
  valid: [
    { code: "const a = `hello ${name}`;" },
    { code: "const a = `prefix-${id}-suffix`;" },
  ],
  invalid: [
    {
      code: "const a = `${testID || `item-${index}`}-btn`;",
      errors: [
        {
          message:
            "Refactor this code to not use nested template literals. [typescript:S4624]",
        },
      ],
    },
  ],
});

// Test S3776 Cognitive Complexity (Functions Domain)
ruleTester.run("S3776", functionRules.S3776, {
  valid: [
    {
      code: `
        function simple(a, b) {
          if (a) return 1;
          if (b) return 2;
          return 3;
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        function complex(a, b, c, d, e, f) {
          if (a) {
            if (b) {
              if (c) {
                if (d) {
                  if (e) {
                    if (f) {
                      return 1;
                    }
                  }
                }
              }
            }
          }
          return 0;
        }
      `,
      errors: [
        {
          message:
            "Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed. [typescript:S3776]",
        },
      ],
    },
  ],
});

// Test S6479 Array Index in Keys (React Domain)
ruleTester.run("S6479", reactRules.S6479, {
  valid: [
    { code: "const a = items.map(item => <View key={item.id} />);" },
    { code: 'const a = <View key="static" />;' },
  ],
  invalid: [
    {
      code: "const a = items.map((_, index) => <View key={index} />);",
      errors: [
        {
          message: "Do not use Array index in keys. [typescript:S6479]",
        },
      ],
    },
    {
      code: "const a = Array.from({ length: 3 }).map((_, index) => <View key={index} />);",
      errors: [
        {
          message: "Do not use Array index in keys. [typescript:S6479]",
        },
      ],
    },
  ],
});

// Test S1143 Finally Jump Statements (Async Error Domain)
ruleTester.run("S1143", asyncErrorRules.S1143, {
  valid: [{ code: "try {} finally { cleanup(); }" }],
  invalid: [
    {
      code: "try {} finally { return 1; }",
      errors: [
        {
          message:
            'Do not use jump statements in "finally" blocks as they swallow errors. [typescript:S1143]',
        },
      ],
    },
  ],
});

// Test S2870 Delete On Array (Collections Domain)
ruleTester.run("S2870", collectionRules.S2870, {
  valid: [{ code: "arr.splice(1, 1);" }],
  invalid: [
    {
      code: "delete arr[0];",
      errors: [
        {
          message:
            'Use "Array#splice()" instead of "delete" operator on arrays. [typescript:S2870]',
        },
      ],
    },
  ],
});

// Test S1607 Skipped Tests (Testing Domain)
ruleTester.run("S1607", testingRules.S1607, {
  valid: [{ code: 'it("should pass", () => {});' }],
  invalid: [
    {
      code: 'it.skip("test", () => {});',
      errors: [
        {
          message:
            "Do not leave skipped tests without documented rationale. [typescript:S1607]",
        },
      ],
    },
  ],
});

// Test S107 Too Many Parameters (Functions Domain)
ruleTester.run("S107", functionRules.S107, {
  valid: [{ code: "function foo(a, b, c) {}" }],
  invalid: [
    {
      code: "function foo(a, b, c, d, e, f, g, h) {}",
      errors: [
        {
          message:
            "Function has 8 parameters, which exceeds threshold of 7. Use an options object. [typescript:S107]",
        },
      ],
    },
  ],
});

// Test S6754 useState Destructuring (React Domain)
ruleTester.run("S6754", reactRules.S6754, {
  valid: [
    { code: "const [count, setCount] = useState(0);" },
    { code: "const [isOpen, setIsOpen] = useState(false);" },
    { code: "const [isOpen, setOpen] = useState(false);" },
    { code: "const [hasError, setHasError] = useState(false);" },
    { code: "const [hasError, setError] = useState(false);" },
    { code: "const [shouldShow, setShouldShow] = useState(false);" },
    { code: "const [dataUser, setDataUser] = React.useState(null);" },
    { code: "const [{ id }, setId] = useState({ id: 1 });" },
    { code: "const [, setCardPosition] = useState({ x: 0, y: 0 });" },
    { code: "const [count] = useState(0);" },
  ],
  invalid: [
    {
      code: "const state = useState(0);",
      errors: [
        {
          message:
            "useState call is not destructured into value + setter pair. [typescript:S6754]",
        },
      ],
    },
    {
      code: "const [count, updateCount] = useState(0);",
      errors: [
        {
          message:
            "useState call is not destructured into value + setter pair. [typescript:S6754]",
        },
      ],
    },
    {
      code: "const [data, setData] = React.useState(null); state = useState(0);",
      errors: [
        {
          message:
            "useState call is not destructured into value + setter pair. [typescript:S6754]",
        },
      ],
    },
    {
      code: "useState(0);",
      errors: [
        {
          message:
            "useState call is not destructured into value + setter pair. [typescript:S6754]",
        },
      ],
    },
  ],
});

// Verify 416 Total Rules Export
const totalExported = Object.keys(plugin.rules).length;
if (totalExported !== 416) {
  throw new Error(`Expected exactly 416 rules, but got ${totalExported}`);
}

// Coverage audit driven by the implementation registry (not a visitor-shape
// check). Migration backlog: `node scripts/sonar-coverage.cjs --list-gaps`.
const registry = require("../registry");
const exportedRuleKeys = new Set(Object.keys(plugin.rules));
const implemented = Object.keys(registry).filter((ruleKey) =>
  exportedRuleKeys.has(ruleKey),
);
const notImplemented = Object.keys(plugin.rules).filter(
  (ruleKey) => !registry[ruleKey],
);

if (implemented.length + notImplemented.length !== totalExported) {
  throw new Error(
    `Implemented (${implemented.length}) + not implemented (${notImplemented.length}) ` +
      `does not match the exported total (${totalExported})`,
  );
}
if (implemented.length !== plugin.sonar.implementedCount) {
  throw new Error(
    `plugin.sonar.implementedCount (${plugin.sonar.implementedCount}) is out of sync ` +
      `with the registry (${implemented.length})`,
  );
}
for (const ruleKey of notImplemented) {
  if (!plugin.rules[ruleKey].meta?.docs?.notImplemented) {
    throw new Error(
      `Rule ${ruleKey} has no implementation but is not marked notImplemented`,
    );
  }
}

console.log(
  `local-sonar: ${implemented.length}/${totalExported} rules implemented ` +
    `(${notImplemented.length} tracked as not implemented, see sonar-coverage.cjs).`,
);
