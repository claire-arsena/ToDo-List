#!/usr/bin/env node
/**
 * Génère toutes les icônes nécessaires pour l'app PWA.
 * Utilise pngjs (pur JS, sans dépendances natives).
 *
 * Usage : node scripts/generate-icons.js
 * Pour personnaliser : remplace les fichiers dans assets/ par tes propres PNG.
 */

const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

// Palette de l'app
const COLOR_PINK_LIGHT = [255, 213, 223]; // #ffd5df
const COLOR_PINK_MID   = [255, 153, 204]; // #ff99cc
const COLOR_PINK_DARK  = [255,  82, 170]; // #ff52aa
const COLOR_WHITE      = [255, 255, 255];

function lerp(a, b, t) {
  return Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
}

/**
 * Crée un PNG de taille `size x size` avec un dégradé diagonal rose.
 * Dessine en overlay un carré blanc arrondi avec 3 "lignes de liste" roses.
 */
function createIconPNG(size) {
  const png = new PNG({ width: size, height: size });

  // --- Fond dégradé diagonal ---
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = (x / size) * 0.5 + (y / size) * 0.5;
      const idx = (size * y + x) << 2;
      png.data[idx]     = lerp(COLOR_PINK_LIGHT[0], COLOR_PINK_DARK[0], t);
      png.data[idx + 1] = lerp(COLOR_PINK_LIGHT[1], COLOR_PINK_DARK[1], t);
      png.data[idx + 2] = lerp(COLOR_PINK_LIGHT[2], COLOR_PINK_DARK[2], t);
      png.data[idx + 3] = 255;
    }
  }

  // --- Carré central blanc semi-transparent (arrondi simulé) ---
  const margin = Math.round(size * 0.18);
  const radius = Math.round(size * 0.1);
  for (let y = margin; y < size - margin; y++) {
    for (let x = margin; x < size - margin; x++) {
      // Simulation coin arrondi
      const dx = Math.max(0, radius - Math.min(x - margin, size - margin - 1 - x));
      const dy = Math.max(0, radius - Math.min(y - margin, size - margin - 1 - y));
      if (dx * dx + dy * dy > radius * radius) continue;

      const idx = (size * y + x) << 2;
      // Mélange blanc à 85%
      png.data[idx]     = lerp(png.data[idx],     COLOR_WHITE[0], 0.85);
      png.data[idx + 1] = lerp(png.data[idx + 1], COLOR_WHITE[1], 0.85);
      png.data[idx + 2] = lerp(png.data[idx + 2], COLOR_WHITE[2], 0.85);
    }
  }

  // --- Lignes de checklist ---
  const lw = Math.max(2, Math.round(size * 0.025)); // épaisseur trait
  const rowPositions = [0.36, 0.52, 0.68];          // positions verticales (%)
  const xStart = Math.round(size * 0.28);
  const xEnd   = Math.round(size * 0.72);

  const drawRect = (x1, y1, x2, y2, color) => {
    for (let py = y1; py <= y2; py++) {
      for (let px = x1; px <= x2; px++) {
        if (px < 0 || px >= size || py < 0 || py >= size) continue;
        const idx = (size * py + px) << 2;
        png.data[idx]     = color[0];
        png.data[idx + 1] = color[1];
        png.data[idx + 2] = color[2];
        png.data[idx + 3] = 255;
      }
    }
  };

  rowPositions.forEach((pos) => {
    const cy = Math.round(size * pos);
    const cbSize = Math.round(size * 0.05);

    // Carré case à cocher
    drawRect(
      xStart,          cy - cbSize,
      xStart + cbSize * 2, cy + cbSize,
      COLOR_PINK_DARK
    );
    // Intérieur blanc de la case
    drawRect(
      xStart + lw,              cy - cbSize + lw,
      xStart + cbSize * 2 - lw, cy + cbSize - lw,
      COLOR_WHITE
    );

    // Ligne de texte
    drawRect(
      xStart + cbSize * 2 + Math.round(size * 0.04),
      cy - lw,
      xEnd,
      cy + lw,
      COLOR_PINK_MID
    );
  });

  return PNG.sync.write(png);
}

/**
 * Crée un PNG de fond uni (pour splash screen).
 */
function createSplashPNG(width, height) {
  const png = new PNG({ width, height });
  const [r, g, b] = COLOR_PINK_LIGHT;
  for (let i = 0; i < width * height; i++) {
    const idx = i << 2;
    png.data[idx]     = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = 255;
  }
  // Logo centré (petit)
  const iconSize = Math.round(Math.min(width, height) * 0.3);
  const iconData = createIconPNG(iconSize);
  const iconPng = PNG.sync.read(iconData);
  const ox = Math.round((width - iconSize) / 2);
  const oy = Math.round((height - iconSize) / 2);
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const si = (iconSize * y + x) << 2;
      const di = (width * (oy + y) + (ox + x)) << 2;
      if (di < 0 || di >= png.data.length - 3) continue;
      png.data[di]     = iconPng.data[si];
      png.data[di + 1] = iconPng.data[si + 1];
      png.data[di + 2] = iconPng.data[si + 2];
      png.data[di + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

// ────────────────────────────────────────────────
//  Génération de tous les assets
// ────────────────────────────────────────────────

const ICONS = [
  // Expo / PWA (source principale 1024x1024)
  { name: 'icon.png',          size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'favicon.png',       size:   64 },

  // iOS home screen (toutes les tailles requises)
  { name: 'apple-touch-icon-57x57.png',   size:  57 },
  { name: 'apple-touch-icon-60x60.png',   size:  60 },
  { name: 'apple-touch-icon-72x72.png',   size:  72 },
  { name: 'apple-touch-icon-76x76.png',   size:  76 },
  { name: 'apple-touch-icon-114x114.png', size: 114 },
  { name: 'apple-touch-icon-120x120.png', size: 120 },
  { name: 'apple-touch-icon-144x144.png', size: 144 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },

  // PWA manifest
  { name: 'pwa-icon-192x192.png', size: 192 },
  { name: 'pwa-icon-512x512.png', size: 512 },
];

console.log('🎨 Génération des icônes…\n');

ICONS.forEach(({ name, size }) => {
  const outPath = path.join(ASSETS_DIR, name);
  // Ne pas écraser si déjà présent (icône personnalisée)
  if (fs.existsSync(outPath)) {
    console.log(`⏭  assets/${name} (déjà présent, conservé)`);
    return;
  }
  const data = createIconPNG(size);
  fs.writeFileSync(outPath, data);
  console.log(`✅  assets/${name} (${size}×${size})`);
});

// Splash screen
const splashPath = path.join(ASSETS_DIR, 'splash.png');
if (!fs.existsSync(splashPath)) {
  const splash = createSplashPNG(1284, 2778);
  fs.writeFileSync(splashPath, splash);
  console.log('✅  assets/splash.png (1284×2778)');
} else {
  console.log('⏭  assets/splash.png (déjà présent, conservé)');
}

console.log('\n🎉 Icônes générées !');
console.log('💡 Pour personnaliser : remplace assets/icon.png (1024×1024) puis relance ce script.');
