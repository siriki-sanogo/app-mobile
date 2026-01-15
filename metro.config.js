const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { resolver } = config;

// Ensure were not treating wasm as source
resolver.sourceExts = resolver.sourceExts.filter(ext => ext !== 'wasm');

// Add to assets
if (!resolver.assetExts.includes('wasm')) {
    resolver.assetExts.push('wasm');
}
if (!resolver.assetExts.includes('db')) {
    resolver.assetExts.push('db');
}

module.exports = config;
