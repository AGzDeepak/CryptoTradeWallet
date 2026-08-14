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
import { BankToBankTransferSection } from './components/BankToBankTransferSection';
import { ExchangesSection } from './components/ExchangesSection';
import { TradeHistorySection } from './components/TradeHistorySection';
import { AutoTradeSection } from './components/auto-trade/AutoTradeSection';

const DashboardContent = () => {
  const { activeTab } = useCrypto();

  return (
    <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 no-scrollbar bg-[#060d18]">
      <div className="p-6 lg:p-8 space-y-0 min-h-full">

        {/* ── AUTO TRADE SECTION ── */}
        {activeTab === 'autotrade' && (
          <AutoTradeSection />
        )}

        {/* ── DASHBOARD ── */}
        {(activeTab === 'dashboard' || !['autotrade','papertrading','simulation','account','wallet','realwallet','ethmainnet','contracts','solidity',
          'decentralized','contractprocess','banktransfer','portfolio','metamaskterminal','realtrading',
          'exchanges','tradehistory','settings','markets','scanner','trades','strategies','analytics'].includes(activeTab)) && (
          <div className="space-y-6">
            <TotalAssetsHero />
          </div>
        )}


        {/* ── ETHEREUM MAINNET ORIGINAL TRADE ── */}
        {activeTab === 'ethmainnet' && (
          <EthereumMainnetTradeSection />
        )}

        {/* ── EXCHANGES ── */}
        {activeTab === 'exchanges' && (
          <ExchangesSection />
        )}

        {/* ── TRADE HISTORY ── */}
        {activeTab === 'tradehistory' && (
          <TradeHistorySection />
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

        {/* ── REAL TRADING & SEPOLIA EXCHANGE ── */}
        {(activeTab === 'metamaskterminal' || activeTab === 'realtrading') && (
          <RealWeb3TradingSection />
        )}

        {/* ── REAL WALLET ── */}
        {activeTab === 'realwallet' && (
          <RealWallet />
        )}

        {/* ── DECENTRALIZED VAULT WALLET ── */}
        {activeTab === 'decentralized' && (
          <DecentralizedWalletView />
        )}

        {/* ── SMART CONTRACTS & SOLIDITY ENGINE ── */}
        {(activeTab === 'contracts' || activeTab === 'solidity' || activeTab === 'contractprocess') && (
          <SolidityContractSection />
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
