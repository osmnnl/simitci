import { useGameLoop } from "./loop/useGameLoop";
import { ClickerPanel } from "./ui/ClickerPanel";
import { ProducerList } from "./ui/ProducerList";
import { UpgradeList } from "./ui/UpgradeList";
import { OfflineModal } from "./ui/OfflineModal";
import { SaveControls } from "./ui/SaveControls";
import "./App.css";

function App() {
  useGameLoop();

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Simitçi</h1>
        <p className="tagline">Tabladan fırın imparatorluğuna.</p>
      </header>

      <main className="app-main">
        <ClickerPanel />
        <div className="side-panels">
          <ProducerList />
          <UpgradeList />
        </div>
      </main>

      <footer className="app-footer">
        <SaveControls />
      </footer>

      <OfflineModal />
    </div>
  );
}

export default App;
