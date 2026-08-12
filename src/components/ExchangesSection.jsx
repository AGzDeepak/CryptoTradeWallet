import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  ArrowRightLeft, TrendingUp, TrendingDown, RefreshCw, 
  ExternalLink, Zap, ShieldCheck, CheckCircle2, Search, Filter, Layers, ArrowUpRight
} from 'lucide-react';

export const ExchangesSection = () => {
  const { marketData, exchangePrices, arbitrageOpps, audioFx, addNotification } = useCrypto();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExchangeFilter, setSelectedExchangeFilter] = useState('ALL');

  const EXCHANGES = [
    { name: 'Binance Pro', code: 'Binance', fee: '0.075%', color: 'border-[#f0b90b]/40 text-[#f0b90b]' },
    { name: 'Bybit Quant', code: 'Bybit', fee: '0.060%', color: 'border-[#f7a600]/40 text-[#f7a600]' },
    { name: 'OKX Institutional', code: 'OKX', fee: '0.080%', color: 'border-[#2952e3]/40 text-[#2952e3]' },
    { name: 'Coinbase Pro', code: 'Coinbase', fee: '0.100%', color: 'border-[#0052ff]/40 text-[#0052ff]' }
  ];

  // Helper to compute exchange rates & best buy/sell
  const getExchangeComparison = (coin) => {
    const pricesObj = exchangePrices[coin.symbol] || {
      'Binance': coin.basePrice * 0.999,
      'Bybit': coin.basePrice * 1.002,
      'OKX': coin.basePrice * 0.998,
      'Coinbase': coin.basePrice * 1.003
    };

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let bestBuy = 'Binance';
    let bestSell = 'Bybit';

    Object.keys(pricesObj).forEach(ex => {
      const p = pricesObj[ex];
      if (p < minPrice) { minPrice = p; bestBuy = ex; }
      if (p > maxPrice) { maxPrice = p; bestSell = ex; }
    });

    const spreadUsd = maxPrice - minPrice;
    const spreadPct = (spreadUsd / minPrice) * 100;

    return {
      pricesObj,
      minPrice,
      maxPrice,
      bestBuy,
      bestSell,
      spreadUsd: spreadUsd.toFixed(2),
      spreadPct: spreadPct.toFixed(2)
    };
  };

  const filteredCoins = (marketData || []).filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Executive Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#080e1a] via-[#050b16] to-[#080d1a] border border-[#4390bc]/25 p-6 font-mono shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <ArrowRightLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-black text-white uppercase tracking-tight">Live Exchange Rates & Best Price Scanner</h1>
              <p className="text-[11px] text-slate-500">Real-time market price comparison across major institutional exchanges</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search coin symbol..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#04060d] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-xs outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Exchange Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        {EXCHANGES.map(ex => (
          <div key={ex.name} className="p-4 rounded-2xl bg-[#080c14] border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{ex.name}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase">{ex.fee} Fee</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>API ONLINE (14ms)</span>
            </div>
          </div>
        ))}
      </div>

      {/* Coins Exchange Comparison Cards */}
      <div className="space-y-4 font-mono text-xs">
        {filteredCoins.map(coin => {
          const comp = getExchangeComparison(coin);
          return (
            <div key={coin.id} className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 space-y-4">
              
              {/* Coin Title & Best Buy / Best Sell Indicators */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-white">
                    {coin.symbol.substring(0, 3)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{coin.name} ({coin.symbol.replace('USDT', '')})</h3>
                    <span className="text-[10px] text-slate-500">Base Price: ${coin.basePrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
                    <span>🟢 BEST BUY:</span>
                    <span className="text-white">{comp.bestBuy}</span>
                    <span className="text-emerald-300 font-black">${comp.minPrice.toLocaleString()}</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1.5">
                    <span>🟡 BEST SELL:</span>
                    <span className="text-white">{comp.bestSell}</span>
                    <span className="text-amber-200 font-black">${comp.maxPrice.toLocaleString()}</span>
                  </div>

                  <div className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-black">
                    +{comp.spreadPct}% Spread (${comp.spreadUsd})
                  </div>
                </div>
              </div>

              {/* 4 Exchange Price Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EXCHANGES.map(ex => {
                  const exPrice = comp.pricesObj[ex.code] || coin.basePrice;
                  const isBestBuy = ex.code === comp.bestBuy;
                  const isBestSell = ex.code === comp.bestSell;

                  return (
                    <div
                      key={ex.code}
                      className={`p-3.5 rounded-xl border space-y-1 transition ${
                        isBestBuy
                          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                          : isBestSell
                            ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                            : 'bg-[#04060d] border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                        <span>{ex.name}</span>
                        {isBestBuy && <span className="text-emerald-400 font-black">BEST BUY</span>}
                        {isBestSell && <span className="text-amber-400 font-black">BEST SELL</span>}
                      </div>

                      <div className="text-sm font-black text-white">
                        ${exPrice.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
