#!/usr/bin/env node
/**
 * Post-build : après `expo export --platform web`
 * 1. Copie les icônes PNG dans dist/assets/ et à la racine dist/
 * 2. Écrase le vieux favicon.ico d'Expo par la nouvelle icône iOS
 * 3. Génère manifest.json et patche dist/index.html avec le cache-busting (?v=2)
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

const iconPath = path.join(ASSETS, 'icon.png');
if (fs.existsSync(iconPath)) {
  // Écrase la racine et le favicon.ico par la nouvelle icône iOS
  fs.copyFileSync(iconPath, path.join(DIST, 'apple-touch-icon.png'));
  fs.copyFileSync(iconPath, path.join(DIST, 'favicon.ico'));
  fs.copyFileSync(iconPath, path.join(DIST, 'favicon.png'));
  console.log('✅  dist/apple-touch-icon.png & dist/favicon.ico écrasés avec la nouvelle icône iOS !');
}

console.log(`✅  ${icons.length} icônes copiées dans dist/assets/`);

// ── 2. Générer manifest.json PWA ──────────────────────────────────────────────

const manifest = {
  name: "Ma Liste",
  short_name: "Ma Liste",
  description: "Gère tes tâches depuis n'importe où",
  start_url: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#f2f2f7",
  theme_color: "#d81b60",
  icons: [
    { src: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
    { src: "/assets/pwa-icon-192x192.png?v=2", sizes: "192x192", type: "image/png" },
    { src: "/assets/pwa-icon-512x512.png?v=2", sizes: "512x512", type: "image/png" },
  ],
};

fs.writeFileSync(path.join(DIST, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✅  dist/manifest.json généré avec succès !');

// ── 3. Patcher index.html ─────────────────────────────────────────────────────

const indexPath = path.join(DIST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Forcer le viewport anti-zoom
html = html.replace(
  /<meta name="viewport" content="[^"]*"/,
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"'
);

// Supprimer tout vieux lien favicon Expo préexistant
html = html.replace(/<link rel="shortcut icon"[^>]*>/gi, '');
html = html.replace(/<link rel="icon"[^>]*>/gi, '');

const appleTags = `
    <!-- iOS home screen icons & Favicons avec cache-busting -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
    <link rel="apple-touch-icon" sizes="57x57"   href="/assets/apple-touch-icon-57x57.png?v=2" />
    <link rel="apple-touch-icon" sizes="60x60"   href="/assets/apple-touch-icon-60x60.png?v=2" />
    <link rel="apple-touch-icon" sizes="72x72"   href="/assets/apple-touch-icon-72x72.png?v=2" />
    <link rel="apple-touch-icon" sizes="76x76"   href="/assets/apple-touch-icon-76x76.png?v=2" />
    <link rel="apple-touch-icon" sizes="114x114" href="/assets/apple-touch-icon-114x114.png?v=2" />
    <link rel="apple-touch-icon" sizes="120x120" href="/assets/apple-touch-icon-120x120.png?v=2" />
    <link rel="apple-touch-icon" sizes="144x144" href="/assets/apple-touch-icon-144x144.png?v=2" />
    <link rel="apple-touch-icon" sizes="152x152" href="/assets/apple-touch-icon-152x152.png?v=2" />
    <link rel="apple-touch-icon" sizes="167x167" href="/assets/apple-touch-icon-167x167.png?v=2" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon-180x180.png?v=2" />

    <!-- Favicon & PWA icons -->
    <link rel="icon" type="image/png" href="/favicon.png?v=2" />
    <link rel="shortcut icon" type="image/png" href="/apple-touch-icon.png?v=2" />
    <link rel="manifest" href="/manifest.json?v=2" />

    <!-- iOS PWA -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Ma Liste" />

    <!-- Styling anti-zoom et harmonisation de la police -->
    <style>
      input, textarea, select, button {
        font-size: 16px !important;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif !important;
        touch-action: manipulation;
      }
    </style>`;

html = html.replace('</head>', appleTags + '\n  </head>');

fs.writeFileSync(indexPath, html);
console.log('✅  dist/index.html patché (icônes iOS forcées & cache-busting)');
console.log('\n🚀 Post-build terminé avec succès !');
