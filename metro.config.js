const { getSentryExpoConfig } = require('@sentry/react-native/metro');

// Expo's default config plus Sentry's debug IDs, which tie each release bundle to the source
// map uploaded during the native build (app.config.ts adds that upload when a token exists)
/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

// Add SVG transformer
config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Add SVG to asset extensions and remove from source extensions
config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = config;
