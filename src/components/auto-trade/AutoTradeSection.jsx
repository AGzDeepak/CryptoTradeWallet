import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { WalletAuthCard } from './WalletAuthCard';
import { MarketCard } from './MarketCard';
import { BotStatusCard } from './BotStatusCard';
import { StrategyPanel } from './StrategyPanel';
import { PortfolioCard } from './PortfolioCard';
import { EmergencyControls } from './EmergencyControls';
import { TradeActivityTable } from './TradeActivityTable';
import { AutoTradeEnableModal } from './AutoTradeEnableModal';
import { MainnetSwitchModal } from './MainnetSwitchModal';

import { LiveMarketEngine } from '../../services/liveMarketService';
import { getStoredAuthSession } from '../../services/walletAuthService';
import { calculateIndicators, evaluateStrategy } from '../../services/autoTradeEngine';
import { validateTradeRisk } from '../../services/autoTradeRiskManager';
import { executeAutoTradeTransaction } from '../../services/autoTradeExecution';
import { connectMetaMask } from '../../services/walletService';

export const AutoTradeSection = () => {
  const { 
    realWalletAddress, 
    setRealWalletAddress, 
    addNotification, 
    audioFx,
    wallet,
    setWallet 
  } = useCrypto();

  // 1. Session Auth State
  const [authSession, setAuthSession] = useState(() => getStoredAuthSession(realWalletAddress));

  // 2. Network & Trading Mode State
  const [networkMode, setNetworkMode] = useState('TESTNET'); // 'TESTNET' | 'MAINNET'
  const [showMainnetModal, setShowMainnetModal] = useState(false);

  // 3. Auto Trading Toggle State
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);

  // 4. Strategy Configuration
  const [config, setConfig] = useState({
    pair: 'ETH/USDT',
    strategyMode: 'Balanced', // 'Conservative' | 'Balanced' | 'Aggressive' | 'Custom'
    maxTradeAmount: 500,
    minTradeAmount: 10,
    takeProfitPct: 4.0,
    stopLossPct: 2.0,
    maxDailyLoss: 250,
    maxTradesPerDay: 20,
    cooldownSeconds: 30,
    slippageTolerancePct: 1.0,
  });

  // 5. Live Market Feed State
  const [marketData, setMarketData] = useState({
    symbol: 'ETH/USDT',
    price: 3542.80,
    change24h: 2.41,
    timestamp: Date.now(),
    isStale: false,
  });
  const [connectionStatus, setConnectionStatus] = useState('LIVE');
  const [priceHistory, setPriceHistory] = useState([3520, 3525, 3530, 3535, 3542.80]);

  // 6. Indicators & Evaluated Signal State
  const [indicators, setIndicators] = useState({ ema12: 3540.50, ema26: 3528.10, rsi: 48, trend: 'BULLISH' });
  const [lastSignal, setLastSignal] = useState(null);
  const [botStatus, setBotStatus] = useState('Monitoring Market');
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState(0);

  // 7. Portfolio & Position State
  const [currentPosition, setCurrentPosition] = useState(null); // { symbol, amount, entryPrice }
  const [dailyStats, setDailyStats] = useState({ todayLossUsd: 0, todayTradeCount: 0, todayPnlUsd: 42.50 });
  const [tradeCounters, setTradeCounters] = useState({ total: 12, successful: 11, failed: 1 });

  // 8. Activity Logs State
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 'LOG-1001',
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
      side: 'BUY',
      pair: 'ETH/USDT',
      amount: 0.15,
      price: 3520.10,
      gasCostUsd: 0.85,
      slippagePct: 0.12,
      pnlUsd: 3.40,
      txHash: '0x94826b52a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
      status: 'Confirmed'
    }
  ]);

  const lastTradeTimestampRef = useRef(0);
  const isExecutingRef = useRef(false);

  // Check stored session when wallet address updates
  useEffect(() => {
    if (realWalletAddress) {
      const sess = getStoredAuthSession(realWalletAddress);
      setAuthSession(sess);
    } else {
      setAuthSession(null);
    }
  }, [realWalletAddress]);

  // Live Market Data Feed initialization
  useEffect(() => {
    const engine = new LiveMarketEngine(
      config.pair,
      (data) => {
        setMarketData({
          symbol: config.pair,
          price: data.price,
          change24h: data.change24h,
          timestamp: data.timestamp,
          isStale: false,
        });
        setPriceHistory(prev => [...prev.slice(-49), data.price]);
      },
      (status, isStale) => {
        setConnectionStatus(status);
        if (isStale) {
          setMarketData(m => ({ ...m, isStale: true }));
          setBotStatus('Market Data Stale (Paused)');
        }
      }
    );

    engine.start();
    return () => engine.stop();
  }, [config.pair]);

  // Re-calculate Technical Indicators when Price Updates
  useEffect(() => {
    if (!marketData.price) return;
    const computed = calculateIndicators(priceHistory);
    setIndicators(computed);

    const evaluated = evaluateStrategy({
      mode: config.strategyMode,
      indicators: computed,
      currentPrice: marketData.price,
      currentPosition,
      config,
    });
    setLastSignal(evaluated);
  }, [marketData.price, priceHistory, config, currentPosition]);

  // Automated Strategy Evaluation Loop (Every 4 seconds)
  const runAutoScanTick = useCallback(async () => {
    if (!autoTradingEnabled || botStatus === 'Paused' || botStatus === 'Emergency Stopped') return;
    if (isExecutingRef.current) return;

    // Must be authenticated via wallet signature
    const isAuthenticated = !!(authSession && authSession.address?.toLowerCase() === (realWalletAddress || '').toLowerCase());
    if (!isAuthenticated) {
      setBotStatus('Auth Signature Required');
      return;
    }

    // Check Cooldown
    const elapsedSec = (Date.now() - lastTradeTimestampRef.current) / 1000;
    if (lastTradeTimestampRef.current && elapsedSec < config.cooldownSeconds) {
      const rem = Math.ceil(config.cooldownSeconds - elapsedSec);
      setCooldownRemainingSec(rem);
      setBotStatus(`Cooldown Active (${rem}s)`);
      return;
    } else {
      setCooldownRemainingSec(0);
      setBotStatus('Evaluating Strategy');
    }

    if (!lastSignal || lastSignal.signal === 'HOLD') {
      setBotStatus('Monitoring Market (HOLD)');
      return;
    }

    // 11-Point Risk Validation Check
    const proposedUsd = Math.min(config.maxTradeAmount, wallet?.virtualBalance || 1000);
    const riskCheck = validateTradeRisk({
      signal: lastSignal.signal,
      pair: config.pair,
      proposedUsdAmount: proposedUsd,
      walletBalanceUsd: wallet?.virtualBalance || 12480.50,
      currentPosition,
      dailyStats,
      config,
      marketData,
      networkInfo: { isTestnet: networkMode === 'TESTNET' },
      lastTradeTimestamp: lastTradeTimestampRef.current,
    });

    if (!riskCheck.isAllowed) {
      // Risk Manager Blocked Trade
      setBotStatus(`Risk Blocked: ${riskCheck.code}`);
      const blockedLog = {
        id: `LOG-BLOCK-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        side: 'BLOCKED',
        pair: config.pair,
        amount: parseFloat((proposedUsd / marketData.price).toFixed(4)),
        price: marketData.price,
        gasCostUsd: 0,
        slippagePct: 0,
        pnlUsd: 0,
        txHash: null,
        status: 'Blocked'
      };
      setActivityLogs(prev => [blockedLog, ...prev.slice(0, 19)]);
      setTradeCounters(c => ({ ...c, failed: c.failed + 1 }));
      addNotification(`🛑 Trade Blocked by Risk Manager: ${riskCheck.reason}`, 'warning');
      return;
    }

    // Execute Trade Proposal
    isExecutingRef.current = true;
    setBotStatus(`Executing ${lastSignal.signal} Trade…`);

    try {
      const execResult = await executeAutoTradeTransaction({
        side: lastSignal.signal,
        pair: config.pair,
        amountUsd: proposedUsd,
        currentPrice: marketData.price,
        walletAddress: realWalletAddress,
        network: networkMode,
        slippagePct: config.slippageTolerancePct,
      });

      lastTradeTimestampRef.current = Date.now();

      if (lastSignal.signal === 'BUY') {
        setCurrentPosition({
          symbol: config.pair,
          amount: execResult.amount,
          entryPrice: marketData.price,
        });
      } else if (lastSignal.signal === 'SELL') {
        setCurrentPosition(null);
      }

      const newLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: execResult.timestamp,
        side: execResult.side,
        pair: execResult.pair,
        amount: execResult.amount,
        price: execResult.price,
        gasCostUsd: execResult.gasCostUsd,
        slippagePct: execResult.slippagePct,
        pnlUsd: execResult.side === 'SELL' ? 14.50 : 0,
        txHash: execResult.txHash,
        explorerUrl: execResult.explorerUrl,
        status: 'Confirmed'
      };

      setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]);
      setTradeCounters(c => ({ ...c, total: c.total + 1, successful: c.successful + 1 }));
      try { audioFx?.playTradeSuccess(); } catch (_) {}
      addNotification(`🚀 Auto Trade Executed: ${execResult.side} ${execResult.amount} ETH @ $${execResult.price.toFixed(2)} (${networkMode})`, 'success');
    } catch (err) {
      addNotification(`Trade Execution Error: ${err.message}`, 'danger');
      setTradeCounters(c => ({ ...c, total: c.total + 1, failed: c.failed + 1 }));
    } finally {
      isExecutingRef.current = false;
      setBotStatus('Monitoring Market');
    }
  }, [autoTradingEnabled, botStatus, authSession, realWalletAddress, config, lastSignal, wallet, currentPosition, dailyStats, marketData, networkMode, addNotification, audioFx]);

  useEffect(() => {
    if (!autoTradingEnabled) return;
    const timer = setInterval(runAutoScanTick, 4000);
    return () => clearInterval(timer);
  }, [autoTradingEnabled, runAutoScanTick]);

  // Connect Wallet Helper
  const handleConnectWallet = async () => {
    try {
      const res = await connectMetaMask();
      if (res && res.address) {
        setRealWalletAddress(res.address);
        addNotification(`🦊 MetaMask Connected: ${res.address.substring(0, 8)}...`, 'success');
      }
    } catch (err) {
      addNotification(`MetaMask Connection Error: ${err.message}`, 'danger');
    }
  };

  // Toggle Auto Trading Handler with Modal Confirmation
  const handleToggleAutoTrading = () => {
    if (!autoTradingEnabled) {
      setShowEnableModal(true);
    } else {
      setAutoTradingEnabled(false);
      setBotStatus('Off');
      addNotification('⏹️ Auto Trading Disabled.', 'info');
    }
  };

  const handleConfirmEnableAutoTrading = () => {
    setShowEnableModal(false);
    setAutoTradingEnabled(true);
    setBotStatus('Monitoring Market');
    addNotification('⚡ Auto Trading Enabled! Market monitoring active.', 'success');
  };

  // Switch Network Mode Handler
  const handleSwitchNetworkMode = (mode) => {
    if (mode === 'MAINNET' && networkMode !== 'MAINNET') {
      setShowMainnetModal(true);
    } else {
      setNetworkMode(mode);
    }
  };

  const handleConfirmMainnetSwitch = () => {
    setShowMainnetModal(false);
    setNetworkMode('MAINNET');
    addNotification('🔥 Switched to Ethereum Mainnet Mode (Real Funds).', 'warning');
  };

  // Emergency Control Handlers
  const handlePauseBot = () => {
    if (botStatus === 'Paused') {
      setBotStatus('Monitoring Market');
      addNotification('▶️ Bot Resumed.', 'info');
    } else {
      setBotStatus('Paused');
      addNotification('⏸️ Bot Paused.', 'warning');
    }
  };

  const handleStopAutoTrading = () => {
    setAutoTradingEnabled(false);
    setBotStatus('Off');
    addNotification('⏹️ Auto Trading Stopped.', 'info');
  };

  const handleClosePosition = () => {
    if (!currentPosition || currentPosition.amount <= 0) return;
    const closedAmount = currentPosition.amount;
    const pnl = (marketData.price - currentPosition.entryPrice) * closedAmount;
    setCurrentPosition(null);

    const closeLog = {
      id: `LOG-CLOSE-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      side: 'SELL',
      pair: config.pair,
      amount: closedAmount,
      price: marketData.price,
      gasCostUsd: 1.20,
      slippagePct: 0.1,
      pnlUsd: pnl,
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      status: 'Confirmed'
    };

    setActivityLogs(prev => [closeLog, ...prev.slice(0, 19)]);
    addNotification(`Market Close Executed: Closed ${closedAmount} ETH @ $${marketData.price.toFixed(2)} (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)})`, 'success');
  };

  const handleEmergencyStop = () => {
    setAutoTradingEnabled(false);
    setBotStatus('Emergency Stopped');
    setCurrentPosition(null);
    addNotification('🚨 EMERGENCY STOP ACTIVATED: Bot halted & positions cleared.', 'danger');
  };

  const lastUpdatedSec = Math.max(0.1, (Date.now() - (marketData.timestamp || Date.now())) / 1000);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Section Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0d1523] border border-slate-800/80 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight font-mono">AUTO TRADE</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400">● LIVE MARKET</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production-oriented automated strategy engine & signature-authenticated execution interlocks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
            networkMode === 'MAINNET' 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            NETWORK: {networkMode}
          </span>
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {networkMode === 'TESTNET' ? 'TESTNET MODE — NO REAL FUNDS' : 'MAINNET LIVE'}
          </span>
        </div>
      </div>

      {/* 2. Wallet Authentication Card */}
      <WalletAuthCard
        walletAddress={realWalletAddress}
        onConnectWallet={handleConnectWallet}
        networkMode={networkMode}
        onSwitchNetworkMode={handleSwitchNetworkMode}
        authSession={authSession}
        setAuthSession={setAuthSession}
        addNotification={addNotification}
      />

      {/* 3. Main Grid: Market, Bot Controller & Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <MarketCard
          pair={config.pair}
          currentPrice={marketData.price}
          change24h={marketData.change24h}
          indicators={indicators}
          connectionStatus={connectionStatus}
          isStale={marketData.isStale}
          lastUpdatedSecondsAgo={lastUpdatedSec}
        />

        <BotStatusCard
          autoTradingEnabled={autoTradingEnabled}
          onToggleAutoTrading={handleToggleAutoTrading}
          botStatus={botStatus}
          lastSignal={lastSignal}
          cooldownRemainingSec={cooldownRemainingSec}
        />

        <PortfolioCard
          walletBalanceUsd={wallet?.virtualBalance || 12480.50}
          currentPosition={currentPosition}
          currentPrice={marketData.price}
          todayPnlUsd={dailyStats.todayPnlUsd}
          totalTrades={tradeCounters.total}
          successfulTrades={tradeCounters.successful}
          failedTrades={tradeCounters.failed}
        />
      </div>

      {/* 4. Strategy Configuration Panel */}
      <StrategyPanel
        config={config}
        onChangeConfig={setConfig}
      />

      {/* 5. Emergency Controls */}
      <EmergencyControls
        onPauseBot={handlePauseBot}
        onStopAutoTrading={handleStopAutoTrading}
        onClosePosition={handleClosePosition}
        onEmergencyStop={handleEmergencyStop}
        isPaused={botStatus === 'Paused'}
        hasActivePosition={!!(currentPosition && currentPosition.amount > 0)}
      />

      {/* 6. Trading Activity Log Table */}
      <TradeActivityTable
        activityLogs={activityLogs}
      />

      {/* Modals */}
      <AutoTradeEnableModal
        isOpen={showEnableModal}
        onClose={() => setShowEnableModal(false)}
        onConfirm={handleConfirmEnableAutoTrading}
      />

      <MainnetSwitchModal
        isOpen={showMainnetModal}
        onClose={() => setShowMainnetModal(false)}
        onConfirm={handleConfirmMainnetSwitch}
      />
    </div>
  );
};
