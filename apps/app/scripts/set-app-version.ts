#!/usr/bin/env bun
/**
 * Read or bump the app version in config/build.ts (and package.json).
 *
 *   bunx tsx scripts/set-app-version.ts check
 *   bunx tsx scripts/set-app-version.ts set 1.1.22
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { toVersionCode } from "../config/build";

const root = resolve(import.meta.dirname, "..");
const buildConfigPath = resolve(root, "config/build.ts");
const packageJsonPath = resolve(root, "package.json");

function readCurrentVersion(): string {
  const content = readFileSync(buildConfigPath, "utf8");
  const match = /export const APP_VERSION = "([^"]+)"/.exec(content);
  if (!match) {
    throw new Error("Could not find APP_VERSION in config/build.ts");
  }
  return match[1];
}

function setVersion(next: string): void {
  const versionCode = toVersionCode(next);

  let buildConfig = readFileSync(buildConfigPath, "utf8");
  buildConfig = buildConfig.replace(
    /export const APP_VERSION = "[^"]+"/,
    `export const APP_VERSION = "${next}"`,
  );
  writeFileSync(buildConfigPath, buildConfig);

  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    version?: string;
  };
  pkg.version = next;
  writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);

  console.log(`version: ${next}`);
  console.log(`versionCode / buildNumber: ${versionCode}`);
}

const [command, arg] = process.argv.slice(2);

switch (command) {
  case "check": {
    const version = readCurrentVersion();
    const code = toVersionCode(version);
    console.log(`config/build.ts APP_VERSION: ${version}`);
    console.log(`versionCode / buildNumber: ${code}`);
    break;
  }
  case "set": {
    if (!arg) {
      throw new Error("Usage: set-app-version.ts set <X.Y.Z>");
    }
    setVersion(arg);
    break;
  }
  default:
    throw new Error("Usage: set-app-version.ts <check|set> [version]");
}
