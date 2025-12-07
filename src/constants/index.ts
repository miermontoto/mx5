export * from './fonts';

export const YEARLY_LIMIT = 10000;

export const COLORS = {
  // Base colors
  background: "#050505",
  backgroundSecondary: "#0A0A0A",
  surface: "#0F0F0F",
  surfaceLight: "#1A1A1A",
  surfaceElevated: "#1F1F1F",
  text: "#FFFFFF",
  textSecondary: "#999999",
  textTertiary: "#666666",
  border: "#222222",
  borderLight: "#333333",

  // Brand colors
  primary: "#CC0000",
  primaryDark: "#990000",
  primaryLight: "#FF0000",
  primaryGlow: "#CC000020",

  // Status colors with better contrast
  excellent: "#00E676",
  good: "#66BB6A",
  neutral: "#FFA726",
  warning: "#FF7043",
  danger: "#FF5252",
  error: "#FF5252",

  // Gradients
  gradientStart: "#CC0000",
  gradientEnd: "#FF0000",
  gradientAccent: "#FF3333",
  
  // Dark gradients for backgrounds
  darkGradientStart: "#0A0A0A",
  darkGradientEnd: "#1A1A1A",
  
  // Mesh gradient colors
  meshColor1: "#CC000010",
  meshColor2: "#FF000008",
  meshColor3: "#FF333305",

  // Glass effect
  glass: "rgba(255, 255, 255, 0.05)",
  glassLight: "rgba(255, 255, 255, 0.1)",
  glassBorder: "rgba(255, 255, 255, 0.15)",
  glassDark: "rgba(0, 0, 0, 0.3)",
  
  // Shadows
  shadowPrimary: "#CC0000",
  shadowDark: "#000000",
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glow: {
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};
