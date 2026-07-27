import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { LineChart, TrendingUp, TrendingDown, ArrowRightLeft, Sparkles } from 'lucide-react';

export const WatchlistPanel = memo(() => {
  const { marketData, priceFlashMap, executeManualTrade } = useCrypto();

  return (
    <div className="chainblock-card space-y-4 font-sans">
      
      {/* Header Baseline */}
      <div className="card-header-baseline">
        <div className="flex items-center space-x-2">
          <LineChart className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-extrabold text-white font-mono tracking-tight">MARKET WATCHLIST & DEPTH</h3>
        </div>
        <span className="text-[10px] font-mono text-teal-400 font-bold px-2 py-0.5 rounded bg-teal-950/80 border border-teal-500/40">
          6 MARKETS LIVE
        </span>
      </div>

      {/* Watchlist Table */}
      <div className="space-y-2 font-mono text-xs">
        {marketData.map((coin) => {
          const isUp = coin.change24 >= 0;
          const flash = priceFlashMap[coin.symbol];
          return (
            <div
              key={coin.symbol}
              className={`p-3 rounded-xl border border-slate-800/80 bg-[#0b1120] hover:border-teal-500/40 transition-all flex items-center justify-between cursor-pointer ${
                flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-white text-xs">
                  {coin.symbol.substring(0, 3)}
                </div>
                <div>
                  <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <span>{coin.symbol}</span>
                    <span className="text-[9px] text-slate-400 font-normal">{coin.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Vol: {coin.vol}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-white text-xs block">${coin.basePrice.toLocaleString()}</span>
                <span className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-teal-400' : 'text-rose-400'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isUp ? '+' : ''}{coin.change24}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exchange Depth Orderbook Bar */}
      <div className="p-3 rounded-xl bg-[#080b12] border border-slate-800 space-y-2 font-mono text-xs">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span className="text-teal-400 font-bold">Bids Depth (58%)</span>
          <span className="text-rose-400 font-bold">Asks Depth (42%)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
          <div style={{ width: '58%' }} className="h-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
          <div style={{ width: '42%' }} className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
        </div>
      </div>

    </div>
  );
});
