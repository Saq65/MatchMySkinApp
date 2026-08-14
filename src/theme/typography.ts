import { Platform } from 'react-native';

// Approximates roopsee.com's serif italic headings using the system serif
// typeface. Swap fontFamily for the real webfont's .ttf once it's available.
export const serifItalic = {
  fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
  fontStyle: 'italic' as const,
};
