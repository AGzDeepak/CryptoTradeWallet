import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { TrendingUp, TrendingDown, Activity, ShieldCheck, Zap } from 'lucide-react';

export const GlobalTickerBar = memo(() => {
  const { marketData, exchangeHealth, priceFlashMap } = useCrypto();

  return (
    <div className="bg-[#0b0f17] border-b border-slate-800/80 px-4 h-9 flex items-center justify-between z-40 font-mono text-[11px] overflow-hidden shrink-0">
      
      {/* Live Tickers Stream */}
      <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center space-x-1.5 text-teal-400 font-bold shrink-0">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="uppercase text-[10px] tracking-wider">LIVE TICKER FEED:</span>
        </div>

        {marketData.map((coin) => {
          const isUp = coin.change24 >= 0;
          const flash = priceFlashMap[coin.symbol];
          return (
            <div 
              key={coin.symbol}
              className={`flex items-center space-x-2 shrink-0 px-2 py-0.5 rounded transition-colors duration-300 ${
                flash === 'up' ? 'bg-emerald-950/80 text-emerald-400' : flash === 'down' ? 'bg-rose-950/80 text-rose-400' : 'text-slate-300'
              }`}
            >
              <span className="font-bold text-white text-[11px]">{coin.symbol}</span>
              <span className="font-semibold text-slate-200">${coin.basePrice.toLocaleString()}</span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isUp ? 'text-teal-400' : 'text-rose-400'}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? '+' : ''}{coin.change24}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Exchange Gateways & Security Telemetry (Right) */}
      <div className="hidden lg:flex items-center space-x-4 shrink-0 border-l border-slate-800/80 pl-4 text-slate-400 text-[10px]">
        <div className="flex items-center space-x-1 text-teal-400">
          <Zap className="w-3 h-3" />
          <span>LATENCY: 12ms</span>
        </div>
        <div className="flex items-center space-x-1 text-indigo-400">
          <ShieldCheck className="w-3 h-3" />
          <span>SSL 256-BIT ENCRYPTED</span>
        </div>
      </div>

    </div>
  );
});
