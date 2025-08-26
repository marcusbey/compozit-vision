module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Removed react-native-reanimated plugin to avoid deprecation warning
      // Add back when worklets are properly installed
    ],
  };
};