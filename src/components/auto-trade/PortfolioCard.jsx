import React from 'react';
import { Wallet, PieChart, TrendingUp, TrendingDown, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const PortfolioCard = ({
  walletBalanceUsd = 12480.50,
  currentPosition = null, // { symbol: 'ETH/USDT', amount: 0.5, entryPrice: 3520.10 }
  currentPrice = 3542.80,
  todayPnlUsd = 42.50,
  totalTrades = 24,
  successfulTrades = 21,
  failedTrades = 3,
}) => {
  let unrealizedPnlUsd = 0;
  let unrealizedPnlPct = 0;

  if (currentPosition && currentPosition.amount > 0) {
    unrealizedPnlUsd = (currentPrice - currentPosition.entryPrice) * currentPosition.amount;
    unrealizedPnlPct = ((currentPrice - currentPosition.entryPrice) / currentPosition.entryPrice) * 100;
  }

  const isProfit = unrealizedPnlUsd >= 0;

  return (
    <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Portfolio & Position Metrics</h3>
            <p className="text-[11px] text-slate-400">Live balance & performance counters</p>
          </div>
        </div>
      </div>

      {/* Top Balances Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">Available Balance</span>
          <span className="text-base font-extrabold text-white mt-0.5 block font-mono">
            ${fmt(walletBalanceUsd)} USDT
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">Current Position</span>
          <span className="text-base font-bold text-slate-200 mt-0.5 block font-mono truncate">
            {currentPosition && currentPosition.amount > 0
              ? `${currentPosition.amount} ETH`
              : 'FLAT / NONE'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">Unrealized P/L</span>
          <span className={`text-base font-extrabold mt-0.5 block font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}${fmt(unrealizedPnlUsd)} ({isProfit ? '+' : ''}{unrealizedPnlPct.toFixed(2)}%)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block">Today's Total P/L</span>
          <span className={`text-base font-extrabold mt-0.5 block font-mono ${todayPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {todayPnlUsd >= 0 ? '+' : ''}${fmt(todayPnlUsd)} USDT
          </span>
        </div>
      </div>

      {/* Trade Counters Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
        <div className="p-2.5 rounded-xl bg-[#060d18] border border-slate-800/80 flex items-center justify-between px-4">
          <span className="text-slate-400">Total Trades</span>
          <span className="font-bold text-white text-sm">{totalTrades}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#060d18] border border-slate-800/80 flex items-center justify-between px-4">
          <span className="text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Successful
          </span>
          <span className="font-bold text-emerald-400 text-sm">{successfulTrades}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#060d18] border border-slate-800/80 flex items-center justify-between px-4">
          <span className="text-slate-400 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> Failed / Blocked
          </span>
          <span className="font-bold text-rose-400 text-sm">{failedTrades}</span>
        </div>
      </div>
    </div>
  );
};
