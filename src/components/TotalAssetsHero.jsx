import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Bot } from 'lucide-react';

export const TotalAssetsHero = () => {
  const { wallet, totalBotProfit, marketData } = useCrypto();

  const currentBalance = wallet?.virtualBalance ?? 0.00;

  const formatUsd = (num) => {
    return (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const getCoinData = (sym) => {
    return marketData?.find(c => c.symbol === `${sym}USDT` || c.symbol.startsWith(sym)) || {
      basePrice: sym === 'BTC' ? 67840.50 : sym === 'LTC' ? 68.50 : sym === 'ETH' ? 3540.20 : 184.75,
      change24: 1.25
    };
  };

  const btcData = getCoinData('BTC');
  const ltcData = getCoinData('LTC');
  const ethData = getCoinData('ETH');
  const solData = getCoinData('SOL');

  const assetCards = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      price: `$${btcData.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${btcData.change24 >= 0 ? '+' : ''}${btcData.change24.toFixed(2)}%`,
      isUp: btcData.change24 >= 0,
      icon: '₿',
      iconBg: 'bg-amber-500/20 text-amber-400',
      arrowBg: btcData.change24 >= 0 ? 'bg-[#2dd4bf] text-slate-950' : 'bg-orange-500 text-slate-950',
      stroke: '#facc15',
      data: [
        { v: btcData.basePrice * 0.95 },
        { v: btcData.basePrice * 0.98 },
        { v: btcData.basePrice * 0.96 },
        { v: btcData.basePrice * 1.01 },
        { v: btcData.basePrice }
      ]
    },
    {
      name: 'Litecoin',
      symbol: 'LTC',
      price: `$${ltcData.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${ltcData.change24 >= 0 ? '+' : ''}${ltcData.change24.toFixed(2)}%`,
      isUp: ltcData.change24 >= 0,
      icon: 'Ł',
      iconBg: 'bg-slate-700/40 text-slate-300',
      arrowBg: ltcData.change24 >= 0 ? 'bg-[#2dd4bf] text-slate-950' : 'bg-orange-500 text-slate-950',
      stroke: '#94a3b8',
      data: [
        { v: ltcData.basePrice * 0.96 },
        { v: ltcData.basePrice * 0.99 },
        { v: ltcData.basePrice * 0.97 },
        { v: ltcData.basePrice * 1.02 },
        { v: ltcData.basePrice }
      ]
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      price: `$${ethData.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${ethData.change24 >= 0 ? '+' : ''}${ethData.change24.toFixed(2)}%`,
      isUp: ethData.change24 >= 0,
      icon: 'Ξ',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      arrowBg: ethData.change24 >= 0 ? 'bg-[#2dd4bf] text-slate-950' : 'bg-orange-500 text-slate-950',
      stroke: '#38bdf8',
      data: [
        { v: ethData.basePrice * 0.94 },
        { v: ethData.basePrice * 0.97 },
        { v: ethData.basePrice * 0.95 },
        { v: ethData.basePrice * 1.01 },
        { v: ethData.basePrice }
      ]
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      price: `$${solData.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${solData.change24 >= 0 ? '+' : ''}${solData.change24.toFixed(2)}%`,
      isUp: solData.change24 >= 0,
      icon: '≡',
      iconBg: 'bg-[#2dd4bf]/20 text-[#2dd4bf]',
      arrowBg: solData.change24 >= 0 ? 'bg-[#2dd4bf] text-slate-950' : 'bg-orange-500 text-slate-950',
      stroke: '#4ade80',
      data: [
        { v: solData.basePrice * 0.97 },
        { v: solData.basePrice * 0.95 },
        { v: solData.basePrice * 0.98 },
        { v: solData.basePrice * 0.94 },
        { v: solData.basePrice }
      ]
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
              <span>BOT PROFIT: +${formatUsd(totalBotProfit || 0.00)}</span>
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
