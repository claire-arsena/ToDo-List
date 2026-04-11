import { ETATS } from './config/constants';

export const COLORS = {
  pinkLight: '#ffd5df',
  pinkDark: '#ff66b3',
  pinkMid: '#ffb3d9',
  statusNew: '#9ac1ff',
  statusProgress: '#ffc87b',
  statusDone: '#aaffaa',
  statusWaiting: '#ffa2f4',
  statusCancelled: '#b64747',
  glassBg: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.65)',
  text: '#333',
  textLight: '#555',
  textMuted: '#888',
  white: '#fff',
  danger: '#e74c3c',
  gradientStart: '#ffd5df',
  gradientEnd: '#ffb3d9',
  chipActive: '#ff66b3',
  chipActiveBorder: '#ff3399',
};

export const STATUS_COLORS = {
  [ETATS.NOUVEAU]: COLORS.statusNew,
  [ETATS.EN_COURS]: COLORS.statusProgress,
  [ETATS.REUSSI]: COLORS.statusDone,
  [ETATS.EN_ATTENTE]: COLORS.statusWaiting,
  [ETATS.ABANDONNE]: COLORS.statusCancelled,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const GLASS = {
  backgroundColor: COLORS.glassBg,
  borderWidth: 1.5,
  borderColor: COLORS.glassBorder,
  borderRadius: 16,
  ...SHADOWS.card,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
