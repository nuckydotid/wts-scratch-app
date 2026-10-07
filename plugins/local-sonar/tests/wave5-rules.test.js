"use strict";

const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");

const smells = require("../rules/major-code-smell-rules");
const a11y = require("../rules/jsx-a11y-rules");
const minor = require("../rules/minor-rules");

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

const e = (pattern) => ({ message: pattern });

// S7721
ruleTester.run("S7721", smells.S7721, {
  valid: [
    "function outer(x) { function inner() { return x; } return inner(); }",
  ],
  invalid: [
    {
      code: "function outer() { function inner() { return 1; } return inner(); }",
      errors: [e(/Move "inner" to the highest scope/)],
    },
  ],
});

// S7724
ruleTester.run("S7724", smells.S7724, {
  valid: ["// eslint-disable-next-line no-console\nconsole.log(1);"],
  invalid: [
    {
      code: "// eslint-disable-next-line\nconsole.log(1);",
      errors: [e(/Specify which ESLint rule/)],
    },
  ],
});

// S7767
ruleTester.run("S7767", smells.S7767, {
  valid: ["const n = Math.trunc(value);"],
  invalid: [
    { code: "const n = value | 0;", errors: [e(/Math\.trunc\(\)/)] },
    { code: "const n = ~~value;", errors: [e(/Math\.trunc\(\)/)] },
  ],
});

// S7768
ruleTester.run("S7768", smells.S7768, {
  valid: ["parent.append(child);"],
  invalid: [
    { code: "parent.appendChild(child);", errors: [e(/Use "append\(\)"/)] },
  ],
});

// S7746
ruleTester.run("S7746", smells.S7746, {
  valid: ["async function f() { return 1; }"],
  invalid: [
    {
      code: "async function f() { return Promise.resolve(1); }",
      errors: [e(/Return the value directly/)],
    },
  ],
});

// S7760
ruleTester.run("S7760", smells.S7760, {
  valid: ["function f(x = 10) { return x; }"],
  invalid: [
    {
      code: "function f(x) { if (!x) { x = 10; } return x; }",
      errors: [e(/Use a default parameter value/)],
    },
  ],
});

// S7761
ruleTester.run("S7761", smells.S7761, {
  valid: ["const id = el.dataset.id;"],
  invalid: [
    {
      code: "el.getAttribute('data-id');",
      errors: [e(/Use "dataset"/)],
    },
  ],
});

// S7762
ruleTester.run("S7762", smells.S7762, {
  valid: ["node.remove();"],
  invalid: [
    { code: "node.removeChild(child);", errors: [e(/Use "remove\(\)"/)] },
  ],
});

// S7740
ruleTester.run("S7740", smells.S7740, {
  valid: ["const value = 1;"],
  invalid: [
    {
      code: "function f() { const self = this; return self; }",
      errors: [e(/Use arrow functions/)],
    },
  ],
});

// S7774
ruleTester.run("S7774", smells.S7774, {
  valid: ["const proto = Widget.prototype;"],
  invalid: [
    {
      code: "const proto = instance.__proto__;",
      errors: [e(/Access the prototype through the constructor/)],
    },
    {
      code: "const proto = instance.constructor.prototype;",
      errors: [e(/Access methods from the prototype/)],
    },
  ],
});

// S7785
ruleTester.run("S7785", smells.S7785, {
  valid: [
    "const data = await fetchData();",
    "function load() { fetchData().then(handle); }",
  ],
  invalid: [
    { code: "fetchData().then(handle);", errors: [e(/top-level await/)] },
    { code: "z.string().catch('');", errors: [e(/top-level await/)] },
  ],
});

// S7763
ruleTester.run("S7763", minor.S7763, {
  valid: ["import Circle from './Circle';\nexport { Circle };"],
  invalid: [
    {
      code: "import { Circle } from './Circle';\nexport { Circle };",
      errors: [e(/export \.\.\. from/)],
    },
  ],
});

// S7776
ruleTester.run("S7776", minor.S7776, {
  valid: ['const NAMES = ["a", "b", "c"];\nconsole.log(NAMES[0]);'],
  invalid: [
    {
      code: 'const NAMES = ["a", "b", "c"];\nNAMES.includes("a");',
      errors: [e(/Use a Set/)],
    },
  ],
});

// S6627
ruleTester.run("S6627", smells.S6627, {
  valid: ["export function publicFn() {}\npublicFn();"],
  invalid: [
    {
      code: "/** @internal */\nexport function internalFn() {}\ninternalFn();",
      errors: [e(/internal API/)],
    },
  ],
});

// S6746
ruleTester.run("S6746", smells.S6746, {
  valid: ["class C { update() { this.setState({ count: 1 }); } }"],
  invalid: [
    {
      code: "class C { update() { this.state.count = 1; } }",
      errors: [e(/Use setState\(\)/)],
    },
  ],
});

// S1068
ruleTester.run("S1068", smells.S1068, {
  valid: ["class C { private secret = 1; get() { return this.secret; } }"],
  invalid: [
    {
      code: "class C { private secret = 1; }",
      errors: [e(/unused private member "secret"/)],
    },
  ],
});

// S6750
ruleTester.run("S6750", smells.S6750, {
  valid: ["ReactDOM.render(element, container);"],
  invalid: [
    {
      code: "const instance = ReactDOM.render(element, container);",
      errors: [e(/return value of ReactDOM\.render/)],
    },
  ],
});

// S1788
ruleTester.run("S1788", smells.S1788, {
  valid: ["function f(a, b = 1) { return a + b; }"],
  invalid: [
    {
      code: "function f(a = 1, b) { return a + b; }",
      errors: [e(/default values to the end/)],
    },
  ],
});

// S2301
ruleTester.run("S2301", smells.S2301, {
  valid: ["function setMode(isEdit: boolean) { return isEdit ? 1 : 0; }"],
  invalid: [
    {
      code: "function setMode(isEdit: boolean) { if (isEdit) { return 1; } else { return 0; } }",
      errors: [e(/boolean parameter "isEdit"/)],
    },
  ],
});

// S7060
ruleTester.run("S7060", smells.S7060, {
  valid: [{ code: "import './other';", filename: "src/index.ts" }],
  invalid: [
    {
      code: "import './index';",
      filename: "src/index.ts",
      errors: [e(/imports itself/)],
    },
  ],
});

// S6481
ruleTester.run("S6481", smells.S6481, {
  valid: [
    "const View = () => <ThemeContext.Provider value={memoizedValue}><div /></ThemeContext.Provider>;",
  ],
  invalid: [
    {
      code: "const View = () => <ThemeContext.Provider value={{ color: 'red' }}><div /></ThemeContext.Provider>;",
      errors: [e(/Memoize this Provider value/)],
    },
  ],
});

// S1854
ruleTester.run("S1854", smells.S1854, {
  valid: ["let x = 1; console.log(x);"],
  invalid: [{ code: "let x = 1;", errors: [e(/never used/)] }],
});

// S2933
ruleTester.run("S2933", smells.S2933, {
  valid: [
    "class C { value: number; constructor() { this.value = 1; } update() { this.value = 2; } }",
    "class C { protected value: number; constructor() { this.value = 1; } }",
    "class C { value = 1; constructor() { this.value = 1; } }",
  ],
  invalid: [
    {
      code: "class C { value: number; constructor() { this.value = 1; } }",
      errors: [e(/readonly/)],
    },
  ],
});

// S6666
ruleTester.run("S6666", smells.S6666, {
  valid: ["fn(...args);", "Reflect.apply(fn, null, args);"],
  invalid: [{ code: "fn.apply(null, args);", errors: [e(/spread syntax/)] }],
});

// S6788
ruleTester.run("S6788", smells.S6788, {
  valid: ["const node = this.ref.current;"],
  invalid: [
    {
      code: "const node = ReactDOM.findDOMNode(this);",
      errors: [e(/findDOMNode/)],
    },
  ],
});

// S6789
ruleTester.run("S6789", smells.S6789, {
  valid: ["const mounted = this.mounted;"],
  invalid: [{ code: "if (this.isMounted()) {}", errors: [e(/isMounted/)] }],
});

// S6660
ruleTester.run("S6660", smells.S6660, {
  valid: ["if (a) { one(); } else if (b) { two(); }"],
  invalid: [
    {
      code: "if (a) { one(); } else { if (b) { two(); } }",
      errors: [e(/else if/)],
    },
  ],
});

// S6661
ruleTester.run("S6661", smells.S6661, {
  valid: ["const merged = { ...source };"],
  invalid: [
    {
      code: "const merged = Object.assign({}, source);",
      errors: [e(/object spread syntax/)],
    },
  ],
});

// S6679
ruleTester.run("S6679", smells.S6679, {
  valid: ["if (Number.isNaN(value)) {}", "if (isNaN(value)) {}"],
  invalid: [{ code: "if (value !== value) {}", errors: [e(/Number\.isNaN/)] }],
});

// S6550
ruleTester.run("S6550", smells.S6550, {
  valid: ["enum E { A = 1, B = 2 }"],
  invalid: [
    { code: "enum E { A = getValue() }", errors: [e(/literal value/)] },
  ],
});

// S6671
ruleTester.run("S6671", smells.S6671, {
  valid: ["Promise.reject(new Error('error'));"],
  invalid: [
    { code: "Promise.reject('error');", errors: [e(/Reject with an Error/)] },
  ],
});

// S6676
ruleTester.run("S6676", smells.S6676, {
  valid: ["fn.call(other);"],
  invalid: [{ code: "fn.call(this);", errors: [e(/redundant/)] }],
});

// S6766
ruleTester.run("S6766", smells.S6766, {
  valid: ['const View = () => <div>{"a > b"}</div>;'],
  invalid: [],
});

test('S6766 reports unescaped ">" in JSX text nodes', () => {
  const reported = [];
  const visitor = smells.S6766.create({
    sourceCode: {},
    report: (descriptor) => reported.push(descriptor),
  });
  visitor.JSXText({ value: "a > b" });
  expect(reported).toHaveLength(1);
  expect(reported[0].message).toMatch(/Escape ">"/);
});

// S6791
ruleTester.run("S6791", smells.S6791, {
  valid: ["class C { componentDidMount() {} }"],
  invalid: [
    {
      code: "class C { componentWillMount() {} }",
      errors: [e(/legacy lifecycle/)],
    },
  ],
});

// S6763
ruleTester.run("S6763", smells.S6763, {
  valid: ["class C extends React.PureComponent { render() { return null; } }"],
  invalid: [
    {
      code: "class C extends React.PureComponent { shouldComponentUpdate() { return true; } }",
      errors: [e(/PureComponent/)],
    },
  ],
});

// S6522
ruleTester.run("S6522", smells.S6522, {
  valid: ["import { value } from './m';\nconsole.log(value);"],
  invalid: [
    {
      code: "import { value } from './m';\nvalue = 1;",
      errors: [e(/Do not reassign the imported binding/)],
    },
  ],
});

// S6535
ruleTester.run("S6535", smells.S6535, {
  // eslint-disable-next-line local-sonar/S7780 -- intentional escape fixture
  valid: ['const s = "a\\nb";'],
  // eslint-disable-next-line local-sonar/S7780 -- intentional escape fixture
  invalid: [{ code: 'const s = "a\\qb";', errors: [e(/unnecessary escape/)] }],
});

// S6643
ruleTester.run("S6643", smells.S6643, {
  valid: ["class MyArray extends Array {}"],
  invalid: [
    {
      code: "Array.prototype.myMethod = function () {};",
      errors: [e(/prototype of the builtin/)],
    },
  ],
});

// S6657
ruleTester.run("S6657", smells.S6657, {
  // eslint-disable-next-line local-sonar/S7780 -- intentional escape fixture
  valid: ['const s = "\\n";'],
  invalid: [],
});

test("S6657 reports octal escape sequences", () => {
  const reported = [];
  const visitor = smells.S6657.create({
    sourceCode: {},
    report: (descriptor) => reported.push(descriptor),
  });
  // eslint-disable-next-line local-sonar/S7780 -- intentional escape fixture
  visitor.Literal({ raw: '"\\1"', value: "\u0001" });
  expect(reported).toHaveLength(1);
  expect(reported[0].message).toMatch(/octal escape/);
});

// S6772
ruleTester.run("S6772", smells.S6772, {
  valid: ['const View = () => <div><span>a</span>{" "}<span>b</span></div>;'],
  invalid: [
    {
      code: "const View = () => <div><span>a</span><span>b</span></div>;",
      errors: [e(/explicit spacing/)],
    },
  ],
});

// S6478
ruleTester.run("S6478", smells.S6478, {
  valid: [
    "function Inner() { return <div />; }\nfunction Outer() { return <Inner />; }",
  ],
  invalid: [
    {
      code: "function Outer() { function Inner() { return <div />; } return <Inner />; }",
      errors: [e(/nested component "Inner"/)],
    },
  ],
});

// S6582
ruleTester.run("S6582", smells.S6582, {
  valid: ["const name = user?.name;"],
  invalid: [
    {
      code: "const name = user && user.name;",
      errors: [e(/optional chaining/)],
    },
  ],
});

// S6569
ruleTester.run("S6569", smells.S6569, {
  valid: ["function f<T extends string>(x: T) { return x; }"],
  invalid: [
    {
      code: "function f<T extends any>(x: T) { return x; }",
      errors: [e(/unnecessary type constraint/)],
    },
  ],
});

// S6590
ruleTester.run("S6590", smells.S6590, {
  valid: ["const modes = ['a', 'b'] as const;"],
  invalid: [
    {
      code: "const modes = ['a', 'b'] as string[];",
      errors: [e(/"as const"/)],
    },
  ],
});

// S4140
ruleTester.run("S4140", smells.S4140, {
  valid: ["const values = [1, 2, 3];"],
  invalid: [{ code: "const values = [1, , 3];", errors: [e(/sparse array/)] }],
});

// S6441
ruleTester.run("S6441", smells.S6441, {
  valid: [
    "class C extends React.Component { helper() { return 1; } render() { return this.helper(); } }",
  ],
  invalid: [
    {
      code: "class C extends React.Component { unusedHelper() { return 1; } render() { return null; } }",
      errors: [e(/unused component method/)],
    },
  ],
});

// S6572
ruleTester.run("S6572", smells.S6572, {
  valid: ["enum E { A = 1, B = 2 }"],
  invalid: [
    {
      code: "enum E { A = 1, B }",
      errors: [e(/either all enum members or none/)],
    },
  ],
});

// S6578
ruleTester.run("S6578", smells.S6578, {
  valid: ["enum E { A = 1, B = 2 }"],
  invalid: [
    {
      code: "enum E { A = 1, B = 1 }",
      errors: [e(/already used/)],
    },
  ],
});

// S1134
ruleTester.run("S1134", smells.S1134, {
  valid: ["// TODO: improve this later"],
  invalid: [{ code: "// FIXME: this is broken", errors: [e(/FIXME/)] }],
});

// S2589
ruleTester.run("S2589", smells.S2589, {
  valid: ["if (value) { doSomething(); }"],
  invalid: [
    { code: "if (true) { doSomething(); }", errors: [e(/always the same/)] },
  ],
});

// S2234
ruleTester.run("S2234", smells.S2234, {
  valid: [
    "function move(from, to) {}\nconst from = 1;\nconst to = 2;\nmove(from, to);",
  ],
  invalid: [
    {
      code: "function move(from, to) {}\nconst from = 1;\nconst to = 2;\nmove(to, from);",
      errors: [e(/parameter order/)],
    },
  ],
});

// S5860
ruleTester.run("S5860", smells.S5860, {
  valid: ["'abc'.replace(/(?<letter>b)/, '$<letter>');"],
  invalid: [
    {
      code: "'abc'.replace(/(?<letter>b)/, '$1');",
      errors: [e(/named capture groups/)],
    },
  ],
});

// S5869
ruleTester.run("S5869", smells.S5869, {
  valid: ["const re = /[ab]/;"],
  invalid: [{ code: "const re = /[aa]/;", errors: [e(/appears twice/)] }],
});

// S1119
ruleTester.run("S1119", smells.S1119, {
  valid: ["for (;;) { break; }"],
  invalid: [
    { code: "loop: for (;;) { break loop; }", errors: [e(/Remove the label/)] },
  ],
});

// S1439
ruleTester.run("S1439", smells.S1439, {
  valid: ["loop: for (;;) { break loop; }"],
  invalid: [
    {
      code: "block: { doSomething(); }",
      errors: [e(/cannot be targeted/)],
    },
  ],
});

// S1479
const manyCases = `switch (x) {${Array.from(
  { length: 31 },
  (_, index) => `case ${index}: break;`,
).join("")}}`;

ruleTester.run("S1479", smells.S1479, {
  valid: ["switch (x) { case 1: break; default: break; }"],
  invalid: [{ code: manyCases, errors: [e(/more than 30 cases/)] }],
});

// S3415
ruleTester.run("S3415", smells.S3415, {
  valid: ["assert.strictEqual(result, 42);"],
  invalid: [
    {
      code: "assert.strictEqual(42, result);",
      errors: [e(/actual value first/)],
    },
  ],
});

// S4623
ruleTester.run("S4623", smells.S4623, {
  valid: ["function fn(a, b = 2) {}\nfn(1);"],
  invalid: [
    {
      code: "function fn(a, b = 2) {}\nfn(1, undefined);",
      errors: [e(/Omit this argument/)],
    },
  ],
});

// S5843
ruleTester.run("S5843", smells.S5843, {
  valid: ["const re = /abc/;"],
  invalid: [
    {
      code: "const re = /a|b|c|d|e|f|g|h|i|j|k|l/;",
      errors: [e(/too complex/)],
    },
  ],
});

// S5958
ruleTester.run("S5958", smells.S5958, {
  valid: ["expect(fn).toThrow(Error);", "expect(fn).not.toThrow();"],
  invalid: [
    { code: "expect(fn).toThrow();", errors: [e(/thrown error type/)] },
  ],
});

// S4634
ruleTester.run("S4634", smells.S4634, {
  valid: ["const promise = Promise.resolve(42);"],
  invalid: [
    {
      code: "const promise = new Promise(resolve => resolve(42));",
      errors: [e(/Promise\.resolve\(\)/)],
    },
  ],
});

// S1121
ruleTester.run("S1121", smells.S1121, {
  valid: ["x = getValue();"],
  invalid: [
    {
      code: "if ((x = getValue())) {}",
      errors: [e(/sub-expression/)],
    },
  ],
});

// S2692
ruleTester.run("S2692", smells.S2692, {
  valid: ["if (arr.indexOf(x) !== -1) {}"],
  invalid: [
    { code: "if (arr.indexOf(x) > 0) {}", errors: [e(/compare against -1/)] },
  ],
});

// S3579
ruleTester.run("S3579", smells.S3579, {
  valid: ["const value = items[0];"],
  invalid: [{ code: "const value = items['foo'];", errors: [e(/numeric/)] }],
});

// S1515
ruleTester.run("S1515", smells.S1515, {
  valid: ["function inner() {}\nfor (let i = 0; i < 3; i++) { inner(); }"],
  invalid: [
    {
      code: "for (let i = 0; i < 3; i++) { function inner() {} inner(); }",
      errors: [e(/out of the loop body/)],
    },
  ],
});

// S6092
ruleTester.run("S6092", smells.S6092, {
  valid: ["expect(value).toBe(true);"],
  invalid: [
    { code: "expect(value).to.be.ok;", errors: [e(/"ok" assertions/)] },
  ],
});

// S2310
ruleTester.run("S2310", smells.S2310, {
  valid: ["for (let i = 0; i < 3; i++) { doSomething(i); }"],
  invalid: [
    {
      code: "for (let i = 0; i < 3; i++) { i = i + 1; }",
      errors: [e(/loop counter "i"/)],
    },
  ],
});

// S4619
ruleTester.run("S4619", smells.S4619, {
  valid: ["if (arr.includes(0)) {}"],
  invalid: [
    { code: "if (0 in [1, 2, 3]) {}", errors: [e(/use includes\(\)/)] },
  ],
});

// S6019
ruleTester.run("S6019", smells.S6019, {
  valid: ["const re = /<.*?>/;"],
  invalid: [
    { code: "const re = /<.*?/;", errors: [e(/reluctant quantifier/)] },
  ],
});

// S125
ruleTester.run("S125", smells.S125, {
  valid: ["// this is a comment about the code"],
  invalid: [
    {
      code: "// if (x) { doSomething(); }",
      errors: [e(/commented-out code/)],
    },
  ],
});

// S4043
ruleTester.run("S4043", smells.S4043, {
  valid: ["const reversed = arr.reverse();"],
  invalid: [
    { code: "arr = arr.reverse();", errors: [e(/mutates the array in place/)] },
  ],
});

// S4030
ruleTester.run("S4030", smells.S4030, {
  valid: ["const set = new Set();\nset.add(1);"],
  invalid: [
    { code: "new Set().add(1);", errors: [e(/immediately discarded/)] },
  ],
});

// S5973
ruleTester.run("S5973", smells.S5973, {
  valid: [
    {
      code: "it('x', () => { expect(getValue()).toBe(1); });",
      filename: "example.test.ts",
    },
    {
      code: "it('x', () => { expect(format(new Date('2099-01-01'))).toBe('2099'); });",
      filename: "example.test.ts",
    },
  ],
  invalid: [
    {
      code: "it('x', () => { expect(Math.random()).toBe(1); });",
      filename: "example.test.ts",
      errors: [e(/avoid Math\.random\(\)/)],
    },
  ],
});

// Architecture rules (no architecture.json committed -> no-op)
ruleTester.run("S7788", smells.S7788, {
  valid: ["import x from './x';\nconsole.log(x);"],
  invalid: [],
});
ruleTester.run("S7789", smells.S7789, {
  valid: ["const x = 1;\nconsole.log(x);"],
  invalid: [],
});
ruleTester.run("S8134", smells.S8134, {
  valid: ["import x from './x';\nconsole.log(x);"],
  invalid: [],
});

// S6821
ruleTester.run("S6821", a11y.S6821, {
  valid: ['const View = () => <div role="button" />;'],
  invalid: [
    {
      code: 'const View = () => <div role="foo" />;',
      errors: [e(/not a valid ARIA role/)],
    },
  ],
});

// S6822
ruleTester.run("S6822", a11y.S6822, {
  valid: ['const View = () => <div role="button" />;'],
  invalid: [
    {
      code: 'const View = () => <button role="button" />;',
      errors: [e(/redundant/)],
    },
  ],
});

// S6823
ruleTester.run("S6823", a11y.S6823, {
  valid: [
    'const View = () => <div tabIndex={0} aria-activedescendant="item-1" />;',
  ],
  invalid: [
    {
      code: 'const View = () => <div aria-activedescendant="item-1" />;',
      errors: [e(/must be focusable/)],
    },
  ],
});

// S6824
ruleTester.run("S6824", a11y.S6824, {
  valid: ['const View = () => <div role="button" />;'],
  invalid: [
    {
      code: 'const View = () => <meta role="button" />;',
      errors: [e(/does not support ARIA/)],
    },
  ],
});

// S6825
ruleTester.run("S6825", a11y.S6825, {
  valid: ['const View = () => <div aria-hidden="true" />;'],
  invalid: [
    {
      code: 'const View = () => <div tabIndex={0} aria-hidden="true" />;',
      errors: [e(/focusable element must not be hidden/)],
    },
  ],
});

// S6747
ruleTester.run("S6747", a11y.S6747, {
  valid: ['const View = () => <div className="x" />;'],
  invalid: [
    {
      code: 'const View = () => <div unknownProp="x" />;',
      errors: [e(/not a known JSX property/)],
    },
  ],
});

// S6807
ruleTester.run("S6807", a11y.S6807, {
  valid: ['const View = () => <div role="checkbox" aria-checked="true" />;'],
  invalid: [
    {
      code: 'const View = () => <div role="checkbox" />;',
      errors: [e(/requires the "aria-checked"/)],
    },
  ],
});

// S6811
ruleTester.run("S6811", a11y.S6811, {
  valid: ['const View = () => <div role="checkbox" aria-checked="true" />;'],
  invalid: [
    {
      code: 'const View = () => <div role="button" aria-checked="true" />;',
      errors: [e(/does not support "aria-checked"/)],
    },
  ],
});

// S6819
ruleTester.run("S6819", a11y.S6819, {
  valid: ["const View = () => <button />;"],
  invalid: [
    {
      code: 'const View = () => <div role="button" />;',
      errors: [e(/Prefer the native/)],
    },
  ],
});

// S6843
ruleTester.run("S6843", a11y.S6843, {
  valid: ['const View = () => <div role="heading" />;'],
  invalid: [
    {
      code: 'const View = () => <button role="heading" />;',
      errors: [e(/non-interactive role/)],
    },
  ],
});

// S6844
ruleTester.run("S6844", a11y.S6844, {
  valid: ['const View = () => <a href="/x" onClick={handle}>x</a>;'],
  invalid: [
    {
      code: "const View = () => <a onClick={handle}>x</a>;",
      errors: [e(/use <button>/)],
    },
  ],
});

// S6845
ruleTester.run("S6845", a11y.S6845, {
  valid: ["const View = () => <button tabIndex={0} />;"],
  invalid: [
    {
      code: "const View = () => <div tabIndex={0} />;",
      errors: [e(/should not have tabIndex/)],
    },
  ],
});

// S6840
ruleTester.run("S6840", a11y.S6840, {
  valid: ['const View = () => <input autoComplete="on" />;'],
  invalid: [
    {
      code: 'const View = () => <div autoComplete="on" />;',
      errors: [e(/not supported on <div>/)],
    },
  ],
});

// S6841
ruleTester.run("S6841", a11y.S6841, {
  valid: ["const View = () => <div tabIndex={-1} />;"],
  invalid: [
    {
      code: "const View = () => <div tabIndex={2} />;",
      errors: [e(/must be 0 or -1/)],
    },
  ],
});

// S6842
ruleTester.run("S6842", a11y.S6842, {
  valid: ['const View = () => <div role="heading" />;'],
  invalid: [
    {
      code: 'const View = () => <div role="button" />;',
      errors: [e(/interactive role/)],
    },
  ],
});

// S6846
ruleTester.run("S6846", a11y.S6846, {
  valid: ['const View = () => <div className="x" />;'],
  invalid: [
    {
      code: 'const View = () => <div accessKey="h" />;',
      errors: [e(/accessKey/)],
    },
  ],
});

// S6847
ruleTester.run("S6847", a11y.S6847, {
  valid: ["const View = () => <button onClick={handle} />;"],
  invalid: [
    {
      code: "const View = () => <div onClick={handle} />;",
      errors: [e(/mouse handlers/)],
    },
  ],
});

// S6848
ruleTester.run("S6848", a11y.S6848, {
  valid: ['const View = () => <div role="button" onKeyDown={handle} />;'],
  invalid: [
    {
      code: "const View = () => <div onKeyDown={handle} />;",
      errors: [e(/keyboard handlers/)],
    },
  ],
});

// S6850
ruleTester.run("S6850", a11y.S6850, {
  valid: ["const View = () => <h1>Title</h1>;"],
  invalid: [
    {
      code: "const View = () => <h1 />;",
      errors: [e(/accessible content/)],
    },
  ],
});

// S6851
ruleTester.run("S6851", a11y.S6851, {
  valid: ['const View = () => <img alt="Company logo" />;'],
  invalid: [
    {
      code: 'const View = () => <img alt="logo.png" />;',
      errors: [e(/describe the image/)],
    },
  ],
});

// S6852
ruleTester.run("S6852", a11y.S6852, {
  valid: ['const View = () => <div role="button" tabIndex={0} />;'],
  invalid: [
    {
      code: 'const View = () => <div role="button" />;',
      errors: [e(/must be focusable/)],
    },
  ],
});

// S6853
ruleTester.run("S6853", a11y.S6853, {
  valid: ['const View = () => <label htmlFor="name">Name</label>;'],
  invalid: [
    {
      code: "const View = () => <label />;",
      errors: [e(/associated with a control/)],
    },
  ],
});

// S6793
ruleTester.run("S6793", a11y.S6793, {
  valid: ['const View = () => <div aria-hidden="true" />;'],
  invalid: [
    {
      code: 'const View = () => <div aria-hidden="maybe" />;',
      errors: [e(/Invalid value/)],
    },
  ],
});

// S5254
ruleTester.run("S5254", a11y.S5254, {
  valid: ['const View = () => <html lang="en" />;'],
  invalid: [
    {
      code: "const View = () => <html />;",
      errors: [e(/lang attribute/)],
    },
  ],
});

// S5257
ruleTester.run("S5257", a11y.S5257, {
  valid: [
    "const View = () => <table><thead><tr><th>x</th></tr></thead></table>;",
  ],
  invalid: [
    {
      code: "const View = () => <table><tr><td>x</td></tr></table>;",
      errors: [e(/layout/)],
    },
  ],
});
