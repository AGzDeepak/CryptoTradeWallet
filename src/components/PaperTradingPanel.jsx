import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  Bot, Play, Pause, Zap, ShoppingBag, PlusCircle, ArrowUpRight,
  RefreshCw, Activity, Terminal, CheckCircle2, ShieldCheck, DollarSign
} from 'lucide-react';

export const PaperTradingPanel = () => {
  const {
    wallet,
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
  const paperBalance = wallet.virtualBalance ?? 0;

  const handleTriggerBotTrade = () => {
    const topOpp = (arbitrageOpps || []).filter(o => o.isProfitable).sort((a, b) => b.netProfit - a.netProfit)[0];
    executeAutoTrade(topOpp || {
      symbol: 'BTCUSDT', buyEx: 'Binance', sellEx: 'Bybit',
      ex1Price: 67840.50, ex2Price: 67990.20, spread: 149.70,
      diffPct: 0.22, netProfit: 14.85, unitSize: 0.1, isProfitable: true
    });
    try { audioFx?.playTradeSuccess(); } catch (_) {}
    addNotification('⚡ Paper Bot Trade Executed!', 'success');
  };

  const handleManualExecute = (e) => {
    e.preventDefault();
    executeOrder(side, symbol, exchange, parseFloat(amount));
  };

  const handleQuickPercent = (pct) => {
    const price = selectedCoin.basePrice || 67840.50;
    const maxQty = (paperBalance * pct) / price;
    setAmount(maxQty.toFixed(6));
  };

  const INPUT_CLASS = "w-full h-11 bg-[#04060d] border border-slate-800/80 rounded-xl px-4 text-white font-bold text-xs outline-none focus:border-[#4390bc]/60 transition font-mono";
  const LABEL_CLASS = "block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="space-y-5 font-sans">

      {/* ══════════════════════════════════════════════════════
          HERO HEADER CARD
      ══════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-gradient-to-br from-[#080e1a] to-[#06080f] border border-[#4390bc]/20 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">

          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_22px_rgba(251,191,36,0.35)]">
              <Bot className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-base font-black text-white font-mono uppercase tracking-tight">
                  Paper Trading & Quant Bot
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-950/70 text-amber-400 border border-amber-700/50">
                  SANDBOX MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Risk-free spatial arbitrage simulation & automated trading bot
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => openModal ? openModal('DEPOSIT') : null}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider shadow hover:brightness-110 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" /> Deposit
            </button>

            <button
              onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
              className={`h-10 px-4 rounded-xl font-black font-mono text-xs uppercase transition shadow flex items-center gap-1.5 ${
                autoTradingEnabled
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 hover:bg-rose-900'
                  : 'bg-amber-400 text-slate-950 hover:brightness-110'
              }`}
            >
              {autoTradingEnabled ? <><Pause className="w-3.5 h-3.5" /> Pause Bot</> : <><Play className="w-3.5 h-3.5 fill-slate-950" /> Start Bot</>}
            </button>

            <button
              onClick={handleTriggerBotTrade}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black font-mono text-xs uppercase hover:brightness-110 transition shadow flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" /> Trigger Trade
            </button>

            <button
              onClick={resetWallet}
              className="h-10 px-3 rounded-xl bg-[#04060d] border border-slate-800 text-slate-400 hover:text-white transition"
              title="Reset Sandbox Balance"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-5 border-t border-slate-800/60 mt-5 font-mono text-xs">
          {[
            { id: 'BOT',    label: 'Quant Bot Engine', icon: Bot },
            { id: 'MANUAL', label: 'Manual Order Entry', icon: ShoppingBag }
          ].map(({ id, label, icon: Icon }) => {
            const active = activeDeck === id;
            return (
              <button
                key={id}
                onClick={() => setActiveDeck(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition border ${
                  active
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-[#04060d] text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-400' : 'text-slate-600'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          KPI STATS GRID
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Available Balance</span>
          <div className="text-2xl font-black text-white tracking-tight">
            ${paperBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 block">USDT Virtual Balance</span>
        </div>

        <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Account Equity</span>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            ${(wallet.totalEquity ?? paperBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 block">Cash + Active Positions</span>
        </div>

        <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Bot Cumulative Profit</span>
          <div className="text-2xl font-black text-amber-400 tracking-tight">
            +${(totalBotProfit || 0).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 block">{autoTradeCount} Trades Settled</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB 1: QUANT BOT ENGINE
      ══════════════════════════════════════════════════════ */}
      {activeDeck === 'BOT' && (
        <div className="space-y-5">
          
          {/* Bot Control Card */}
          <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/70">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${autoTradingEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <div>
                  <h3 className="text-xs font-black text-white font-mono uppercase">
                    Autopilot Quant Engine Status: <span className={autoTradingEnabled ? 'text-emerald-400' : 'text-slate-400'}>{autoTradingEnabled ? 'ONLINE' : 'PAUSED'}</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Scans exchanges every 400ms · Auto-executes profitable spatial arbitrage routes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">Spread Threshold:</span>
                <span className="text-amber-400 font-black">{minProfitThreshold.toFixed(2)}%</span>
              </div>
            </div>

            {/* Min Profit Slider Controls */}
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Minimum Spread Gate (% Profit)</span>
                <span className="text-amber-400 font-bold">{minProfitThreshold.toFixed(2)}%</span>
              </div>

              <input
                type="range"
                min="0.10"
                max="5.00"
                step="0.10"
                value={minProfitThreshold}
                onChange={e => setMinProfitThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#04060d] rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex flex-wrap gap-2">
                {[0.25, 0.50, 1.00, 2.50, 5.00].map(v => (
                  <button
                    key={v}
                    onClick={() => setMinProfitThreshold(v)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition border ${
                      minProfitThreshold === v
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-[#04060d] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {v.toFixed(2)}%
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Live Bot Execution Log */}
          <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/70 bg-[#060a10]/60 font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase">Bot Execution Log</h3>
              </div>
              <span className="text-[10px] text-slate-500">{autoTradeLogs.length} events</span>
            </div>

            <div className="max-h-64 overflow-y-auto no-scrollbar p-4 space-y-2 font-mono text-[11px]">
              {autoTradeLogs.length === 0 ? (
                <div className="py-10 text-center text-slate-600 italic">
                  No trades executed yet — click <strong className="text-amber-400">Trigger Trade</strong> to run a paper order.
                </div>
              ) : autoTradeLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#04060d] border border-slate-800/70 text-slate-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-amber-400 font-bold shrink-0">[{log.time}]</span>
                    <span className="truncate">{log.text}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                    SETTLED
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2: MANUAL ORDER ENTRY
      ══════════════════════════════════════════════════════ */}
      {activeDeck === 'MANUAL' && (
        <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-6 space-y-5 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black text-white uppercase">Manual Paper Order</h3>
            </div>
            
            {/* BUY / SELL toggle */}
            <div className="flex bg-[#04060d] p-1 rounded-xl border border-slate-800 gap-1">
              {['BUY', 'SELL'].map(s => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
                    side === s
                      ? s === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleManualExecute} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={LABEL_CLASS}>Crypto Pair</label>
                <select value={symbol} onChange={e => setSymbol(e.target.value)} className={INPUT_CLASS}>
                  {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'LTCUSDT', 'AVAXUSDT'].map(s => (
                    <option key={s} value={s}>{s.replace('USDT', '/USDT')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>Target Exchange</label>
                <select value={exchange} onChange={e => setExchange(e.target.value)} className={INPUT_CLASS}>
                  {['Binance Pro', 'Bybit Quant', 'OKX Institutional', 'Coinbase Pro'].map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>Order Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Quick % chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">Quick Size:</span>
              {[['25%', 0.25], ['50%', 0.50], ['75%', 0.75], ['MAX', 1.0]].map(([label, pct]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickPercent(pct)}
                  className="px-3 py-1 rounded-lg bg-[#04060d] hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-bold transition"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Warnings */}
            {side === 'BUY' && paperBalance < 2 && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-[11px] font-bold">
                ⚠ Balance is ${paperBalance.toFixed(2)} — minimum $2.00 required for BUY order.
              </div>
            )}

            <button
              type="submit"
              disabled={side === 'BUY' && paperBalance < 2}
              className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-lg ${
                side === 'BUY'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 disabled:opacity-40'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:brightness-110'
              }`}
            >
              {side === 'BUY' && paperBalance < 2
                ? '⚠ MIN $2.00 REQUIRED'
                : `▶ EXECUTE ${side} — ${symbol.replace('USDT', '/USDT')}`}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
