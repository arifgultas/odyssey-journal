/**
 * Book-inspired Design System
 * Warm, elegant colors and typography for a travel journal aesthetic
 */

export const Colors = {
  light: {
    // Primary colors
    primary: '#2C1810',      // Dark brown (main text)
    secondary: '#8B7355',    // Medium brown
    accent: '#D4A574',       // Gold/tan accent
    compass: '#4A6FA5',      // Compass/navigation color (reused for links, map markers, info)

    // Backgrounds
    background: '#F5F1E8',   // Cream/parchment
    surface: '#FFFFFF',      // White (cards)

    // Text
    text: '#2C1810',         // Dark brown text
    textSecondary: '#8B7355', // Medium brown
    textMuted: '#A89984',    // Muted brown

    // UI Elements
    border: '#E8DCC8',       // Light tan border
    divider: '#E8DCC8',

    // Status colors
    success: '#6B8E23',      // Olive green
    error: '#8B4513',        // Saddle brown
    warning: '#DAA520',      // Goldenrod
    info: '#4A6FA5',         // Teal blue (links, map markers)

    // Tab bar
    tint: '#D4A574',
    tabIconDefault: '#A89984',
    tabIconSelected: '#2C1810',

    // Vintage Map Colors (Explore page)
    parchment: '#E8DCC8',
    compassBlue: '#4A6FA5',
    goldenrod: '#DAA520',
    sepiaOverlay: '#704214',
  },
  dark: {
    // Sepia/Parchment dark mode
    primary: '#F5F1E8',
    secondary: '#D4A574',
    accent: '#DAA520',
    compass: '#6B9BD1',      // Lighter compass color for dark mode

    background: '#1A1410',
    surface: '#2C1810',

    text: '#F5F1E8',
    textSecondary: '#D4A574',
    textMuted: '#A89984',

    border: '#3D2F20',
    divider: '#3D2F20',

    success: '#8FBC8F',
    error: '#CD853F',
    warning: '#F0E68C',
    info: '#6B9BD1',         // Lighter teal for dark mode

    tint: '#D4A574',
    tabIconDefault: '#8B7355',
    tabIconSelected: '#F5F1E8',

    // Vintage Map Colors (Explore page)
    parchment: '#3D2F20',
    compassBlue: '#6B9BD1',
    goldenrod: '#F0E68C',
    sepiaOverlay: '#1A1410',
  },
};

export const Typography = {
  // Font families
  fonts: {
    heading: 'PlayfairDisplay-Bold',
    headingBlack: 'PlayfairDisplay-Black',
    body: 'Lora-Regular',
    bodyBold: 'Lora-Bold',
    bodyItalic: 'Lora-Italic',
    accent: 'Merriweather-Regular',
    accentBold: 'Merriweather-Bold',
    ui: 'Inter-Regular',
    uiBold: 'Inter-Bold',
    // Handwriting font for polaroid captions
    handwriting: 'Caveat-Regular',
    handwritingBold: 'Caveat-Bold',
    // Ephesis script font for brand title
    brandTitle: 'Ephesis-Regular',
  },

  // Font sizes with line heights
  sizes: {
    display: { fontSize: 48, lineHeight: 56, letterSpacing: -0.96 },
    h1: { fontSize: 36, lineHeight: 44, letterSpacing: -0.36 },
    h2: { fontSize: 28, lineHeight: 36, letterSpacing: 0 },
    h3: { fontSize: 24, lineHeight: 32, letterSpacing: 0 },
    bodyLg: { fontSize: 18, lineHeight: 28, letterSpacing: 0.18 },
    body: { fontSize: 16, lineHeight: 26, letterSpacing: 0.16 },
    bodySm: { fontSize: 14, lineHeight: 22, letterSpacing: 0 },
    caption: { fontSize: 12, lineHeight: 18, letterSpacing: 0.24 },
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Font shortcuts for convenience
export const Fonts = {
  heading: Typography.fonts.heading,
  headingBlack: Typography.fonts.headingBlack,
  body: Typography.fonts.body,
  bodyBold: Typography.fonts.bodyBold,
  bodyItalic: Typography.fonts.bodyItalic,
  accent: Typography.fonts.accent,
  accentBold: Typography.fonts.accentBold,
  ui: Typography.fonts.ui,
  uiBold: Typography.fonts.uiBold,
  rounded: Typography.fonts.heading, // Using heading font for rounded
  mono: 'Courier', // Monospace font
};
