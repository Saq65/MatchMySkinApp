import { colors } from './colors';

export type ScoreTier = {
  label: string;
  color: string;
};

// Prefers the API's own match_label (e.g. "Excellent Match") when present,
// falling back to score thresholds only if it's missing.
export function getScoreTier(matchLabel: string | undefined, score: number): ScoreTier {
  const normalized = (matchLabel ?? '').toLowerCase();

  if (normalized.includes('excellent') || normalized.includes('great')) {
    return { label: 'Great', color: colors.scoreGreat };
  }
  if (normalized.includes('good')) {
    return { label: 'Good', color: colors.scoreGood };
  }
  if (normalized.includes('fair')) {
    return { label: 'Fair', color: colors.scoreFair };
  }
  if (normalized.includes('caution') || normalized.includes('poor')) {
    return { label: 'Caution', color: colors.scoreCaution };
  }

  if (score >= 85) return { label: 'Great', color: colors.scoreGreat };
  if (score >= 70) return { label: 'Good', color: colors.scoreGood };
  if (score >= 50) return { label: 'Fair', color: colors.scoreFair };
  return { label: 'Caution', color: colors.scoreCaution };
}
