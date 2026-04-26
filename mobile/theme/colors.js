// Uygulama geneli renk ve stil sabitleri
export const COLORS = {
  // Ana renkler — Web ile uyumlu "Midnight Glow" paleti
  bg: '#0f0f1a',
  bgCard: '#1a1a2e',
  bgCardHover: '#252540',
  border: '#2a2a4a',
  accent: '#6366f1',        // indigo
  accentLight: '#818cf8',
  accentGlow: 'rgba(99,102,241,0.15)',
  success: '#10b981',       // green
  warning: '#f59e0b',       // amber
  danger: '#ef4444',        // red
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#475569',

  // Öncelik renkleri
  priorityHigh: '#ef4444',
  priorityMedium: '#f59e0b',
  priorityLow: '#10b981',

  // Durum renkleri
  statusTodo: '#6366f1',
  statusInProgress: '#f59e0b',
  statusDone: '#10b981',
};

export const FONTS = {
  regular: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const SHADOW = {
  card: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};
