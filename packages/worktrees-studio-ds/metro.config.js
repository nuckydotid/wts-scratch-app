const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// The DS storyboard dev server defaults to 8085 (Metro server.port) — the
// CommandsGUI "Open" buttons target http://localhost:8085/expo-story/flows/*.
config.server = { port: 8085 };

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
});
