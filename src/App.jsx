import React, { useState } from 'react';
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
import { LineChart, Briefcase, Cpu, SlidersHorizontal, ShieldCheck } from 'lucide-react';

const DashboardContent = () => {
  const { activeTab } = useCrypto();
  const [workstationMode, setWorkstationMode] = useState('terminal'); // 'terminal' | 'portfolio' | 'bot_ai'

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar smooth-scroll-container bg-[#0b1120]">
      <div className="max-w-[1750px] mx-auto space-y-6">
        
        {/* Master Bot & Stimulation Control Command Deck */}
        <AutoTraderBar />

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Desktop Workstation Mode Switcher Pills (Zero Clutter Navigation) */}
            <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-2xl border border-slate-800 font-mono text-xs shadow-xl">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-400 ml-2" />
                <span className="text-slate-400 font-bold uppercase text-[11px] hidden sm:inline">DESKTOP WORKSTATION:</span>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setWorkstationMode('terminal')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition font-bold ${
                    workstationMode === 'terminal'
                      ? 'bg-teal-400 text-slate-950 shadow-lg glow-mint'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>QUANT ARBITRAGE TERMINAL</span>
                </button>

                <button
                  onClick={() => setWorkstationMode('portfolio')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition font-bold ${
                    workstationMode === 'portfolio'
                      ? 'bg-teal-400 text-slate-950 shadow-lg glow-mint'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>PORTFOLIO & AUDIT LEDGER</span>
                </button>

                <button
                  onClick={() => setWorkstationMode('bot_ai')}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition font-bold ${
                    workstationMode === 'bot_ai'
                      ? 'bg-teal-400 text-slate-950 shadow-lg glow-mint'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AI BOT & TELEMETRY</span>
                </button>
              </div>
            </div>

            {/* WORKSTATION 1: QUANT ARBITRAGE TERMINAL */}
            {workstationMode === 'terminal' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <LiveChart />
                  <ArbitragePanel />
                </div>
                <div className="lg:col-span-5 space-y-6">
                  <TotalAssetsHero />
                  <OperationSwapTool />
                  <LivePositions />
                </div>
              </div>
            )}

            {/* WORKSTATION 2: PORTFOLIO & AUDIT LEDGER */}
            {workstationMode === 'portfolio' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <TradeHistory />
                </div>
                <div className="lg:col-span-5 space-y-6">
                  <TotalAssetsHero />
                  <PaperTradingPanel />
                  <LivePositions />
                </div>
              </div>
            )}

            {/* WORKSTATION 3: AI BOT & TELEMETRY */}
            {workstationMode === 'bot_ai' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-6 space-y-6">
                  <AiStrategyPanel />
                </div>
                <div className="lg:col-span-6 space-y-6">
                  <ExchangeStatus />
                  <TransactionsWidget />
                </div>
              </div>
            )}

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
    <div className="h-screen w-screen bg-[#0b1120] text-slate-100 flex overflow-hidden font-sans selection:bg-teal-400 selection:text-black relative">
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
