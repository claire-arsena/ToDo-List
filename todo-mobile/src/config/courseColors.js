// Palette catégorielle vive, une couleur par "code" de cours (ex: "S5.A&B.01",
// "R5.A.L1"...) pour que toutes les séances d'un même cours (CM/TD/TP) restent
// visuellement regroupées dans la vue Planning semaine, comme sur l'export ADE.
const COURSE_PALETTE = [
  '#7c6df2', // violet
  '#2ea6ff', // bleu
  '#1fc7b6', // turquoise
  '#3ecf5f', // vert
  '#ff9f43', // orange
  '#ff5c7a', // corail
  '#e854c9', // magenta
  '#5b6bd8', // indigo
  '#f0c419', // ambre
  '#22b0a3', // sarcelle
];

// Extrait le "code" de cours en tête du titre (ex: "S5.A&B.01" dans
// "S5.A&B.01 Autonomie IUT GA1") pour regrouper les différentes séances
// (CM/TD/TP) d'un même cours sous une seule couleur. À défaut, le titre
// complet sert de clé.
function getCourseKey(title) {
  if (!title) return '';
  const match = title.match(/^[A-Z0-9]+(?:[.&][A-Z0-9]+)*/);
  return (match ? match[0] : title).trim();
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCourseColor(title) {
  const key = getCourseKey(title);
  const index = hashString(key) % COURSE_PALETTE.length;
  return COURSE_PALETTE[index];
}

// Titre sans le code de cours en tête (déjà porté par la couleur du bloc),
// pour laisser plus de place à la partie utile du titre dans les colonnes
// étroites de la vue semaine.
export function getDisplayTitle(title) {
  if (!title) return '';
  const key = getCourseKey(title);
  if (key && title.startsWith(key)) {
    const rest = title.slice(key.length).trim();
    return rest || title;
  }
  return title;
}
