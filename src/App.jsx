import React from 'react';
import { CryptoProvider, useCrypto } from './context/CryptoContext';
import { BackgroundParticles } from './components/BackgroundParticles';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

import { TotalAssetsHero } from './components/TotalAssetsHero';
import { YellowPortfolioCard } from './components/YellowPortfolioCard';
import { OperationSwapTool } from './components/OperationSwapTool';
import { MarketGraphPanel } from './components/MarketGraphPanel';

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
import { RealWeb3TradingSection } from './components/RealWeb3TradingSection';
import { EthereumMainnetTradeSection } from './components/EthereumMainnetTradeSection';
import { ContractProcessSection } from './components/ContractProcessSection';
import { SolidityContractSection } from './components/SolidityContractSection';
import { ExchangesSection } from './components/ExchangesSection';
import { TradeHistorySection } from './components/TradeHistorySection';
import { AutoTradeSection } from './components/auto-trade/AutoTradeSection';
import { RiskNetworkSection } from './components/RiskNetworkSection';
import { FlashArbitrageTerminal } from './components/FlashArbitrageTerminal';
import { ArbitrageSection } from './components/ArbitrageSection';

const DashboardContent = () => {
  const { activeTab } = useCrypto();


  return (
    <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 no-scrollbar bg-[#060d18]">
      <div className="p-6 lg:p-8 space-y-0 min-h-full">

        {/* ── 1. TRADE SECTION ── */}
        {(activeTab === 'trade' || activeTab === 'papertrading' || activeTab === 'metamaskterminal' || activeTab === 'realtrading') && (
          <RealWeb3TradingSection />
        )}

        {/* ── 2. MARKET SECTION ── */}
        {(activeTab === 'market' || activeTab === 'exchanges' || activeTab === 'markets' || activeTab === 'scanner') && (
          <ExchangesSection />
        )}

        {/* ── 3. PORTFOLIO SECTION ── */}
        {(activeTab === 'portfolio' || activeTab === 'account' || activeTab === 'wallet' || activeTab === 'realwallet' || activeTab === 'decentralized' || activeTab === 'dashboard') && (
          <WalletSection />
        )}

        {/* ── 4. RISK & NETWORK SECTION ── */}
        {(activeTab === 'risk' || activeTab === 'settings') && (
          <RiskNetworkSection />
        )}

        {/* ── 5. AUTOMATION SECTION ── */}
        {(activeTab === 'automation' || activeTab === 'autotrade') && (
          <AutoTradeSection />
        )}

        {/* ── 6. ARBITRAGE SECTION (2-EXCHANGE, TRIANGULAR, MULTI-PAIR & FLASH LOAN ATOMIC) ── */}
        {(activeTab === 'arbitrage' || activeTab === 'contracts' || activeTab === 'solidity') && (
          <ArbitrageSection />
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
    <div className="h-screen w-screen bg-[#060d18] text-slate-100 flex overflow-hidden font-sans selection:bg-violet-500 selection:text-white relative">
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
