"use strict";

const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");

const codeSmellRules = require("../rules/code-smell-rules");
const angularRules = require("../rules/angular-rules");

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

function error(message) {
  return { message };
}

// S7783
ruleTester.run("S7783", codeSmellRules.S7783, {
  valid: ["value.trimStart();"],
  invalid: [
    {
      code: "value.trimLeft();",
      errors: [
        error('Replace "trimLeft()" with "trimStart()". [typescript:S7783]'),
      ],
    },
    {
      code: "value.trimRight();",
      errors: [
        error('Replace "trimRight()" with "trimEnd()". [typescript:S7783]'),
      ],
    },
  ],
});

// S6861
ruleTester.run("S6861", codeSmellRules.S6861, {
  valid: ["export const counter = 0;"],
  invalid: [
    {
      code: "export let counter = 0;",
      errors: [
        error(
          'Exported variables should be immutable ("const") or wrapped in a getter. [typescript:S6861]',
        ),
      ],
    },
  ],
});

// S1186
ruleTester.run("S1186", codeSmellRules.S1186, {
  valid: ["function noop() {\n  // intentionally empty\n}"],
  invalid: [
    {
      code: "function noop() {}",
      errors: [
        error(
          "Remove this empty function or document why it must stay empty. [typescript:S1186]",
        ),
      ],
    },
  ],
});

// S6859
ruleTester.run("S6859", codeSmellRules.S6859, {
  valid: ["import fs from 'node:fs';"],
  invalid: [
    {
      code: "import fs from '/usr/lib/fs';",
      errors: [
        error(
          'Use a relative or aliased import instead of the absolute path "/usr/lib/fs". [typescript:S6859]',
        ),
      ],
    },
  ],
});

// S7059
ruleTester.run("S7059", codeSmellRules.S7059, {
  valid: ["class C { constructor() { this.value = 1; } }"],
  invalid: [
    {
      code: "class C { constructor() { fetch('/api'); } }",
      errors: [
        error(
          "Constructors should not start asynchronous work; expose an init method instead. [typescript:S7059]",
        ),
      ],
    },
  ],
});

// S3516
ruleTester.run("S3516", codeSmellRules.S3516, {
  valid: [
    "function f(x) { if (x) { return 1; } return 2; }",
    "function f(x) { if (!x) { return null; } return x.value; }",
  ],
  invalid: [
    {
      code: "function f(x) { if (x) { return 1; } return 1; }",
      errors: [
        error(
          "This function always returns the same value; remove the redundant returns. [typescript:S3516]",
        ),
      ],
    },
  ],
});

// S1314
ruleTester.run("S1314", codeSmellRules.S1314, {
  valid: ["const mode = 493;"],
  invalid: [
    {
      code: "const mode = 0o755;",
      errors: [
        error(
          "Do not use octal values; use a decimal or hexadecimal literal instead. [typescript:S1314]",
        ),
      ],
    },
  ],
});

// S2430
ruleTester.run("S2430", codeSmellRules.S2430, {
  valid: ["const instance = new Widget();"],
  invalid: [
    {
      code: "const instance = new widget();",
      errors: [
        error(
          'Constructor "widget" should start with an upper case letter. [typescript:S2430]',
        ),
      ],
    },
  ],
});

// S3504
ruleTester.run("S3504", codeSmellRules.S3504, {
  valid: ["let total = 1;"],
  invalid: [
    {
      code: "var total = 1;",
      errors: [
        error('Replace "var" with "let" or "const". [typescript:S3504]'),
      ],
    },
  ],
});

// S4123
ruleTester.run("S4123", codeSmellRules.S4123, {
  valid: ["async function f() { const value = await getValue(); }"],
  invalid: [
    {
      code: "async function f() { const value = await 42; }",
      errors: [
        error(
          'Remove "await": the awaited value is not a promise. [typescript:S4123]',
        ),
      ],
    },
  ],
});

// S4524
ruleTester.run("S4524", codeSmellRules.S4524, {
  valid: ["switch (x) { case 1: break; default: break; }"],
  invalid: [
    {
      code: "switch (x) { default: break; case 1: break; }",
      errors: [
        error(
          'Move the "default" clause to the end of the switch statement. [typescript:S4524]',
        ),
      ],
    },
  ],
});

// S2699
ruleTester.run("S2699", codeSmellRules.S2699, {
  valid: ["it('works', () => { expect(value).toBe(1); });"],
  invalid: [
    {
      code: "it('works', () => { doSomething(); });",
      errors: [error("Add an assertion to this test case. [typescript:S2699]")],
    },
  ],
});

// S1994
ruleTester.run("S1994", codeSmellRules.S1994, {
  valid: ["for (let i = 0; i < 10; i++) { doSomething(); }"],
  invalid: [
    {
      code: "for (let i = 0; i < 10; j++) { doSomething(); }",
      errors: [
        error(
          'The loop counter "i" is not modified by the update clause. [typescript:S1994]',
        ),
      ],
    },
  ],
});

// S2970
ruleTester.run("S2970", codeSmellRules.S2970, {
  valid: ["expect(value).toBe(1);"],
  invalid: [
    {
      code: "expect(value);",
      errors: [
        error(
          "Complete this assertion with a matcher call (e.g. toBe, toEqual). [typescript:S2970]",
        ),
      ],
    },
  ],
});

// S1219
ruleTester.run("S1219", codeSmellRules.S1219, {
  valid: ["switch (x) { case 1: doSomething(); break; }"],
  invalid: [
    {
      code: "switch (x) { case 1: marker: doSomething(); break; }",
      errors: [
        error(
          "Remove this label from the switch statement. [typescript:S1219]",
        ),
      ],
    },
  ],
});

// S3735
ruleTester.run("S3735", codeSmellRules.S3735, {
  valid: ["doSomething();"],
  invalid: [
    {
      code: "void doSomething();",
      errors: [error('Do not use the "void" operator. [typescript:S3735]')],
    },
  ],
});

// S3972
ruleTester.run("S3972", codeSmellRules.S3972, {
  valid: ["function f(a, b) {\n  if (a) { g(); }\n  if (b) { h(); }\n}"],
  invalid: [
    {
      code: "function f(a, b) { if (a) { g(); } if (b) { h(); } }",
      errors: [
        error(
          "Start this conditional on a new line to avoid confusion with the previous block. [typescript:S3972]",
        ),
      ],
    },
  ],
});

// S6079
ruleTester.run("S6079", codeSmellRules.S6079, {
  valid: ["it('t', done => { doSomething(); done(); });"],
  invalid: [
    {
      code: "it('t', done => { doSomething(); done(); after(); });",
      errors: [
        error(
          'Remove the code after "done()"; the test has already finished. [typescript:S6079]',
        ),
      ],
    },
  ],
});

// S2004
ruleTester.run("S2004", codeSmellRules.S2004, {
  valid: [
    "function a() { function b() { function c() { function d() { return 1; } } } }",
  ],
  invalid: [
    {
      code: "function a() { function b() { function c() { function d() { function e() { return 1; } } } } }",
      errors: [
        error(
          "Refactor this function: nesting depth 5 exceeds the allowed 4. [typescript:S2004]",
        ),
      ],
    },
  ],
});

// S2187
ruleTester.run("S2187", codeSmellRules.S2187, {
  valid: [
    {
      code: "it('works', () => { expect(1).toBe(1); });",
      filename: "example.test.ts",
    },
    { code: "const x = 1;", filename: "example.ts" },
  ],
  invalid: [
    {
      code: "const x = 1;",
      filename: "example.test.ts",
      errors: [
        error(
          "Add at least one test case to this test file. [typescript:S2187]",
        ),
      ],
    },
  ],
});

// S7648
ruleTester.run("S7648", angularRules.S7648, {
  valid: ["@Component({ standalone: true }) class AppComponent {}"],
  invalid: [
    {
      code: "@Component({ selector: 'app-root' }) class AppComponent {}",
      errors: [
        error(
          'Set "standalone: true" to use the standalone architecture. [typescript:S7648]',
        ),
      ],
    },
  ],
});

// S7649
ruleTester.run("S7649", angularRules.S7649, {
  valid: ["class C { @Input() name: string; }"],
  invalid: [
    {
      code: "class C { @Input('alias') name: string; }",
      errors: [
        error(
          "Do not alias an Input binding; use the property name directly. [typescript:S7649]",
        ),
      ],
    },
  ],
});

// S7653
ruleTester.run("S7653", angularRules.S7653, {
  valid: ["class C { @Output() changed = new EventEmitter(); }"],
  invalid: [
    {
      code: "class C { @Output('changedAlias') changed = new EventEmitter(); }",
      errors: [
        error(
          "Do not alias an Output binding; use the property name directly. [typescript:S7653]",
        ),
      ],
    },
  ],
});

// S7650
ruleTester.run("S7650", angularRules.S7650, {
  valid: ["@Component({ standalone: true }) class C {}"],
  invalid: [
    {
      code: "@Component({ inputs: ['name'] }) class C {}",
      errors: [
        error(
          'Use the @Input() decorator instead of the "inputs" metadata property. [typescript:S7650]',
        ),
      ],
    },
  ],
});

// S7654
ruleTester.run("S7654", angularRules.S7654, {
  valid: ["@Component({ standalone: true }) class C {}"],
  invalid: [
    {
      code: "@Directive({ outputs: ['changed'] }) class D {}",
      errors: [
        error(
          'Use the @Output() decorator instead of the "outputs" metadata property. [typescript:S7654]',
        ),
      ],
    },
  ],
});

// S7651
ruleTester.run("S7651", angularRules.S7651, {
  valid: ["class C { @Output() selectionChanged = new EventEmitter(); }"],
  invalid: [
    {
      code: "class C { @Output() click = new EventEmitter(); }",
      errors: [
        error(
          'Do not name an @Output() after the DOM event "click". [typescript:S7651]',
        ),
      ],
    },
  ],
});

// S7652
ruleTester.run("S7652", angularRules.S7652, {
  valid: ["class C { @Output() changed = new EventEmitter(); }"],
  invalid: [
    {
      code: "class C { @Output() onChange = new EventEmitter(); }",
      errors: [
        error(
          'Rename the @Output() "onChange" without the "on" prefix. [typescript:S7652]',
        ),
      ],
    },
  ],
});

// S7655
ruleTester.run("S7655", angularRules.S7655, {
  valid: [
    "@Component({ standalone: true }) class C implements OnInit { ngOnInit() { this.load(); } }",
  ],
  invalid: [
    {
      code: "@Component({ standalone: true }) class C { ngOnInit() { this.load(); } }",
      errors: [
        error(
          'Implement the "OnInit" interface for "ngOnInit". [typescript:S7655]',
        ),
      ],
    },
  ],
});

// S7656
ruleTester.run("S7656", angularRules.S7656, {
  valid: [
    "@Pipe({ standalone: true }) class P implements PipeTransform { transform(value: string) { return value; } }",
  ],
  invalid: [
    {
      code: "@Pipe({ standalone: true }) class P { format(value: string) { return value; } }",
      errors: [
        error(
          'Angular Pipes should implement "PipeTransform". [typescript:S7656]',
        ),
      ],
    },
  ],
});

// S7641
ruleTester.run("S7641", angularRules.S7641, {
  valid: ["@Component({ standalone: true }) class C { ngOnInit() {} }"],
  invalid: [
    {
      code: "class NotAComponent { ngOnInit() {} }",
      errors: [
        error(
          '"ngOnInit" is only invoked on Angular components, directives or pipes. [typescript:S7641]',
        ),
      ],
    },
  ],
});

// S7647
ruleTester.run("S7647", angularRules.S7647, {
  valid: [
    "@Component({ standalone: true }) class C { ngAfterViewInit() { this.init(); } }",
  ],
  invalid: [
    {
      code: "@Component({ standalone: true }) class C { ngAfterViewInit() {} }",
      errors: [
        error(
          'Remove the empty lifecycle method "ngAfterViewInit". [typescript:S7647]',
        ),
      ],
    },
  ],
});
