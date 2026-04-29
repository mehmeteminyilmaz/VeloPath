// Uygulama geneli renk ve stil sabitleri
export const THEMES = {
  dark: {
    bg: '#0f0f1a',
    bgCard: '#1a1a2e',
    bgCardHover: '#252540',
    border: '#2a2a4a',
    accent: '#6366f1',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  light: {
    bg: '#f8fafc',
    bgCard: '#ffffff',
    bgCardHover: '#f1f5f9',
    border: '#e2e8f0',
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
