module.exports = function (api) {
  api.cache(true);
  return {
    // No react-native-reanimated/plugin: Reanimated 4 handles worklets
    // without a Babel plugin (mirrors apps/app).
    presets: [["babel-preset-expo"]],
  };
};
