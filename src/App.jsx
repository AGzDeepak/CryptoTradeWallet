import React from 'react';
import { CryptoProvider, useCrypto } from './context/CryptoContext';
import { BackgroundParticles } from './components/BackgroundParticles';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AutoTraderBar } from './components/AutoTraderBar';
import { TotalAssetsHero } from './components/TotalAssetsHero';
import { YellowPortfolioCard } from './components/YellowPortfolioCard';
import { OperationSwapTool } from './components/OperationSwapTool';
import { MarketGraphPanel } from './components/MarketGraphPanel';
import { ArbitrageBotTerminal } from './components/ArbitrageBotTerminal';
import { AiStrategyPanel } from './components/AiStrategyPanel';
import { PaperTradingPanel } from './components/PaperTradingPanel';
import { LivePositions } from './components/LivePositions';
import { TradeHistory } from './components/TradeHistory';
import { MarketScanner } from './components/MarketScanner';
import { ExchangeStatus } from './components/ExchangeStatus';
import { AnalyticsSection } from './components/AnalyticsSection';
import { SettingsModal } from './components/SettingsModal';
import { GlobalModals } from './components/GlobalModals';
import { WalletSection } from './components/WalletSection';
import { RealWallet } from './components/RealWallet';
import { DecentralizedWalletView } from './components/wallet/DecentralizedWalletView';
import { AccountSection } from './components/AccountSection';
import { LiveCryptoNews } from './components/LiveCryptoNews';
import { SimulationSection } from './components/SimulationSection';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MetaMaskTradeTerminalSection } from './components/MetaMaskTradeTerminalSection';

const DashboardContent = () => {
  const { activeTab } = useCrypto();

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-8 no-scrollbar smooth-scroll-container bg-[#080a10]">
      
      {/* Outer Shell Frame */}
      <div className="chainblock-shell p-4 sm:p-6 lg:p-8 space-y-8">
        
        {(activeTab === 'dashboard' || !['papertrading', 'simulation', 'account', 'wallet', 'realwallet', 'decentralized', 'portfolio', 'metamaskterminal', 'settings'].includes(activeTab)) && (
          <div className="space-y-8">
            
            {/* Top Row: Executive Hero & Autopilot Command Deck */}
            <div className="space-y-6">
              <TotalAssetsHero />
              <AutoTraderBar />
            </div>

            {/* Main HFT Spatial Arbitrage Bot Terminal */}
            <ArbitrageBotTerminal />

            {/* Live Interactive Market Price Chart Graph & Orderbook */}
            <MarketGraphPanel />

            {/* Split Action Deck: Swap Tool (5 Cols) & Active Positions (7 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-5 space-y-6">
                <OperationSwapTool />
              </div>

              <div className="lg:col-span-7 space-y-6">
                <LivePositions />
              </div>

            </div>

            {/* Full Width Verified Trade Audit Log Ledger */}
            <TradeHistory />

          </div>
        )}

        {/* Dedicated Standalone Paper Trading Section */}
        {activeTab === 'papertrading' && (
          <div className="space-y-6">
            <PaperTradingPanel />
            <LivePositions />
            <TradeHistory />
          </div>
        )}

        {/* Dedicated Standalone Quantitative Simulation Section */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <SimulationSection />
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            <AccountSection />
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <WalletSection />
          </div>
        )}

        {activeTab === 'metamaskterminal' && (
          <div className="space-y-6">
            <MetaMaskTradeTerminalSection />
          </div>
        )}

        {activeTab === 'realwallet' && (
          <div className="space-y-6">
            <RealWallet />
          </div>
        )}

        {activeTab === 'decentralized' && (
          <div className="space-y-6">
            <DecentralizedWalletView />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <WalletSection />
          </div>
        )}

        {activeTab === 'markets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-12 space-y-6">
              <TotalAssetsHero />
              <OperationSwapTool />
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <MarketScanner />
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="space-y-6">
            <TradeHistory />
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
    <div className="h-screen w-screen bg-[#0b0c10] text-slate-100 flex overflow-hidden font-sans selection:bg-[#facc15] selection:text-black relative">
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

      {/* Global Modals & Mobile Navigation */}
      <GlobalModals />
      <MobileBottomNav />
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
