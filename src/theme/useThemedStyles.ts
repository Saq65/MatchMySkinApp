import { useMemo } from 'react';
import type { ThemeColors } from './colors';

// Recomputes StyleSheet objects only when the active palette changes, so
// components can define `const createStyles = (colors) => StyleSheet.create({...})`
// at module scope and stay reactive to theme switches. Takes `colors` from the
// caller's own useTheme() call rather than reading context itself, since
// components almost always need `colors` directly too (icon props, inline
// styles) and shouldn't read the theme context twice.
export function useThemedStyles<T>(colors: ThemeColors, factory: (colors: ThemeColors) => T): T {
  return useMemo(() => factory(colors), [colors, factory]);
}
