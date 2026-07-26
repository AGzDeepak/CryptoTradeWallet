import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const PortfolioWidget = () => {
  const portfolioCoins = [
    { symbol: 'ETH', name: 'Ethereum', price: '$3,245.03', change: '-12.40%', isUp: false, amount: '0.12543 ETH', bg: 'bg-indigo-500', icon: 'Ξ' },
    { symbol: 'BTC', name: 'Bitcoin', price: '$3,245.03', change: '-8.20%', isUp: false, amount: '0.12543 BTC', bg: 'bg-amber-500', icon: '₿' },
    { symbol: 'LTC', name: 'Litecoin', price: '$3,245.03', change: '+14.15%', isUp: true, amount: '0.12543 LTC', bg: 'bg-sky-500', icon: 'Ł' },
    { symbol: 'SOL', name: 'Solana', price: '$3,245.03', change: '-5.00%', isUp: false, amount: '0.12543 SOL', bg: 'bg-purple-500', icon: '◎' },
    { symbol: 'BNB', name: 'Binance Coin', price: '$3,245.03', change: '+11.20%', isUp: true, amount: '0.12543 BNB', bg: 'bg-[#f3ba2f]', icon: 'B' }
  ];

  return (
    <div className="cyber-panel space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 className="text-base font-extrabold text-white">My Portfolio</h3>
        <span className="text-xs text-blue-400 font-mono font-semibold cursor-pointer hover:underline">View All</span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {portfolioCoins.map((coin) => (
          <div key={coin.symbol} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1c202c] border border-slate-800/80 hover:border-slate-700 transition">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full ${coin.bg} flex items-center justify-center font-bold text-white text-xs`}>
                {coin.icon}
              </div>
              <div>
                <span className="font-bold text-slate-100 block leading-none">{coin.name}</span>
                <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">{coin.price}</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-[11px] font-bold block ${coin.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {coin.change}
              </span>
              <span className="text-[10px] text-slate-400 font-sans block">{coin.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
