import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';

export const ArbitragePanel = memo(() => {
  const { marketData, executeManualTrade } = useCrypto();

  const liveMarketRows = [
    { coin: 'Bitcoin', symbol: 'BTC', icon: '₿', bg: 'bg-amber-500', change: '+12.50%', isUp: true, cap: '$3.560M', vol: '$85.20M', price: '$45,830.22' },
    { coin: 'Ethereum', symbol: 'ETH', icon: 'Ξ', bg: 'bg-indigo-500', change: '-2.40%', isUp: false, cap: '$1.840M', vol: '$42.10M', price: '$3,245.03' },
    { coin: 'Solana', symbol: 'SOL', icon: '◎', bg: 'bg-purple-500', change: '+8.10%', isUp: true, cap: '$890.5M', vol: '$28.40M', price: '$184.75' },
    { coin: 'Litecoin', symbol: 'LTC', icon: 'Ł', bg: 'bg-sky-500', change: '+14.15%', isUp: true, cap: '$420.0M', vol: '$12.80M', price: '$112.50' }
  ];

  return (
    <div className="cyber-panel space-y-4 font-sans">
      
      {/* Header Bar (Matching Reference Image) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 className="text-base font-extrabold text-white">Live Market</h3>
        <span className="text-xs text-blue-400 font-mono font-semibold cursor-pointer hover:underline">
          View More
        </span>
      </div>

      {/* Table (Matching Reference Image) */}
      <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-800/80">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#1c202c] border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold">
              <th className="py-3 px-4">Coin</th>
              <th className="py-3 px-4">Change</th>
              <th className="py-3 px-4">Market Cap</th>
              <th className="py-3 px-4">24h Volume</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-[#161924]">
            {liveMarketRows.map((row) => (
              <tr key={row.symbol} className="hover:bg-[#1f2434] transition">
                
                {/* Coin */}
                <td className="py-3.5 px-4 font-bold text-white">
                  <div className="flex items-center space-x-3">
                    <div className={`w-7 h-7 rounded-full ${row.bg} flex items-center justify-center font-bold text-white text-xs`}>
                      {row.icon}
                    </div>
                    <span>{row.coin}</span>
                  </div>
                </td>

                {/* Change */}
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    row.isUp
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {row.change}
                  </span>
                </td>

                {/* Market Cap */}
                <td className="py-3.5 px-4 text-slate-300">{row.cap}</td>

                {/* 24h Volume */}
                <td className="py-3.5 px-4 text-slate-400">{row.vol}</td>

                {/* Price */}
                <td className="py-3.5 px-4 font-bold text-white">{row.price}</td>

                {/* Action */}
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => executeManualTrade(`${row.symbol}USDT`, 'Binance', 'Bybit', 0.5)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
});
