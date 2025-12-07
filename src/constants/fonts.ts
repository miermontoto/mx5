import { Platform } from 'react-native';

// Font family constants with web-safe fallbacks
export const FONTS = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
  semiBold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
  light: Platform.select({
    ios: 'System',
    android: 'Roboto-Light',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
};

// Font weight constants that work across platforms
export const FONT_WEIGHTS = {
  light: Platform.select({
    ios: '300',
    android: '300',
    web: '300',
    default: '300',
  }) as '300',
  regular: Platform.select({
    ios: '400',
    android: '400',
    web: '400',
    default: '400',
  }) as '400',
  medium: Platform.select({
    ios: '500',
    android: '500',
    web: '500',
    default: '500',
  }) as '500',
  semiBold: Platform.select({
    ios: '600',
    android: '600',
    web: '600',
    default: '600',
  }) as '600',
  bold: Platform.select({
    ios: '700',
    android: '700',
    web: '700',
    default: '700',
  }) as '700',
};

// Global text styles to ensure consistent rendering
export const TEXT_STYLES = {
  // Anti-aliasing for web
  webTextStyle: Platform.select({
    web: {
      WebkitFontSmoothing: 'antialiased' as any,
      MozOsxFontSmoothing: 'grayscale' as any,
    },
    default: {},
  }),
};