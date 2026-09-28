import { ACHIEVEMENTS, type AchievementHelpers } from "../content/achievements";
import { FEATURES, type FeatureFlags } from "../content/features";
import { TIERS } from "../content/tiers";
import { masteryLevel, skillLevel, unlockedDistricts } from "./derive";
import { clone, type GameState } from "./state";

function helpers(s: GameState, f: FeatureFlags): AchievementHelpers {
  return {
    skillLevel: (id) => skillLevel(s, id, f),
    maxMastery: () => Math.max(...TIERS.map((t) => masteryLevel(s, t.id, f))),
    totalDevirs: () => s.stats.devirsTotal,
    anyOwned: (tier) => unlockedDistricts(s, f).some((id) => s.districts[id].owned[tier] > 0),
  };
}

/** Returns the same object when nothing new unlocked (cheap to call every tick). */
export function checkAchievements(state: GameState, f: FeatureFlags = FEATURES): { state: GameState; unlocked: string[] } {
  if (!f.achievements) return { state, unlocked: [] };
  const h = helpers(state, f);
  const have = new Set(state.achievements);
  const fresh = ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.check(state, h)).map((a) => a.id);
  if (!fresh.length) return { state, unlocked: [] };
  const s = clone(state);
  s.achievements = [...s.achievements, ...fresh];
  return { state: s, unlocked: fresh };
}
