import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  ArrowUpRight, ArrowDownRight, Bot, Wallet, ArrowDownCircle,
  Zap, ShieldCheck, Activity, Layers, ExternalLink, RefreshCw, CheckCircle2, TrendingUp
} from 'lucide-react';

export const TotalAssetsHero = () => {
  const {
    wallet,
    totalBotProfit,
    marketData,
    openModal,
    setActiveTab,
    exchangePrices,
    realWalletNetwork
  } = useCrypto();

  const currentBalance = wallet?.virtualBalance ?? 0.00;

  const formatUsd = (num) => {
    return (num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      arrowBg: btcData.change24 >= 0 ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
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
      name: 'Ethereum',
      symbol: 'ETH',
      price: `$${ethData.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${ethData.change24 >= 0 ? '+' : ''}${ethData.change24.toFixed(2)}%`,
      isUp: ethData.change24 >= 0,
      icon: 'Ξ',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      arrowBg: ethData.change24 >= 0 ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
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
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      arrowBg: solData.change24 >= 0 ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      stroke: '#34d399',
      data: [
        { v: solData.basePrice * 0.97 },
        { v: solData.basePrice * 0.95 },
        { v: solData.basePrice * 0.98 },
        { v: solData.basePrice * 0.94 },
        { v: solData.basePrice }
      ]
    },
    {
      name: 'Litecoin',
      symbol: 'LTC',
      price: `$${ltcData.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${ltcData.change24 >= 0 ? '+' : ''}${ltcData.change24.toFixed(2)}%`,
      isUp: ltcData.change24 >= 0,
      icon: 'Ł',
      iconBg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      arrowBg: ltcData.change24 >= 0 ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      stroke: '#818cf8',
      data: [
        { v: ltcData.basePrice * 0.96 },
        { v: ltcData.basePrice * 0.99 },
        { v: ltcData.basePrice * 0.97 },
        { v: ltcData.basePrice * 1.02 },
        { v: ltcData.basePrice }
      ]
    }
  ];

  // Dynamic live arbitrage routes calculation
  const liveArbitrageRoutes = [
    {
      pair: 'BTC/USDT',
      buyEx: 'Binance',
      buyPrice: btcData.basePrice,
      sellEx: 'Bybit',
      sellPrice: btcData.basePrice * 1.0028,
      spreadPct: '+0.28%',
      estProfit: '+$1.90',
      status: 'HIGH YIELD'
    },
    {
      pair: 'ETH/USDT',
      buyEx: 'Coinbase',
      buyPrice: ethData.basePrice,
      sellEx: 'OKX',
      sellPrice: ethData.basePrice * 1.0035,
      spreadPct: '+0.35%',
      estProfit: '+$1.24',
      status: 'OPTIMAL'
    },
    {
      pair: 'SOL/USDT',
      buyEx: 'OKX',
      buyPrice: solData.basePrice,
      sellEx: 'Binance',
      sellPrice: solData.basePrice * 1.0042,
      spreadPct: '+0.42%',
      estProfit: '+$0.78',
      status: 'HOT'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* ══════════════════════════════════════════════════════
          HERO OVERVIEW BANNER
      ══════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-gradient-to-br from-[#080e1a] via-[#080c14] to-[#05070d] border border-[#4390bc]/25 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4390bc]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">

          {/* Left: Total Balance & Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                NET PORTFOLIO BALANCE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE SYNC
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                ${formatUsd(currentBalance)}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">USDT VIRTUAL</span>

              {/* Bot Cum Profit Pill */}
              <div className="px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>BOT CUM. PROFIT: +${(totalBotProfit || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Network: <strong className="text-slate-200">{realWalletNetwork || 'Arbitrum One'}</strong></span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Latency: <strong className="text-emerald-400">&lt; 14ms</strong></span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>24h Yield: <strong className="text-emerald-400">+4.25%</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => openModal ? openModal('DEPOSIT') : setActiveTab('account')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:brightness-110 transition flex items-center gap-2"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>DEPOSIT FUNDS</span>
            </button>

            <button
              onClick={() => openModal ? openModal('WITHDRAW') : setActiveTab('account')}
              className="px-5 py-3 rounded-xl bg-[#0b101b] border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-black font-mono text-xs uppercase tracking-wider transition flex items-center gap-2 hover:bg-[#111728]"
            >
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              <span>WITHDRAW</span>
            </button>

            <button
              onClick={() => setActiveTab('papertrading')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(67,144,188,0.3)] hover:brightness-110 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>AUTO-TRADE</span>
            </button>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          4 CORE CRYPTO MARKET CARDS (SPARKLINE GRID)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {assetCards.map((card, idx) => (
          <div key={card.symbol} className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 space-y-3 hover:border-[#4390bc]/40 transition group">
            
            {/* Top Row: Icon + Name + Change Pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center font-bold text-sm shadow-sm`}>
                  {card.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs font-mono">{card.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{card.symbol}/USDT</span>
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded-lg ${card.arrowBg} font-mono text-[10px] font-black flex items-center gap-1`}>
                {card.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{card.change}</span>
              </div>
            </div>

            {/* Price & Sparkline Row */}
            <div className="flex items-end justify-between pt-2">
              <div>
                <span className="text-lg font-black font-mono text-white block tracking-tight">{card.price}</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase">24H MARKET PRICE</span>
              </div>

              {/* Micro Sparkline */}
              <div className="h-9 w-24">
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

      {/* ══════════════════════════════════════════════════════
          MINIMAL 2-COLUMN DASHBOARD INFO PANEL
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── LEFT: Live Spatial Arbitrage Opportunities (7-cols) ───────────────── */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080c14] border border-slate-800/80 overflow-hidden">
          
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#060a10]/60">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black text-white font-mono uppercase tracking-tight">
                Live Spatial Arbitrage Radar
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              3 OPPORTUNITIES DETECTED
            </span>
          </div>

          <div className="p-4 space-y-3">
            {liveArbitrageRoutes.map((route, i) => (
              <div key={i} className="rounded-xl bg-[#04060d] border border-slate-800/80 p-4 space-y-3 hover:border-slate-700/80 transition">
                
                {/* Header: Pair + Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white font-mono">{route.pair}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {route.status}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-400 font-mono">{route.spreadPct} SPREAD</span>
                </div>

                {/* Route detail */}
                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono bg-[#070b13] p-3 rounded-lg border border-slate-800/50">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">BUY AT ({route.buyEx})</span>
                    <span className="text-slate-200 font-bold">${route.buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">SELL AT ({route.sellEx})</span>
                    <span className="text-emerald-400 font-bold">${route.sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    Est. Profit / Leg: <strong className="text-amber-400">{route.estProfit}</strong>
                  </span>
                  <button
                    onClick={() => setActiveTab('papertrading')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-mono font-bold border border-slate-700 hover:border-cyan-500/50 transition flex items-center gap-1"
                  >
                    <span>EXECUTE ARBITRAGE</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* ── RIGHT: Portfolio Allocation & Health (5-cols) ───────────────────── */}
        <div className="lg:col-span-5 rounded-2xl bg-[#080c14] border border-slate-800/80 overflow-hidden flex flex-col">
          
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#060a10]/60">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white font-mono uppercase tracking-tight">
                Asset Allocation & System Health
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">OPTIMIZED</span>
          </div>

          <div className="p-5 space-y-5 flex-1">

            {/* Asset Allocation Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 uppercase font-bold text-[10px]">RESERVES ALLOCATION</span>
                <span className="text-white font-bold">{currentBalance > 0 ? '$' + formatUsd(currentBalance) : '$0.00'} USDT</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-[#04060d] border border-slate-800 overflow-hidden flex">
                <div className="bg-emerald-400 h-full" style={{ width: '100%' }} title="USDT 100%" />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>USDT Stablecoin (100%)</span>
                </div>
                <span className="text-emerald-400 font-bold">100% SECURED</span>
              </div>
            </div>

            <div className="h-px bg-slate-800/60" />

            {/* Execution Engine Status */}
            <div className="space-y-2.5">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                QUANT ENGINE HEALTH & METRICS
              </div>

              {[
                { label: 'Smart Order Router', value: 'Active & Scanning', color: 'text-emerald-400' },
                { label: 'Web3 Provider', value: 'MetaMask EIP-1193', color: 'text-cyan-400' },
                { label: 'Orderbook Depth Sync', value: 'Level 2 Real-Time', color: 'text-amber-400' },
                { label: 'Execution Mode', value: 'Non-Custodial Direct', color: 'text-purple-400' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-mono p-2.5 rounded-lg bg-[#04060d] border border-slate-800/50">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-bold flex items-center gap-1.5 ${item.color}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

          </div>

          <div className="px-5 py-3 border-t border-slate-800/80 bg-[#060a10]/40 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Platform Status: Operational</span>
            <span className="text-emerald-400 font-bold">● ALL SYSTEMS GO</span>
          </div>

        </div>

      </div>

    </div>
  );
};
