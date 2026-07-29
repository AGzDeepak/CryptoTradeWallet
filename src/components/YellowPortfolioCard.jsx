import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { MoreHorizontal, TrendingUp } from 'lucide-react';

export const YellowPortfolioCard = memo(() => {
  const { openModal } = useCrypto();

  const portfolioItems = [
    { name: 'Bitcoin', symbol: 'BTC', pct: '40%', change: '+2.5%', isUp: true, icon: '₿', badgeBg: 'bg-amber-500', badgeText: 'text-amber-950', ringColor: 'border-amber-400' },
    { name: 'Ethereum', symbol: 'ETH', pct: '30%', change: '+1.8%', isUp: true, icon: 'Ξ', badgeBg: 'bg-indigo-500', badgeText: 'text-indigo-950', ringColor: 'border-indigo-400' },
    { name: 'Solana', symbol: 'SOL', pct: '15%', change: '+4.2%', isUp: true, icon: '≡', badgeBg: 'bg-purple-500', badgeText: 'text-purple-950', ringColor: 'border-purple-400' },
    { name: 'Tether', symbol: 'USDT', pct: '10%', change: '0.0%', isUp: true, icon: '₮', badgeBg: 'bg-emerald-500', badgeText: 'text-emerald-950', ringColor: 'border-emerald-400' },
    { name: 'Ripple', symbol: 'XRP', pct: '5%', change: '+3.5%', isUp: true, icon: '✕', badgeBg: 'bg-cyan-500', badgeText: 'text-cyan-950', ringColor: 'border-cyan-400' }
  ];

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-[0_15px_40px_-10px_rgba(245,158,11,0.45)] space-y-4 font-mono">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/15">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold font-sans text-slate-950 tracking-tight leading-none">
              My Portfolio
            </h3>
            <span className="text-[10px] font-bold text-slate-900 opacity-80">Live Asset Allocation</span>
          </div>
        </div>
        <button 
          onClick={() => openModal('PORTFOLIO_DETAILS')}
          className="p-1.5 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition"
          title="Portfolio Options"
        >
          <MoreHorizontal className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* List of Colored Coins */}
      <div className="space-y-2.5">
        {portfolioItems.map((coin, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/10 hover:bg-slate-950/15 border border-black/5 transition"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full ${coin.badgeBg} ${coin.badgeText} flex items-center justify-center font-extrabold text-base shadow-md border-2 ${coin.ringColor}`}>
                {coin.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-950 font-sans leading-none">{coin.name}</h4>
                <span className="text-[10px] text-slate-900 font-bold block mt-0.5 opacity-80">{coin.symbol}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-extrabold text-sm text-slate-950 block">{coin.pct}</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 shadow-sm ${
                coin.isUp ? 'bg-slate-950 text-emerald-300' : 'bg-slate-950 text-rose-300'
              }`}>
                {coin.change}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
});
