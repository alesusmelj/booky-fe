const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 🔑 Permitimos cargar .txt como asset
config.resolver.assetExts.push('txt');

module.exports = config;
