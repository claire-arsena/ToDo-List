#!/usr/bin/env node
/**
 * Post-build : après `expo export --platform web`
 * Copie la nouvelle icône iOS 3D dans TOUS les noms et dossiers possibles pour iOS Safari :
 * - /apple-touch-icon.png
 * - /apple-touch-icon-precomposed.png
 * - /apple-touch-icon-180x180.png
 * - /apple-touch-icon-180x180-precomposed.png
 * - /favicon.ico
 * - /favicon.png
 */

const fs = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..');
const ASSETS      = path.join(ROOT, 'assets');
const DIST        = path.join(ROOT, 'dist');
const DIST_ASSETS = path.join(DIST, 'assets');

if (!fs.existsSync(DIST_ASSETS)) fs.mkdirSync(DIST_ASSETS, { recursive: true });

// Copie des PNG dans assets/
const icons = fs.readdirSync(ASSETS).filter(f => f.endsWith('.png'));
icons.forEach(file => {
  fs.copyFileSync(
    path.join(ASSETS, file),
    path.join(DIST_ASSETS, file)
  );
});

const iconPath = path.join(ASSETS, 'icon.png');
if (fs.existsSync(iconPath)) {
  // Écrasement absolu à la racine pour TOUS les patterns iOS Safari
  const rootFiles = [
    'apple-touch-icon.png',
    'apple-touch-icon-precomposed.png',
    'apple-touch-icon-180x180.png',
    'apple-touch-icon-180x180-precomposed.png',
    'apple-touch-icon-152x152.png',
    'apple-touch-icon-167x167.png',
    'favicon.ico',
    'favicon.png',
    'icon.png',
  ];

  rootFiles.forEach((file) => {
    fs.copyFileSync(iconPath, path.join(DIST, file));
  });

  console.log('✅  Toutes les icônes racine iOS Safari (apple-touch-icon*.png & favicon.ico) écrasées à 100% !');
}

// ── 2. Générer manifest.json PWA pour iOS & Chrome ────────────────────────────

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
    { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any maskable" },
    { src: "/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png", purpose: "any maskable" },
    { src: "/assets/pwa-icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "/assets/pwa-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
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

// Nettoyer les anciens liens
html = html.replace(/<link rel="shortcut icon"[^>]*>/gi, '');
html = html.replace(/<link rel="icon"[^>]*>/gi, '');
html = html.replace(/<link rel="apple-touch-icon"[^>]*>/gi, '');
html = html.replace(/<link rel="apple-touch-icon-precomposed"[^>]*>/gi, '');

const iosTags = `
    <!-- Icônes iOS Safari Écran d'accueil Officiel -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
    <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/apple-touch-icon-180x180-precomposed.png" />
    <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />

    <!-- Favicon & PWA -->
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="manifest" href="/manifest.json" />

    <!-- Meta iOS PWA Web App -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Ma Liste" />

    <!-- Styling anti-zoom et harmonisation de la police -->
    <style>
      input, textarea, select, button {
        font-size: 16px !important;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif !important;
        touch-action: manipulation;
      }
    </style>`;

html = html.replace('</head>', iosTags + '\n  </head>');

fs.writeFileSync(indexPath, html);
console.log('✅  dist/index.html patché avec toutes les balises iOS Safari officielles !');
console.log('\n🚀 Post-build terminé avec succès !');
