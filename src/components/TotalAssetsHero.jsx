import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Eye, EyeOff, Plus, ArrowUpRight, Sparkles, Bot, TrendingUp } from 'lucide-react';

export const TotalAssetsHero = () => {
  const { wallet, openModal, marketData, arbitrageOpps, executeManualTrade, totalBotProfit } = useCrypto();
  const [hideBalance, setHideBalance] = useState(false);

  // Get live prices from context
  const btcCoin = marketData.find(c => c.symbol === 'BTCUSDT') || { basePrice: 67840.50, change24: -0.21 };
  const ethCoin = marketData.find(c => c.symbol === 'ETHUSDT') || { basePrice: 3540.20, change24: 12.23 };
  const solCoin = marketData.find(c => c.symbol === 'SOLUSDT') || { basePrice: 184.75, change24: 4.12 };

  // Calculate live values
  const btcQty = 0.2342;
  const btcValueUsd = btcQty * btcCoin.basePrice;

  const ethQty = 2.4510;
  const ethValueUsd = ethQty * ethCoin.basePrice;

  const solQty = 45.80;
  const solValueUsd = solQty * solCoin.basePrice;

  // Format number in standard en-US financial notation
  const formatUsd = (num) => {
    return (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const currentBalance = wallet?.virtualBalance ?? 100000.00;
  const btcEquivalent = (currentBalance / (btcCoin.basePrice || 67840.50)).toFixed(4);

  const assetCards = [
    {
      symbol: 'BTC',
      amount: '0.2342 BTC',
      val: `$${formatUsd(btcValueUsd)}`,
      pair: 'BTC/USD',
      change: `${btcCoin.change24 >= 0 ? '+' : ''}${btcCoin.change24}%`,
      isUp: btcCoin.change24 >= 0,
      icon: '₿',
      bg: 'bg-amber-500',
      data: [{ v: btcValueUsd * 0.96 }, { v: btcValueUsd * 0.99 }, { v: btcValueUsd * 0.97 }, { v: btcValueUsd * 1.02 }, { v: btcValueUsd }]
    },
    {
      symbol: 'ETH',
      amount: '2.4510 ETH',
      val: `$${formatUsd(ethValueUsd)}`,
      pair: 'ETH/USD',
      change: `${ethCoin.change24 >= 0 ? '+' : ''}${ethCoin.change24}%`,
      isUp: ethCoin.change24 >= 0,
      icon: 'Ξ',
      bg: 'bg-indigo-500',
      data: [{ v: ethValueUsd * 0.92 }, { v: ethValueUsd * 0.95 }, { v: ethValueUsd * 0.94 }, { v: ethValueUsd * 0.98 }, { v: ethValueUsd }]
    },
    {
      symbol: 'SOL',
      amount: '45.80 SOL',
      val: `$${formatUsd(solValueUsd)}`,
      pair: 'SOL/USD',
      change: `${solCoin.change24 >= 0 ? '+' : ''}${solCoin.change24}%`,
      isUp: solCoin.change24 >= 0,
      icon: '◎',
      bg: 'bg-[#34d399]',
      data: [{ v: solValueUsd * 0.93 }, { v: solValueUsd * 0.96 }, { v: solValueUsd * 0.95 }, { v: solValueUsd * 0.99 }, { v: solValueUsd }]
    }
  ];

  const topOpp = arbitrageOpps[0] || { symbol: 'BTCUSDT', diffPct: 0.47, netProfit: 185.00, buyExchange: 'Binance', sellExchange: 'Bybit' };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Total Assets Value Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mb-1">
            <span>Total assets value in $</span>
            <button onClick={() => setHideBalance(!hideBalance)} className="text-slate-500 hover:text-slate-300">
              {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {hideBalance ? '••••••••' : `$${formatUsd(currentBalance)}`}
            </span>

            {/* BOT CUMULATIVE PROFIT BADGE IN WALLET */}
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[#34d399] font-mono text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
              <Bot className="w-3.5 h-3.5 text-[#34d399]" />
              <span>BOT CUMULATIVE PROFIT: +${formatUsd(totalBotProfit || 0.00)}</span>
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono block mt-1">~ {btcEquivalent} BTC</span>
        </div>

        {/* Quick Action Pill Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openModal('DEPOSIT')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#34d399] text-black font-extrabold text-xs transition hover:brightness-110 shadow-lg font-mono"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Deposit</span>
          </button>
          
          <button
            onClick={() => openModal('WITHDRAW')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#161a23] border border-slate-800 text-rose-300 font-mono font-semibold text-xs transition hover:border-rose-800/80 hover:bg-rose-950/40"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* 3 Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {assetCards.map((card, idx) => (
          <div key={card.symbol} className="chainblock-card flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-white font-mono">{card.amount}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono block">{card.val}</span>
            </div>

            {/* Dynamic Sparkline Chart */}
            <div className="h-12 w-full opacity-90">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.data}>
                  <defs>
                    <linearGradient id={`grad-hero-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={card.isUp ? '#34d399' : '#f43f5e'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={card.isUp ? '#34d399' : '#f43f5e'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.isUp ? '#34d399' : '#f43f5e'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#grad-hero-${idx})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Row: Icon + Pair + Change */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono text-xs">
              <div className="flex items-center space-x-2">
                <div className={`w-5 h-5 rounded-full ${card.bg} text-black font-bold flex items-center justify-center text-[10px]`}>
                  {card.icon}
                </div>
                <span className="text-slate-300 font-semibold">{card.pair}</span>
              </div>

              <span className={`text-[11px] font-bold ${card.isUp ? 'text-[#34d399]' : 'text-rose-400'}`}>
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Arbitrage Signal & Asset Allocation Bar */}
      <div className="chainblock-card p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800/80">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#34d399]" /> TOP LIVE ARBITRAGE SIGNAL
          </span>
          <span className="text-[#34d399] font-bold">REAL-TIME EXECUTION READY</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white">{topOpp.symbol}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-[#34d399] border border-emerald-800 font-bold">
                +{topOpp.diffPct}% Spread
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Buy {topOpp.buyExchange} ➔ Sell {topOpp.sellExchange} | Est. Net Profit: <strong className="text-[#34d399]">+${topOpp.netProfit}</strong>
            </span>
          </div>

          <button
            onClick={() => executeManualTrade(topOpp.symbol, topOpp.buyExchange, topOpp.sellExchange, 0.5)}
            className="px-4 py-2 rounded-xl bg-[#34d399] text-black font-extrabold text-xs font-sans hover:brightness-110 shadow-md shrink-0"
          >
            EXECUTE ARBITRAGE
          </button>
        </div>

        {/* Portfolio Asset Allocation Bar */}
        <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Portfolio Allocation: Cash (68%) • BTC (16%) • ETH (10%) • SOL (6%)</span>
            <span className="text-[#34d399] font-bold">100% Allocated</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div style={{ width: '68%' }} className="h-full bg-[#34d399]" />
            <div style={{ width: '16%' }} className="h-full bg-amber-500" />
            <div style={{ width: '10%' }} className="h-full bg-indigo-500" />
            <div style={{ width: '6%' }} className="h-full bg-purple-500" />
          </div>
        </div>

      </div>

    </div>
  );
};
