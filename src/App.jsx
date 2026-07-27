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
import { VibrantWellnessHero } from './components/VibrantWellnessHero';

const DashboardContent = () => {
  const { activeTab } = useCrypto();

  if (activeTab === 'vibrant_wellness') {
    return (
      <main className="flex-1 overflow-hidden">
        <VibrantWellnessHero />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar smooth-scroll-container">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Master Bot Execution Header */}
        <AutoTraderBar />

        {activeTab === 'dashboard' && (
          <>
            {/* Upper Section: Total Assets Hero (Left) & Operation Swap Tool (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              <div className="xl:col-span-2">
                <TotalAssetsHero />
              </div>
              <div className="xl:col-span-1">
                <OperationSwapTool />
              </div>
            </div>

            {/* Lower Section: Analytics Line Chart (Left) & Transactions List (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              <div className="xl:col-span-2 space-y-6">
                <LiveChart />
                <ArbitragePanel />
                <PaperTradingPanel />
                <LivePositions />
              </div>

              <div className="xl:col-span-1 space-y-6">
                <TransactionsWidget />
                <AiStrategyPanel />
                <ExchangeStatus />
              </div>
            </div>
          </>
        )}

        {activeTab === 'markets' && (
          <>
            <TotalAssetsHero />
            <LiveChart />
            <ArbitragePanel />
          </>
        )}

        {activeTab === 'scanner' && (
          <>
            <MarketScanner />
            <ArbitragePanel />
          </>
        )}

        {activeTab === 'portfolio' && (
          <>
            <PaperTradingPanel />
            <LivePositions />
          </>
        )}

        {activeTab === 'trades' && (
          <>
            <TransactionsWidget />
            <TradeHistory />
          </>
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
          <>
            <AnalyticsSection />
          </>
        )}

        {activeTab === 'history' && (
          <>
            <TradeHistory />
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <SettingsModal />
          </>
        )}

      </div>
    </main>
  );
};

const MainLayout = () => {
  const { isAuthenticated, activeTab } = useCrypto();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (activeTab === 'vibrant_wellness') {
    return (
      <div className="h-screen w-screen bg-black text-slate-100 overflow-hidden font-sans relative">
        <VibrantWellnessHero />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#090b0e] text-slate-100 flex overflow-hidden font-sans selection:bg-[#34d399] selection:text-black relative">
      {/* Background Canvas */}
      <BackgroundParticles />

      {/* Outer Chainblock Container Frame */}
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
