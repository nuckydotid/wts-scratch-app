const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the Bun workspace so edits to @repo/worktrees-studio-ds and
// @repo/worktrees-studio-shared-ids trigger web rebuilds (mirrors apps/metro.config.js).
config.watchFolders = [workspaceRoot];

config.server = { port: 8086 };

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
});
