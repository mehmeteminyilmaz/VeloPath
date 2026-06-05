export const ACCENT_COLORS = [
  { name: 'Indigo',   value: '#6366f1' },
  { name: 'Violet',   value: '#8b5cf6' },
  { name: 'Pink',     value: '#ec4899' },
  { name: 'Rose',     value: '#f43f5e' },
  { name: 'Orange',   value: '#f97316' },
  { name: 'Amber',    value: '#f59e0b' },
  { name: 'Emerald',  value: '#10b981' },
  { name: 'Cyan',     value: '#06b6d4' },
  { name: 'Sky',      value: '#0ea5e9' },
];

export const THEMES = {
  dark: {
    bg: '#060b18',
    bgCard: 'rgba(30, 41, 59, 0.75)',
    bgCardHover: '#1e293b',
    border: 'rgba(255, 255, 255, 0.08)',
    accent: '#6366f1',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  light: {
    bg: '#f0f4ff',
    bgCard: 'rgba(255, 255, 255, 0.75)',
    bgCardHover: '#e2e8f0',
    border: 'rgba(0, 0, 0, 0.06)',
    accent: '#4f46e5',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    danger: '#dc2626',
    success: '#059669',
    warning: '#d97706',
  }
};


// Geriye dönük uyumluluk için varsayılan COLORS (Koyu Tema)
export const COLORS = THEMES.dark;

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
