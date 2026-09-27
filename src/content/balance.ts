/** Every tunable number lives here. Values match "Uzun Oyun Tasarım Planı (v2)". */
export const BALANCE = {
  milestones: [25, 50, 100, 200, 300, 400, 500],
  milestoneMult: 2,

  upgradeCount: 30,
  upgradeFirstCost: 5_000,
  upgradeCostStep: 10,
  upgradeMult: 3,

  clickBase: 1,
  clickIncomePct: 0.02,

  // Devir (prestige): ün = floor(k * (lifetime / L0)^exp); +bonus per ün
  unK: 20,
  unL0: 3e9,
  unExp: 1 / 3,
  unBonus: 0.05,

  // Skills (Melvor XP curve)
  skillMaxLevel: 99,
  firinXpPerTier: 0.2, // XP/s × (highest owned tier + 1)
  satisXpPerTier: 0.2,
  hamurXpPerClick: 3,
  skillBonusPerLevel: 0.01,
  hamurClickBonusPerLevel: 0.02,

  // Offline
  offlineEfficiency: 0.5,
  offlineEfficiencyMax: 0.7,
  offlineCapHours: 4,
  offlineCapHoursMax: 12,
  offlineModalMinSeconds: 60,
  offlineXpEfficiency: 0.5,

  // Districts
  markaPerDistrict: 0.1,

  // Kalabalık (crowd)
  crowdPerClick: 0.05,
  crowdDecayPerSecond: 1 / 30,
  crowdMax: 0.5, // production × (1 + crowd)

  // Orders
  orderSlots: 3,
  orderRewardFactor: 0.3, // reward = income at start × duration × factor
};
