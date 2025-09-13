export const colors = {
  // Primary brand colors
  primary: {
    main: '#6366F1',      // Indigo-500 - Main brand color
    light: '#EEF2FF',     // Indigo-50 - Light backgrounds
    border: '#E0E7FF',    // Indigo-200 - Light borders
    indigo50: '#EEF2FF',  // Indigo-50
    indigo100: '#E0E7FF', // Indigo-100
    indigo200: '#C7D2FE', // Indigo-200
    indigo600: '#4F46E5', // Indigo-600
    indigo700: '#4338CA', // Indigo-700
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#374151',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },

  // Status colors
  status: {
    error: '#EF4444',     // Red-500
    warning: '#F59E0B',   // Amber-500
    success: '#10B981',   // Emerald-500
    info: '#3B82F6',      // Blue-500
  },

  // Green colors
  green: {
    100: '#DCFCE7',       // Green-100
    600: '#16A34A',       // Green-600
  },

  // Disabled states
  disabled: {
    background: '#D1D5DB', // Gray-300
    text: '#9CA3AF',       // Gray-400
  },

  // Shadows
  shadow: {
    default: '#000000',
  },
} as const;

// Color aliases for easier usage
export const theme = {
  background: {
    primary: colors.neutral.white,
    secondary: colors.neutral.gray50,
    disabled: colors.disabled.background,
  },
  text: {
    primary: colors.neutral.gray800,
    secondary: colors.neutral.gray500,
    disabled: colors.disabled.text,
    inverse: colors.neutral.white,
  },
  border: {
    default: colors.neutral.gray200,
    primary: colors.primary.border,
  },
  button: {
    primary: colors.primary.main,
    disabled: colors.disabled.background,
  },
  icon: {
    primary: colors.primary.main,
    default: colors.neutral.gray500,
    active: colors.primary.main,
    inactive: colors.neutral.gray500,
  },
} as const;