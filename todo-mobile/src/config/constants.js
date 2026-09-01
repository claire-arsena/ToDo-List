export const ETATS = {
  NOUVEAU: 'Nouveau',
  EN_COURS: 'En cours',
  REUSSI: 'Réussi',
  EN_ATTENTE: 'En attente',
  ABANDONNE: 'Abandonné',
};

export const ETAT_TERMINE = [
  ETATS.REUSSI,
  ETATS.ABANDONNE,
];

// Largeur à partir de laquelle le web bascule en mise en page "PC"
// (Planning en vue semaine au lieu de la timeline jour par jour mobile).
export const DESKTOP_BREAKPOINT = 900;

export const FOLDER_COLORS = [
  '#d81b60', // iOS Deep Pink
  '#34c759', // iOS Green
  '#af52de', // iOS Purple
  '#ff9500', // iOS Orange
  '#ff3b30', // iOS Red
  '#ff66b3', // Rose Bonbon
  '#00c7be', // iOS Teal
  '#ffcc00', // iOS Yellow
  '#e84393', // Magenta
  '#30b0c7', // Cyan iOS
  '#5856d6', // Indigo iOS
  '#fd79a8', // Rose Pastel
  '#00b894', // Vert Menthe
  '#fdcb6e', // Or Doux
];

export const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const normalizeDateStr = (rawDate) => {
  if (!rawDate) return '';
  if (typeof rawDate !== 'string') return '';
  const trimmed = rawDate.trim();
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  if (trimmed.includes('T')) {
    return trimmed.split('T')[0];
  }
  return trimmed;
};

export const isTaskOverdue = (task) => {
  if (!task) return false;
  const isTerminated = task.status === ETATS.REUSSI || task.status === ETATS.ABANDONNE;
  if (isTerminated) return false;

  const targetDate = normalizeDateStr(task.endDate || task.dueDate || task.startDate);
  if (!targetDate) return false;

  return targetDate < getTodayStr();
};
