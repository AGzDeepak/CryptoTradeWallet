import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { BarChart3, TrendingUp, Award, DollarSign, CandlestickChart, Activity, Zap } from 'lucide-react';

export const AnalyticsSection = () => {
  const { totalBotProfit } = useCrypto();

  const dailyProfitData = [
    { day: 'Mon', profit: 420, botProfit: 310 },
    { day: 'Tue', profit: 680, botProfit: 520 },
    { day: 'Wed', profit: 910, botProfit: 780 },
    { day: 'Thu', profit: 540, botProfit: 410 },
    { day: 'Fri', profit: 1250, botProfit: 990 },
    { day: 'Sat', profit: 890, botProfit: 710 },
    { day: 'Sun', profit: 1482, botProfit: 1240 },
  ];

  const pieData = [
    { name: 'Profitable Trades (94%)', value: 94, color: '#34d399' },
    { name: 'Slippage / Losses (6%)', value: 6, color: '#f43f5e' },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 mb-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-extrabold text-white font-mono">QUANT PERFORMANCE & MARKET CANDLE ANALYTICS</h3>
        </div>
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-[#34d399] border border-emerald-800 font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Bot Profit: +${(totalBotProfit || 0.00).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Profit & Bot Accumulation Bar Chart */}
        <div className="bg-[#060810] p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" /> Daily Profit Accumulation vs Bot Yield ($)
            </span>
            <span className="text-[#34d399] font-bold">+18.4% WoW</span>
          </div>

          <div className="h-56 font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyProfitData}>
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" orientation="right" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#090c14] p-2.5 rounded-xl border border-cyan-500/40 text-xs font-mono text-cyan-300 space-y-1">
                          <div className="font-bold text-white border-b border-slate-800 pb-1">{payload[0].payload.day} Settlement</div>
                          <div>Total Profit: +${payload[0].value}</div>
                          <div className="text-[#34d399] font-bold">Bot Share: +${payload[0].payload.botProfit}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="profit" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="botProfit" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win Rate Distribution & True Candlestick Accuracy */}
        <div className="bg-[#060810] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <CandlestickChart className="w-4 h-4 text-[#34d399]" /> True Market Candle Win / Loss Ratio
            </span>
            <span className="text-purple-400 font-bold">94.0% Win Rate</span>
          </div>

          <div className="h-44 font-mono text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-analytics-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center space-x-6 text-xs font-mono pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#34d399]"></span>
              <span className="text-slate-300">94.0% Profitable Arbitrage</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">6.0% Exchange Slippage</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
