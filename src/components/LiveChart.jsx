import React, { useState, useMemo, memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { LineChart as LineIcon, CandlestickChart, Calendar } from 'lucide-react';

export const LiveChart = memo(() => {
  const { marketData } = useCrypto();
  const [chartMode, setChartMode] = useState('Price'); // 'Price' | 'Candle'
  const [timeframe, setTimeframe] = useState('1D');

  const chartData = useMemo(() => {
    return [
      { time: '08:00 AM', close: 12500, volume: 150 },
      { time: '08:30 AM', close: 14200, volume: 320 },
      { time: '09:00 AM', close: 13904.34, volume: 450, highlight: true }, // Highlighted node from reference image
      { time: '09:30 AM', close: 11200, volume: 220 },
      { time: '10:00 AM', close: 14800, volume: 380 },
      { time: '10:30 AM', close: 13500, volume: 290 },
      { time: '11:00 AM', close: 16200, volume: 510 },
      { time: '11:30 AM', close: 14900, volume: 340 },
      { time: '12:00 PM', close: 17500, volume: 600 }
    ];
  }, []);

  return (
    <div className="chainblock-card space-y-4 mb-6 font-sans">
      
      {/* Header Bar (Matching Reference Image) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        
        {/* Left Title & Mode Switcher (Price / Candle) */}
        <div className="flex items-center space-x-4">
          <h3 className="text-base font-extrabold text-white">Analytics</h3>

          <div className="flex items-center space-x-1 bg-[#11141b] p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setChartMode('Price')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition ${
                chartMode === 'Price'
                  ? 'bg-[#1b202c] text-white font-bold border border-slate-700 shadow-md'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LineIcon className="w-3.5 h-3.5" />
              <span>Price</span>
            </button>
            <button
              onClick={() => setChartMode('Candle')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition ${
                chartMode === 'Candle'
                  ? 'bg-[#1b202c] text-white font-bold border border-slate-700 shadow-md'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candle</span>
            </button>
          </div>
        </div>

        {/* Right Timeframe Pills (1D, 7D, 1M, 3M, ALL, Calendar) */}
        <div className="flex items-center space-x-1 bg-[#11141b] p-1 rounded-xl border border-slate-800 font-mono text-xs">
          {['1D', '7D', '1M', '3M', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                timeframe === tf
                  ? 'bg-[#1b202c] text-[#34d399] border border-[#34d399]/40 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tf}
            </button>
          ))}
          <button className="p-1 rounded-lg text-slate-500 hover:text-white">
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Chart Body */}
      <div className="h-[280px] w-full font-mono text-xs relative">
        
        {/* Floating Tooltip Node Badge ($13,904.34 -2.4% from reference image) */}
        <div className="absolute left-[32%] top-[38%] z-20 bg-white text-black px-2.5 py-1 rounded-xl shadow-2xl border border-slate-200 text-[10px] font-bold flex flex-col items-center">
          <span>$13,904.34</span>
          <span className="text-rose-500 text-[9px] font-mono">-2.4%</span>
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white absolute -bottom-3 animate-ping"></div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 55, 72, 0.3)" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} orientation="left" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#11141b] p-2.5 rounded-xl border border-[#34d399]/40 shadow-xl text-xs font-mono text-white">
                      <div>Time: {payload[0].payload.time}</div>
                      <div className="text-[#34d399] font-bold">Price: ${payload[0].value.toLocaleString()}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="volume" yAxisId={1} fill="rgba(52, 211, 153, 0.15)" radius={[2, 2, 0, 0]} />
            <YAxis yAxisId={1} orientation="right" domain={[0, 'auto']} hide />
            <Line type="monotone" dataKey="close" stroke="#34d399" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
});
