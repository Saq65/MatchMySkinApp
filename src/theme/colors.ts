// Matched from matchmyskin.roopsee.com: cream background, near-black text,
// magenta/pink accent, lavender secondary panel, sage green for active pills.
export const lightColors = {
  background: '#F7F1E6',
  surface: '#FFFFFF',
  border: '#DDD3C2',
  text: '#1A1A1A',
  textMuted: '#736C60',
  primary: '#D6178A',
  primaryDark: '#AD1370',
  primarySoft: '#F6D9EC',
  selectedBorder: '#1A1A1A',
  progressTrack: '#E4DACA',
  tabInactive: '#B0A796',
  danger: '#C0392B',
  star: '#F2B84B',
  lavender: '#E4D7E8',
  sage: '#A9C0A0',
  scoreGreat: '#5BA35B',
  scoreGood: '#E0A83C',
  scoreFair: '#D98A4A',
  scoreCaution: '#C0392B',
};

export type ThemeColors = typeof lightColors;

// Same warm brand identity as the light palette, inverted rather than a
// generic cold black -- the accent is brightened slightly for contrast.
export const darkColors: ThemeColors = {
  background: '#15100D',
  surface: '#211B17',
  border: '#3A322B',
  text: '#F3ECE2',
  textMuted: '#B8AFA1',
  primary: '#F04FA8',
  primaryDark: '#D6178A',
  primarySoft: '#3D1F30',
  selectedBorder: '#F3ECE2',
  progressTrack: '#3A322B',
  tabInactive: '#7A7267',
  danger: '#E05A48',
  star: '#F2B84B',
  lavender: '#332B3A',
  sage: '#4C5D46',
  scoreGreat: '#6FC26F',
  scoreGood: '#E0A83C',
  scoreFair: '#D98A4A',
  scoreCaution: '#E05A48',
};

// Legacy alias -- still used by any file not yet swept onto useTheme().
export const colors = lightColors;
