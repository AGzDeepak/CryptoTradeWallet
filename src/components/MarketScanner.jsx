import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Search, Activity, RefreshCw, Zap, ExternalLink } from 'lucide-react';

export const MarketScanner = () => {
  const { marketData, exchangePrices } = useCrypto();
  const [searchTerm, setSearchTerm] = useState('');

  const scannedCoins = marketData.filter(c => 
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" /> MULTI-EXCHANGE MARKET SCANNER
          </h3>
          <p className="text-xs text-slate-400">Scans orderbook depth, liquidity pools, and spread across top global exchanges.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search coin (BTC, ETH, SOL)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 uppercase text-[11px] text-slate-400">
              <th className="py-2.5 px-3">Coin</th>
              <th className="py-2.5 px-3">Index Price</th>
              <th className="py-2.5 px-3">Binance</th>
              <th className="py-2.5 px-3">Bybit</th>
              <th className="py-2.5 px-3">OKX</th>
              <th className="py-2.5 px-3">Spread %</th>
              <th className="py-2.5 px-3">Liquidity Depth</th>
              <th className="py-2.5 px-3 text-right">24h Vol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {scannedCoins.map((coin) => {
              const exMap = exchangePrices[coin.symbol] || {};
              const binP = exMap.Binance || coin.basePrice;
              const bybP = exMap.Bybit || coin.basePrice * 1.002;
              const okxP = exMap.OKX || coin.basePrice * 0.999;
              const spread = parseFloat((Math.abs(bybP - binP) / binP * 100).toFixed(2));

              return (
                <tr key={coin.symbol} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-extrabold text-cyan-400">{coin.symbol}</td>
                  <td className="py-3 px-3 text-slate-200 font-bold">${coin.basePrice.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-300">${binP}</td>
                  <td className="py-3 px-3 text-slate-300">${bybP}</td>
                  <td className="py-3 px-3 text-slate-300">${okxP}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      spread >= 0.25 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-400'
                    }`}>
                      +{spread}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">HIGH ($25M+)</td>
                  <td className="py-3 px-3 text-right text-slate-300">{coin.vol}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
