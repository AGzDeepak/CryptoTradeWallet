import React from 'react';
import { CryptoProvider, useCrypto } from './context/CryptoContext';
import { BackgroundParticles } from './components/BackgroundParticles';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GlobalTickerBar } from './components/GlobalTickerBar';
import { WatchlistPanel } from './components/WatchlistPanel';
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
    <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar smooth-scroll-container bg-[#07090e]">
      <div className="max-w-[1750px] mx-auto space-y-6">
        
        {/* Row 1: Master Bot Autopilot & Stimulation Command Deck (Full Width) */}
        <AutoTraderBar />

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Row 2: Live Candlestick Chart (Left 50%) & Total Assets Hero (Right 50%) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
              <LiveChart />
              <TotalAssetsHero />
            </div>

            {/* Row 3: Spatial Arbitrage Matrix (Left 50%) & Manual Swap Terminal (Right 50%) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
              <ArbitragePanel />
              <OperationSwapTool />
            </div>

            {/* Row 4: Watchlist & Depth (Left 50%) & AI Bot Strategies (Right 50%) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
              <WatchlistPanel />
              <AiStrategyPanel />
            </div>

            {/* Row 5: Live Open Positions (Left 50%) & Paper Trading / Exchange Status (Right 50%) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <LivePositions />
              <div className="space-y-6">
                <PaperTradingPanel />
                <ExchangeStatus />
              </div>
            </div>

            {/* Row 6: Quantitative Trade Audit Log Ledger (Full Width) */}
            <TradeHistory />

          </div>
        )}

        {activeTab === 'markets' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <LiveChart />
              <ArbitragePanel />
            </div>
            <div className="space-y-6">
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <TotalAssetsHero />
              <LivePositions />
            </div>
            <div className="space-y-6">
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-6">
              <AiStrategyPanel />
            </div>
            <div className="space-y-6">
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
    <div className="h-screen w-screen bg-[#07090e] text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-teal-400 selection:text-black relative">
      {/* Background Canvas */}
      <BackgroundParticles />

      {/* Top Global Live Ticker Bar */}
      <GlobalTickerBar />

      {/* Outer Shell Frame */}
      <div className="flex-1 flex overflow-hidden relative z-10">
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
