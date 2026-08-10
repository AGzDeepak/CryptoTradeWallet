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
import { ContractProcessSection } from './components/ContractProcessSection';
import { BankToBankTransferSection } from './components/BankToBankTransferSection';

const DashboardContent = () => {
  const { activeTab } = useCrypto();

  return (
    <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 no-scrollbar smooth-scroll-container bg-[#080a10]">
      {/* Single unified shell — no double padding */}
      <div className="chainblock-shell m-4 sm:m-6 lg:m-8 p-5 sm:p-7 lg:p-8 space-y-6 min-h-[calc(100%-2rem)]">

        {/* ── DASHBOARD ── */}
        {(activeTab === 'dashboard' || !['papertrading','simulation','account','wallet','realwallet',
          'decentralized','contractprocess','banktransfer','portfolio','metamaskterminal',
          'settings','markets','scanner','trades','strategies','analytics'].includes(activeTab)) && (
          <div className="space-y-6">
            <TotalAssetsHero />
            <AutoTraderBar />
            <ArbitrageBotTerminal />
            <MarketGraphPanel />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5">
                <OperationSwapTool />
              </div>
              <div className="lg:col-span-7">
                <LivePositions />
              </div>
            </div>
          </div>
        )}

        {/* ── PAPER TRADING ── */}
        {activeTab === 'papertrading' && (
          <div className="space-y-6">
            <PaperTradingPanel />
            <LivePositions />
          </div>
        )}

        {/* ── SIMULATION ── */}
        {activeTab === 'simulation' && (
          <SimulationSection />
        )}

        {/* ── ACCOUNT ── */}
        {activeTab === 'account' && (
          <AccountSection />
        )}

        {/* ── WALLET ── */}
        {activeTab === 'wallet' && (
          <WalletSection />
        )}

        {/* ── METAMASK TERMINAL ── */}
        {activeTab === 'metamaskterminal' && (
          <MetaMaskTradeTerminalSection />
        )}

        {/* ── REAL WALLET ── */}
        {activeTab === 'realwallet' && (
          <RealWallet />
        )}

        {/* ── DECENTRALIZED VAULT WALLET ── */}
        {activeTab === 'decentralized' && (
          <DecentralizedWalletView />
        )}

        {/* ── CONTRACT PROCESS ── */}
        {activeTab === 'contractprocess' && (
          <ContractProcessSection />
        )}

        {/* ── BANK TO BANK TRANSFER ── */}
        {activeTab === 'banktransfer' && (
          <BankToBankTransferSection />
        )}

        {/* ── PORTFOLIO ── */}
        {activeTab === 'portfolio' && (
          <WalletSection />
        )}

        {/* ── MARKETS ── */}
        {activeTab === 'markets' && (
          <div className="space-y-6">
            <TotalAssetsHero />
            <OperationSwapTool />
          </div>
        )}

        {/* ── MARKET SCANNER ── */}
        {activeTab === 'scanner' && (
          <MarketScanner />
        )}

        {/* ── TRADE HISTORY LEDGER ── */}
        {activeTab === 'trades' && (
          <TradeHistory />
        )}

        {/* ── AI STRATEGIES ── */}
        {activeTab === 'strategies' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <AiStrategyPanel />
            <OperationSwapTool />
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <AnalyticsSection />
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <SettingsModal />
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
      <BackgroundParticles />

      <div className="w-full h-full flex overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          <Header />
          <DashboardContent />
        </div>
      </div>

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
