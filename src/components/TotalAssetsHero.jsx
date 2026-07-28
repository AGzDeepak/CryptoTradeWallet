import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Bot } from 'lucide-react';

export const TotalAssetsHero = () => {
  const { wallet, totalBotProfit } = useCrypto();

  const currentBalance = wallet?.virtualBalance ?? 0.00;

  const formatUsd = (num) => {
    return (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const assetCards = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      price: '$52,291',
      change: '+0.25%',
      isUp: true,
      icon: '₿',
      iconBg: 'bg-amber-500/20 text-amber-400',
      arrowBg: 'bg-[#2dd4bf] text-slate-950',
      stroke: '#facc15',
      data: [{ v: 48000 }, { v: 51000 }, { v: 49500 }, { v: 53200 }, { v: 52291 }]
    },
    {
      name: 'Litecoin',
      symbol: 'LTC',
      price: '$8,291',
      change: '+0.25%',
      isUp: true,
      icon: 'Ł',
      iconBg: 'bg-slate-700/40 text-slate-300',
      arrowBg: 'bg-[#2dd4bf] text-slate-950',
      stroke: '#94a3b8',
      data: [{ v: 7800 }, { v: 8100 }, { v: 7900 }, { v: 8400 }, { v: 8291 }]
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      price: '$28,291',
      change: '+0.25%',
      isUp: true,
      icon: 'Ξ',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      arrowBg: 'bg-[#2dd4bf] text-slate-950',
      stroke: '#38bdf8',
      data: [{ v: 26000 }, { v: 27500 }, { v: 27000 }, { v: 28900 }, { v: 28291 }]
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      price: '$14,291',
      change: '-0.25%',
      isUp: false,
      icon: '≡',
      iconBg: 'bg-[#2dd4bf]/20 text-[#2dd4bf]',
      arrowBg: 'bg-orange-500 text-slate-950',
      stroke: '#4ade80',
      data: [{ v: 15200 }, { v: 14800 }, { v: 15000 }, { v: 14100 }, { v: 14291 }]
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner matching reference screenshot (TOTAL BALANCE + Today / 7 Days / 30 Days) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
        <div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
            TOTAL BALANCE
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
              ${formatUsd(currentBalance)}
            </span>
            <span className="text-xl font-mono text-slate-400 font-bold">.00</span>

            {/* Bot Cum Profit Pill */}
            <span className="ml-3 px-3 py-1 rounded-full bg-amber-950/80 border border-[#facc15]/50 text-[#facc15] font-mono text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
              <Bot className="w-3.5 h-3.5" />
              <span>BOT PROFIT: +${formatUsd(totalBotProfit || 1248.50)}</span>
            </span>
          </div>
        </div>

        {/* Performance Stats matching reference screenshot */}
        <div className="flex items-center space-x-6 text-xs font-mono border-l border-slate-800/80 pl-6">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Today</span>
            <span className="text-rose-400 font-extrabold text-sm flex items-center gap-0.5">
              -2.5% <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            </span>
          </div>

          <div className="border-l border-slate-800/80 pl-6">
            <span className="text-slate-400 text-[10px] uppercase block mb-0.5">7 Days</span>
            <span className="text-[#2dd4bf] font-extrabold text-sm flex items-center gap-0.5">
              +4.25% <ArrowUpRight className="w-3.5 h-3.5 text-[#2dd4bf]" />
            </span>
          </div>

          <div className="border-l border-slate-800/80 pl-6">
            <span className="text-slate-400 text-[10px] uppercase block mb-0.5">30 Days</span>
            <span className="text-[#2dd4bf] font-extrabold text-sm flex items-center gap-0.5">
              +11.5% <ArrowUpRight className="w-3.5 h-3.5 text-[#2dd4bf]" />
            </span>
          </div>
        </div>
      </div>

      {/* 4 Asset Sparkline Cards Grid matching reference screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {assetCards.map((card, idx) => (
          <div key={card.symbol} className="chainblock-card p-5 space-y-3">
            
            {/* Top Row: Icon + Name + Diagonal Arrow Pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full ${card.iconBg} flex items-center justify-center font-bold text-sm`}>
                  {card.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs leading-none">{card.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{card.symbol}</span>
                </div>
              </div>

              <div className={`w-8 h-8 rounded-full ${card.arrowBg} flex items-center justify-center shadow-md`}>
                {card.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>

            {/* Price & Sparkline Row */}
            <div className="flex items-end justify-between pt-1">
              <div>
                <span className="text-xl font-extrabold font-mono text-white block">{card.price}</span>
                <span className={`text-[10px] font-mono font-bold ${card.isUp ? 'text-[#2dd4bf]' : 'text-rose-400'}`}>
                  {card.change}
                </span>
              </div>

              {/* SVG Micro Sparkline */}
              <div className="h-10 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={card.data}>
                    <defs>
                      <linearGradient id={`grad-card-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={card.stroke} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={card.stroke} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={card.stroke}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#grad-card-${idx})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
