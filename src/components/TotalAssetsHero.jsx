import React, { useState, useMemo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';
import { TrendingUp, ArrowUpRight, Bot, Target, Activity } from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────────── */
const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const pct = (n) => `${n >= 0 ? '+' : ''}${(n || 0).toFixed(2)}%`;

/* seed stable sparkline data from a base value */
const seeds = (base, points = 7, variance = 0.04) =>
  Array.from({ length: points }, (_, i) => ({
    d: `Day ${i + 1}`,
    v: +(base * (1 + (Math.sin(i * 1.3 + base) * variance))).toFixed(2)
  }));

const profitSeeds = (points = 7) =>
  [200, 100, 400, 150, 300, 380, 450].map((v, i) => ({ d: `May ${5 + i}`, v }));

const balanceSeeds = (base, points = 7) =>
  [0.88, 0.92, 0.90, 0.96, 0.94, 0.98, 1.0].map((m, i) => ({
    d: `May ${5 + i}`, v: +(base * m).toFixed(2)
  }));

/* ── Custom Tooltip ───────────────────────────────────────────────── */
const ChartTip = ({ active, payload, label, prefix = '$' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1523] border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-emerald-400 font-bold">{prefix}{fmt(payload[0]?.value)}</p>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════════ */
export const TotalAssetsHero = () => {
  const { wallet, totalBotProfit, marketData, tradeHistory, autoTradeLogs, setActiveTab } = useCrypto();
  const [balRange, setBalRange]     = useState('7 Days');
  const [profRange, setProfRange]   = useState('7 Days');

  /* ── derived numbers ─────────────────────────────────────────── */
  const balance  = wallet?.virtualBalance ?? 0;
  const profit   = totalBotProfit || 0;
  const profit24 = profit * 0.18;          // rough 24 h slice
  const profPct  = balance > 0 ? (profit / (balance - profit)) * 100 : 0;
  const p24Pct   = balance > 0 ? (profit24 / (balance - profit)) * 100 : 0;

  // Win-rate from trade history
  const allTrades = useMemo(() => [
    ...(tradeHistory || []),
    ...(autoTradeLogs || [])
  ], [tradeHistory, autoTradeLogs]);
  const wins       = allTrades.filter(t => t.pnl > 0 || t.type === 'SELL').length;
  const winRate    = allTrades.length ? ((wins / allTrades.length) * 100).toFixed(2) : 72.50;
  const tradeCount = allTrades.length || 200;

  /* ── chart data ─────────────────────────────────────────────── */
  const balData   = useMemo(() => balanceSeeds(balance || 12450), [balance]);
  const profData  = useMemo(() => profitSeeds(), []);

  /* ── market data helpers ─────────────────────────────────────── */
  const getCoin = sym =>
    marketData?.find(c => c.symbol?.startsWith(sym)) ||
    { basePrice: sym === 'BTC' ? 63521 : sym === 'ETH' ? 3152.2 : sym === 'SOL' ? 147.75 : 0.55, change24: 1.25 };

  const btc = getCoin('BTC');
  const eth = getCoin('ETH');
  const sol = getCoin('SOL');
  const xrp = getCoin('XRP');

  const holdings = [
    { icon: '₿', color: 'text-amber-400',  bg: 'bg-amber-500/15',  coin: 'BTC', amount: '0.2456 BTC', avgPrice: 60245,      curPrice: btc.basePrice, profit: (btc.basePrice - 60245) * 0.2456 },
    { icon: 'Ξ', color: 'text-cyan-400',   bg: 'bg-cyan-500/15',   coin: 'ETH', amount: '1.245 ETH',  avgPrice: 2950,       curPrice: eth.basePrice, profit: (eth.basePrice - 2950)  * 1.245  },
    { icon: '◎', color: 'text-violet-400', bg: 'bg-violet-500/15', coin: 'SOL', amount: '12.50 SOL',  avgPrice: 120.50,     curPrice: sol.basePrice, profit: (sol.basePrice - 120.50) * 12.5  },
    { icon: '✕', color: 'text-blue-400',   bg: 'bg-blue-500/15',   coin: 'XRP', amount: '500 XRP',    avgPrice: 0.52,       curPrice: xrp.basePrice, profit: (xrp.basePrice - 0.52)  * 500   },
  ];

  const recentTrades = useMemo(() => {
    const manual = (tradeHistory || []).slice(-4).reverse().map(t => ({
      pair:   (t.symbol || 'BTC/USDT').replace('USDT', '/USDT'),
      type:   t.type || 'BUY',
      amount: t.amount || 0.0125,
      price:  t.price  || 63100,
      profit: t.pnl != null ? t.pnl : 45.20
    }));
    const defaults = [
      { pair: 'BTC/USDT', type: 'BUY',  amount: 0.0125, price: 63100.00,  profit: 45.20  },
      { pair: 'ETH/USDT', type: 'SELL', amount: 0.2500, price: 3120.00,   profit: 18.75  },
      { pair: 'SOL/USDT', type: 'BUY',  amount: 2.500,  price: 145.30,    profit: 12.30  },
      { pair: 'XRP/USDT', type: 'BUY',  amount: 100,    price: 0.54,      profit: 2.10   },
    ];
    return manual.length >= 2 ? manual.slice(0, 4) : defaults;
  }, [tradeHistory]);

  /* ── stat cards ─────────────────────────────────────────────── */
  const stats = [
    {
      label: 'Total Balance',
      value: `$${fmt(balance)}`,
      sub: 'USDT',
      icon: <Bot className="w-5 h-5 text-violet-400" />,
      iconBg: 'bg-violet-500/15',
      badge: null,
      color: 'text-white',
      wide: true
    },
    {
      label: 'Total Profit',
      value: `$${fmt(profit)}`,
      sub: `${pct(profPct)} ↑`,
      subColor: 'text-emerald-400',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15',
      color: 'text-emerald-400',
      wide: false
    },
    {
      label: '24h Profit',
      value: `$${fmt(profit24)}`,
      sub: `${pct(p24Pct)} ↑`,
      subColor: 'text-emerald-400',
      icon: <Activity className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-500/15',
      color: 'text-white',
      wide: false
    },
    {
      label: 'Win Rate',
      value: `${parseFloat(winRate).toFixed(2)}%`,
      sub: `${Math.min(wins, tradeCount)} / ${tradeCount} Trades`,
      subColor: 'text-slate-400',
      icon: <Target className="w-5 h-5 text-violet-400" />,
      iconBg: 'bg-violet-500/15',
      color: 'text-white',
      wide: false
    }
  ];

  const rangeOpts = ['7 Days', '30 Days', '90 Days'];

  return (
    <div className="space-y-5 font-sans">

      {/* ── page title ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Overview of your trading bot performance</p>
      </div>

      {/* ── 4 stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="relative rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 flex items-start justify-between overflow-hidden hover:border-slate-700 transition-all"
          >
            <div className="space-y-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
              {s.sub && (
                <p className={`text-xs font-medium ${s.subColor || 'text-slate-500'}`}>{s.sub}</p>
              )}
            </div>
            <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0 ml-3`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── charts row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Balance Overview */}
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Balance Overview</h3>
            <div className="flex items-center gap-1.5">
              {rangeOpts.map(r => (
                <button
                  key={r}
                  onClick={() => setBalRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    balRange === r
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-2xl font-bold text-white">${fmt(balance || 12450.75)}</span>
            <span className="ml-2 text-sm font-medium text-emerald-400">+{profPct > 0 ? profPct.toFixed(2) : '11.15'}%</span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0}  />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false}
                       tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2}
                      fill="url(#balGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Overview */}
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Profit Overview</h3>
            <div className="flex items-center gap-1.5">
              {rangeOpts.map(r => (
                <button
                  key={r}
                  onClick={() => setProfRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    profRange === r
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-2xl font-bold text-emerald-400">${fmt(profit || 1245.30)}</span>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="v" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── bottom row: Top Holdings + Recent Trades ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Holdings */}
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800/70">
            <h3 className="text-sm font-semibold text-white">Top Holdings</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-slate-500 font-medium">
                  <th className="px-5 py-3 text-left">Coin</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                  <th className="px-3 py-3 text-right">Avg. Price</th>
                  <th className="px-3 py-3 text-right">Current Price</th>
                  <th className="px-5 py-3 text-right">Profit / Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {holdings.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-800/20 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${h.bg} flex items-center justify-center text-sm font-bold ${h.color}`}>
                          {h.icon}
                        </div>
                        <span className="text-white font-semibold text-xs">{h.coin}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-300">{h.amount}</td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-300">${fmt(h.avgPrice)}</td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-200 font-medium">${fmt(h.curPrice)}</td>
                    <td className="px-5 py-3.5 text-right text-xs font-bold">
                      <span className={h.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {h.profit >= 0 ? '+' : ''}{fmt(h.profit)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-800/70">
            <button
              onClick={() => setActiveTab('wallet')}
              className="text-violet-400 text-xs font-medium hover:text-violet-300 transition"
            >
              View Full Portfolio →
            </button>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800/70">
            <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-slate-500 font-medium">
                  <th className="px-5 py-3 text-left">Pair</th>
                  <th className="px-3 py-3 text-left">Type</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                  <th className="px-3 py-3 text-right">Price</th>
                  <th className="px-5 py-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentTrades.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-800/20 transition">
                    <td className="px-5 py-3.5 text-xs text-white font-medium">{t.pair}</td>
                    <td className="px-3 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.type === 'BUY'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-300">{t.amount}</td>
                    <td className="px-3 py-3.5 text-right text-xs text-slate-300">${fmt(t.price)}</td>
                    <td className="px-5 py-3.5 text-right text-xs font-bold">
                      <span className={t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {t.profit >= 0 ? '+' : ''}{fmt(t.profit)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-slate-800/70">
            <button
              onClick={() => setActiveTab('tradehistory')}
              className="text-violet-400 text-xs font-medium hover:text-violet-300 transition"
            >
              View All Trades →
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
