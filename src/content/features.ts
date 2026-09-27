/**
 * Phase switches. Each roadmap phase ships by flipping its flag, so a phase
 * can be released (or rolled back) without touching engine code.
 */
export const FEATURES = {
  devir: true, // Faz 2
  skills: true, // Faz 3
  districts: true, // Faz 4
  orders: false, // Faz 5
  crowd: false, // Faz 5
};
export type FeatureFlags = typeof FEATURES;
