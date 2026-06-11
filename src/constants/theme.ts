export const Colors = {
  background: '#E8E1D9',
  surface: '#F0E9E1',
  surfacePressed: '#DDD6CE',
  border: '#C9BFB7',
  primary: '#8B1A1A',
  primaryPressed: '#6E1414',
  text: '#1A1A1A',
  textSecondary: '#6B6060',
  textMuted: '#A09090',
  placeholder: '#B8ADAD',
  white: '#FFFFFF',
  black: '#000000',
  success: '#3A9E5E',
  error: '#C43B3B',
  chartBlue: '#4A8FD4',
  progressStart: '#9B59B6',
  progressEnd: '#E91E8C',
  pausedIcon: '#9B9090',
  overlay: 'rgba(0,0,0,0.4)',
  google: '#FFFFFF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Legacy exports — kept for compatibility with existing template components
export { Colors as default };
