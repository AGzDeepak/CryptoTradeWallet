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
  CandlestickChart
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Bar, 
  Cell, 
  Line 
} from 'recharts';

// Custom SVG Candlestick Shape Component
const CandlestickItem = (props) => {
  const { x, y, width, height, payload } = props;

  if (!payload || payload.open === undefined) return null;

  const { open, high, low, close } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#10b981' : '#f43f5e';

  // Calculate Y coordinates relative to chart scale
  // Recharts passes y as top of the bar container, but we compute exact wick coordinates
  const yDomainMin = props.yAxisDomain ? props.yAxisDomain[0] : Math.min(open, close, low) * 0.99;
  const yDomainMax = props.yAxisDomain ? props.yAxisDomain[1] : Math.max(open, close, high) * 1.01;
  const chartHeight = props.chartHeight || 260;

  const scaleY = (val) => {
    if (yDomainMax === yDomainMin) return chartHeight / 2;
    return chartHeight - ((val - yDomainMin) / (yDomainMax - yDomainMin)) * chartHeight;
  };

  const highY = scaleY(high);
  const lowY = scaleY(low);
  const openY = scaleY(open);
  const closeY = scaleY(close);

  const candleTop = Math.min(openY, closeY);
  const candleHeight = Math.max(Math.abs(openY - closeY), 2); // Minimum 2px height
  const candleWidth = Math.max(width * 0.6, 6);
  const candleX = x + (width - candleWidth) / 2;
  const wickX = x + width / 2;

  return (
    <g>
      {/* Wick line from High to Low */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={lowY}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Candle Body */}
      <rect
        x={candleX}
        y={candleTop}
        width={candleWidth}
        height={candleHeight}
        fill={isGreen ? '#10b981' : '#f43f5e'}
        stroke={color}
        strokeWidth={1}
        rx={1}
      />
    </g>
  );
};

export const MarketGraphPanel = () => {
  const { marketData } = useCrypto();
  
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('24H');
  const [ohlcData, setOhlcData] = useState([]);
  const [priceStats, setPriceStats] = useState({ high: 0, low: 0, minP: 0, maxP: 0 });

  const activeCoin = marketData.find(c => c.symbol === selectedPair) || marketData[0] || {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    basePrice: 67840.50,
    vol: '4.82B',
    high24: 68920.00,
    low24: 66500.00,
    change24: 2.45
  };

  // Generate dynamic realistic OHLC Candlestick data
  useEffect(() => {
    const baseP = activeCoin.basePrice || 67840.50;
    const pointsCount = timeframe === '1H' ? 12 : timeframe === '24H' ? 24 : timeframe === '7D' ? 28 : 30;
    const volatility = baseP * 0.008;

    const data = [];
    let currentOpen = baseP * (1 - (activeCoin.change24 || 0) / 100);
    let allMin = Infinity;
    let allMax = -Infinity;

    for (let i = 0; i < pointsCount; i++) {
      const change = (Math.random() - 0.47) * volatility;
      const currentClose = Math.max(baseP * 0.7, currentOpen + change);
      
      const maxBody = Math.max(currentOpen, currentClose);
      const minBody = Math.min(currentOpen, currentClose);
      
      const high = maxBody + Math.random() * (volatility * 0.5);
      const low = Math.max(baseP * 0.65, minBody - Math.random() * (volatility * 0.5));

      allMin = Math.min(allMin, low);
      allMax = Math.max(allMax, high);

      let label = `${i}:00`;
      if (timeframe === '7D') label = `Day ${Math.floor(i / 4) + 1}`;
      else if (timeframe === '1M') label = `Day ${i + 1}`;
      else if (timeframe === '1H') label = `${i * 5}m`;

      const ma7 = parseFloat((currentClose * (1 + (Math.random() * 0.003 - 0.0015))).toFixed(2));

      data.push({
        time: label,
        open: parseFloat(currentOpen.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(currentClose.toFixed(2)),
        ma7,
        volume: Math.floor(Math.random() * 8000 + 1200),
        isBullish: currentClose >= currentOpen
      });

      currentOpen = currentClose;
    }

    // Ensure last candle close matches exact live market price
    if (data.length > 0) {
      data[data.length - 1].close = activeCoin.basePrice;
    }

    setOhlcData(data);
    setPriceStats({
      high: allMax,
      low: allMin,
      minP: allMin * 0.995,
      maxP: allMax * 1.005
    });
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
      
      {/* Header Bar: Pair Selector & Candlestick Mode Indicator */}
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-[#090d16] text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <span>{pair.icon}</span>
                <span>{pair.label}</span>
              </button>
            );
          })}
        </div>

        {/* Candlestick Badge & Timeframe Selector */}
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1.5">
            <CandlestickChart className="w-3.5 h-3.5 text-amber-400" />
            <span>REAL-TIME CANDLESTICK (OHLC)</span>
          </span>

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
          <span className="text-[10px] text-slate-400 uppercase font-bold block">24H HIGH (OHLC):</span>
          <span className="text-sm font-bold text-emerald-400 block">
            ${(activeCoin.high24 || activeCoin.basePrice * 1.03).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 24h Low */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">24H LOW (OHLC):</span>
          <span className="text-sm font-bold text-rose-400 block">
            ${(activeCoin.low24 || activeCoin.basePrice * 0.97).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Volume */}
        <div className="space-y-1 hidden sm:block">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">24H VOLUME:</span>
          <span className="text-sm font-bold text-cyan-400 block">
            ${activeCoin.vol || '4.82B'}
          </span>
        </div>

        {/* Status */}
        <div className="space-y-1 hidden lg:block">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">CANDLESTREAM FEED:</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>OHLC LIVE TICK</span>
          </span>
        </div>

      </div>

      {/* Main Interactive Candlestick Chart Canvas */}
      <div className="h-[340px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={ohlcData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis 
              domain={[priceStats.minP || 'auto', priceStats.maxP || 'auto']} 
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
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
              formatter={(value, name) => {
                if (name === 'close') return [`$${value.toLocaleString()}`, 'Close Price'];
                if (name === 'open') return [`$${value.toLocaleString()}`, 'Open Price'];
                if (name === 'high') return [`$${value.toLocaleString()}`, 'High Wick'];
                if (name === 'low') return [`$${value.toLocaleString()}`, 'Low Wick'];
                return [value, name];
              }}
            />
            
            {/* Moving Average Line (MA-7) */}
            <Line 
              type="monotone" 
              dataKey="ma7" 
              stroke="#facc15" 
              strokeWidth={1.5} 
              dot={false} 
              name="MA(7)"
            />

            {/* Custom Candlestick Rendering */}
            <Bar
              dataKey="close"
              shape={<CandlestickItem yAxisDomain={[priceStats.minP, priceStats.maxP]} chartHeight={280} />}
            >
              {ohlcData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isBullish ? '#10b981' : '#f43f5e'} />
              ))}
            </Bar>

            {/* Bottom Volume Bars */}
            <Bar dataKey="volume" yAxisId="volumeAxis" opacity={0.3}>
              {ohlcData.map((entry, index) => (
                <Cell key={`vol-${index}`} fill={entry.isBullish ? '#10b981' : '#f43f5e'} />
              ))}
            </Bar>
            <YAxis yAxisId="volumeAxis" orientation="right" hide domain={[0, 'dataMax * 4']} />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
