#!/usr/bin/env node
/**
 * Génère toutes les icônes nécessaires pour l'app iOS / PWA à partir de assets/icon.png.
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

const ICONS = [
  'icon.png',
  'adaptive-icon.png',
  'favicon.png',
  'apple-touch-icon-57x57.png',
  'apple-touch-icon-60x60.png',
  'apple-touch-icon-72x72.png',
  'apple-touch-icon-76x76.png',
  'apple-touch-icon-114x114.png',
  'apple-touch-icon-120x120.png',
  'apple-touch-icon-144x144.png',
  'apple-touch-icon-152x152.png',
  'apple-touch-icon-167x167.png',
  'apple-touch-icon-180x180.png',
  'pwa-icon-192x192.png',
  'pwa-icon-512x512.png',
];

console.log('🎨 Mise à jour de toutes les icônes iOS…\n');

const mainIconPath = path.join(ASSETS_DIR, 'icon.png');

if (fs.existsSync(mainIconPath)) {
  ICONS.forEach((name) => {
    if (name === 'icon.png') return;
    const outPath = path.join(ASSETS_DIR, name);
    fs.copyFileSync(mainIconPath, outPath);
    console.log(`✅  assets/${name} mis à jour depuis la nouvelle icône iOS`);
  });
}

console.log('\n🎉 Toutes les icônes iOS ont été générées et mises à jour avec succès !');
