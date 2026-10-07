# Vite

> Scraped from `https://v2.tauri.app/start/frontend/vite/` (last fetch: 2026-09-25). Verbatim archive — see the curated guides in `docs/tauri/` for the adapted version.

# Vite

Vite is a build tool that aims to provide a faster and leaner development experience for modern web projects.
This guide is accurate as of Vite 8.

## Checklist

[Section titled “Checklist”](#checklist)

- Use `../dist` as `frontendDist` in `src-tauri/tauri.conf.json`.
- Use `process.env.TAURI_DEV_HOST` as the development server host IP when set to run on iOS physical devices.

## Example configuration

[Section titled “Example configuration”](#example-configuration)

1. ##### Update Tauri configuration

   [Section titled “Update Tauri configuration”](#update-tauri-configuration)

   Assuming you have the following `dev` and `build` scripts in your `package.json`:

   ```
   {

   "scripts": {

   "dev": "vite",

   "build": "tsc && vite build",

   "preview": "vite preview",

   "tauri": "tauri"

   }

   }
   ```

   You can configure the Tauri CLI to use your Vite development server and dist folder
   along with the hooks to automatically run the Vite scripts:

   - [npm](#tab-panel-0-0)
   - [yarn](#tab-panel-0-1)
   - [pnpm](#tab-panel-0-2)
   - [deno](#tab-panel-0-3)

   tauri.conf.json

   ```
   {

   "build": {

   "beforeDevCommand": "npm run dev",

   "beforeBuildCommand": "npm run build",

   "devUrl": "http://localhost:5173",

   "frontendDist": "../dist"

   }

   }
   ```

   tauri.conf.json

   ```
   {

   "build": {

   "beforeDevCommand": "yarn dev",

   "beforeBuildCommand": "yarn build",

   "devUrl": "http://localhost:5173",

   "frontendDist": "../dist"

   }

   }
   ```

   tauri.conf.json

   ```
   {

   "build": {

   "beforeDevCommand": "pnpm dev",

   "beforeBuildCommand": "pnpm build",

   "devUrl": "http://localhost:5173",

   "frontendDist": "../dist"

   }

   }
   ```

   tauri.conf.json

   ```
   {

   "build": {

   "beforeDevCommand": "deno task dev",

   "beforeBuildCommand": "deno task build",

   "devUrl": "http://localhost:5173",

   "frontendDist": "../dist"

   }

   }
   ```

2. ##### Update Vite configuration:

   [Section titled “Update Vite configuration:”](#update-vite-configuration)

   vite.config.js

   ```
   import { defineConfig } from 'vite';

   const host = process.env.TAURI_DEV_HOST;

   export default defineConfig({

   // prevent vite from obscuring rust errors

   clearScreen: false,

   server: {

   // make sure this port matches the devUrl port in tauri.conf.json file

   port: 5173,

   // Tauri expects a fixed port, fail if that port is not available

   strictPort: true,

   // if the host Tauri is expecting is set, use it

   host: host || false,

   hmr: host

   ? {

   protocol: 'ws',

   host,

   port: 1421,

   }

   : undefined,

   watch: {

   // tell vite to ignore watching `src-tauri`

   ignored: ['**/src-tauri/**'],

   },

   },

   // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.

   envPrefix: ['VITE_', 'TAURI_ENV_*'],

   build: {

   // Tauri uses Chromium on Windows and WebKit on macOS and Linux

   target:

   process.env.TAURI_ENV_PLATFORM == 'windows'

   ? 'chrome105'

   : 'safari13',

   // don't minify for debug builds

   minify: !process.env.TAURI_ENV_DEBUG,

   // produce sourcemaps for debug builds

   sourcemap: !!process.env.TAURI_ENV_DEBUG,

   },

   });
   ```

[Edit page](https://github.com/tauri-apps/tauri-docs/edit/v2/src/content/docs/start/frontend/vite.mdx)

Last updated: Sep 3, 2026

[Previous  
Trunk](/start/frontend/trunk/)[Next  
Overview](/start/migrate/)

---

[Support on Open Collective](https://opencollective.com/tauri)[Sponsor on GitHub](https://github.com/sponsors/tauri-apps)

© 2026 Tauri Contributors. CC-BY / MIT
