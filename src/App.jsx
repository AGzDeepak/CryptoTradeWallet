import React from 'react';
import { CryptoProvider, useCrypto } from './context/CryptoContext';
import { BackgroundParticles } from './components/BackgroundParticles';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AutoTraderBar } from './components/AutoTraderBar';
import { TotalAssetsHero } from './components/TotalAssetsHero';
import { OperationSwapTool } from './components/OperationSwapTool';
import { LiveChart } from './components/LiveChart';
import { TransactionsWidget } from './components/TransactionsWidget';
import { ArbitragePanel } from './components/ArbitragePanel';
import { AiStrategyPanel } from './components/AiStrategyPanel';
import { PaperTradingPanel } from './components/PaperTradingPanel';
import { LivePositions } from './components/LivePositions';
import { TradeHistory } from './components/TradeHistory';
import { MarketScanner } from './components/MarketScanner';
import { ExchangeStatus } from './components/ExchangeStatus';
import { AnalyticsSection } from './components/AnalyticsSection';
import { SettingsModal } from './components/SettingsModal';
import { GlobalModals } from './components/GlobalModals';

const DashboardContent = () => {
  const { activeTab } = useCrypto();

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar smooth-scroll-container bg-[#0b1120]">
      <div className="max-w-[1700px] mx-auto space-y-6">
        
        {/* Master Bot & Stimulation Control Header Bar */}
        <AutoTraderBar />

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: LEFT WORKSPACE (35% Width - Account, Balance & Execution) */}
            <div className="lg:col-span-4 space-y-6">
              <TotalAssetsHero />
              <OperationSwapTool />
              <PaperTradingPanel />
            </div>

            {/* COLUMN 2: CENTER WORKSPACE (45% Width - Charts, Scanner & Positions) */}
            <div className="lg:col-span-5 space-y-6">
              <LiveChart />
              <ArbitragePanel />
              <LivePositions />
            </div>

            {/* COLUMN 3: RIGHT WORKSPACE (20% Width - Audit Ledger, Strategies & Health) */}
            <div className="lg:col-span-3 space-y-6">
              <AiStrategyPanel />
              <TransactionsWidget />
              <ExchangeStatus />
            </div>

          </div>
        )}

        {activeTab === 'markets' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 space-y-6">
              <LiveChart />
              <ArbitragePanel />
            </div>
            <div className="xl:col-span-1 space-y-6">
              <TotalAssetsHero />
              <OperationSwapTool />
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <MarketScanner />
            <ArbitragePanel />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 space-y-6">
              <TotalAssetsHero />
              <LivePositions />
            </div>
            <div className="xl:col-span-1 space-y-6">
              <PaperTradingPanel />
            </div>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="space-y-6">
            <TradeHistory />
            <TransactionsWidget />
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <AiStrategyPanel />
            </div>
            <div className="xl:col-span-1">
              <OperationSwapTool />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AnalyticsSection />
            <LiveChart />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <TradeHistory />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <SettingsModal />
          </div>
        )}

      </div>
    </main>
  );
};

const MainLayout = () => {
  const { isAuthenticated } = useCrypto();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="h-screen w-screen bg-[#0b1120] text-slate-100 flex overflow-hidden font-sans selection:bg-[#2dd4bf] selection:text-black relative">
      {/* Background Canvas */}
      <BackgroundParticles />

      {/* Outer Shell Frame */}
      <div className="w-full h-full flex overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Right Main Container (Header + Dashboard Body) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          <Header />
          <DashboardContent />
        </div>
      </div>

      {/* Global Modals */}
      <GlobalModals />
    </div>
  );
};

export default function App() {
  return (
    <CryptoProvider>
      <MainLayout />
    </CryptoProvider>
  );
}
