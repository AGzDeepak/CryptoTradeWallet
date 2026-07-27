import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ChevronDown, SlidersHorizontal, DollarSign } from 'lucide-react';

export const LiveChart = () => {
  const { marketData } = useCrypto();
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [timeInterval, setTimeInterval] = useState('1h');
  const [showDropdown, setShowDropdown] = useState(false);

  const btcCoin = marketData.find(c => c.symbol === selectedCoin) || marketData[0] || { basePrice: 38252.02 };

  const chartData = [
    { time: '20:00', price: 34200, vol: 240 },
    { time: '20:10', price: 41000, vol: 320 },
    { time: '20:20', price: 36500, vol: 210 },
    { time: '20:30', price: 49200, vol: 480 },
    { time: '20:40', price: 43000, vol: 310 },
    { time: '20:50', price: 51200, vol: 540 },
  ];

  return (
    <div className="chainblock-card space-y-4 font-sans">
      
      {/* Header matching reference screenshot (Chart + Sliders + $ USD Dropdown) */}
      <div className="card-header-baseline">
        <h3 className="text-xl font-extrabold text-white font-sans tracking-tight">Chart</h3>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-xl bg-[#14161d] border border-slate-800 text-slate-300 hover:text-[#facc15] transition">
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1 bg-[#14161d] border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white cursor-pointer">
            <span className="w-4 h-4 rounded-full bg-[#facc15] text-slate-950 flex items-center justify-center text-[10px]">$</span>
            <span>USD</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Subheader matching reference screenshot (Bitcoin/BTC dropdown + Price + Interval Pills) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
        <div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition font-bold"
            >
              <span>{btcCoin.name || 'Bitcoin'}/{btcCoin.symbol ? btcCoin.symbol.replace('USDT', '') : 'BTC'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDropdown && (
              <div className="absolute top-6 left-0 z-50 bg-[#191b22] border border-slate-700 rounded-xl p-1.5 shadow-2xl w-40 text-xs">
                {marketData.map((c) => (
                  <button
                    key={c.symbol}
                    onClick={() => { setSelectedCoin(c.symbol); setShowDropdown(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
                  >
                    {c.name} ({c.symbol.replace('USDT', '')})
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-3xl font-extrabold text-white block mt-1 tracking-tight">
            ${btcCoin.basePrice ? btcCoin.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '38,252.02'}
          </span>
        </div>

        {/* Time Interval Pills matching reference screenshot */}
        <div className="flex items-center space-x-1 bg-[#14161d] p-1 rounded-2xl border border-slate-800 text-xs">
          {['1h', '3h', '1d', '1w', '1m'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeInterval(tf)}
              className={`px-3 py-1 rounded-xl transition font-bold ${
                timeInterval === tf
                  ? 'bg-[#facc15] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line Chart & Volume Histogram Area matching reference screenshot */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="grad-gold-chart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#facc15" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['dataMin - 2000', 'dataMax + 2000']} />
            <Tooltip contentStyle={{ backgroundColor: '#191b22', borderColor: '#334155', borderRadius: '12px' }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#facc15"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#grad-gold-chart)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
