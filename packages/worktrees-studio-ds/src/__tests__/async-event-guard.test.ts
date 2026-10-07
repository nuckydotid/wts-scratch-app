import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Static guard (#50): RNTL v14 `fireEvent`/`userEvent` calls return promises
 * that wrap `act`. An un-awaited call leaves the act queue pending and every
 * later `render` in the same file mounts an empty tree (root-caused in #48).
 *
 * Rule: the call must be awaited on the same line —
 * `await fireEvent.press(node);`. Deliberate exceptions carry an inline
 * `// async-event-ok: <reason>` comment.
 */
const CALL_PATTERN = /\b(fireEvent|userEvent)\s*(?:\.|\()/u;
const AWAIT_PATTERN = /await\s+(?:fireEvent|userEvent)\b/u;
const ESCAPE_PATTERN = /async-event-ok/u;
/** `userEvent.setup()` returns a user instance synchronously (v14). */
const SETUP_PATTERN = /userEvent\s*\.\s*setup\s*\(/u;
const TEST_FILE = /\.(?:test|spec)\.tsx?$/u;

/** This guard's own fixtures contain the forbidden strings inside literals. */
const SELF = "async-event-guard.test.ts";

export function findUnawaitedAsyncEvents(files: Iterable<[string, string]>): string[] {
  const violations: string[] = [];
  for (const [path, content] of files) {
    content.split("\n").forEach((line, index) => {
      const trimmed = line.trimStart();
      if (
        trimmed === "" ||
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith('"') ||
        trimmed.startsWith("'") ||
        trimmed.startsWith("`")
      ) {
        return;
      }
      if (!CALL_PATTERN.test(line)) return;
      if (SETUP_PATTERN.test(line)) return;
      if (AWAIT_PATTERN.test(line)) return;
      if (ESCAPE_PATTERN.test(line)) return;
      violations.push(
        `${path}:${index + 1} — un-awaited ${line.trim()} (use \`await\`, or add // async-event-ok: reason)`
      );
    });
  }
  return violations;
}

function collectTestFiles(dir: string): [string, string][] {
  const files: [string, string][] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === "__snapshots__") {
        continue;
      }
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!TEST_FILE.test(entry.name)) continue;
      if (entry.name === SELF) continue;
      files.push([relative(REPO, full), readFileSync(full, "utf8")]);
    }
  };
  walk(dir);
  return files;
}

const REPO = join(__dirname, "../../..", "..");

describe("async-event guard", () => {
  it("red: flags an un-awaited press", () => {
    const dirty: [string, string][] = [
      [
        "fixtures/dirty.test.tsx",
        ['it("x", async () => {', "  fireEvent.press(node);", "});"].join("\n"),
      ],
    ];
    const violations = findUnawaitedAsyncEvents(dirty);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain("fixtures/dirty.test.tsx:2");
  });

  it("green: awaits pass, escapes pass, imports and comments pass", () => {
    const clean: [string, string][] = [
      [
        "fixtures/clean.test.tsx",
        [
          'import { fireEvent, userEvent } from "@testing-library/react-native";',
          "// fireEvent.press(node); in a comment is fine",
          'it("x", async () => {',
          "  await fireEvent.press(node);",
          "  await userEvent.press(node);",
          "  fireEvent.press(node); // async-event-ok: deliberate probe",
          "});",
        ].join("\n"),
      ],
    ];
    expect(findUnawaitedAsyncEvents(clean)).toEqual([]);
  });

  it("keeps every app and DS jest suite awaited", () => {
    const files = [
      ...collectTestFiles(join(REPO, "apps/app/src")),
      ...collectTestFiles(join(REPO, "packages/worktrees-studio-ds/src")),
    ];
    expect(files.length).toBeGreaterThan(30);
    expect(findUnawaitedAsyncEvents(files)).toEqual([]);
  });
});
