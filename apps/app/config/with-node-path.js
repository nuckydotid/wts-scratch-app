const fs = require("fs");
const path = require("path");

const { withDangerousMod } = require("expo/config-plugins");

/**
 * Pins the Node.js executable path in android/app/build.gradle so that
 * Gradle can find `node` regardless of how Android Studio is launched
 * (Finder, Dock, or terminal). Without this, GUI-launched Android Studio
 * inherits a minimal PATH from launchd that doesn't include Homebrew's
 * Node.js location, causing "node: command not found" build failures.
 *
 * The path is resolved at prebuild time from the active `node` binary.
 */
const MARKER = "// @generated config/with-node-path.js — pinned Node.js executable";

function withNodePath(config) {
  return withDangerousMod(config, [
    "android",
    async (c) => {
      const buildGradlePath = path.join(c.modRequest.platformProjectRoot, "app", "build.gradle");

      if (!fs.existsSync(buildGradlePath)) {
        return c;
      }

      const contents = fs.readFileSync(buildGradlePath, "utf8");

      // Resolve the node binary path at prebuild time
      const nodePath = process.execPath;

      const nodeConfigLine = `nodeExecutableAndArgs = ["${nodePath}"]`;

      if (contents.includes(MARKER)) {
        // Already patched — update the path in case node moved
        const updated = contents.replace(
          new RegExp(
            `// @generated config/with-node-path\\.js — pinned Node\\.js executable\\nnodeExecutableAndArgs = \\[.*?\\]`,
          ),
          `${MARKER}\n    ${nodeConfigLine}`,
        );
        if (updated !== contents) {
          fs.writeFileSync(buildGradlePath, updated);
        }
        return c;
      }

      // Insert after the "Bundling" comment block
      const bundlingAnchor = "    /* Bundling */";
      if (contents.includes(bundlingAnchor)) {
        const patched = contents.replace(
          bundlingAnchor,
          `${bundlingAnchor}\n    ${MARKER}\n    ${nodeConfigLine}`,
        );
        fs.writeFileSync(buildGradlePath, patched);
      }

      return c;
    },
  ]);
}

module.exports = withNodePath;
