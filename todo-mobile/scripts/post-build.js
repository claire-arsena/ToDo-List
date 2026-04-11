#!/usr/bin/env node
/**
 * Post-build : après `expo export --platform web`
 * 1. Copie les icônes PNG dans dist/assets/
 * 2. Injecte les balises apple-touch-icon dans dist/index.html
 */

const fs = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const ASSETS  = path.join(ROOT, 'assets');
const DIST    = path.join(ROOT, 'dist');
const DIST_ASSETS = path.join(DIST, 'assets');

// ── 1. Copier les icônes PNG ──────────────────────────────────────────────────

if (!fs.existsSync(DIST_ASSETS)) fs.mkdirSync(DIST_ASSETS, { recursive: true });

const icons = fs.readdirSync(ASSETS).filter(f => f.endsWith('.png'));
icons.forEach(file => {
  fs.copyFileSync(
    path.join(ASSETS, file),
    path.join(DIST_ASSETS, file)
  );
});

// Copie aussi apple-touch-icon.png à la racine (Safari le cherche automatiquement)
const icon180 = path.join(ASSETS, 'apple-touch-icon-180x180.png');
if (fs.existsSync(icon180)) {
  fs.copyFileSync(icon180, path.join(DIST, 'apple-touch-icon.png'));
  console.log('✅  dist/apple-touch-icon.png (racine, détection automatique Safari)');
}

console.log(`✅  ${icons.length} icônes copiées dans dist/assets/`);

// ── 2. Patcher index.html ─────────────────────────────────────────────────────

const indexPath = path.join(DIST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const appleTags = `
    <!-- iOS home screen icons -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="apple-touch-icon" sizes="57x57"   href="/assets/apple-touch-icon-57x57.png" />
    <link rel="apple-touch-icon" sizes="60x60"   href="/assets/apple-touch-icon-60x60.png" />
    <link rel="apple-touch-icon" sizes="72x72"   href="/assets/apple-touch-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="76x76"   href="/assets/apple-touch-icon-76x76.png" />
    <link rel="apple-touch-icon" sizes="114x114" href="/assets/apple-touch-icon-114x114.png" />
    <link rel="apple-touch-icon" sizes="120x120" href="/assets/apple-touch-icon-120x120.png" />
    <link rel="apple-touch-icon" sizes="144x144" href="/assets/apple-touch-icon-144x144.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/assets/apple-touch-icon-152x152.png" />
    <link rel="apple-touch-icon" sizes="167x167" href="/assets/apple-touch-icon-167x167.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon-180x180.png" />
    <!-- PWA icons -->
    <link rel="icon" sizes="192x192" href="/assets/pwa-icon-192x192.png" />
    <link rel="icon" sizes="512x512" href="/assets/pwa-icon-512x512.png" />
    <!-- iOS PWA -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Ma Liste" />`;

// Injecter juste avant </head>
if (!html.includes('apple-touch-icon')) {
  html = html.replace('</head>', appleTags + '\n  </head>');
  fs.writeFileSync(indexPath, html);
  console.log('✅  dist/index.html patché (balises apple-touch-icon injectées)');
} else {
  console.log('⏭  dist/index.html déjà patché, ignoré');
}

console.log('\n🚀 Post-build terminé !');
