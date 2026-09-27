import { DISTRICTS_BY_ID } from "./content/districts";
import { FEATURES } from "./content/features";
import { useGameLoop } from "./loop/useGameLoop";
import { useGame } from "./store/gameStore";
import { ClickerPanel } from "./ui/ClickerPanel";
import { DistrictTabs } from "./ui/DistrictTabs";
import { OfflineModal } from "./ui/OfflineModal";
import { OrdersPanel } from "./ui/OrdersPanel";
import { SaveControls } from "./ui/SaveControls";
import { SkillsPanel } from "./ui/SkillsPanel";
import { TierList } from "./ui/TierList";
import { UpgradePanel } from "./ui/UpgradePanel";
import "./App.css";

export default function App() {
  useGameLoop();
  const active = useGame((s) => s.game.active);
  const def = DISTRICTS_BY_ID[active];
  return (
    <div className="shell">
      <header className="top">
        <div>
          <h1>Simitçi</h1>
          <p className="muted">{def.name} · {def.tagline}</p>
        </div>
      </header>
      {FEATURES.districts && <DistrictTabs />}
      <main className="grid">
        <ClickerPanel />
        <TierList />
        <div className="side">
          <UpgradePanel />
          {FEATURES.orders && <OrdersPanel />}
          {FEATURES.skills && <SkillsPanel />}
        </div>
      </main>
      <footer className="foot"><SaveControls /></footer>
      <OfflineModal />
    </div>
  );
}
