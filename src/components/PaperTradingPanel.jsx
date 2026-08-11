import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  Bot, Play, Pause, Zap, ShoppingBag, PlusCircle, ArrowUpRight,
  RefreshCw, Activity, Terminal, CheckCircle2, ShieldCheck
} from 'lucide-react';

/* ── Shared sub-components ─────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{children}</p>
);

const StatCard = ({ label, value, sub, accent = 'text-white', border = 'border-slate-800', glow = '' }) => (
  <div className={`rounded-2xl bg-[#080c14] border ${border} p-5 space-y-1 ${glow}`}>
    <SectionLabel>{label}</SectionLabel>
    <div className={`text-2xl font-black font-mono tracking-tight ${accent}`}>{value}</div>
    {sub && <div className="text-[10px] text-slate-500 font-mono">{sub}</div>}
  </div>
);

export const PaperTradingPanel = () => {
  const {
    wallet, walletMode, setWalletMode,
    realWallet, connectRealWallet,
    resetWallet, openPositions, tradeHistory,
    executeOrder, executeAutoTrade,
    openModal, totalBotProfit, autoTradeCount,
    autoTradingEnabled, setAutoTradingEnabled,
    autoTradeLogs, arbitrageOpps,
    minProfitThreshold, setMinProfitThreshold,
    stopLossLimit, setStopLossLimit,
    addNotification, audioFx, marketData
  } = useCrypto();

  const [activeDeck, setActiveDeck] = useState('BOT'); // 'BOT' | 'MANUAL'
  const [side, setSide]             = useState('BUY');
  const [symbol, setSymbol]         = useState('BTCUSDT');
  const [exchange, setExchange]     = useState('Binance Pro');
  const [amount, setAmount]         = useState('0.5');

  const selectedCoin   = marketData.find(c => c.symbol === symbol) || marketData[0] || { basePrice: 67840.50 };
  const paperBalance   = wallet.virtualBalance ?? 0;
  const currentBalance = walletMode === 'REAL' && realWallet.connected ? realWallet.balanceUsd : paperBalance;

  const handleTriggerBotTrade = () => {
    const topOpp = (arbitrageOpps || []).filter(o => o.isProfitable).sort((a, b) => b.netProfit - a.netProfit)[0];
    executeAutoTrade(topOpp || {
      symbol: 'BTCUSDT', buyEx: 'Binance', sellEx: 'Bybit',
      ex1Price: 67840.50, ex2Price: 67990.20, spread: 149.70,
      diffPct: 0.22, netProfit: 14.85, unitSize: 0.1, isProfitable: true
    });
    try { audioFx?.playTradeSuccess(); } catch (_) {}
    addNotification('⚡ PAPER BOT TRADE TRIGGERED!', 'success');
  };

  const handleManualExecute = (e) => {
    e.preventDefault();
    executeOrder(side, symbol, exchange, parseFloat(amount));
  };

  const handleQuickPercent = (pct) => {
    const price  = selectedCoin.basePrice || 67840.50;
    const maxQty = (currentBalance * pct) / price;
    setAmount(maxQty.toFixed(6));
  };

  const INPUT_CLASS = "w-full h-11 bg-[#060a10] border border-slate-800 rounded-xl px-3.5 text-white font-bold text-sm outline-none focus:border-[#68a7ca]/60 transition font-mono";
  const LABEL_CLASS = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="space-y-6 font-sans">

      {/* ══════════════════════════════════════════════════════════════
          HEADER — Title + Mode Toggle + Actions
      ══════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-[#080c14] border border-[#68a7ca]/25 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">

          {/* Left: Identity */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_22px_rgba(250,204,21,0.35)]">
              <Bot className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-white font-mono uppercase tracking-tight">
                  Paper Trading & Quant Bot Deck
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border shrink-0 ${
                  walletMode === 'REAL'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : 'bg-amber-950/60 text-amber-400 border-amber-700/50'
                }`}>
                  {walletMode === 'REAL' ? '🟢 REAL METAMASK' : '🟡 PAPER SANDBOX'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Simulate trades risk-free · Automated arbitrage bot · Manual order entry
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Mode toggle */}
            <div className="flex bg-[#060a10] p-1 rounded-xl border border-slate-800 gap-1">
              {[
                { id: 'DEMO', label: 'PAPER MOCK' },
                { id: 'REAL', label: 'REAL METAMASK' },
              ].map(({ id, label }) => (
                <button key={id}
                  onClick={() => {
                    if (id === 'REAL' && !realWallet.connected) connectRealWallet('MetaMask');
                    else setWalletMode(id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    walletMode === id
                      ? id === 'REAL' ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >{label}</button>
              ))}
            </div>

            <button onClick={() => openModal('DEPOSIT')}
              className="h-9 px-4 rounded-xl bg-amber-400 text-slate-950 font-black text-[11px] hover:brightness-110 transition shadow flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" /> Deposit
            </button>
            <button onClick={() => openModal('WITHDRAW')}
              className="h-9 px-4 rounded-xl bg-[#0c0f18] border border-slate-800 text-rose-400 font-bold text-[11px] hover:border-rose-600 transition flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
            </button>
            <button onClick={resetWallet}
              className="h-9 px-4 rounded-xl bg-[#0c0f18] border border-slate-800 text-slate-400 font-bold text-[11px] hover:text-amber-400 hover:border-amber-500/50 transition flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          KPI STATS — 4-Column Grid
      ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Available Balance"
          value={`$${paperBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub={paperBalance <= 0 ? '⚠ Deposit funds to trade' : 'USDT Virtual Pool'}
          accent={paperBalance <= 0 ? 'text-rose-400' : 'text-white'}
          border={paperBalance <= 0 ? 'border-rose-700/50' : 'border-slate-800'}
        />
        <StatCard
          label="Account Equity"
          value={`$${(wallet.totalEquity ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="Cash + Open Positions"
          accent="text-[#2dd4bf]"
        />
        <StatCard
          label="Bot Cumulative Profit"
          value={`+$${(totalBotProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub={`${autoTradeCount} Trades Executed`}
          accent="text-amber-400"
          border="border-amber-500/25"
        />
        <StatCard
          label="Open / Settled"
          value={`${openPositions.length} / ${tradeHistory.length}`}
          sub="Live Sandbox Feed"
          accent="text-purple-400"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SUB-TAB SWITCHER
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex gap-2 border-b border-slate-800/70 pb-4">
        {[
          { id: 'BOT',    icon: Bot,         label: 'Automated Bot', sub: 'Quant Autopilot' },
          { id: 'MANUAL', icon: ShoppingBag, label: 'Manual Orders', sub: 'Order Entry Terminal' },
        ].map(({ id, icon: Icon, label, sub }) => {
          const active = activeDeck === id;
          return (
            <button key={id} onClick={() => setActiveDeck(id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-left transition ${
                active
                  ? id === 'BOT'
                    ? 'bg-amber-500/15 border-amber-500/40 shadow-[0_0_18px_rgba(245,158,11,0.15)]'
                    : 'bg-[#4390bc]/15 border-[#68a7ca]/35 shadow-[0_0_18px_rgba(67,144,188,0.15)]'
                  : 'bg-[#060a10] border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? (id === 'BOT' ? 'text-amber-400' : 'text-[#68a7ca]') : 'text-slate-600'}`} />
              <div>
                <div className={`text-xs font-black uppercase tracking-tight font-mono ${active ? 'text-white' : 'text-slate-400'}`}>{label}</div>
                <div className="text-[10px] text-slate-600 font-mono">{sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB 1 — AUTOMATED PAPER BOT ENGINE
      ══════════════════════════════════════════════════════════════ */}
      {activeDeck === 'BOT' && (
        <div className="space-y-5">

          {/* Bot Control Bar */}
          <div className="rounded-2xl bg-[#080c14] border border-amber-500/25 p-6 space-y-5">

            {/* Top: Status + Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border ${
                  autoTradingEnabled
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white font-mono uppercase">Autopilot Quant Bot Engine</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black border ${
                      autoTradingEnabled
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                        : 'bg-slate-900 text-slate-500 border-slate-700'
                    }`}>
                      {autoTradingEnabled ? '● ONLINE' : '◌ PAUSED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Scans 4 exchanges every 400ms · Executes spatial arbitrage ≥ {minProfitThreshold.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { setAutoTradingEnabled(!autoTradingEnabled); addNotification(`Paper Bot ${!autoTradingEnabled ? 'Activated 🟢' : 'Paused ⏸️'}`, 'info'); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase transition shadow ${
                    autoTradingEnabled
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110'
                  }`}>
                  {autoTradingEnabled ? <><Pause className="w-4 h-4" /> PAUSE BOT</> : <><Play className="w-4 h-4 fill-slate-950" /> ACTIVATE BOT</>}
                </button>
                <button
                  onClick={handleTriggerBotTrade}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase hover:brightness-110 transition shadow">
                  <Zap className="w-4 h-4 fill-slate-950" /> TRIGGER NOW
                </button>
              </div>
            </div>

            {/* Config Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">

              {/* Min Profit Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionLabel>Min Profit Threshold</SectionLabel>
                  <span className="text-amber-400 font-black font-mono text-sm">{minProfitThreshold.toFixed(2)}%</span>
                </div>
                <input type="range" min="0.10" max="5.00" step="0.10" value={minProfitThreshold}
                  onChange={e => setMinProfitThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400" />
                <div className="flex flex-wrap gap-1.5">
                  {[0.25, 0.50, 1.00, 2.50, 5.00].map(v => (
                    <button key={v} onClick={() => setMinProfitThreshold(v)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                        minProfitThreshold === v
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-[#060a10] text-slate-400 border-slate-800 hover:text-white'
                      }`}>
                      {v.toFixed(2)}%
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-[#060a10] border border-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    Bot only executes when spread ≥ <strong className="text-amber-400">{minProfitThreshold.toFixed(2)}%</strong> — min $5.00 net profit
                  </p>
                </div>
              </div>

              {/* Stop Loss */}
              <div className="space-y-3">
                <SectionLabel>Stop-Loss Capital Limit</SectionLabel>
                <input type="number" step="50" value={stopLossLimit}
                  onChange={e => setStopLossLimit(parseFloat(e.target.value))}
                  className={INPUT_CLASS.replace('focus:border-[#68a7ca]/60', 'focus:border-rose-500/60') + ' text-rose-300'} />
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                  Auto-halts the bot when daily loss exceeds this USD limit to protect your paper balance.
                </p>
              </div>

              {/* Scan Speed */}
              <div className="space-y-3">
                <SectionLabel>Scan Speed & Latency</SectionLabel>
                <div className="rounded-xl bg-[#060a10] border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-emerald-400 font-mono">400ms</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[9px] font-bold border border-emerald-700">OPTIMAL</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Sub-second orderbook spread detection across all connected exchanges</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bot Execution Log */}
          <div className="rounded-2xl bg-[#080c14] border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white font-mono uppercase">Live Bot Execution Log</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{autoTradeLogs.length} events recorded</span>
            </div>
            <div className="max-h-64 overflow-y-auto no-scrollbar p-4 space-y-2 font-mono text-[11px]">
              {autoTradeLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-600 italic">
                  No paper trades recorded yet — click <strong className="text-amber-400">TRIGGER NOW</strong> to start.
                </div>
              ) : autoTradeLogs.map(log => (
                <div key={log.id} className={`flex items-center justify-between gap-4 p-3 rounded-xl border ${
                  log.type === 'danger'
                    ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                    : 'bg-[#060a10] border-slate-800/80 text-slate-300'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-amber-400 font-bold shrink-0">[{log.time}]</span>
                    <span className="truncate">{log.text}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[9px] font-bold border border-emerald-700/60 shrink-0">
                    SETTLED
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2 — MANUAL PAPER TRADING TERMINAL
      ══════════════════════════════════════════════════════════════ */}
      {activeDeck === 'MANUAL' && (
        <div className="rounded-2xl bg-[#080c14] border border-[#68a7ca]/25 overflow-hidden">

          {/* Tab header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#68a7ca]" />
              <span className="text-xs font-black text-white font-mono uppercase">Execute Mock Paper Order</span>
            </div>
            {/* BUY / SELL toggle */}
            <div className="flex bg-[#060a10] p-1 rounded-xl border border-slate-800 gap-1">
              {['BUY', 'SELL'].map(s => (
                <button key={s} onClick={() => setSide(s)}
                  className={`px-5 py-1.5 rounded-lg text-[11px] font-black uppercase transition ${
                    side === s
                      ? s === 'BUY'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'bg-rose-500 text-white shadow'
                      : 'text-slate-500 hover:text-white'
                  }`}>
                  {s === 'BUY' ? '▲ BUY (LONG)' : '▼ SELL (SHORT)'}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualExecute} className="p-6 space-y-5">

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={LABEL_CLASS}>Crypto Pair</label>
                <select value={symbol} onChange={e => setSymbol(e.target.value)} className={INPUT_CLASS}>
                  {['BTCUSDT','ETHUSDT','SOLUSDT','LTCUSDT','AVAXUSDT'].map(s => (
                    <option key={s} value={s}>{s.replace('USDT', '/USDT')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Target Exchange</label>
                <select value={exchange} onChange={e => setExchange(e.target.value)} className={INPUT_CLASS}>
                  {['Binance Pro','Bybit Quant','OKX Institutional','Coinbase Pro'].map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Order Quantity</label>
                <input type="number" step="0.01" value={amount}
                  onChange={e => setAmount(e.target.value)} className={INPUT_CLASS} />
              </div>
            </div>

            {/* Quick % Chips */}
            <div className="rounded-xl bg-[#060a10] border border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide shrink-0">Quick Size:</span>
              <div className="flex flex-wrap gap-2">
                {[['25%', 0.25], ['50%', 0.50], ['75%', 0.75], ['MAX', 1.0]].map(([label, pct]) => (
                  <button key={label} type="button" onClick={() => handleQuickPercent(pct)}
                    className="h-8 px-4 rounded-lg bg-[#0c0f18] hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[11px] transition">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Warnings / Cost Preview */}
            {side === 'BUY' && paperBalance <= 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-700/60 text-rose-300 text-[11px] font-mono font-bold flex items-center gap-2">
                ⚠ Wallet balance is $0.00 — deposit funds before placing a BUY order.
              </div>
            )}

            {side === 'BUY' && parseFloat(amount) > 0 && (
              <div className="rounded-xl bg-[#060a10] border border-slate-800 px-5 py-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Estimated Cost</span>
                <span className="text-sm font-black text-white font-mono">
                  ${(parseFloat(amount) * (selectedCoin.basePrice || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                </span>
              </div>
            )}

            {/* Submit */}
            <button type="submit"
              disabled={side === 'BUY' && paperBalance <= 0}
              className={`w-full h-13 py-3.5 rounded-xl font-black font-mono text-sm uppercase tracking-widest transition shadow-lg ${
                side === 'BUY'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:brightness-110'
              }`}>
              {side === 'BUY' && paperBalance <= 0
                ? '⚠ DEPOSIT FUNDS TO TRADE'
                : `▶ EXECUTE ${side} — ${symbol.replace('USDT', '/USDT')}`}
            </button>

          </form>
        </div>
      )}

    </div>
  );
};
