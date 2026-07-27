import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { MoreHorizontal } from 'lucide-react';

export const YellowPortfolioCard = memo(() => {
  const { openModal } = useCrypto();

  const portfolioItems = [
    { name: 'Bitcoin', symbol: 'BTC', pct: '37%', change: '+2.5%', isUp: true, icon: '₿' },
    { name: 'Tether', symbol: 'USDT', pct: '23%', change: '-3.5%', isUp: false, icon: '₮' },
    { name: 'Ethereum', symbol: 'ETH', pct: '20%', change: '-1.5%', isUp: false, icon: 'Ξ' },
    { name: 'Ripple', symbol: 'XLA', pct: '17%', change: '+3.5%', isUp: true, icon: '❖' },
    { name: 'Ethereum', symbol: 'ETH', pct: '20%', change: '+2.5%', isUp: true, icon: 'Ξ' }
  ];

  return (
    <div className="yellow-portfolio-card space-y-4 font-sans text-slate-950 font-mono">
      
      {/* Header matching reference screenshot */}
      <div className="flex items-center justify-between pb-2 border-b border-black/10">
        <h3 className="text-xl font-extrabold font-sans text-slate-950 tracking-tight">
          My Portfolio
        </h3>
        <button 
          onClick={() => openModal('PORTFOLIO_DETAILS')}
          className="p-1 rounded-lg text-slate-950 hover:bg-black/10 transition"
        >
          <MoreHorizontal className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* List of Coins matching reference screenshot */}
      <div className="space-y-3">
        {portfolioItems.map((coin, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-black/5 transition"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-950 text-[#facc15] flex items-center justify-center font-bold text-base shadow-md">
                {coin.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-950 font-sans leading-none">{coin.name}</h4>
                <span className="text-[10px] text-slate-800 font-bold block mt-0.5">{coin.symbol}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-extrabold text-sm text-slate-950 block">{coin.pct}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                coin.isUp ? 'bg-slate-950 text-[#2dd4bf]' : 'bg-slate-950 text-rose-400'
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
