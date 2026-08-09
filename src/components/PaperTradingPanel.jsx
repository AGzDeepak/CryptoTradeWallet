import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  Wallet, RefreshCw, ShoppingBag, ArrowUpRight, PlusCircle, Bot, 
  Play, Pause, Zap, ShieldCheck, Activity, Terminal, Layers, ArrowRightLeft, CheckCircle2, AlertTriangle
} from 'lucide-react';

export const PaperTradingPanel = () => {
  const { 
    wallet, 
    walletMode,
    setWalletMode,
    realWallet,
    connectRealWallet,
    resetWallet, 
    openPositions, 
    tradeHistory, 
    executeOrder, 
    executeAutoTrade,
    openModal, 
    totalBotProfit,
    autoTradeCount,
    autoTradingEnabled,
    setAutoTradingEnabled,
    autoTradeLogs,
    arbitrageOpps,
    minProfitThreshold,
    setMinProfitThreshold,
    stopLossLimit,
    setStopLossLimit,
    addNotification,
    audioFx,
    marketData 
  } = useCrypto();

  const [activeDeck, setActiveDeck] = useState('BOT'); // 'BOT' | 'MANUAL'
  const [side, setSide] = useState('BUY');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [exchange, setExchange] = useState('Binance Pro');
  const [amount, setAmount] = useState('0.5');

  const selectedCoin = marketData.find(c => c.symbol === symbol) || marketData[0] || { basePrice: 67840.50 };

  const currentAvailableBalance = walletMode === 'REAL' && realWallet.connected 
    ? realWallet.balanceUsd 
    : (wallet.virtualBalance ?? 0.00);

  // Manual Trigger for Automated Paper Bot Trade
  const handleTriggerBotTradeNow = () => {
    const topOpp = (arbitrageOpps || [])
      .filter(o => o.isProfitable)
      .sort((a, b) => b.netProfit - a.netProfit)[0];

    if (!topOpp) {
      const fallbackOpp = {
        symbol: 'BTCUSDT',
        buyEx: 'Binance',
        sellEx: 'Bybit',
        ex1Price: 67840.50,
        ex2Price: 67990.20,
        spread: 149.70,
        diffPct: 0.22,
        netProfit: 14.85,
        unitSize: 0.1,
        isProfitable: true
      };
      executeAutoTrade(fallbackOpp);
    } else {
      executeAutoTrade(topOpp);
    }

    try { audioFx?.playTradeSuccess(); } catch (_) {}
    addNotification('⚡ PAPER BOT TRADE TRIGGERED! Automated paper arbitrage executed & settled.', 'success');
  };

  const handleManualExecute = (e) => {
    e.preventDefault();
    executeOrder(side, symbol, exchange, parseFloat(amount));
  };

  const handleQuickPercent = (pct) => {
    const bal = currentAvailableBalance;
    const price = selectedCoin.basePrice || 67840.50;
    const maxQty = (bal * pct) / price;
    setAmount(maxQty.toFixed(6));
  };

  return (
    <div className="chainblock-card p-5 sm:p-7 space-y-6 font-sans">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <Bot className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-white font-mono tracking-tight">PAPER TRADING & QUANT BOT DECK</h3>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
              walletMode === 'REAL' 
                ? 'bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]' 
                : 'bg-amber-950 text-[#facc15] border border-[#facc15]/40'
            }`}>
              {walletMode === 'REAL' ? '🟢 REAL MONEY MODE (WEB3)' : '🟡 PAPER BOT SANDBOX'}
            </span>
          </div>
        </div>

        {/* Action Buttons & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs w-full lg:w-auto">
          <div className="flex bg-[#0b0c10] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setWalletMode('DEMO')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
                walletMode === 'DEMO' ? 'bg-[#facc15] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              PAPER MOCK
            </button>
            <button
              onClick={() => {
                if (realWallet.connected) setWalletMode('REAL');
                else connectRealWallet('MetaMask');
              }}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
                walletMode === 'REAL' ? 'bg-[#2dd4bf] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              REAL METAMASK
            </button>
          </div>

          <button
            onClick={() => openModal('DEPOSIT')}
            className="flex-1 lg:flex-none h-9 px-3.5 rounded-xl bg-[#facc15] text-slate-950 font-extrabold transition hover:brightness-110 shadow-md flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => openModal('WITHDRAW')}
            className="flex-1 lg:flex-none h-9 px-3.5 rounded-xl bg-[#14161d] border border-slate-700 text-rose-300 font-bold hover:border-rose-500 transition flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>Withdraw</span>
          </button>
          
          <button
            onClick={resetWallet}
            className="flex-1 lg:flex-none h-9 px-3.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-slate-300 font-bold hover:text-[#facc15] hover:border-[#facc15] transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-[#facc15]" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Key KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        
        <div className={`p-4 rounded-2xl border space-y-1.5 shadow-sm ${
          (wallet.virtualBalance ?? 0) <= 0
            ? 'bg-rose-950/40 border-rose-700'
            : 'bg-[#0b0c10] border-slate-800'
        }`}>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Available Paper Balance</span>
          <span className={`text-xl font-extrabold block tracking-tight ${
            (wallet.virtualBalance ?? 0) <= 0 ? 'text-rose-400' : 'text-white'
          }`}>
            ${(wallet.virtualBalance ?? 0.00).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {(wallet.virtualBalance ?? 0) <= 0 ? '⚠ Deposit funds to trade' : 'USDT Virtual Pool'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1.5 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Account Equity</span>
          <span className="text-xl font-extrabold text-[#2dd4bf] block tracking-tight">
            ${(wallet.totalEquity ?? 0.00).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2dd4bf]/80 block">Cash + Open Positions</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#facc15]/40 space-y-1.5 shadow-sm">
          <span className="text-[10px] text-[#facc15] uppercase tracking-wider block font-semibold flex items-center gap-1">
            <Bot className="w-3.5 h-3.5 text-[#facc15]" /> BOT CUM. PROFIT
          </span>
          <span className="text-xl font-extrabold text-[#facc15] block tracking-tight">
            +${(totalBotProfit || 0.00).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-amber-400/80 block">{autoTradeCount} Trades Executed</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1.5 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Mock Executions</span>
          <span className="text-xl font-extrabold text-purple-400 block tracking-tight">
            {openPositions.length} Open / {tradeHistory.length} Settled
          </span>
          <span className="text-[10px] text-purple-400/80 block">Live Sandbox Feed</span>
        </div>

      </div>

      {/* 3. Sub-Tab Mode Switcher */}
      <div className="flex space-x-2 border-b border-slate-800/80 pb-3 font-mono">
        <button
          onClick={() => setActiveDeck('BOT')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeDeck === 'BOT'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-[#060810] text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Bot className={`w-4 h-4 ${activeDeck === 'BOT' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>1. AUTOMATED PAPER TRADING BOT (QUANT AUTOPILOT)</span>
        </button>

        <button
          onClick={() => setActiveDeck('MANUAL')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            activeDeck === 'MANUAL'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
              : 'bg-[#060810] text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <ShoppingBag className={`w-4 h-4 ${activeDeck === 'MANUAL' ? 'text-cyan-400' : 'text-slate-500'}`} />
          <span>2. MANUAL PAPER TRADING TERMINAL (ORDER ENTRY)</span>
        </button>
      </div>

      {/* ================= SUB-TAB 1: AUTOMATED PAPER TRADING BOT ENGINE ================= */}
      {activeDeck === 'BOT' && (
        <div className="space-y-6 font-mono text-xs">
          
          {/* Bot Power Control & Quick Trigger Bar */}
          <div className="p-5 rounded-3xl bg-[#090d16] border border-amber-500/40 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  autoTradingEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 animate-pulse'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-black text-white uppercase">AUTOPILOT QUANT PAPER BOT ENGINE</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      autoTradingEnabled
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                        : 'bg-rose-950 text-rose-400 border border-rose-500'
                    }`}>
                      {autoTradingEnabled ? 'BOT STATUS: ONLINE 🟢' : 'BOT STATUS: PAUSED ⏸️'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Scans multi-exchange orderbooks every 400ms & executes high-profit spatial arbitrage trades.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setAutoTradingEnabled(!autoTradingEnabled);
                    addNotification(`Paper Bot ${!autoTradingEnabled ? 'Activated 🟢' : 'Paused ⏸️'}`, 'info');
                  }}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase transition shadow flex items-center gap-2 ${
                    autoTradingEnabled
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110'
                  }`}
                >
                  {autoTradingEnabled ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>PAUSE PAPER BOT</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>ACTIVATE PAPER BOT</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleTriggerBotTradeNow}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase hover:brightness-110 transition shadow flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>TRIGGER BOT PAPER TRADE NOW</span>
                </button>
              </div>
            </div>

            {/* Bot Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* MIN PROFIT THRESHOLD CONTROL CARD */}
              <div className="p-4 rounded-2xl bg-[#060810] border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">MIN PROFIT THRESHOLD</span>
                  <span className="text-base font-black text-amber-400 font-mono">{minProfitThreshold.toFixed(2)}%</span>
                </div>

                <input
                  type="range"
                  min="0.10"
                  max="5.00"
                  step="0.10"
                  value={minProfitThreshold}
                  onChange={e => setMinProfitThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[
                    { label: '0.25%', val: 0.25 },
                    { label: '0.50%', val: 0.50 },
                    { label: '1.00%', val: 1.00 },
                    { label: '2.50%', val: 2.50 },
                    { label: '5.00% (MAX)', val: 5.00 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setMinProfitThreshold(p.val)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                        minProfitThreshold === p.val
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-[#090d16] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800/80 text-[10px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>WORKFLOW CONNECTED TO PAPER BOT</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-normal">
                    The Paper Bot continuously scans orderbooks and <strong>ONLY executes trades</strong> when the exchange price spread is <strong>≥ {minProfitThreshold.toFixed(2)}%</strong> (Min $5.00 USD net profit).
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#060810] border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block">STOP-LOSS CAPITAL LIMIT</span>
                <input
                  type="number"
                  step="50"
                  value={stopLossLimit}
                  onChange={e => setStopLossLimit(parseFloat(e.target.value))}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl p-2 text-rose-300 font-mono font-bold outline-none"
                />
                <span className="text-[9px] text-slate-500 block">Auto-halts bot if daily loss exceeds limit</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#060810] border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block">SCAN SPEED & LATENCY</span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-emerald-400">400ms Stimulation</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[9px] font-bold">OPTIMAL</span>
                </div>
                <span className="text-[9px] text-slate-500 block">Sub-second orderbook spread detection</span>
              </div>
            </div>
          </div>

          {/* Live Bot Execution Activity Feed Log */}
          <div className="p-5 rounded-3xl bg-[#090d16] border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black text-white uppercase">LIVE PAPER BOT EXECUTION LOG FEED</h4>
              </div>
              <span className="text-[10px] text-slate-400">{autoTradeLogs.length} Events Recorded</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 font-mono text-[11px]">
              {autoTradeLogs.length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic">No paper bot trades recorded yet. Click "TRIGGER BOT PAPER TRADE NOW" above.</div>
              ) : (
                autoTradeLogs.map(log => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      log.type === 'danger'
                        ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                        : 'bg-[#060810] border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-400 font-bold">[{log.time}]</span>
                      <span>{log.text}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 text-[9px] font-bold border border-slate-800 shrink-0">
                      SETTLED 🟢
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ================= SUB-TAB 2: MANUAL PAPER TRADING TERMINAL ================= */}
      {activeDeck === 'MANUAL' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-5 font-mono text-xs">
          
          {/* Form Header with Side Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <h4 className="text-xs font-mono uppercase text-[#facc15] font-bold flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> EXECUTE MOCK PAPER ORDER
            </h4>

            <div className="flex space-x-1 bg-[#14161d] p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-extrabold transition ${
                  side === 'BUY'
                    ? 'bg-[#2dd4bf] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BUY (LONG)
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-extrabold transition ${
                  side === 'SELL'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SELL (SHORT)
              </button>
            </div>
          </div>

          {/* Inputs Grid */}
          <form onSubmit={handleManualExecute} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 block mb-1.5 text-[11px] font-bold">Crypto Pair</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
                >
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="ETHUSDT">ETH/USDT</option>
                  <option value="SOLUSDT">SOL/USDT</option>
                  <option value="LTCUSDT">LTC/USDT</option>
                  <option value="AVAXUSDT">AVAX/USDT</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 text-[11px] font-bold">Target Exchange</label>
                <select
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
                >
                  <option value="Binance Pro">Binance Pro</option>
                  <option value="Bybit Quant">Bybit Quant</option>
                  <option value="OKX Institutional">OKX Institutional</option>
                  <option value="Coinbase Pro">Coinbase Pro</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 text-[11px] font-bold">Order Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
                />
              </div>
            </div>

            {/* Quick Size Percentage Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#14161d] border border-slate-800">
              <span className="text-slate-400 font-bold text-[11px]">Quick Size Percentage:</span>
              <div className="grid grid-cols-4 gap-2 w-full sm:w-auto">
                {[
                  { label: '25%', pct: 0.25 },
                  { label: '50%', pct: 0.50 },
                  { label: '75%', pct: 0.75 },
                  { label: '100% (MAX)', pct: 1.0 }
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleQuickPercent(btn.pct)}
                    className="h-8 px-3 rounded-lg bg-[#0b0c10] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] transition text-center"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {side === 'BUY' && (wallet.virtualBalance ?? 0) <= 0 && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-300 text-xs font-mono font-bold flex items-center gap-2">
                ⚠ Wallet balance is $0.00 — Please deposit funds first before placing a BUY order.
              </div>
            )}

            {/* Cost Preview */}
            {side === 'BUY' && parseFloat(amount) > 0 && (
              <div className="p-3 rounded-xl bg-[#0b0c10] border border-slate-800 text-xs font-mono flex justify-between items-center">
                <span className="text-slate-400">Estimated Cost:</span>
                <span className="text-white font-bold">
                  ${(parseFloat(amount) * (selectedCoin.basePrice || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                </span>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={side === 'BUY' && (wallet.virtualBalance ?? 0) <= 0}
              className={`w-full h-12 rounded-xl font-extrabold font-sans text-xs sm:text-sm tracking-wider uppercase transition shadow-lg ${
                side === 'BUY'
                  ? 'bg-[#2dd4bf] text-slate-950 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed'
                  : 'bg-rose-500 text-white hover:brightness-110'
              }`}
            >
              {side === 'BUY' && (wallet.virtualBalance ?? 0) <= 0
                ? 'DEPOSIT FUNDS TO TRADE'
                : `EXECUTE ${side} ORDER — ${symbol}`
              }
            </button>

          </form>

        </div>
      )}

    </div>
  );
};
