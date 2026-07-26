import React from 'react';
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
import { BarChart3, TrendingUp, Award, DollarSign } from 'lucide-react';

export const AnalyticsSection = () => {
  const dailyProfitData = [
    { day: 'Mon', profit: 420 },
    { day: 'Tue', profit: 680 },
    { day: 'Wed', profit: 910 },
    { day: 'Thu', profit: 540 },
    { day: 'Fri', profit: 1250 },
    { day: 'Sat', profit: 890 },
    { day: 'Sun', profit: 1482 },
  ];

  const pieData = [
    { name: 'Profitable Trades (94%)', value: 94, color: '#10b981' },
    { name: 'Slippage / Losses (6%)', value: 6, color: '#f43f5e' },
  ];

  const exchangeVolumeData = [
    { name: 'Binance', value: 45, color: '#f59e0b' },
    { name: 'Bybit', value: 30, color: '#00f0ff' },
    { name: 'OKX', value: 15, color: '#a855f7' },
    { name: 'Coinbase', value: 10, color: '#3b82f6' },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-extrabold text-white">QUANT PERFORMANCE ANALYTICS</h3>
        </div>
        <span className="text-xs font-mono text-emerald-400">Total Profit: +$6,172.00 USD</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Profit Bar Chart */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-3 flex items-center justify-between">
            <span>Weekly Daily Profit Accumulation ($)</span>
            <span className="text-emerald-400 font-bold">+18.4% WoW</span>
          </h4>
          <div className="h-56 font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyProfitData}>
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" orientation="right" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 p-2 rounded border border-cyan-500 text-xs font-mono text-cyan-400">
                          {payload[0].payload.day}: +${payload[0].value}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="profit" fill="#00f0ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win Rate Distribution Donut Chart */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">
            AI Bot Execution Win / Loss Ratio
          </h4>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center space-x-6 text-xs font-mono pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">94.0% Wins</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">6.0% Losses</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
