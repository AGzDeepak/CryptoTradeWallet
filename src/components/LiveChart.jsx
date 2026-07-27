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
  CartesianGrid,
  Cell
} from 'recharts';
import { LineChart as LineIcon, CandlestickChart, Calendar, RefreshCw, TrendingUp } from 'lucide-react';

// Custom SVG Renderer for True Financial Market Candlesticks (OHLC)
const CustomCandlestick = (props) => {
  const { x, width, open, close, high, low, yAxis } = props;
  if (!yAxis || open === undefined || close === undefined) return null;

  const isBullish = close >= open;
  const color = isBullish ? '#34d399' : '#f43f5e';
  
  // Get scaled Y positions
  const yOpen = yAxis.scale(open);
  const yClose = yAxis.scale(close);
  const yHigh = yAxis.scale(high);
  const yLow = yAxis.scale(low);

  const candleTop = Math.min(yOpen, yClose);
  const candleBottom = Math.max(yOpen, yClose);
  const candleHeight = Math.max(Math.abs(yClose - yOpen), 3);
  const candleWidth = Math.max(width * 0.5, 6);
  const candleX = x + (width - candleWidth) / 2;
  const wickX = x + width / 2;

  return (
    <g className="transition-all duration-300">
      {/* High to Low Wick Line */}
      <line x1={wickX} y1={yHigh} x2={wickX} y2={yLow} stroke={color} strokeWidth={1.5} strokeOpacity={0.9} />
      {/* Body Rect (Open to Close) */}
      <rect 
        x={candleX} 
        y={candleTop} 
        width={candleWidth} 
        height={candleHeight} 
        fill={color} 
        stroke={color}
        strokeWidth={1}
        rx={1} 
      />
    </g>
  );
};

export const LiveChart = memo(() => {
  const { marketData } = useCrypto();
  const [chartMode, setChartMode] = useState('Candle'); // Default to 'Candle' for True Market Candlesticks
  const [timeframe, setTimeframe] = useState('1D');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const currentCoin = marketData.find(c => c.symbol === selectedSymbol) || marketData[0];
  const baseP = currentCoin.basePrice || 67840.50;

  // True Market OHLC Candlestick Data Generator
  const candleData = useMemo(() => {
    const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
    const multipliers = [
      { o: 0.985, h: 0.998, l: 0.980, c: 0.995, v: 420 },
      { o: 0.995, h: 1.012, l: 0.991, c: 1.008, v: 650 },
      { o: 1.008, h: 1.015, l: 0.998, c: 1.002, v: 510 },
      { o: 1.002, h: 1.025, l: 0.999, c: 1.021, v: 880 },
      { o: 1.021, h: 1.028, l: 1.010, c: 1.014, v: 340 },
      { o: 1.014, h: 1.032, l: 1.012, c: 1.029, v: 720 },
      { o: 1.029, h: 1.035, l: 1.020, c: 1.025, v: 460 },
      { o: 1.025, h: 1.040, l: 1.022, c: 1.038, v: 910 },
      { o: 1.038, h: 1.045, l: 1.031, c: 1.042, v: 830 },
      { o: 1.042, h: 1.048, l: 1.035, c: 1.039, v: 520 },
      { o: 1.039, h: 1.055, l: 1.037, c: 1.051, v: 1150 },
      { o: 1.051, h: 1.058, l: 1.046, c: 1.055, v: 980 }
    ];

    return times.map((t, i) => {
      const m = multipliers[i];
      const open = Math.round(baseP * m.o * 100) / 100;
      const high = Math.round(baseP * m.h * 100) / 100;
      const low = Math.round(baseP * m.l * 100) / 100;
      const close = Math.round(baseP * m.c * 100) / 100;
      const isBull = close >= open;

      return {
        time: t,
        open,
        high,
        low,
        close,
        volume: m.v,
        isBullish: isBull,
        color: isBull ? '#34d399' : '#f43f5e'
      };
    });
  }, [baseP]);

  const latestCandle = candleData[candleData.length - 1];

  return (
    <div className="chainblock-card space-y-4 mb-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        
        {/* Left Title & Ticker Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <CandlestickChart className="w-5 h-5 text-[#34d399]" />
            <h3 className="text-base font-extrabold text-white font-mono">ANALYTICAL MARKET CANDLES</h3>
          </div>

          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-[#11141b] border border-slate-800 rounded-xl px-3 py-1 text-white font-mono text-xs font-bold outline-none"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
            <option value="AVAXUSDT">AVAX/USDT</option>
          </select>

          {/* Mode Switcher (Price Line vs True Candlestick) */}
          <div className="flex items-center space-x-1 bg-[#11141b] p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setChartMode('Candle')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition ${
                chartMode === 'Candle'
                  ? 'bg-emerald-950 text-[#34d399] font-bold border border-emerald-500/40 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candles</span>
            </button>
            <button
              onClick={() => setChartMode('Price')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition ${
                chartMode === 'Price'
                  ? 'bg-[#1b202c] text-white font-bold border border-slate-700 shadow-md'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LineIcon className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
          </div>
        </div>

        {/* Right Timeframe Pills */}
        <div className="flex items-center space-x-1 bg-[#11141b] p-1 rounded-xl border border-slate-800 font-mono text-xs">
          {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf) => (
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
        </div>

      </div>

      {/* Ticker OHLC Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs bg-[#060810] p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-slate-500 text-[10px] block">OPEN</span>
          <span className="text-slate-200 font-bold">${latestCandle.open.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">HIGH</span>
          <span className="text-[#34d399] font-bold">${latestCandle.high.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">LOW</span>
          <span className="text-rose-400 font-bold">${latestCandle.low.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">CLOSE</span>
          <span className="text-white font-extrabold">${latestCandle.close.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">VOLUME</span>
          <span className="text-cyan-400 font-bold">{latestCandle.volume} Vol</span>
        </div>
      </div>

      {/* Main Chart Canvas Body */}
      <div className="h-[290px] w-full font-mono text-xs relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={candleData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 55, 72, 0.3)" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} orientation="left" />
            
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#090c14] p-3 rounded-xl border border-[#34d399]/40 shadow-2xl text-xs font-mono text-white space-y-1">
                      <div className="text-slate-400 font-bold pb-1 border-b border-slate-800">Time: {d.time} ({selectedSymbol})</div>
                      <div className="flex justify-between gap-4"><span>Open:</span> <strong className="text-slate-300">${d.open.toLocaleString()}</strong></div>
                      <div className="flex justify-between gap-4"><span>High:</span> <strong className="text-[#34d399]">${d.high.toLocaleString()}</strong></div>
                      <div className="flex justify-between gap-4"><span>Low:</span> <strong className="text-rose-400">${d.low.toLocaleString()}</strong></div>
                      <div className="flex justify-between gap-4"><span>Close:</span> <strong className="text-white font-extrabold">${d.close.toLocaleString()}</strong></div>
                      <div className="flex justify-between gap-4 text-cyan-400"><span>Volume:</span> <strong>{d.volume} Vol</strong></div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Volume Histogram Bars */}
            <Bar dataKey="volume" yAxisId={1} radius={[2, 2, 0, 0]}>
              {candleData.map((entry, index) => (
                <Cell key={`cell-vol-${index}`} fill={entry.isBullish ? 'rgba(52, 211, 153, 0.25)' : 'rgba(244, 63, 94, 0.25)'} />
              ))}
            </Bar>
            <YAxis yAxisId={1} orientation="right" domain={[0, 'auto']} hide />

            {/* Render Candlesticks or Price Line */}
            {chartMode === 'Candle' ? (
              <Bar 
                dataKey="close" 
                shape={(barProps) => <CustomCandlestick {...barProps} />} 
              />
            ) : (
              <Line type="monotone" dataKey="close" stroke="#34d399" strokeWidth={2.5} dot={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
});
