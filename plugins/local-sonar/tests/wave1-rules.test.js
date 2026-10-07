"use strict";

const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");

const injectionRules = require("../rules/injection-rules");
const classRules = require("../rules/class-rules");
const modernRules = require("../rules/modern-js-rules");

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

// S2076 - OS command injection
ruleTester.run("S2076", injectionRules.S2076, {
  valid: [
    {
      code: "const cp = require('child_process'); cp.exec('ls -la');",
    },
    {
      code: "const cp = require('child_process'); cp.exec('ping ' + Number(req.query.count));",
    },
    {
      code: "const cp = require('child_process'); cp.execFile('./tool', ['--safe']);",
    },
  ],
  invalid: [
    {
      code: "const { exec } = require('child_process'); exec(req.query.command);",
      errors: [
        error(
          "OS command arguments should not be built from untrusted data. [typescript:S2076]",
        ),
      ],
    },
    {
      code: "const cp = require('child_process'); const { dir } = req.body; cp.exec('ls ' + dir);",
      errors: [
        error(
          "OS command arguments should not be built from untrusted data. [typescript:S2076]",
        ),
      ],
    },
    {
      code: "import { spawnSync } from 'child_process'; const file = route.params.file; spawnSync('cat', [file]);",
      errors: [
        error(
          "OS command arguments should not be built from untrusted data. [typescript:S2076]",
        ),
      ],
    },
  ],
});

// S2083 - Path injection
ruleTester.run("S2083", injectionRules.S2083, {
  valid: [
    {
      code: "const fs = require('fs'); fs.readFile('./config.json', () => {});",
    },
    {
      code: "const fs = require('fs'); fs.readFile(path.join('/safe', 'config.json'), () => {});",
    },
  ],
  invalid: [
    {
      code: "const fs = require('fs'); fs.readFile(path.join('/data', req.query.file), () => {});",
      errors: [
        error(
          "I/O paths should not be built from untrusted data. [typescript:S2083]",
        ),
      ],
    },
    {
      code: "const fsp = require('fs/promises'); const target = req.body.target; fsp.writeFile(`/tmp/${target}`, 'data');",
      errors: [
        error(
          "I/O paths should not be built from untrusted data. [typescript:S2083]",
        ),
      ],
    },
  ],
});

// S3649 - SQL injection
ruleTester.run("S3649", injectionRules.S3649, {
  valid: [
    { code: "db.query('SELECT * FROM users WHERE id = ?', [req.query.id]);" },
    { code: "db.execute('DELETE FROM sessions WHERE expired = 1');" },
  ],
  invalid: [
    {
      code: "db.query(`SELECT * FROM users WHERE name = ${req.query.name}`);",
      errors: [
        error(
          "Database queries should not be built from untrusted data. [typescript:S3649]",
        ),
      ],
    },
    {
      code: "const id = req.params.id; db.raw('SELECT * FROM t WHERE id = ' + id);",
      errors: [
        error(
          "Database queries should not be built from untrusted data. [typescript:S3649]",
        ),
      ],
    },
  ],
});

// S5147 - NoSQL injection
ruleTester.run("S5147", injectionRules.S5147, {
  valid: [
    { code: "users.findOne({ username: 'static-user' });" },
    { code: "users.findOne({ age: Number(req.body.age) });" },
  ],
  invalid: [
    {
      code: "users.findOne({ username: req.body.username });",
      errors: [
        error(
          "NoSQL queries should not be built from untrusted data. [typescript:S5147]",
        ),
      ],
    },
    {
      code: 'const name = req.query.name; users.find({ $where: `this.name == "${name}"` });',
      errors: [
        error(
          '"$where" should not be built from untrusted data. [typescript:S5147]',
        ),
      ],
    },
  ],
});

// S5146 - HTTP redirect (open redirect)
ruleTester.run("S5146", injectionRules.S5146, {
  valid: [
    { code: "res.redirect('/home');" },
    { code: "res.redirect(`/user/${Number(req.params.id)}`);" },
  ],
  invalid: [
    {
      code: "res.redirect(req.query.url);",
      errors: [
        error(
          "HTTP redirects should not use untrusted data. [typescript:S5146]",
        ),
      ],
    },
    {
      code: "res.setHeader('Location', req.query.next);",
      errors: [
        error(
          "HTTP redirects should not use untrusted data. [typescript:S5146]",
        ),
      ],
    },
    {
      code: "res.writeHead(302, { Location: `${req.query.host}/login` });",
      errors: [
        error(
          "HTTP redirects should not use untrusted data. [typescript:S5146]",
        ),
      ],
    },
  ],
});

// S6105 - DOM open redirect
ruleTester.run("S6105", injectionRules.S6105, {
  valid: [
    { code: "window.location.href = '/home';" },
    { code: "location.replace('/settings');" },
  ],
  invalid: [
    {
      code: "window.location.href = req.query.url;",
      errors: [
        error(
          "DOM navigation should not use untrusted data. [typescript:S6105]",
        ),
      ],
    },
    {
      code: "window.location.assign(location.search);",
      errors: [
        error(
          "DOM navigation should not use untrusted data. [typescript:S6105]",
        ),
      ],
    },
    {
      code: "window.open(req.query.target);",
      errors: [
        error(
          "DOM navigation should not use untrusted data. [typescript:S6105]",
        ),
      ],
    },
  ],
});

// S5131 - Reflected XSS
ruleTester.run("S5131", injectionRules.S5131, {
  valid: [
    { code: "res.send('Hello world');" },
    { code: "res.json({ name: req.query.name });" },
  ],
  invalid: [
    {
      code: "res.send(`Hello ${req.query.name}`);",
      errors: [
        error(
          "Reflected user input should be escaped before being written to the response. [typescript:S5131]",
        ),
      ],
    },
    {
      code: "res.write('<h1>' + req.query.title + '</h1>');",
      errors: [
        error(
          "Reflected user input should be escaped before being written to the response. [typescript:S5131]",
        ),
      ],
    },
    {
      code: "ctx.body = req.body.content;",
      errors: [
        error(
          "Reflected user input should be escaped before being written to the response. [typescript:S5131]",
        ),
      ],
    },
  ],
});

// S5696 - DOM XSS
ruleTester.run("S5696", injectionRules.S5696, {
  valid: [
    { code: "document.getElementById('root').innerHTML = '<b>safe</b>';" },
    { code: 'document.write("<p>static</p>");' },
  ],
  invalid: [
    {
      code: "document.getElementById('root').innerHTML = req.query.html;",
      errors: [
        error("DOM updates should not use untrusted data. [typescript:S5696]"),
      ],
    },
    {
      code: "document.write(location.search);",
      errors: [
        error("DOM updates should not use untrusted data. [typescript:S5696]"),
      ],
    },
    {
      code: "const View = () => <div dangerouslySetInnerHTML={{ __html: req.query.html }} />;",
      errors: [
        error("DOM updates should not use untrusted data. [typescript:S5696]"),
      ],
    },
  ],
});

// S6096 - Zip slip
ruleTester.run("S6096", injectionRules.S6096, {
  valid: [
    {
      code: "const fs = require('fs'); zip.on('entry', entry => { fs.writeFileSync('./out/fixed.txt', entry.data); });",
    },
  ],
  invalid: [
    {
      code: "const fs = require('fs'); zip.on('entry', entry => { fs.writeFileSync(path.join('/out', entry.fileName), entry.data); });",
      errors: [
        error(
          "Archive entry names should be validated before building file paths (zip slip). [typescript:S6096]",
        ),
      ],
    },
  ],
});

// S2631 - Regex injection / ReDoS
ruleTester.run("S2631", injectionRules.S2631, {
  valid: [
    { code: "new RegExp('^[a-z]+$');" },
    // eslint-disable-next-line local-sonar/S7780 -- intentional escape fixture
    { code: "RegExp('^\\\\d{3}$', 'g');" },
  ],
  invalid: [
    {
      code: "new RegExp(req.query.pattern);",
      errors: [
        error(
          "Regular expressions should not be built from untrusted data. [typescript:S2631]",
        ),
      ],
    },
    {
      code: "const pattern = req.body.regex; RegExp(pattern);",
      errors: [
        error(
          "Regular expressions should not be built from untrusted data. [typescript:S2631]",
        ),
      ],
    },
  ],
});

// S7725 - Recursive accessors
ruleTester.run("S7725", classRules.S7725, {
  valid: [
    { code: "const obj = { get foo() { return this._foo; } };" },
    { code: "class A { get foo() { return this.state.foo; } }" },
  ],
  invalid: [
    {
      code: "const obj = { get foo() { return this.foo; } };",
      errors: [
        error(
          'Accessor "foo" recursively accesses its own property. [typescript:S7725]',
        ),
      ],
    },
    {
      code: "class A { set bar(value) { this.bar = value; } }",
      errors: [
        error(
          'Accessor "bar" recursively accesses its own property. [typescript:S7725]',
        ),
      ],
    },
  ],
});

// S4275 - Accessors should access the expected field
ruleTester.run("S4275", classRules.S4275, {
  valid: [
    { code: "class A { get foo() { return this.foo; } }" },
    { code: "class A { get foo() { return this._foo; } }" },
    { code: "class A { set foo(value) { this.foo = value; } }" },
  ],
  invalid: [
    {
      code: "class A { get foo() { return this.bar; } }",
      errors: [
        error(
          'Getter and setter should access the field "foo". [typescript:S4275]',
        ),
      ],
    },
    {
      code: "const obj = { set name(value) { this.title = value; } };",
      errors: [
        error(
          'Getter and setter should access the field "name". [typescript:S4275]',
        ),
      ],
    },
  ],
});

// S3854 - super() usage
ruleTester.run("S3854", classRules.S3854, {
  valid: [
    { code: "class A extends B { constructor() { super(); this.x = 1; } }" },
    { code: "class A extends B { constructor() { super(...args); } }" },
  ],
  invalid: [
    {
      code: "class A extends B { constructor() { this.x = 1; super(); } }",
      errors: [
        error(
          '"super()" should be called before "this" is accessed. [typescript:S3854]',
        ),
      ],
    },
    {
      code: "class A extends B { constructor() { this.x = 1; } }",
      errors: [
        error(
          '"super()" should be called in the constructor of a derived class. [typescript:S3854]',
        ),
      ],
    },
    {
      code: "class A { constructor() { super(); } }",
      errors: [
        error(
          '"super()" should not be called in a class without a superclass. [typescript:S3854]',
        ),
      ],
    },
  ],
});

// S3812 - Parentheses when negating "in"/"instanceof"
ruleTester.run("S3812", modernRules.S3812, {
  valid: [
    { code: "const r = !(key in obj);" },
    { code: "const r = (!key) in obj;" },
    { code: "const r = !(value instanceof Foo);" },
  ],
  invalid: [
    {
      code: "const r = !key in obj;",
      errors: [
        error(
          'Add parentheses to clarify the negation applied to "in". [typescript:S3812]',
        ),
      ],
    },
    {
      code: "const r = !value instanceof Foo;",
      errors: [
        error(
          'Add parentheses to clarify the negation applied to "instanceof". [typescript:S3812]',
        ),
      ],
    },
  ],
});

// S7725 - Recursive accessors
ruleTester.run("S7725", classRules.S7725, {
  valid: [
    { code: "const obj = { get foo() { return this._foo; } };" },
    { code: "class A { get foo() { return this.state.foo; } }" },
  ],
  invalid: [
    {
      code: "const obj = { get foo() { return this.foo; } };",
      errors: [
        error(
          'Accessor "foo" recursively accesses its own property. [typescript:S7725]',
        ),
      ],
    },
    {
      code: "class A { set bar(value) { this.bar = value; } }",
      errors: [
        error(
          'Accessor "bar" recursively accesses its own property. [typescript:S7725]',
        ),
      ],
    },
  ],
});

// S4275 - Accessors should access the expected field
ruleTester.run("S4275", classRules.S4275, {
  valid: [
    { code: "class A { get foo() { return this.foo; } }" },
    { code: "class A { get foo() { return this._foo; } }" },
    { code: "class A { set foo(value) { this.foo = value; } }" },
  ],
  invalid: [
    {
      code: "class A { get foo() { return this.bar; } }",
      errors: [
        error(
          'Getter and setter should access the field "foo". [typescript:S4275]',
        ),
      ],
    },
    {
      code: "const obj = { set name(value) { this.title = value; } };",
      errors: [
        error(
          'Getter and setter should access the field "name". [typescript:S4275]',
        ),
      ],
    },
  ],
});

// S3854 - super() usage
ruleTester.run("S3854", classRules.S3854, {
  valid: [
    { code: "class A extends B { constructor() { super(); this.x = 1; } }" },
    { code: "class A extends B { constructor() { super(...args); } }" },
  ],
  invalid: [
    {
      code: "class A extends B { constructor() { this.x = 1; super(); } }",
      errors: [
        error(
          '"super()" should be called before "this" is accessed. [typescript:S3854]',
        ),
      ],
    },
    {
      code: "class A extends B { constructor() { this.x = 1; } }",
      errors: [
        error(
          '"super()" should be called in the constructor of a derived class. [typescript:S3854]',
        ),
      ],
    },
    {
      code: "class A { constructor() { super(); } }",
      errors: [
        error(
          '"super()" should not be called in a class without a superclass. [typescript:S3854]',
        ),
      ],
    },
  ],
});

// S3812 - Parentheses when negating "in"/"instanceof"
ruleTester.run("S3812", modernRules.S3812, {
  valid: [
    { code: "const r = !(key in obj);" },
    { code: "const r = (!key) in obj;" },
    { code: "const r = !(value instanceof Foo);" },
  ],
  invalid: [
    {
      code: "const r = !key in obj;",
      errors: [
        error(
          'Add parentheses to clarify the negation applied to "in". [typescript:S3812]',
        ),
      ],
    },
    {
      code: "const r = !value instanceof Foo;",
      errors: [
        error(
          'Add parentheses to clarify the negation applied to "instanceof". [typescript:S3812]',
        ),
      ],
    },
  ],
});
