module.exports = {
  root: true,
  extends: '@react-native',
  // Reference-only Next.js backend route handlers dropped in for API-contract
  // reference; not part of the RN app bundle and not lintable with RN globals.
  ignorePatterns: ['src/api/**'],
};
