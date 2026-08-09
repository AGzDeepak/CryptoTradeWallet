import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export const LiveMarketCards = memo(() => {
  const { marketData, priceFlashMap } = useCrypto();

  const cardsData = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: '₿',
      iconBg: 'bg-amber-500',
      price: '$52,291',
      change: '+0.25%',
      isUp: true,
      lineColor: '#2563eb',
      data: [{ v: 51000 }, { v: 51800 }, { v: 51400 }, { v: 52100 }, { v: 51900 }, { v: 52291 }]
    },
    {
      symbol: 'LTC',
      name: 'Litecoin',
      icon: 'Ł',
      iconBg: 'bg-sky-500',
      price: '$8,291',
      change: '+0.25%',
      isUp: true,
      lineColor: '#2563eb',
      data: [{ v: 8100 }, { v: 8200 }, { v: 8150 }, { v: 8250 }, { v: 8220 }, { v: 8291 }]
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: 'Ξ',
      iconBg: 'bg-indigo-500',
      price: '$28,291',
      change: '+0.25%',
      isUp: true,
      lineColor: '#2563eb',
      data: [{ v: 27800 }, { v: 28100 }, { v: 27900 }, { v: 28200 }, { v: 28150 }, { v: 28291 }]
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      icon: '◎',
      iconBg: 'bg-emerald-500',
      price: '$14,291',
      change: '-0.25%',
      isUp: false,
      lineColor: '#10b981',
      data: [{ v: 14500 }, { v: 14400 }, { v: 14350 }, { v: 14250 }, { v: 14300 }, { v: 14291 }]
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-sans">
      {cardsData.map((card, idx) => {
        const coin = marketData.find(c => c.symbol === `${card.symbol}USDT` || c.symbol.startsWith(card.symbol)) || marketData[idx] || marketData[0];
        const isUp = (coin?.change24 ?? 0) >= 0;
        const changeStr = `${isUp ? '+' : ''}${(coin?.change24 ?? 0).toFixed(2)}%`;
        const flashClass = priceFlashMap[coin?.symbol] === 'up'
          ? 'price-up'
          : priceFlashMap[coin?.symbol] === 'down'
          ? 'price-down'
          : '';

        const sparklineData = [
          { v: coin.basePrice * 0.96 },
          { v: coin.basePrice * 0.99 },
          { v: coin.basePrice * 0.97 },
          { v: coin.basePrice * 1.01 },
          { v: coin.basePrice }
        ];

        return (
          <div
            key={card.symbol}
            className={`cyber-card p-4 relative overflow-hidden group ${flashClass}`}
          >
            {/* Top Row: Icon + Name */}
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full ${card.iconBg} flex items-center justify-center font-bold text-white text-xs shadow-md`}>
                {card.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white leading-none">{card.name}</h4>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{card.symbol}</span>
              </div>
            </div>

            {/* Middle Price & Percentage */}
            <div className="my-2 z-10">
              <div className="text-xl font-extrabold font-mono text-white tracking-tight">
                ${coin.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className={`text-[11px] font-mono font-bold block mt-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {changeStr}
              </span>
            </div>

            {/* Blue Line Sparkline Chart */}
            <div className="h-10 w-full -mb-1 z-0 opacity-70 group-hover:opacity-100 transition">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={`grad-card-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={card.lineColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={card.lineColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.lineColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#grad-card-${idx})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        );
      })}
    </div>
  );
});
