import { ETATS } from './config/constants';

export const COLORS = {
  pinkLight:       '#ffd5df',
  pinkMid:         '#ffb3d9',
  pinkDark:        '#ff66b3',
  red:             '#ff5c5c',
  redDark:         '#e60000',
  statusNew:       '#9ac1ff',
  statusProgress:  '#ffc87b',
  statusDone:      '#aaffaa',
  statusWaiting:   '#ffa2f4',
  statusCancelled: '#b64747',
  glassBg:         'rgba(255, 255, 255, 0.5)',
  glassBorder:     'rgba(255, 255, 255, 0.6)',
  text:            '#262626',
  textLight:       '#555',
  textMuted:       '#888',
  white:           '#ffffff',
  danger:          '#e74c3c',
};

export const STATUS_COLORS = {
  [ETATS.NOUVEAU]:    COLORS.statusNew,
  [ETATS.EN_COURS]:   COLORS.statusProgress,
  [ETATS.REUSSI]:     COLORS.statusDone,
  [ETATS.EN_ATTENTE]: COLORS.statusWaiting,
  [ETATS.ABANDONNE]:  COLORS.statusCancelled,
};

// Ombre glassmorphism identique au web : 0 16px 48px 0 rgba(255,102,179,0.25)
export const SHADOWS = {
  glass: {
    shadowColor: '#ff66b3',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 48,
    elevation: 8,
  },
  addBtn: {
    shadowColor: '#ff66b3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const GLASS = {
  backgroundColor: COLORS.glassBg,
  borderWidth: 1.5,
  borderColor: COLORS.glassBorder,
  borderRadius: 16,
  ...SHADOWS.glass,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};
