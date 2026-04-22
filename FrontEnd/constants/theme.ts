export const lightColors = {
  background: "#FAFAF7",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textTertiary: "#9A9A9A",
  accent: "#C8965D",
  accentDark: "#A87B4A",
  accentLight: "#F5EDE3",
  danger: "#D94F4F",
  success: "#4CAF7D",
  border: "#E8E5DF",
  borderLight: "#F0EDE8",
  overlay: "rgba(0,0,0,0.45)",
  shadow: "rgba(26,26,26,0.08)",
};

export const darkColors = {
  background: "#121212",
  surface: "#1E1E1E",
  text: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textTertiary: "#717171",
  accent: "#DABB93", // slightly lighter gold for dark mode constrast
  accentDark: "#C8965D",
  accentLight: "#352A1D", // dark accent background
  danger: "#EF5350",
  success: "#66BB6A",
  border: "#333333",
  borderLight: "#2A2A2A",
  overlay: "rgba(0,0,0,0.7)",
  shadow: "rgba(0,0,0,0.5)",
};

// We temporarily export lightColors as default colors so un-refactored components don't crash before the script runs.
export const colors = lightColors;

export const fonts = {
  heading: "Outfit_700Bold",
  headingMedium: "Outfit_600SemiBold",
  headingItalic: "Outfit_500Medium",
  body: "Outfit_400Regular",
  bodyMedium: "Outfit_500Medium",
  bodySemiBold: "Outfit_600SemiBold",
  bodyBold: "Outfit_700Bold",
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 22,
  xl: 28,
  "2xl": 34,
  "3xl": 40,
  "4xl": 48,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 56,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 28,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
};

const theme = { colors, fonts, fontSize, spacing, radius, shadows };
export default theme;
