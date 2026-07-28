import { ETATS } from './config/constants';

export const COLORS = {
  // iOS Deep Pink Theme (Pas de blanc pur, fond casse doux)
  pinkLight:       '#fce4ec',
  pinkMid:         '#f8bbd0',
  pinkDark:        '#d81b60', // iOS Deep Pink Principal
  pinkDeep:        '#c2185b', // Accent presse / gradient
  pinkTint:        'rgba(216, 27, 96, 0.12)',

  red:             '#ff3b30', // Red iOS
  redDark:         '#c62828',

  // Couleurs de statuts iOS
  statusNew:       '#d81b60',
  statusProgress:  '#ff9500',
  statusDone:      '#34c759',
  statusWaiting:   '#af52de',
  statusCancelled: '#8e8e93',

  // iOS System Colors (Off-white / Blanc casse)
  iosBg:           '#f0f1f5',
  iosCard:         '#f8f9fc', // Blanc cassé doux (pas de blanc pur)
  iosCardSolid:    '#f7f8fb',
  iosBorder:       'rgba(0, 0, 0, 0.08)',
  iosGlassBorder:  'rgba(0, 0, 0, 0.08)',

  // Typographie iOS
  text:            '#1c1c1e',
  textLight:       '#3c3c43',
  textMuted:       '#8e8e93',
  white:           '#ffffff',
  danger:          '#ff3b30',
};

export const STATUS_COLORS = {
  [ETATS.NOUVEAU]:    COLORS.statusNew,
  [ETATS.EN_COURS]:   COLORS.statusProgress,
  [ETATS.REUSSI]:     COLORS.statusDone,
  [ETATS.EN_ATTENTE]: COLORS.statusWaiting,
  [ETATS.ABANDONNE]:  COLORS.statusCancelled,
};

// Ombres iOS prononcées et douces
export const SHADOWS = {
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  addBtn: {
    shadowColor: '#d81b60',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
};

export const GLASS = {
  backgroundColor: COLORS.iosCard,
  borderWidth: 1,
  borderColor: COLORS.iosBorder,
  borderRadius: 20,
  ...SHADOWS.glass,
};

export const RADIUS = {
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  full: 999,
};
