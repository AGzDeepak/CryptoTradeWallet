import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export const TopHeroPanel = () => {
  const { wallet } = useCrypto();

  const areaChartData = [
    { v: 12000000 },
    { v: 14200000 },
    { v: 13800000 },
    { v: 16500000 },
    { v: 15400000 },
    { v: 18475773 },
    { v: 17200000 }
  ];

  const miniBarData = [{ v: 40 }, { v: 75 }, { v: 55 }, { v: 90 }, { v: 100 }];
  const miniAreaData = [{ v: 10 }, { v: 30 }, { v: 25 }, { v: 60 }, { v: 85 }];
  const miniSparkline = [{ v: 20 }, { v: 50 }, { v: 40 }, { v: 80 }, { v: 70 }];

  const featuredVaults = [
    { coin: 'ETH', network: 'Polygon', apr: '4.89% APR', color: 'border-purple-500/40', badgeBg: 'bg-purple-500' },
    { coin: 'WBTC', network: 'Arbitrum', apr: '4.19% APR', color: 'border-amber-500/40', badgeBg: 'bg-amber-500' },
    { coin: 'USDC', network: 'Avalanche', apr: '10.37% APR', color: 'border-cyan-500/40', badgeBg: 'bg-cyan-500' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Left Main Hero Card (Matching WOOFi Reference Image) */}
      <div className="lg:col-span-2 woofi-card flex flex-col justify-between space-y-6">
        
        {/* Top Metric Header & Smooth Peak Chart */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-mono block mb-1">Total Value Locked & Arbitrage Volume</span>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400 tracking-tight">
                $18,475,773
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                +2.44% <TrendingUp className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Glowing Peak Node Area Chart */}
          <div className="h-20 w-full sm:w-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData}>
                <defs>
                  <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#heroGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Featured Vaults Row (Matching WOOFi Reference Image Bottom Row) */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-3">Featured Vaults & High-Yield Arbitrage Routes</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {featuredVaults.map((vault) => (
              <div key={vault.coin} className={`woofi-subcard ${vault.color} flex items-center justify-between`}>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-extrabold text-sm text-white">{vault.coin}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {vault.network}
                    </span>
                  </div>
                  <div className="text-base font-extrabold font-mono text-cyan-400">{vault.apr}</div>
                </div>
                <div className={`w-8 h-8 rounded-full ${vault.badgeBg} opacity-20 flex items-center justify-center font-bold text-white`}>
                  ⚡
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Side Earnings Panel (Matching WOOFi Reference Image Right Panel) */}
      <div className="lg:col-span-1 woofi-card flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h3 className="text-base font-extrabold text-white">My earnings & Portfolio</h3>
          <span className="text-xs text-cyan-400 font-mono font-semibold">Live Sandbox</span>
        </div>

        {/* Metric 1: Holdings */}
        <div className="woofi-subcard flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Holdings</span>
            <span className="text-lg font-extrabold font-mono text-white">${wallet.virtualBalance.toLocaleString()}</span>
          </div>
          <div className="h-10 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={miniBarData}>
                <Bar dataKey="v" fill="#c084fc" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 2: Monthly Profit */}
        <div className="woofi-subcard flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Monthly Profit</span>
            <span className="text-lg font-extrabold font-mono text-emerald-400">+${wallet.todayProfit.toLocaleString()}</span>
          </div>
          <div className="h-10 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniAreaData}>
                <Area type="monotone" dataKey="v" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric 3: Average APR */}
        <div className="woofi-subcard flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Average APR / Yield</span>
            <span className="text-lg font-extrabold font-mono text-cyan-400">14.82%</span>
          </div>
          <div className="h-10 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniSparkline}>
                <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
