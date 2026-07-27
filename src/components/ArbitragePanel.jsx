import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ArrowRightLeft, Sparkles, Zap, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const ArbitragePanel = memo(() => {
  const { arbitrageOpps, executeManualTrade } = useCrypto();

  const sampleOpps = arbitrageOpps && arbitrageOpps.length > 0 ? arbitrageOpps : [
    { symbol: 'BTCUSDT', buyExchange: 'Binance', sellExchange: 'Bybit', ex1Price: 67820.50, ex2Price: 68140.00, diffPct: 0.47, netProfit: 146.19, isProfitable: true },
    { symbol: 'ETHUSDT', buyExchange: 'OKX', sellExchange: 'Coinbase', ex1Price: 3520.10, ex2Price: 3548.80, diffPct: 0.82, netProfit: 109.17, isProfitable: true },
    { symbol: 'SOLUSDT', buyExchange: 'Bybit', sellExchange: 'Binance', ex1Price: 182.40, ex2Price: 185.90, diffPct: 1.92, netProfit: 171.32, isProfitable: true },
    { symbol: 'AVAXUSDT', buyExchange: 'Coinbase', sellExchange: 'OKX', ex1Price: 37.80, ex2Price: 38.65, diffPct: 2.25, netProfit: 83.47, isProfitable: true }
  ];

  return (
    <div className="chainblock-card space-y-4 font-sans mb-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="w-5 h-5 text-[#34d399]" />
          <h3 className="text-base font-extrabold text-white font-mono">SPATIAL ARBITRAGE OPPORTUNITIES MATRIX</h3>
        </div>
        <span className="text-xs font-mono text-[#34d399] font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" /> REAL-TIME ORDERBOOK SCANNING
        </span>
      </div>

      {/* Grid of Spatial Opportunity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sampleOpps.map((opp) => (
          <div 
            key={opp.symbol}
            className="p-4 rounded-xl bg-[#080b12] border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3 shadow-inner"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-mono">
                <span className="font-extrabold text-sm text-white">{opp.symbol}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-[#34d399] border border-emerald-800 text-[10px] font-bold">
                  +{opp.diffPct}% SPREAD
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#34d399]">
                +${opp.netProfit} EST. NET
              </span>
            </div>

            {/* Route Direction Box */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#111522] border border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Leg 1: Buy Exchange</span>
                <span className="text-[#34d399] font-bold block">{opp.buyExchange}</span>
                <span className="text-slate-300 text-[11px]">${typeof opp.ex1Price === 'number' ? opp.ex1Price.toLocaleString() : opp.ex1Price}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Leg 2: Sell Exchange</span>
                <span className="text-purple-400 font-bold block">{opp.sellExchange}</span>
                <span className="text-slate-300 text-[11px]">${typeof opp.ex2Price === 'number' ? opp.ex2Price.toLocaleString() : opp.ex2Price}</span>
              </div>
            </div>

            <button
              onClick={() => executeManualTrade(opp.symbol, opp.buyExchange, opp.sellExchange, opp.unitSize || 0.5)}
              className="w-full py-2.5 rounded-xl bg-[#34d399] text-black font-extrabold text-xs font-sans hover:brightness-110 shadow-lg flex items-center justify-center gap-1.5 transition"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>EXECUTE SPATIAL ROUTE (BUY {opp.buyExchange.toUpperCase()} ➔ SELL {opp.sellExchange.toUpperCase()})</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
});
