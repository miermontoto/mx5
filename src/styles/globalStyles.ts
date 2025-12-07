import { StyleSheet, Platform } from 'react-native';
import { FONTS, FONT_WEIGHTS, TEXT_STYLES } from '../constants/fonts';
import { COLORS } from '../constants';

export const globalTextStyles = StyleSheet.create({
  // Base text style with anti-aliasing
  text: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    ...TEXT_STYLES.webTextStyle,
  },
  
  // Headings
  h1: {
    fontFamily: FONTS.light,
    fontSize: 32,
    fontWeight: FONT_WEIGHTS.light,
    letterSpacing: -1,
    color: COLORS.text,
    ...TEXT_STYLES.webTextStyle,
  },
  
  h2: {
    fontFamily: FONTS.regular,
    fontSize: 24,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: -0.5,
    color: COLORS.text,
    ...TEXT_STYLES.webTextStyle,
  },
  
  h3: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    ...TEXT_STYLES.webTextStyle,
  },
  
  // Body text
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 24,
    color: COLORS.text,
    ...TEXT_STYLES.webTextStyle,
  },
  
  bodySmall: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
    color: COLORS.textSecondary,
    ...TEXT_STYLES.webTextStyle,
  },
  
  // Labels
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.textSecondary,
    ...TEXT_STYLES.webTextStyle,
  },
  
  // Buttons
  button: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.text,
    ...TEXT_STYLES.webTextStyle,
  },
  
  // Numbers
  number: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      default: 'System',
    }),
    ...TEXT_STYLES.webTextStyle,
  },
});

// Function to apply global styles to web
export const applyWebStyles = () => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      body {
        font-family: ${FONTS.regular};
        background-color: ${COLORS.background};
        color: ${COLORS.text};
      }
      
      input, textarea, select {
        font-family: ${FONTS.regular};
      }
      
      /* Better number rendering */
      .tabular-nums {
        font-variant-numeric: tabular-nums;
      }
    `;
    document.head.appendChild(style);
  }
};