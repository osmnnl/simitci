// Prints a human-readable balance report; run with: npx vitest run src/sim/report.test.ts
import { it } from "vitest";
import { simulate, fmtTime } from "./player";
import { TIERS } from "../content/tiers";

const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
const ALL = { devir: true, skills: true, districts: true, orders: true, crowd: true, mastery: true, events: true, achievements: true, mobileShell: false };
it.skipIf(!env.REPORT)("balance report", () => {
  const r = simulate(Number(env.DAYS ?? 30), ALL);
  for (const [d, ft] of Object.entries(r.firstTier)) {
    console.log(d, Object.entries(ft!).map(([i, t]) => `${TIERS[+i].name} ${fmtTime(t)}`).join(", "));
  }
  console.log("unlocks", Object.entries(r.unlocks).map(([d, t]) => `${d} ${fmtTime(t!)}`).join(", "));
  console.log("devirs", r.devirs.length, r.devirs.slice(0, 4).map((x) => `${x.district}@${fmtTime(x.t)}→${x.un}`).join(" "));
  console.log("korkuteli ün", r.state.districts.korkuteli.un, "skillXp", JSON.stringify(r.state.skillsXp));
});
