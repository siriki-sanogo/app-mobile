const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { resolver } = config;

// Ajouter le support pour les extensions de fichiers modèles IA (GGUF, BIN) 
// et les bases de données (DB), ainsi que WASM pour SQLite Web.

// 1. Assets
const assetsToAdd = ['gguf', 'bin', 'wasm', 'db'];
assetsToAdd.forEach(ext => {
    if (!resolver.assetExts.includes(ext)) {
        resolver.assetExts.push(ext);
    }
});

// 2. Source - S'assurer que wasm n'est pas traité comme du code source
resolver.sourceExts = resolver.sourceExts.filter(ext => ext !== 'wasm');

module.exports = config;
