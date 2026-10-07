"use strict";

const { RuleTester } = require("eslint");
const tsParser = require("@typescript-eslint/parser");

const cryptoWebRules = require("../rules/crypto-web-security-rules");
const cloudRules = require("../rules/cloud-config-rules");
const collectionRules = require("../rules/collections-rules");
const typescriptRules = require("../rules/typescript-rules");
const reactRules = require("../rules/react-jsx-rules");

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

// S1523 - Dynamic code execution
ruleTester.run("S1523", cryptoWebRules.S1523, {
  valid: ["setTimeout(() => doThing(), 100);", "const fn = () => 1;"],
  invalid: [
    {
      code: "eval('1 + 1');",
      errors: [
        error(
          "Avoid dynamically executing code with eval(). [typescript:S1523]",
        ),
      ],
    },
    {
      code: "new Function('return 1');",
      errors: [
        error("Avoid constructing functions from strings. [typescript:S1523]"),
      ],
    },
    {
      code: "setTimeout('doThing()', 100);",
      errors: [
        error(
          "Do not pass strings to timers; pass a function instead. [typescript:S1523]",
        ),
      ],
    },
  ],
});

// S2245 - Math.random
ruleTester.run("S2245", cryptoWebRules.S2245, {
  valid: ["const token = crypto.randomBytes(16).toString('hex');"],
  invalid: [
    {
      code: "const token = Math.random().toString(36);",
      errors: [
        error(
          "Math.random() is not cryptographically secure; use a CSPRNG for security-sensitive values. [typescript:S2245]",
        ),
      ],
    },
  ],
});

// S6418 - Hard-coded secrets
ruleTester.run("S6418", cryptoWebRules.S6418, {
  valid: [
    "const apiKey = process.env.API_KEY;",
    "const apiKey = 'your-api-key';",
  ],
  invalid: [
    {
      code: "const apiKey = 'abcd1234efgh5678';",
      errors: [
        error(
          'Revoke and remove this hard-coded secret "apiKey". [typescript:S6418]',
        ),
      ],
    },
    {
      code: "const config = { authToken: 'zxy9876secretvalue' };",
      errors: [
        error(
          'Revoke and remove this hard-coded secret "authToken". [typescript:S6418]',
        ),
      ],
    },
  ],
});

// S7639 - Wallet phrases
ruleTester.run("S7639", cryptoWebRules.S7639, {
  valid: ["const seedPhrase = 'short';"],
  invalid: [
    {
      code: "const seedPhrase = 'apple banana cherry dog';",
      errors: [
        error(
          "Wallet recovery phrases must not be hard-coded; load them from secure storage. [typescript:S7639]",
        ),
      ],
    },
  ],
});

// S5332 - Clear-text protocols
ruleTester.run("S5332", cryptoWebRules.S5332, {
  valid: ["const url = 'wss://example.com';"],
  invalid: [
    {
      code: "const socket = new WebSocket('ws://example.com');",
      errors: [error('Use "wss://" instead of "ws://". [typescript:S5332]')],
    },
    {
      code: "const options = { secure: false };",
      errors: [
        error(
          "Use an encrypted transport instead of clear-text protocols. [typescript:S5332]",
        ),
      ],
    },
  ],
});

// S5443 - Publicly writable directories
ruleTester.run("S5443", cryptoWebRules.S5443, {
  valid: ["fs.writeFileSync('./data.json', payload);"],
  invalid: [
    {
      code: "fs.writeFileSync('/tmp/data.json', payload);",
      errors: [
        error(
          '"/tmp/data.json" is a publicly writable directory; use a private directory with restrictive permissions. [typescript:S5443]',
        ),
      ],
    },
  ],
});

// S5042 - Archive expansion limits
ruleTester.run("S5042", cryptoWebRules.S5042, {
  valid: ["zlib.inflateSync(buffer, { maxOutputLength: 1024 });"],
  invalid: [
    {
      code: "zlib.inflateSync(buffer);",
      errors: [
        error(
          'Set "maxOutputLength" when expanding archives to prevent resource exhaustion. [typescript:S5042]',
        ),
      ],
    },
    {
      code: "zlib.gunzipSync(buffer, { chunkSize: 1024 });",
      errors: [
        error(
          'Set "maxOutputLength" when expanding archives to prevent resource exhaustion. [typescript:S5042]',
        ),
      ],
    },
  ],
});

// S2598 - File upload restrictions
ruleTester.run("S2598", cryptoWebRules.S2598, {
  valid: [
    "const upload = multer({ limits: { fileSize: 1024 }, fileFilter });",
    "const text = value.toString();",
    "const json = payload.constructor();",
  ],
  invalid: [
    {
      code: "const upload = multer();",
      errors: [
        error(
          'Restrict file uploads with "limits" and "fileFilter". [typescript:S2598]',
        ),
      ],
    },
    {
      code: "const upload = multer({ dest: '/uploads' });",
      errors: [
        error(
          'Restrict file uploads with "limits" and "fileFilter". [typescript:S2598]',
        ),
      ],
    },
  ],
});

// S4502 - CSRF protection disabled
ruleTester.run("S4502", cryptoWebRules.S4502, {
  valid: ["const csrfOptions = { ignoreMethods: ['GET', 'HEAD'] };"],
  invalid: [
    {
      code: "const csrfOptions = { ignoreMethods: ['GET', 'POST'] };",
      errors: [
        error(
          "CSRF protection must not be ignored for state-changing methods. [typescript:S4502]",
        ),
      ],
    },
    {
      code: "const config = { csrf: false };",
      errors: [
        error("CSRF protection must not be disabled. [typescript:S4502]"),
      ],
    },
  ],
});

// S5876 - Session regeneration on authentication
ruleTester.run("S5876", cryptoWebRules.S5876, {
  valid: [
    "app.post('/login', (req, res) => { req.session.regenerate(() => { req.session.user = req.body.user; res.end(); }); });",
    "app.get('/health', (req, res) => res.end('ok'));",
  ],
  invalid: [
    {
      code: "app.post('/login', (req, res) => { req.session.user = req.body.user; res.end(); });",
      errors: [
        error(
          "Regenerate the session during authentication to prevent session fixation. [typescript:S5876]",
        ),
      ],
    },
  ],
});

// S2819 - Origin verification
ruleTester.run("S2819", cryptoWebRules.S2819, {
  valid: [
    "window.addEventListener('message', event => { if (event.origin === 'https://a.example.com') handle(event.data); });",
  ],
  invalid: [
    {
      code: "window.postMessage(payload, '*');",
      errors: [
        error(
          'Do not use "*" as postMessage target origin. [typescript:S2819]',
        ),
      ],
    },
    {
      code: "window.addEventListener('message', event => handle(event.data));",
      errors: [
        error(
          'Verify "event.origin" before handling cross-origin messages. [typescript:S2819]',
        ),
      ],
    },
  ],
});

// S2755 - XXE
ruleTester.run("S2755", cryptoWebRules.S2755, {
  valid: ["const parser = { noent: false };"],
  invalid: [
    {
      code: "const parser = { noent: true };",
      errors: [
        error(
          "Disable external entity resolution to prevent XXE. [typescript:S2755]",
        ),
      ],
    },
  ],
});

// S4423 - Weak TLS versions
ruleTester.run("S4423", cryptoWebRules.S4423, {
  valid: ["const minVersion = 'TLSv1.2';"],
  invalid: [
    {
      code: "const options = { secureProtocol: 'TLSv1_method' };",
      errors: [
        error(
          '"TLSv1_method" is a weak SSL/TLS protocol version. [typescript:S4423]',
        ),
      ],
    },
    {
      code: "const minVersion = 'TLSv1.1';",
      errors: [
        error(
          '"TLSv1.1" is a weak SSL/TLS protocol version. [typescript:S4423]',
        ),
      ],
    },
  ],
});

// S4830 - Certificate verification
ruleTester.run("S4830", cryptoWebRules.S4830, {
  valid: ["const agent = new https.Agent({ rejectUnauthorized: true });"],
  invalid: [
    {
      code: "const agent = new https.Agent({ rejectUnauthorized: false });",
      errors: [
        error(
          "Certificate verification must not be disabled (rejectUnauthorized: false). [typescript:S4830]",
        ),
      ],
    },
    {
      code: "process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';",
      errors: [
        error(
          "Certificate verification must not be disabled via NODE_TLS_REJECT_UNAUTHORIZED=0. [typescript:S4830]",
        ),
      ],
    },
  ],
});

// S5527 - Hostname verification
ruleTester.run("S5527", cryptoWebRules.S5527, {
  valid: ["const options = { servername: 'example.com' };"],
  invalid: [
    {
      code: "const options = { checkServerIdentity: () => undefined };",
      errors: [
        error(
          'Do not override "checkServerIdentity"; it disables hostname verification. [typescript:S5527]',
        ),
      ],
    },
  ],
});

// S4426 - Robust crypto keys
ruleTester.run("S4426", cryptoWebRules.S4426, {
  valid: ["crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });"],
  invalid: [
    {
      code: "crypto.generateKeyPairSync('rsa', { modulusLength: 1024 });",
      errors: [
        error(
          "RSA modulus length must be at least 2048 bits. [typescript:S4426]",
        ),
      ],
    },
  ],
});

// S5542 - Secure mode and padding
ruleTester.run("S5542", cryptoWebRules.S5542, {
  valid: ["crypto.createCipheriv('aes-256-gcm', key, iv);"],
  invalid: [
    {
      code: "crypto.createCipheriv('aes-256-ecb', key, null);",
      errors: [
        error(
          '"aes-256-ecb" uses ECB mode, which is not semantically secure. [typescript:S5542]',
        ),
      ],
    },
  ],
});

// S5659 - JWT strong algorithms
ruleTester.run("S5659", cryptoWebRules.S5659, {
  valid: ["jwt.verify(token, secret, { algorithms: ['RS256'] });"],
  invalid: [
    {
      code: "jwt.decode(token);",
      errors: [
        error(
          "jwt.decode() does not verify the token signature; use jwt.verify(). [typescript:S5659]",
        ),
      ],
    },
    {
      code: "jwt.sign(payload, secret, { algorithm: 'none' });",
      errors: [
        error(
          "JWT must be signed and verified with a strong algorithm. [typescript:S5659]",
        ),
      ],
    },
  ],
});

// S5852 - Slow regular expressions
ruleTester.run("S5852", cryptoWebRules.S5852, {
  valid: ["const pattern = /^[a-z]+$/;"],
  invalid: [
    {
      code: "const pattern = /(a+)+b/;",
      errors: [
        error(
          "This regular expression can backtrack super-linearly; simplify the quantified groups. [typescript:S5852]",
        ),
      ],
    },
    {
      code: "new RegExp('(a|aa)+');",
      errors: [
        error(
          "This regular expression can backtrack super-linearly; simplify the quantified groups. [typescript:S5852]",
        ),
      ],
    },
  ],
});

// S2871 - Array sort comparator
ruleTester.run("S2871", collectionRules.S2871, {
  valid: ["const sorted = items.sort((a, b) => a - b);"],
  invalid: [
    {
      code: "const sorted = items.sort();",
      errors: [
        error('Provide a compare function to "sort()". [typescript:S2871]'),
      ],
    },
    {
      code: "const sorted = items.toSorted();",
      errors: [
        error('Provide a compare function to "toSorted()". [typescript:S2871]'),
      ],
    },
  ],
});

// S4335 - Meaningful intersections
ruleTester.run("S4335", typescriptRules.S4335, {
  valid: ["type Good = A & B;"],
  invalid: [
    {
      code: "type Broken = A & {};",
      errors: [
        error(
          "Remove meaningless types from this intersection; they add no type safety. [typescript:S4335]",
        ),
      ],
    },
    {
      code: "type Bad = A & any;",
      errors: [
        error(
          "Remove meaningless types from this intersection; they add no type safety. [typescript:S4335]",
        ),
      ],
    },
  ],
});

// S5260 - Table cells reference headers
ruleTester.run("S5260", reactRules.S5260, {
  valid: ['const Row = () => <tr><td headers="h1">value</td></tr>;'],
  invalid: [
    {
      code: "const Row = () => <tr><td>value</td></tr>;",
      errors: [
        error(
          'Table cells should reference their headers with the "headers" attribute. [typescript:S5260]',
        ),
      ],
    },
  ],
});

// S6270 - Public access policies
ruleTester.run("S6270", cloudRules.S6270, {
  valid: ["const props = { publicReadAccess: false };"],
  invalid: [
    {
      code: "const props = { publicReadAccess: true };",
      errors: [
        error(
          'Public access ("publicReadAccess: true") should be disabled. [typescript:S6270]',
        ),
      ],
    },
    {
      code: "const props = { blockPublicPolicy: false };",
      errors: [
        error(
          'Public access block "blockPublicPolicy" must not be disabled. [typescript:S6270]',
        ),
      ],
    },
  ],
});

// S6281 - Public S3 ACLs
ruleTester.run("S6281", cloudRules.S6281, {
  valid: ["const props = { accessControl: 'private' };"],
  invalid: [
    {
      code: "const props = { accessControl: 'public-read' };",
      errors: [
        error('Public ACL "public-read" must not be used. [typescript:S6281]'),
      ],
    },
  ],
});

// S6265 - Bucket access to everyone
ruleTester.run("S6265", cloudRules.S6265, {
  valid: ["const policy = { principal: 'arn:aws:iam::123:role/App' };"],
  invalid: [
    {
      code: "const policy = { principal: '*' };",
      errors: [
        error(
          'Do not grant bucket access to everyone ("*"); restrict the principal. [typescript:S6265]',
        ),
      ],
    },
  ],
});

// S6329 - Public network access
ruleTester.run("S6329", cloudRules.S6329, {
  valid: ["const props = { cidr: '10.0.0.0/16' };"],
  invalid: [
    {
      code: "const props = { publiclyAccessible: true };",
      errors: [
        error(
          'Public network access ("publiclyAccessible: true") should be disabled. [typescript:S6329]',
        ),
      ],
    },
    {
      code: "const ingress = { cidr: '0.0.0.0/0' };",
      errors: [
        error(
          "Do not allow traffic from 0.0.0.0/0; restrict the CIDR range. [typescript:S6329]",
        ),
      ],
    },
  ],
});

// S6333 - Public APIs
ruleTester.run("S6333", cloudRules.S6333, {
  valid: ["const props = { authorizationType: 'AWS_IAM' };"],
  invalid: [
    {
      code: "const props = { authorizationType: 'NONE' };",
      errors: [
        error(
          'Public APIs must require authentication; do not use "NONE" authorization. [typescript:S6333]',
        ),
      ],
    },
  ],
});

// S6302 - Policies granting all privileges
ruleTester.run("S6302", cloudRules.S6302, {
  valid: ["const policy = { actions: ['s3:GetObject'] };"],
  invalid: [
    {
      code: "const policy = { actions: ['*'] };",
      errors: [
        error(
          'Do not grant all privileges ("*") in a policy. [typescript:S6302]',
        ),
      ],
    },
  ],
});

// S6317 - IAM scope
ruleTester.run("S6317", cloudRules.S6317, {
  valid: ["const policy = { action: 'iam:GetUser' };"],
  invalid: [
    {
      code: "const policy = { action: 'iam:*' };",
      errors: [
        error('Avoid wildcard IAM actions such as "iam:*". [typescript:S6317]'),
      ],
    },
  ],
});

// S6249 - HTTP with S3
ruleTester.run("S6249", cloudRules.S6249, {
  valid: ["const props = { enforceSSL: true };"],
  invalid: [
    {
      code: "const props = { enforceSSL: false };",
      errors: [
        error(
          'HTTP communication must not be allowed ("enforceSSL: false"). [typescript:S6249]',
        ),
      ],
    },
  ],
});

// S6268 - Angular sanitization bypass
ruleTester.run("S6268", cloudRules.S6268, {
  valid: ["this.sanitizer.sanitize(value);"],
  invalid: [
    {
      code: "this.sanitizer.bypassSecurityTrustHtml(value);",
      errors: [
        error(
          '"bypassSecurityTrustHtml" bypasses Angular sanitization; ensure the value is trusted. [typescript:S6268]',
        ),
      ],
    },
  ],
});
