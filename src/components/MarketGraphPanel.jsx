import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart2, 
  Zap, 
  Clock, 
  DollarSign, 
  RefreshCw,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const MarketGraphPanel = () => {
  const { marketData } = useCrypto();
  
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('24H');
  const [chartData, setChartData] = useState([]);
  const [chartColor, setChartColor] = useState('#10b981'); // Emerald green or Rose red

  const activeCoin = marketData.find(c => c.symbol === selectedPair) || marketData[0] || {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    basePrice: 67840.50,
    vol: '4.82B',
    high24: 68920.00,
    low24: 66500.00,
    change24: 2.45
  };

  // Generate dynamic realistic market price graph data points
  useEffect(() => {
    const baseP = activeCoin.basePrice || 67840.50;
    const isPositive = (activeCoin.change24 ?? 0) >= 0;
    setChartColor(isPositive ? '#10b981' : '#f43f5e');

    const pointsCount = timeframe === '1H' ? 12 : timeframe === '24H' ? 24 : timeframe === '7D' ? 28 : 30;
    const volatility = baseP * 0.015;

    const data = [];
    let currentP = baseP * (1 - (activeCoin.change24 || 0) / 100);

    for (let i = 0; i < pointsCount; i++) {
      const randomNoise = (Math.random() - 0.48) * volatility;
      currentP = Math.max(baseP * 0.7, currentP + randomNoise);

      let label = `${i}:00`;
      if (timeframe === '7D') label = `Day ${Math.floor(i / 4) + 1}`;
      else if (timeframe === '1M') label = `Day ${i + 1}`;
      else if (timeframe === '1H') label = `${i * 5}m`;

      data.push({
        time: label,
        price: parseFloat(currentP.toFixed(2)),
        ma7: parseFloat((currentP * (1 + (Math.random() * 0.004 - 0.002))).toFixed(2)),
        ma25: parseFloat((currentP * (1 + (Math.random() * 0.008 - 0.004))).toFixed(2)),
        volume: Math.floor(Math.random() * 5000 + 1000)
      });
    }

    // Ensure last point matches exact live price
    if (data.length > 0) {
      data[data.length - 1].price = activeCoin.basePrice;
    }

    setChartData(data);
  }, [selectedPair, timeframe, activeCoin.basePrice, activeCoin.change24]);

  const pairList = [
    { symbol: 'BTCUSDT', label: 'BTC/USDT', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETHUSDT', label: 'ETH/USDT', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'SOLUSDT', label: 'SOL/USDT', name: 'Solana', icon: '◎' },
    { symbol: 'AVAXUSDT', label: 'AVAX/USDT', name: 'Avalanche', icon: '🔺' },
    { symbol: 'XRPUSDT', label: 'XRP/USDT', name: 'Ripple', icon: '✕' },
    { symbol: 'LINKUSDT', label: 'LINK/USDT', name: 'Chainlink', icon: '⬢' }
  ];

  return (
    <div className="chainblock-card p-6 space-y-6 font-sans">
      
      {/* Header Bar: Pair Selector & Live Telemetry */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        
        {/* Pair Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {pairList.map((pair) => {
            const isSelected = selectedPair === pair.symbol;
            return (
              <button
                key={pair.symbol}
                onClick={() => setSelectedPair(pair.symbol)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center space-x-2 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-[#090d16] text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <span>{pair.icon}</span>
                <span>{pair.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center space-x-1.5 bg-[#090d16] p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
          {['1H', '24H', '7D', '1M', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
                timeframe === tf
                  ? 'bg-[#2dd4bf] text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

      </div>

      {/* Real-time Ticker Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 font-mono text-xs p-4 rounded-2xl bg-[#090d16] border border-slate-800">
        
        {/* Price */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">LIVE MARKET PRICE:</span>
          <span className="text-lg font-black text-white block">
            ${activeCoin.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 24h Change */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">24H CHANGE:</span>
          <span className={`text-sm font-extrabold flex items-center gap-1 ${
            (activeCoin.change24 ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {(activeCoin.change24 ?? 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{(activeCoin.change24 ?? 0) >= 0 ? `+${activeCoin.change24}%` : `${activeCoin.change24}%`}</span>
          </span>
        </div>

        {/* 24h High */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">24H HIGH:</span>
          <span className="text-sm font-bold text-emerald-400 block">
            ${(activeCoin.high24 || activeCoin.basePrice * 1.03).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 24h Low */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">24H LOW:</span>
          <span className="text-sm font-bold text-rose-400 block">
            ${(activeCoin.low24 || activeCoin.basePrice * 0.97).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 24h Volume */}
        <div className="space-y-1 hidden sm:block">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">24H VOLUME:</span>
          <span className="text-sm font-bold text-cyan-400 block">
            ${activeCoin.vol || '4.82B'}
          </span>
        </div>

        {/* Status */}
        <div className="space-y-1 hidden lg:block">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">FEED STATUS:</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REAL-TIME LIVE</span>
          </span>
        </div>

      </div>

      {/* Main Interactive Recharts Chart Canvas */}
      <div className="h-[340px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#64748b" 
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(val) => `$${val > 1000 ? Math.round(val / 1000) + 'k' : val}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={chartColor} 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
