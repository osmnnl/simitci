import { useState } from "react";
import { FEATURES } from "../content/features";
import { onlineIncome } from "../engine/derive";
import { useGame } from "../store/gameStore";
import { AchievementsPanel } from "./AchievementsPanel";
import { tabBadges } from "./badges";
import { ClickerPanel, DevirBox } from "./ClickerPanel";
import { DistrictTabs } from "./DistrictTabs";
import { MasteryPanel } from "./MasteryPanel";
import { OrdersPanel } from "./OrdersPanel";
import { SaveControls } from "./SaveControls";
import { SkillsPanel } from "./SkillsPanel";
import { TierList } from "./TierList";
import { UpgradePanel } from "./UpgradePanel";
import { money } from "./format";
import { NavIcon } from "./NavIcon";
import { QuickBuy } from "./QuickBuy";

type Tab = "dukkan" | "uretim" | "siparis" | "ustalik" | "basarim";

const TABS: { id: Tab; label: string; show: () => boolean }[] = [
  { id: "dukkan", label: "Dükkân", show: () => true },
  { id: "uretim", label: "Üretim", show: () => true },
  { id: "siparis", label: "Sipariş", show: () => FEATURES.orders },
  { id: "ustalik", label: "Ustalık", show: () => FEATURES.skills || FEATURES.mastery },
  { id: "basarim", label: FEATURES.achievements ? "Başarım" : "Ayarlar", show: () => true },
];

export function MobileShell() {
  const [tab, setTab] = useState<Tab>("dukkan");
  const game = useGame((s) => s.game);
  const unseen = useGame((s) => s.unseenAchievements);
  const ds = game.districts[game.active];
  const inc = onlineIncome(game, game.active);
  const badges = tabBadges(game, unseen);
  const tabs = TABS.filter((t) => t.show());

  return (
    <div className="m-shell">
      <header className="m-top">
        <div className="m-stats">
          <div>
            <span className="m-label">Kasa</span>
            <span className="m-money">{money(ds.money)}</span>
          </div>
          <div className="m-right">
            <span className="m-label">Gelir</span>
            <span className="m-rate">{money(inc)}/sn</span>
          </div>
        </div>
        {FEATURES.districts && <DistrictTabs />}
      </header>

      <main className="m-main" key={tab}>
        {tab === "dukkan" && (<><ClickerPanel compact /><QuickBuy onMore={() => setTab("uretim")} />{FEATURES.devir && <DevirBox card />}</>)}
        {tab === "uretim" && (<><UpgradePanel /><TierList /></>)}
        {tab === "siparis" && <OrdersPanel />}
        {tab === "ustalik" && (<>{FEATURES.skills && <SkillsPanel />}{FEATURES.mastery && <MasteryPanel />}</>)}
        {tab === "basarim" && (<>{FEATURES.achievements && <AchievementsPanel markSeen />}<div className="m-save"><SaveControls /></div></>)}
      </main>

      <nav className="m-nav" aria-label="Bölümler">
        {tabs.map((t) => {
          const badge = badges[t.id];
          return (
            <button key={t.id} type="button" className={"m-tab" + (tab === t.id ? " on" : "")} aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
              <span className="m-icon"><NavIcon name={t.id} /></span>
              <span className="m-tab-label">{t.label}</span>
              {badge && <span className="m-badge" aria-label={`${badge} yeni`}>{badge}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
