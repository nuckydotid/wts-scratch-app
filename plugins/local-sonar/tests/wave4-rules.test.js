"use strict";

const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");

const bugRules = require("../rules/major-bug-rules");
const hotspotRules = require("../rules/major-hotspot-rules");

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

// S7727
ruleTester.run("S7727", bugRules.S7727, {
  valid: ["items.map(item => parse(item));"],
  invalid: [
    {
      code: "items.map(parse);",
      errors: [
        error(
          'Pass an arrow function wrapping "parse" so extra arguments are not forwarded. [typescript:S7727]',
        ),
      ],
    },
  ],
});

// S7739
ruleTester.run("S7739", bugRules.S7739, {
  valid: ["const result = { value: 1 };"],
  invalid: [
    {
      code: "const result = { then: resolve };",
      errors: [
        error(
          'Object with a "then" property is treated as a thenable; rename it. [typescript:S7739]',
        ),
      ],
    },
  ],
});

// S6638
ruleTester.run("S6638", bugRules.S6638, {
  valid: ["const total = price * quantity;"],
  invalid: [
    {
      code: "const zero = price * 0;",
      errors: [
        error(
          'This "*" expression always returns the same value. [typescript:S6638]',
        ),
      ],
    },
  ],
});

// S1534
ruleTester.run("S1534", bugRules.S1534, {
  valid: ["const point = { x: 1, y: 2 };"],
  invalid: [
    {
      code: "const point = { x: 1, x: 2 };",
      errors: [
        error('Member "x" is declared more than once. [typescript:S1534]'),
      ],
    },
  ],
});

// S1656
ruleTester.run("S1656", bugRules.S1656, {
  valid: ["total = subtotal + tax;"],
  invalid: [
    {
      code: "total = total;",
      errors: [
        error('Remove this self-assignment of "total". [typescript:S1656]'),
      ],
    },
  ],
});

// S905
ruleTester.run("S905", bugRules.S905, {
  valid: ["doSomething();"],
  invalid: [
    {
      code: "doSomething;",
      errors: [
        error(
          "This statement has no effect; remove it or make the intent explicit. [typescript:S905]",
        ),
      ],
    },
  ],
});

// S6426
ruleTester.run("S6426", bugRules.S6426, {
  valid: ["it('works', () => {});"],
  invalid: [
    {
      code: "it.only('works', () => {});",
      errors: [
        error(
          "Remove the exclusive test marker (.only / fit / fdescribe) before committing. [typescript:S6426]",
        ),
      ],
    },
  ],
});

// S4124
ruleTester.run("S4124", bugRules.S4124, {
  valid: ["interface User { name: string; }"],
  invalid: [
    {
      code: "interface User { new (name: string): User; }",
      errors: [
        error(
          "Interfaces cannot declare constructors; use a class or a factory signature. [typescript:S4124]",
        ),
      ],
    },
  ],
});

// S6435
ruleTester.run("S6435", bugRules.S6435, {
  valid: ["class C { render() { return this.view; } }"],
  invalid: [
    {
      code: "class C { render() { this.paint(); } }",
      errors: [error('React "render" must return a value. [typescript:S6435]')],
    },
  ],
});

// S6523
ruleTester.run("S6523", bugRules.S6523, {
  valid: [
    "if (user?.name) { greet(user.name); }",
    "(event?.callback ?? defaultCallback)();",
    "event?.callback();",
    "const name = user?.profile.name;",
    "node.children?.filter(isVisible).map(render);",
    "const merged = { ...event?.values };",
  ],
  invalid: [
    {
      code: "(event?.callback)();",
      errors: [
        error(
          '"event?.callback" may be undefined and is used where undefined throws an error. [typescript:S6523]',
        ),
      ],
    },
    {
      code: "const { code } = event?.error;",
      errors: [
        error(
          '"event?.error" may be undefined and is used where undefined throws an error. [typescript:S6523]',
        ),
      ],
    },
    {
      code: "consume(...event?.values);",
      errors: [
        error(
          '"event?.values" may be undefined and is used where undefined throws an error. [typescript:S6523]',
        ),
      ],
    },
  ],
});

// S6534
ruleTester.run("S6534", bugRules.S6534, {
  valid: ["const safe = 9007199254740991;"],
  invalid: [
    {
      code: "const unsafe = 9007199254740993;",
      errors: [
        error(
          '"9007199254740993" exceeds the maximum safe integer and may lose precision. [typescript:S6534]',
        ),
      ],
    },
  ],
});

// S6440
ruleTester.run("S6440", bugRules.S6440, {
  valid: ["function App() { const [x] = useState(0); return x; }"],
  invalid: [
    {
      code: "function App(flag) { if (flag) { useState(0); } return null; }",
      errors: [
        error(
          'Hook "useState" must be called unconditionally at the top level of a component or hook. [typescript:S6440]',
        ),
      ],
    },
  ],
});

// S6442
ruleTester.run("S6442", bugRules.S6442, {
  valid: ["function App() { const [x] = useState(0); return x; }"],
  invalid: [
    {
      code: "const handler = () => useState(0);",
      errors: [
        error(
          'Move useState into a component or custom hook ("handler" is neither). [typescript:S6442]',
        ),
      ],
    },
  ],
});

// S5863
ruleTester.run("S5863", bugRules.S5863, {
  valid: ["expect(result).toBe(expected);"],
  invalid: [
    {
      code: "expect(result).toBe(result);",
      errors: [
        error(
          'The assertion "result" is compared with itself. [typescript:S5863]',
        ),
      ],
    },
  ],
});

// S3531
ruleTester.run("S3531", bugRules.S3531, {
  valid: ["function* gen() { yield 1; }"],
  invalid: [
    {
      code: "function* gen() { doSomething(); }",
      errors: [
        error(
          "This generator never yields a value; remove the generator or add a yield. [typescript:S3531]",
        ),
      ],
    },
  ],
});

// S2123
ruleTester.run("S2123", bugRules.S2123, {
  valid: ["i++;"],
  invalid: [
    {
      code: "i = i++;",
      errors: [
        error(
          'The increment of "i" is discarded by the assignment. [typescript:S2123]',
        ),
      ],
    },
    {
      code: "function pick() { let i = 0; return i++; }",
      errors: [
        error(
          "The incremented value is discarded; use the prefix form instead. [typescript:S2123]",
        ),
      ],
    },
  ],
});

// S3699
ruleTester.run("S3699", bugRules.S3699, {
  valid: ["console.log(value);"],
  invalid: [
    {
      code: "const result = console.log(value);",
      errors: [
        error(
          'The return value of void function "log()" should not be used. [typescript:S3699]',
        ),
      ],
    },
  ],
});

// S2137
ruleTester.run("S2137", bugRules.S2137, {
  valid: ["const value = undefined;"],
  invalid: [
    {
      code: "undefined = 1;",
      errors: [
        error(
          'Do not assign to the special identifier "undefined". [typescript:S2137]',
        ),
      ],
    },
    {
      code: "const NaN = 1;",
      errors: [
        error('Do not bind the special identifier "NaN". [typescript:S2137]'),
      ],
    },
  ],
});

// S2251
ruleTester.run("S2251", bugRules.S2251, {
  valid: ["for (let i = 0; i < 10; i++) { doSomething(); }"],
  invalid: [
    {
      code: "for (let i = 0; i < 10; i--) { doSomething(); }",
      errors: [
        error(
          'The loop counter "i" moves in the wrong direction. [typescript:S2251]',
        ),
      ],
    },
  ],
});

// S2999
ruleTester.run("S2999", bugRules.S2999, {
  valid: ["const instance = new Widget();"],
  invalid: [
    {
      code: "const fn = new (() => {})();",
      errors: [
        error(
          '"new" can only be used with functions and classes. [typescript:S2999]',
        ),
      ],
    },
  ],
});

// S1529
ruleTester.run("S1529", bugRules.S1529, {
  valid: ["if (a && b) { doSomething(); }"],
  invalid: [
    {
      code: "if (a & b) { doSomething(); }",
      errors: [
        error(
          'The bitwise operator "&" is used in a boolean context; did you mean the logical operator? [typescript:S1529]',
        ),
      ],
    },
  ],
});

// S6080
ruleTester.run("S6080", bugRules.S6080, {
  valid: ["describe('suite', function () { this.timeout(2000); });"],
  invalid: [
    {
      code: "describe('suite', function () { this.timeout(0); });",
      errors: [
        error(
          "Disabling Mocha timeouts should be done explicitly and only when required. [typescript:S6080]",
        ),
      ],
    },
  ],
});

// S4822
ruleTester.run("S4822", bugRules.S4822, {
  valid: ["try { doSomething(); } catch (error) { handle(error); }"],
  invalid: [
    {
      code: 'try { Promise.reject(new Error("bad")); } catch (error) { handle(error); }',
      errors: [
        error(
          "A promise rejection inside a try block is not caught by the catch clause. [typescript:S4822]",
        ),
      ],
    },
  ],
});

// S3981
ruleTester.run("S3981", bugRules.S3981, {
  valid: [
    "if (items.length === 0) { doSomething(); }",
    "if (items.length > 0) { doSomething(); }",
  ],
  invalid: [
    {
      code: "if (items.length >= 0) { doSomething(); }",
      errors: [
        error(
          "This comparison is always true; compare against a meaningful bound instead. [typescript:S3981]",
        ),
      ],
    },
  ],
});

// S3984
ruleTester.run("S3984", bugRules.S3984, {
  valid: ['throw new Error("failure");', "setError(false);"],
  invalid: [
    {
      code: 'new Error("failure");',
      errors: [
        error(
          "This error is created but never thrown; throw it or remove it. [typescript:S3984]",
        ),
      ],
    },
  ],
});

// S1848
ruleTester.run("S1848", bugRules.S1848, {
  valid: ["const service = new Service();"],
  invalid: [
    {
      code: "new Service();",
      errors: [
        error(
          "This created object is not used anywhere; assign it or remove the statement. [typescript:S1848]",
        ),
      ],
    },
  ],
});

// S6328
ruleTester.run("S6328", bugRules.S6328, {
  valid: ["'abc'.replace(/a(b)c/, '$1');"],
  invalid: [
    {
      code: "'abc'.replace(/a(b)c/, '$2');",
      errors: [
        error(
          "Replacement references group $2 but the pattern only has 1. [typescript:S6328]",
        ),
      ],
    },
  ],
});

// S6351
ruleTester.run("S6351", bugRules.S6351, {
  valid: [
    "const re = /abc/; re.test(value);",
    "const re = /abc/g; re.lastIndex = 0; re.test(value);",
  ],
  invalid: [
    {
      code: "const re = /abc/g; re.test(value);",
      errors: [
        error(
          "A global regular expression keeps state (lastIndex) between calls; use a non-global expression or reset lastIndex. [typescript:S6351]",
        ),
      ],
    },
  ],
});

// S4143
ruleTester.run("S4143", bugRules.S4143, {
  valid: ["fruits[1] = 'apple'; use(fruits[1]);"],
  invalid: [
    {
      code: "fruits[1] = 'apple'; fruits[1] = 'banana';",
      errors: [
        error(
          '"fruits[1]" is overwritten without its value being read. [typescript:S4143]',
        ),
      ],
    },
  ],
});

// S6324
ruleTester.run("S6324", bugRules.S6324, {
  valid: ["const pattern = /abc/;"],
  invalid: [
    {
      // eslint-disable-next-line local-sonar/S7780 -- intentional escape fixture
      code: "const pattern = /\\x1f/;",
      errors: [
        error(
          "Remove control characters from this regular expression. [typescript:S6324]",
        ),
      ],
    },
  ],
});

// S5256
ruleTester.run("S5256", bugRules.S5256, {
  valid: [
    "const Table = () => <table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>x</td></tr></tbody></table>;",
  ],
  invalid: [
    {
      code: "const Table = () => <table><tbody><tr><td>x</td></tr></tbody></table>;",
      errors: [
        error(
          "Add a header row (<thead> or <th>) to this table. [typescript:S5256]",
        ),
      ],
    },
  ],
});

// S6756
ruleTester.run("S6756", bugRules.S6756, {
  valid: [
    "class Counter extends React.Component { increment() { this.setState(prev => ({ count: prev.count + 1 })); } }",
    "function Counter() { const [count, setCount] = useState(0); setCount(count + 1); return count; }",
  ],
  invalid: [
    {
      code: "class Counter extends React.Component { increment() { this.setState({ count: this.state.count + 1 }); } }",
      errors: [
        error(
          'Use the callback form of "setState" when referencing the previous state. [typescript:S6756]',
        ),
      ],
    },
  ],
});

// S7790
ruleTester.run("S7790", hotspotRules.S7790, {
  valid: ["ejs.render('<%= name %>', context);"],
  invalid: [
    {
      code: "ejs.render(req.query.template, context);",
      errors: [
        error(
          "Do not construct template content dynamically; use a static template with a context object. [typescript:S7790]",
        ),
      ],
    },
  ],
});

// S5144
ruleTester.run("S5144", hotspotRules.S5144, {
  valid: ["fetch('https://api.example.com/users');"],
  invalid: [
    {
      code: "fetch(req.query.url);",
      errors: [
        error(
          "Server-side request URL should not be built from untrusted data. [typescript:S5144]",
        ),
      ],
    },
  ],
});

// S6287
ruleTester.run("S6287", hotspotRules.S6287, {
  valid: ["res.cookie('session', sessionId);"],
  invalid: [
    {
      code: "res.cookie('session', req.query.sid);",
      errors: [
        error(
          "Session cookie values should not come from untrusted data. [typescript:S6287]",
        ),
      ],
    },
  ],
});

// S6350
ruleTester.run("S6350", hotspotRules.S6350, {
  valid: ["const cp = require('child_process'); cp.exec('ls -la');"],
  invalid: [
    {
      code: "const cp = require('child_process'); const cmd = req.body.command; cp.exec(cmd);",
      errors: [
        error(
          "System command arguments should not be built from user input. [typescript:S6350]",
        ),
      ],
    },
  ],
});

// S7044
ruleTester.run("S7044", hotspotRules.S7044, {
  valid: ["const fs = require('fs'); fs.readFile('./config.json', callback);"],
  invalid: [
    {
      code: "const fs = require('fs'); fs.readFile(path.join('/data', req.query.file), callback);",
      errors: [
        error(
          "File paths should not be built from untrusted data (path traversal). [typescript:S7044]",
        ),
      ],
    },
  ],
});

// S2077
ruleTester.run("S2077", hotspotRules.S2077, {
  valid: ["db.query('SELECT * FROM users WHERE id = ?', [id]);"],
  invalid: [
    {
      code: "db.query(`SELECT * FROM users WHERE id = ${id}`);",
      errors: [
        error(
          "Use parameterized queries instead of formatting SQL strings. [typescript:S2077]",
        ),
      ],
    },
  ],
});

// S2612
ruleTester.run("S2612", hotspotRules.S2612, {
  valid: ["fs.chmodSync(file, 0o640);"],
  invalid: [
    {
      code: "fs.chmodSync(file, 0o666);",
      errors: [
        error(
          '"0o666" allows write access for others; use restrictive permissions. [typescript:S2612]',
        ),
      ],
    },
  ],
});

// S6275
ruleTester.run("S6275", hotspotRules.S6275, {
  valid: ["const volume = { encrypted: true };"],
  invalid: [
    {
      code: "const volume = { encrypted: false };",
      errors: [
        error(
          'Encryption must be enabled ("encrypted: false"). [typescript:S6275]',
        ),
      ],
    },
  ],
});

// S6332
ruleTester.run("S6332", hotspotRules.S6332, {
  valid: ["const fileSystem = { encrypted: true };"],
  invalid: [
    {
      code: "const fileSystem = { encrypted: false };",
      errors: [
        error(
          'Encryption must be enabled ("encrypted: false"). [typescript:S6332]',
        ),
      ],
    },
  ],
});

// S6303
ruleTester.run("S6303", hotspotRules.S6303, {
  valid: ["const db = { storageEncrypted: true };"],
  invalid: [
    {
      code: "const db = { storageEncrypted: false };",
      errors: [
        error(
          'Encryption must be enabled ("storageEncrypted: false"). [typescript:S6303]',
        ),
      ],
    },
  ],
});

// S6308
ruleTester.run("S6308", hotspotRules.S6308, {
  valid: ["const domain = { encryptAtRest: true };"],
  invalid: [
    {
      code: "const domain = { encryptAtRest: false };",
      errors: [
        error(
          'Encryption must be enabled ("encryptAtRest: false"). [typescript:S6308]',
        ),
      ],
    },
  ],
});

// S6319
ruleTester.run("S6319", hotspotRules.S6319, {
  valid: ["const notebook = { volumeKmsKeyId: 'key-id' };"],
  invalid: [
    {
      code: "const notebook = { volumeKmsKeyId: '' };",
      errors: [
        error(
          "Provide a KMS key so the notebook volume is encrypted. [typescript:S6319]",
        ),
      ],
    },
  ],
});

// S6327
ruleTester.run("S6327", hotspotRules.S6327, {
  valid: ["const topic = { kmsMasterKeyId: 'key-id' };"],
  invalid: [
    {
      code: "const topic = { kmsMasterKeyId: '' };",
      errors: [
        error(
          'Enable server-side encryption ("kmsMasterKeyId" must not be empty or false). [typescript:S6327]',
        ),
      ],
    },
  ],
});

// S6330
ruleTester.run("S6330", hotspotRules.S6330, {
  valid: ["const queue = { sqsManagedSseEnabled: true };"],
  invalid: [
    {
      code: "const queue = { sqsManagedSseEnabled: false };",
      errors: [
        error(
          'Enable server-side encryption ("sqsManagedSseEnabled" must not be empty or false). [typescript:S6330]',
        ),
      ],
    },
  ],
});

// S5604
ruleTester.run("S5604", hotspotRules.S5604, {
  valid: ["const permissions = ['notifications'];"],
  invalid: [
    {
      code: "const permissions = ['geolocation'];",
      errors: [
        error(
          'The intrusive permission "geolocation" should not be requested unless strictly required. [typescript:S5604]',
        ),
      ],
    },
  ],
});

// S4721
ruleTester.run("S4721", hotspotRules.S4721, {
  valid: ["spawn(command, args);"],
  invalid: [
    {
      code: "spawn(command, args, { shell: true });",
      errors: [
        error(
          "Do not use a shell interpreter (shell: true) unless required and sanitized. [typescript:S4721]",
        ),
      ],
    },
  ],
});

// S5691
ruleTester.run("S5691", hotspotRules.S5691, {
  valid: ["app.use(express.static('public', { dotfiles: 'deny' }));"],
  invalid: [
    {
      code: "app.use(express.static('public', { dotfiles: 'allow' }));",
      errors: [
        error(
          "Do not serve hidden files (\"dotfiles: 'allow'\"). [typescript:S5691]",
        ),
      ],
    },
  ],
});

// S5693
ruleTester.run("S5693", hotspotRules.S5693, {
  valid: ["app.use(express.json({ limit: '100kb' }));"],
  invalid: [
    {
      code: "app.use(express.json({ limit: '50mb' }));",
      errors: [
        error(
          "The request size limit exceeds 2000000 bytes. [typescript:S5693]",
        ),
      ],
    },
  ],
});

// S5247
ruleTester.run("S5247", hotspotRules.S5247, {
  valid: ["const engine = { autoescape: true };"],
  invalid: [
    {
      code: "const engine = { autoescape: false };",
      errors: [
        error(
          'Do not disable auto-escaping ("autoescape: false"). [typescript:S5247]',
        ),
      ],
    },
  ],
});
