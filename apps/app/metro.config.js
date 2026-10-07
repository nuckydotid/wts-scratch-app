const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];

module.exports = withUniwindConfig(config, {
  cssEntryFile: path.relative(projectRoot, path.join(projectRoot, "src/ui/global.css")),
  dtsFile: path.join(projectRoot, "uniwind-types.d.ts"),
});
