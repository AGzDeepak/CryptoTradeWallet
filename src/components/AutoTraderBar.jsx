import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Bot, Sliders, Play, Pause, Terminal, Activity, AlertCircle, DollarSign } from 'lucide-react';

export const AutoTraderBar = memo(() => {
  const { 
    autoTradingEnabled, 
    setAutoTradingEnabled,
    minProfitThreshold,
    setMinProfitThreshold,
    autoTradeLogs,
    totalBotProfit,
    autoTradeCount,
    tradingMode,
    setTradingMode,
    wallet,
    walletMode,
    setWalletMode,
    realWallet,
    connectRealWallet,
    takeProfitTarget,
    setTakeProfitTarget,
    stopLossLimit,
    setStopLossLimit,
    maxTradeAllocation,
    setMaxTradeAllocation,
    autoStopReason,
    setAutoStopReason,
    resetLimitsAndResume,
    openModal
  } = useCrypto();

  const walletBalance = walletMode === 'REAL' && realWallet.connected
    ? realWallet.balanceUsd
    : (wallet?.virtualBalance ?? 0);
  
  const MIN_TRADE_FUNDS = 2; // $2 minimum balance to start bot trading
  const isInsufficientFunds = autoTradingEnabled && walletBalance < MIN_TRADE_FUNDS;

  const handleResetClick = () => {
    if (resetLimitsAndResume) {
      resetLimitsAndResume();
    } else {
      setAutoStopReason(null);
      setAutoTradingEnabled(true);
    }
  };

  return (
    <div className="chainblock-card p-6 rounded-2xl space-y-6 font-sans">
      
      {/* Row 1: Header (Branding & Status on Left, Bot Cum. Profit, Wallet Balance, and Action Button on Right) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        
        {/* Left: Bot Emblem & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#facc15] text-slate-950 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(250,204,21,0.35)] shrink-0">
            <Bot className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-base text-white font-mono tracking-tight">AUTOPILOT QUANT COMMAND DECK</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isInsufficientFunds
                  ? 'bg-rose-950 text-rose-400 border-rose-700'
                  : autoTradingEnabled 
                    ? 'bg-emerald-950 text-[#2dd4bf] border-[#2dd4bf] animate-pulse' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isInsufficientFunds ? '⚠ HALTED — NO FUNDS' : autoTradingEnabled ? '• AUTOPILOT ACTIVE' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Autonomous Quantitative Trading Engine: Monitors cross-exchange spatial arbitrage routes.</p>
          </div>
        </div>

        {/* Right: Balance Metrics & Activate/Pause Button */}
        <div className="flex items-center space-x-4 shrink-0 self-end sm:self-auto">
          <div className="text-right font-mono hidden md:block">
            <span className="text-[10px] text-slate-400 uppercase block">Bot Cum. Profit</span>
            <span className="text-base font-extrabold text-[#facc15]">
              +${totalBotProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-400 block">{autoTradeCount} Executions</span>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase block">Wallet Balance</span>
            <span className={`text-base font-extrabold block ${
              walletBalance <= 0 ? 'text-rose-400' : 'text-white'
            }`}>
              ${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-[10px] block font-bold ${
              walletBalance < MIN_TRADE_FUNDS ? 'text-rose-400' : 'text-[#2dd4bf]'
            }`}>
              {walletBalance < MIN_TRADE_FUNDS ? 'INSUFFICIENT' : 'USDT READY'}
            </span>
          </div>

          <button
            onClick={() => {
              if (autoStopReason) {
                handleResetClick();
              } else if (!autoTradingEnabled && walletBalance < MIN_TRADE_FUNDS) {
                openModal('DEPOSIT');
              } else {
                setAutoTradingEnabled(!autoTradingEnabled);
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition border shadow-lg flex items-center gap-1.5 ${
              autoStopReason
                ? 'bg-[#facc15] text-slate-950 border-[#facc15] animate-pulse'
                : autoTradingEnabled
                  ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-800'
                  : 'bg-emerald-950 hover:bg-emerald-900 text-[#2dd4bf] border-[#2dd4bf]'
            }`}
          >
            {autoStopReason ? (
              <span>RESET & RESUME</span>
            ) : autoTradingEnabled ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE BOT</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>ACTIVATE BOT</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Row 2: Controls Grid Across Full Card Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Execution Engine Mode */}
        <div className="bg-[#0b0c10] p-3 rounded-xl border border-slate-800 font-mono flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 mb-1.5 uppercase font-bold tracking-wider">Execution Engine Mode</div>
          <div className="grid grid-cols-2 gap-1 bg-[#14161d] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setWalletMode('DEMO')}
              className={`py-1.5 rounded text-[10px] font-bold transition text-center ${
                walletMode === 'DEMO' ? 'bg-[#facc15] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              DEMO
            </button>
            <button
              onClick={() => {
                if (realWallet.connected) setWalletMode('REAL');
                else connectRealWallet('MetaMask');
              }}
              className={`py-1.5 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                walletMode === 'REAL' ? 'bg-[#2dd4bf] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🟢 REAL MONEY
            </button>
          </div>
        </div>

        {/* 2. Trading Strategy Profile */}
        <div className="bg-[#0b0c10] p-3 rounded-xl border border-slate-800 font-mono flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider font-bold">
            Trading Strategy Profile
          </div>
          <select
            value={tradingMode}
            onChange={(e) => setTradingMode(e.target.value)}
            className="w-full bg-[#14161d] border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs outline-none focus:border-[#facc15]"
          >
            <option value="Balanced">Balanced Yield</option>
            <option value="Aggressive">Aggressive Arbitrage</option>
            <option value="Conservative">Conservative Safe Guard</option>
          </select>
        </div>

        {/* 3. Min Profit Target Slider */}
        <div className="bg-[#0b0c10] p-3 rounded-xl border border-slate-800 font-mono flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#facc15]" /> Min Profit Target
            </span>
            <span className="text-[#facc15] font-extrabold text-xs font-mono">{minProfitThreshold.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="5.00"
            step="0.10"
            value={minProfitThreshold}
            onChange={(e) => setMinProfitThreshold(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#facc15] my-auto"
          />
        </div>

      </div>

      {/* Auto-Stop Limit Hit Alert Banner */}
      {autoStopReason && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/80 border border-[#facc15] text-amber-200 font-mono text-xs font-bold">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#facc15] shrink-0" />
            {autoStopReason === 'TAKE_PROFIT_TARGET_HIT'
              ? `🎯 TAKE-PROFIT TARGET HIT — Cumulative profit reached your target of +$${takeProfitTarget.toFixed(2)} USDT. Bot paused automatically.`
              : `🛑 STOP-LOSS LIMIT HIT — Loss exceeded your max limit of -$${stopLossLimit.toFixed(2)} USDT. Bot paused to protect capital.`
            }
          </span>
          <button
            onClick={handleResetLimits}
            className="px-3 py-1 rounded-lg bg-[#facc15] text-slate-950 text-xs font-extrabold hover:brightness-110 shrink-0 ml-2"
          >
            RESET LIMITS & RESUME
          </button>
        </div>
      )}

      {/* Auto-Execution Live Stream Terminal */}
      <div className="bg-[#0b0c10] p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1.5 border-b border-slate-800">
          <span className="flex items-center gap-1.5 font-bold text-slate-200">
            <Terminal className="w-3.5 h-3.5 text-[#facc15]" /> AUTOPILOT EXECUTION & TELEMETRY STREAM:
          </span>
          <span className="text-[10px] text-[#2dd4bf] flex items-center gap-1 font-bold">
            <Activity className="w-3 h-3 animate-pulse text-[#2dd4bf]" /> STRATEGY: {tradingMode.toUpperCase()}
          </span>
        </div>

        {/* Insufficient funds banner in terminal */}
        {isInsufficientFunds && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] font-mono font-bold">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              BOT HALTED — Wallet balance ($${walletBalance.toFixed(2)}) below minimum required. Deposit funds to resume auto-trading.
            </span>
            <button
              onClick={() => openModal('DEPOSIT')}
              className="px-3 py-1 rounded-lg bg-[#facc15] text-slate-950 text-[10px] font-extrabold hover:brightness-110 shrink-0 ml-2"
            >
              + DEPOSIT
            </button>
          </div>
        )}

        <div className="max-h-24 overflow-y-auto space-y-1.5 no-scrollbar text-[11px] pt-1">
          {autoTradeLogs.map((log) => (
            <div key={log.id} className="flex justify-between items-center text-slate-300">
              <span className={`font-medium ${
                log.type === 'danger' ? 'text-rose-400' : 'text-[#2dd4bf]'
              }`}>
                {log.text}
              </span>
              <span className="text-slate-500 text-[10px] ml-2 shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});
