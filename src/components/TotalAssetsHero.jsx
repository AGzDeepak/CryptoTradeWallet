import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Eye, EyeOff, Plus, ArrowUpRight, Sparkles, Bot, Wallet } from 'lucide-react';

export const TotalAssetsHero = () => {
  const { wallet, openModal, marketData, arbitrageOpps, executeManualTrade, totalBotProfit } = useCrypto();
  const [hideBalance, setHideBalance] = useState(false);

  const btcCoin = marketData.find(c => c.symbol === 'BTCUSDT') || { basePrice: 67840.50, change24: -0.21 };
  const ethCoin = marketData.find(c => c.symbol === 'ETHUSDT') || { basePrice: 3540.20, change24: 12.23 };
  const solCoin = marketData.find(c => c.symbol === 'SOLUSDT') || { basePrice: 184.75, change24: 4.12 };

  const btcQty = 0.2342;
  const btcValueUsd = btcQty * btcCoin.basePrice;

  const ethQty = 2.4510;
  const ethValueUsd = ethQty * ethCoin.basePrice;

  const solQty = 45.80;
  const solValueUsd = solQty * solCoin.basePrice;

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
      bg: 'bg-teal-400',
      data: [{ v: solValueUsd * 0.93 }, { v: solValueUsd * 0.96 }, { v: solValueUsd * 0.95 }, { v: solValueUsd * 0.99 }, { v: solValueUsd }]
    }
  ];

  const topOpp = arbitrageOpps[0] || { symbol: 'BTCUSDT', diffPct: 0.47, netProfit: 185.00, buyExchange: 'Binance', sellExchange: 'Bybit' };

  return (
    <div className="chainblock-card space-y-5 font-sans">
      
      {/* Header & Balance Banner */}
      <div className="card-header-baseline border-none pb-0 mb-0 h-auto">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mb-1">
            <Wallet className="w-3.5 h-3.5 text-teal-400" />
            <span>TOTAL ASSET EQUITY BALANCE</span>
            <button onClick={() => setHideBalance(!hideBalance)} className="text-slate-500 hover:text-slate-300">
              {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {hideBalance ? '••••••••' : `$${formatUsd(currentBalance)}`}
            </span>

            <span className="px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/50 text-teal-300 font-mono text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
              <Bot className="w-3.5 h-3.5 text-teal-400" />
              <span>BOT CUMULATIVE PROFIT: +${formatUsd(totalBotProfit || 0.00)}</span>
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono block mt-1">~ {btcEquivalent} BTC</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => openModal('DEPOSIT')}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-extrabold text-xs transition hover:brightness-110 shadow-lg font-mono"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Deposit</span>
          </button>
          
          <button
            onClick={() => openModal('WITHDRAW')}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-300 font-mono font-semibold text-xs transition hover:border-rose-800/80 hover:bg-rose-950/40"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* 3 Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {assetCards.map((card, idx) => (
          <div key={card.symbol} className="chainblock-subcard flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-white font-mono">{card.amount}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono block">{card.val}</span>
            </div>

            {/* Sparkline Chart */}
            <div className="h-12 w-full opacity-90">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.data}>
                  <defs>
                    <linearGradient id={`grad-hero-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={card.isUp ? '#2dd4bf' : '#f87171'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={card.isUp ? '#2dd4bf' : '#f87171'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.isUp ? '#2dd4bf' : '#f87171'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#grad-hero-${idx})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono text-xs">
              <div className="flex items-center space-x-2">
                <div className={`w-5 h-5 rounded-full ${card.bg} text-slate-950 font-bold flex items-center justify-center text-[10px]`}>
                  {card.icon}
                </div>
                <span className="text-slate-300 font-semibold">{card.pair}</span>
              </div>

              <span className={`text-[11px] font-bold ${card.isUp ? 'text-teal-400' : 'text-rose-400'}`}>
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Asset Allocation Bar */}
      <div className="bg-[#0b1120] p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Asset Allocation: Cash (68%) • BTC (16%) • ETH (10%) • SOL (6%)</span>
          <span className="text-teal-400 font-bold">100% Portfolio Allocated</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
          <div style={{ width: '68%' }} className="h-full bg-teal-400" />
          <div style={{ width: '16%' }} className="h-full bg-amber-500" />
          <div style={{ width: '10%' }} className="h-full bg-indigo-500" />
          <div style={{ width: '6%' }} className="h-full bg-purple-500" />
        </div>
      </div>

    </div>
  );
};
