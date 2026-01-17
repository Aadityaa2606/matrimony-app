// App theme colors
export const Colors = {
  // Primary colors - Deep rose/maroon for matrimony theme
  primary: '#C41E3A',
  primaryLight: '#E85A71',
  primaryDark: '#8B0000',
  
  // Secondary colors - Gold accents
  secondary: '#D4AF37',
  secondaryLight: '#F4CF67',
  secondaryDark: '#A48B27',
  
  // Accent colors
  accent: '#FF6B6B',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  background: '#FFF9F5',
  surface: '#FFFFFF',
  
  // Gray scale
  gray100: '#F7F7F7',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  // Semantic colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Text colors
  textPrimary: '#1F1F1F',
  textSecondary: '#525252',
  textLight: '#737373',
  textWhite: '#FFFFFF',
  
  // Border colors
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Font sizes
export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  h3: 24,
  h2: 28,
  h1: 32,
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
