const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  
  config.resolver = {
    ...resolver,
    // Removes 'svg' from asset extensions so it isn't treated as a static image
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    // Adds 'svg' to source extensions so it is treated as a component
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  return config;
})();