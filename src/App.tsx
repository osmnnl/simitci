import { DISTRICTS_BY_ID } from "./content/districts";
import { FEATURES } from "./content/features";
import { useGameLoop } from "./loop/useGameLoop";
import { useGame } from "./store/gameStore";
import { AchievementsPanel } from "./ui/AchievementsPanel";
import { ClickerPanel } from "./ui/ClickerPanel";
import { DistrictTabs } from "./ui/DistrictTabs";
import { EventBanner } from "./ui/EventBanner";
import { MasteryPanel } from "./ui/MasteryPanel";
import { MobileShell } from "./ui/MobileShell";
import { OfflineModal } from "./ui/OfflineModal";
import { OrdersPanel } from "./ui/OrdersPanel";
import { SaveControls } from "./ui/SaveControls";
import { SkillsPanel } from "./ui/SkillsPanel";
import { TierList } from "./ui/TierList";
import { Toasts } from "./ui/Toasts";
import { UpgradePanel } from "./ui/UpgradePanel";
import { useMediaQuery } from "./ui/useMediaQuery";
import "./App.css";

function DesktopShell() {
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
          {FEATURES.mastery && <MasteryPanel />}
          {FEATURES.achievements && <AchievementsPanel />}
        </div>
      </main>
      <footer className="foot"><SaveControls /></footer>
    </div>
  );
}

export default function App() {
  useGameLoop();
  const mobile = useMediaQuery("(max-width: 759px)");
  return (
    <>
      {mobile && FEATURES.mobileShell ? <MobileShell /> : <DesktopShell />}
      <EventBanner />
      <Toasts />
      <OfflineModal />
    </>
  );
}
