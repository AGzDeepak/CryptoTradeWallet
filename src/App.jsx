import React from 'react';
import { CryptoProvider, useCrypto } from './context/CryptoContext';
import { BackgroundParticles } from './components/BackgroundParticles';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GlobalTickerBar } from './components/GlobalTickerBar';
import { ExecutiveMetricsBar } from './components/ExecutiveMetricsBar';
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
      <div className="max-w-[1850px] mx-auto space-y-6">
        
        {/* Master Bot Autopilot Command Deck */}
        <AutoTraderBar />

        {/* Executive Real-Time Key Performance Metrics Bar */}
        <ExecutiveMetricsBar />

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Main 3-Column Wall-to-Wall Institutional Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* COLUMN 1: LEFT WATCHLIST & PAPER TRADING (3 Cols / 25% Width) */}
              <div className="lg:col-span-3 space-y-6">
                <WatchlistPanel />
                <PaperTradingPanel />
                <ExchangeStatus />
              </div>

              {/* COLUMN 2: CENTER CANDLESTICK CHART, ARBITRAGE MATRIX & POSITIONS (6 Cols / 50% Width) */}
              <div className="lg:col-span-6 space-y-6">
                <LiveChart />
                <ArbitragePanel />
                <LivePositions />
                <TransactionsWidget />
              </div>

              {/* COLUMN 3: RIGHT TOTAL ASSETS, SWAP TOOL & AI STRATEGIES (3 Cols / 25% Width) */}
              <div className="lg:col-span-3 space-y-6">
                <TotalAssetsHero />
                <OperationSwapTool />
                <AiStrategyPanel />
              </div>

            </div>

            {/* Bottom Full-Width Section: Quantitative Trade Audit Log */}
            <TradeHistory />

          </div>
        )}

        {activeTab === 'markets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <LiveChart />
              <ArbitragePanel />
            </div>
            <div className="lg:col-span-5 space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-6">
              <TotalAssetsHero />
              <LivePositions />
            </div>
            <div className="lg:col-span-5 space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <AiStrategyPanel />
            </div>
            <div className="lg:col-span-6">
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
