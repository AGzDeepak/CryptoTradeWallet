import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ArrowUpRight, Clock, XCircle, Activity, Sparkles } from 'lucide-react';

export const LivePositions = () => {
  const { openPositions, closePosition } = useCrypto();

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-extrabold text-white">LIVE OPEN POSITIONS</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
          {openPositions.length} POSITIONS ACTIVE
        </span>
      </div>

      {openPositions.length === 0 ? (
        <div className="text-center py-8 text-slate-500 font-mono text-xs">
          No open positions currently. Enable Auto-Trader Bot to automatically execute arbitrage trades.
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 uppercase text-[11px] text-slate-400">
                <th className="py-2.5 px-3">Position ID</th>
                <th className="py-2.5 px-3">Pair</th>
                <th className="py-2.5 px-3">Buy / Sell Exchanges</th>
                <th className="py-2.5 px-3">Entry Prices</th>
                <th className="py-2.5 px-3">Live Prices</th>
                <th className="py-2.5 px-3">Spread %</th>
                <th className="py-2.5 px-3">Live PnL ($)</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {openPositions.map((pos) => {
                const isProfitable = pos.unrealizedPnL >= 0;
                return (
                  <tr key={pos.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 text-slate-400 font-semibold">{pos.id}</td>
                    <td className="py-3 px-3 font-bold text-cyan-400">{pos.symbol}</td>
                    <td className="py-3 px-3 text-slate-300">
                      <span className="text-emerald-400 font-semibold">{pos.buyExchange}</span> → <span className="text-purple-400 font-semibold">{pos.sellExchange}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      ${pos.entryBuyPrice} / ${pos.entrySellPrice}
                    </td>
                    <td className="py-3 px-3 text-slate-200">
                      ${pos.currentBuyPrice} / ${pos.currentSellPrice}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-cyan-300 border border-slate-800 font-bold">
                        +{pos.spreadPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-extrabold text-sm ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfitable ? '+' : ''}${pos.unrealizedPnL}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {pos.duration}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => closePosition(pos.id)}
                        className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold transition"
                      >
                        CLOSE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
