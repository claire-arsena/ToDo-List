import { ETATS } from './config/constants';

export const COLORS = {
  // iOS Deep Pink Theme (Remplacement du bleu Apple #007AFF par le rose foncé iOS #d81b60)
  pinkLight:       '#fce4ec',
  pinkMid:         '#f8bbd0',
  pinkDark:        '#d81b60', // iOS Deep Pink Principal
  pinkDeep:        '#c2185b', // Accent presse / gradient
  pinkTint:        'rgba(216, 27, 96, 0.12)',

  red:             '#ff3b30', // Red iOS
  redDark:         '#c62828',

  // Couleurs de statuts iOS
  statusNew:       '#d81b60', // Nouveau = Pink iOS
  statusProgress:  '#ff9500', // Orange iOS
  statusDone:      '#34c759', // Green iOS
  statusWaiting:   '#af52de', // Purple iOS
  statusCancelled: '#8e8e93', // Muted iOS

  // iOS System Colors
  iosBg:           '#f2f2f7',
  iosCard:         'rgba(255, 255, 255, 0.88)',
  iosCardSolid:    '#ffffff',
  iosBorder:       'rgba(60, 60, 67, 0.12)',
  iosGlassBorder:  'rgba(255, 255, 255, 0.8)',

  // Typographie iOS
  text:            '#000000',
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

// Ombre iOS douce et raffinée
export const SHADOWS = {
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  addBtn: {
    shadowColor: '#d81b60',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const GLASS = {
  backgroundColor: COLORS.iosCard,
  borderWidth: 0.5,
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
