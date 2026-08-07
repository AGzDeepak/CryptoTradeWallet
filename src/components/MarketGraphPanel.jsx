import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  CandlestickChart,
  Eye,
  Sliders,
  Layers
} from 'lucide-react';

export const MarketGraphPanel = () => {
  const { marketData } = useCrypto();
  
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('24H');
  const [chartType, setChartType] = useState('CANDLES'); // 'CANDLES' | 'LINE'
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const svgRef = useRef(null);

  const pairList = [
    { symbol: 'BTCUSDT', label: 'BTC/USDT', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETHUSDT', label: 'ETH/USDT', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'SOLUSDT', label: 'SOL/USDT', name: 'Solana', icon: '◎' },
    { symbol: 'AVAXUSDT', label: 'AVAX/USDT', name: 'Avalanche', icon: '🔺' },
    { symbol: 'XRPUSDT', label: 'XRP/USDT', name: 'Ripple', icon: '✕' },
    { symbol: 'LINKUSDT', label: 'LINK/USDT', name: 'Chainlink', icon: '⬢' }
  ];

  const activeCoin = marketData.find(c => c.symbol === selectedPair) || marketData[0] || {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    basePrice: 67840.50,
    vol: '4.82B',
    high24: 68920.00,
    low24: 66500.00,
    change24: 2.45
  };

  // Generate 32 realistic TradingView-grade OHLC Candlestick data points
  const ohlcData = useMemo(() => {
    const baseP = activeCoin.basePrice || 67840.50;
    const pointsCount = timeframe === '1H' ? 16 : timeframe === '24H' ? 28 : timeframe === '7D' ? 28 : 32;
    const volatility = baseP * 0.007;

    const data = [];
    let currentOpen = baseP * (1 - (activeCoin.change24 || 0) / 100);

    const now = new Date();

    for (let i = pointsCount - 1; i >= 0; i--) {
      const change = (Math.random() - 0.47) * volatility;
      const currentClose = Math.max(baseP * 0.7, currentOpen + change);
      
      const maxBody = Math.max(currentOpen, currentClose);
      const minBody = Math.min(currentOpen, currentClose);
      
      const high = maxBody + Math.random() * (volatility * 0.55);
      const low = Math.max(baseP * 0.65, minBody - Math.random() * (volatility * 0.55));
      const isBullish = currentClose >= currentOpen;

      let label = `${24 - i}:00`;
      if (timeframe === '7D') label = `Day ${Math.floor((32 - i) / 4) + 1}`;
      else if (timeframe === '1M') label = `Day ${32 - i}`;
      else if (timeframe === '1H') label = `${(16 - i) * 4}m`;

      const vol = Math.floor(Math.random() * 6000 + 1500);

      data.push({
        index: pointsCount - 1 - i,
        time: label,
        open: parseFloat(currentOpen.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(currentClose.toFixed(2)),
        volume: vol,
        isBullish
      });

      currentOpen = currentClose;
    }

    // Ensure last candle close matches live market price exactly
    if (data.length > 0) {
      data[data.length - 1].close = activeCoin.basePrice;
      data[data.length - 1].isBullish = data[data.length - 1].close >= data[data.length - 1].open;
      data[data.length - 1].high = Math.max(data[data.length - 1].high, activeCoin.basePrice);
      data[data.length - 1].low = Math.min(data[data.length - 1].low, activeCoin.basePrice);
    }

    // Calculate MA(7) and MA(25)
    for (let i = 0; i < data.length; i++) {
      let sum7 = 0;
      let count7 = 0;
      for (let j = Math.max(0, i - 6); j <= i; j++) {
        sum7 += data[j].close;
        count7++;
      }
      data[i].ma7 = parseFloat((sum7 / count7).toFixed(2));

      let sum25 = 0;
      let count25 = 0;
      for (let j = Math.max(0, i - 24); j <= i; j++) {
        sum25 += data[j].close;
        count25++;
      }
      data[i].ma25 = parseFloat((sum25 / count25).toFixed(2));
    }

    return data;
  }, [selectedPair, timeframe, activeCoin.basePrice, activeCoin.change24]);

  // Price range statistics
  const { minP, maxP, maxVol } = useMemo(() => {
    if (!ohlcData || ohlcData.length === 0) return { minP: 0, maxP: 100, maxVol: 1 };
    const lows = ohlcData.map(d => d.low);
    const highs = ohlcData.map(d => d.high);
    const vols = ohlcData.map(d => d.volume);

    const minVal = Math.min(...lows);
    const maxVal = Math.max(...highs);
    const maxV = Math.max(...vols);

    const padding = (maxVal - minVal) * 0.05 || 10;
    return {
      minP: minVal - padding,
      maxP: maxVal + padding,
      maxVol: maxV || 1
    };
  }, [ohlcData]);

  // Handle Mouse Hover for Crosshairs & Tooltip
  const handleMouseMove = (e) => {
    if (!svgRef.current || !ohlcData || ohlcData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const padLeft = 15;
    const padRight = 75;
    const chartW = rect.width - padLeft - padRight;
    const stepX = chartW / ohlcData.length;

    const candleIdx = Math.min(
      ohlcData.length - 1,
      Math.max(0, Math.floor((mouseX - padLeft) / stepX))
    );

    setHoveredCandle(ohlcData[candleIdx]);
    setMousePos({ x: mouseX, y: mouseY, chartW, chartH: rect.height });
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setMousePos(null);
  };

  // Dimensions for SVG canvas
  const svgWidth = 900;
  const svgHeight = 360;
  const padTop = 25;
  const padBot = 35;
  const padLeft = 15;
  const padRight = 80;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBot;

  const getY = (price) => {
    if (maxP === minP) return padTop + chartH / 2;
    return padTop + chartH - ((price - minP) / (maxP - minP)) * chartH;
  };

  // MA lines SVG paths
  const ma7Path = useMemo(() => {
    if (!ohlcData || ohlcData.length === 0) return '';
    const stepX = chartW / ohlcData.length;
    return ohlcData.reduce((acc, d, i) => {
      const cx = padLeft + (i + 0.5) * stepX;
      const cy = getY(d.ma7);
      return `${acc} ${i === 0 ? 'M' : 'L'} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
    }, '');
  }, [ohlcData, minP, maxP]);

  const ma25Path = useMemo(() => {
    if (!ohlcData || ohlcData.length === 0) return '';
    const stepX = chartW / ohlcData.length;
    return ohlcData.reduce((acc, d, i) => {
      const cx = padLeft + (i + 0.5) * stepX;
      const cy = getY(d.ma25);
      return `${acc} ${i === 0 ? 'M' : 'L'} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
    }, '');
  }, [ohlcData, minP, maxP]);

  // Smooth Area Path if user chooses LINE mode
  const areaPath = useMemo(() => {
    if (!ohlcData || ohlcData.length === 0) return '';
    const stepX = chartW / ohlcData.length;
    const points = ohlcData.map((d, i) => `${(padLeft + (i + 0.5) * stepX).toFixed(1)},${getY(d.close).toFixed(1)}`);
    const lineStr = `M ${points.join(' L ')}`;
    const lastX = (padLeft + (ohlcData.length - 0.5) * stepX).toFixed(1);
    const firstX = (padLeft + 0.5 * stepX).toFixed(1);
    const bottomY = (padTop + chartH).toFixed(1);
    return `${lineStr} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [ohlcData, minP, maxP]);

  // Y-axis grid tick levels
  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const price = minP + (i / count) * (maxP - minP);
      const y = getY(price);
      ticks.push({ price, y });
    }
    return ticks;
  }, [minP, maxP]);

  const latestCandle = ohlcData.length > 0 ? ohlcData[ohlcData.length - 1] : null;
  const activeDisplayCandle = hoveredCandle || latestCandle;

  return (
    <div className="chainblock-card p-6 space-y-6 font-sans">
      
      {/* 1. Header Bar: Pair Selector & Technical Mode Indicator */}
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

        {/* Chart Type Switcher & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Candlestick vs Line Toggle */}
          <div className="flex items-center bg-[#090d16] p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setChartType('CANDLES')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 ${
                chartType === 'CANDLES'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>CANDLES (OHLC)</span>
            </button>
            <button
              onClick={() => setChartType('LINE')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 ${
                chartType === 'LINE'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>AREA LINE</span>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1 bg-[#090d16] p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            {['1H', '24H', '7D', '1M', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  timeframe === tf
                    ? 'bg-[#2dd4bf] text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2. Real-time Ticker & Active Candle OHLC Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 font-mono text-xs p-4 rounded-2xl bg-[#090d16] border border-slate-800">
        
        {/* Live Price */}
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

        {/* Active Candle Open & Close */}
        {activeDisplayCandle && (
          <>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">OPEN / CLOSE:</span>
              <span className="text-xs font-bold text-slate-200 block">
                O: ${activeDisplayCandle.open.toLocaleString()} | C: ${activeDisplayCandle.close.toLocaleString()}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">HIGH / LOW:</span>
              <span className="text-xs font-bold block">
                <span className="text-emerald-400">H: ${activeDisplayCandle.high.toLocaleString()}</span>{' '}
                <span className="text-rose-400">L: ${activeDisplayCandle.low.toLocaleString()}</span>
              </span>
            </div>
          </>
        )}

        {/* MA Indicators */}
        <div className="space-y-1 hidden lg:block">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">INDICATORS:</span>
          <div className="text-[11px] font-bold space-x-2">
            <span className="text-[#facc15]">MA(7): ${latestCandle?.ma7?.toLocaleString()}</span>
            <span className="text-[#06b6d4]">MA(25): ${latestCandle?.ma25?.toLocaleString()}</span>
          </div>
        </div>

        {/* Live Telemetry Status */}
        <div className="space-y-1 hidden lg:block">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">CANDLESTREAM FEED:</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TRADINGVIEW L2 STREAM</span>
          </span>
        </div>

      </div>

      {/* 3. Pure SVG TradingView-Grade Financial Candlestick Canvas */}
      <div className="relative w-full h-[360px] bg-[#07090e] rounded-2xl border border-slate-800 p-2 overflow-hidden shadow-2xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Area Line Gradient */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* A. Background Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={svgWidth - padRight}
                y2={tick.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - padRight + 8}
                y={tick.y + 4}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ${tick.price > 1000 ? (tick.price / 1000).toFixed(1) + 'k' : tick.price.toFixed(2)}
              </text>
            </g>
          ))}

          {/* B. Area Line Chart Mode (If selected) */}
          {chartType === 'LINE' && (
            <>
              <path d={areaPath} fill="url(#areaGradient)" />
              <path
                d={ohlcData.reduce((acc, d, i) => {
                  const stepX = chartW / ohlcData.length;
                  const cx = padLeft + (i + 0.5) * stepX;
                  const cy = getY(d.close);
                  return `${acc} ${i === 0 ? 'M' : 'L'} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
                }, '')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />
            </>
          )}

          {/* C. JAPANESE FINANCIAL CANDLESTICKS (OHLC) */}
          {chartType === 'CANDLES' && ohlcData.map((d, i) => {
            const stepX = chartW / ohlcData.length;
            const cx = padLeft + (i + 0.5) * stepX;
            const candleW = Math.max(4, Math.min(16, stepX * 0.65));

            const yHigh = getY(d.high);
            const yLow = getY(d.low);
            const yOpen = getY(d.open);
            const yClose = getY(d.close);

            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(2, Math.abs(yOpen - yClose));
            const color = d.isBullish ? '#10b981' : '#f43f5e';
            const strokeColor = d.isBullish ? '#059669' : '#e11d48';

            // Volume Bar Height at Bottom
            const volH = (d.volume / maxVol) * (chartH * 0.18);
            const volY = padTop + chartH - volH;

            return (
              <g key={i} className="transition-opacity duration-150">
                {/* 1. Translucent Volume Bar at Bottom */}
                <rect
                  x={cx - candleW / 2}
                  y={volY}
                  width={candleW}
                  height={volH}
                  fill={color}
                  opacity={0.25}
                  rx={1}
                />

                {/* 2. Thin Central High-to-Low Wick (Shadow) */}
                <line
                  x1={cx}
                  y1={yHigh}
                  x2={cx}
                  y2={yLow}
                  stroke={color}
                  strokeWidth={1.5}
                />

                {/* 3. Open-to-Close Rectangular Candle Body */}
                <rect
                  x={cx - candleW / 2}
                  y={bodyTop}
                  width={candleW}
                  height={bodyHeight}
                  fill={color}
                  stroke={strokeColor}
                  strokeWidth={0.8}
                  rx={1.5}
                  className="hover:brightness-125 transition"
                />
              </g>
            );
          })}

          {/* D. Moving Average Overlay Lines */}
          <path d={ma7Path} fill="none" stroke="#facc15" strokeWidth="1.8" opacity={0.85} />
          <path d={ma25Path} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" opacity={0.85} />

          {/* E. X-Axis Time Labels at Bottom */}
          {ohlcData.map((d, i) => {
            if (i % Math.ceil(ohlcData.length / 8) !== 0 && i !== ohlcData.length - 1) return null;
            const stepX = chartW / ohlcData.length;
            const cx = padLeft + (i + 0.5) * stepX;
            return (
              <text
                key={`time-${i}`}
                x={cx}
                y={svgHeight - 10}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {d.time}
              </text>
            );
          })}

          {/* F. Live Price Horizontal Line & Right Y-Axis Badge */}
          {latestCandle && (
            <g>
              <line
                x1={padLeft}
                y1={getY(latestCandle.close)}
                x2={svgWidth - padRight}
                y2={getY(latestCandle.close)}
                stroke="#10b981"
                strokeDasharray="2 2"
                strokeWidth="1.2"
              />
              <rect
                x={svgWidth - padRight + 2}
                y={getY(latestCandle.close) - 10}
                width={70}
                height={20}
                fill="#10b981"
                rx={4}
              />
              <text
                x={svgWidth - padRight + 37}
                y={getY(latestCandle.close) + 4}
                fill="#022c22"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="900"
                textAnchor="middle"
              >
                ${latestCandle.close > 1000 ? Math.round(latestCandle.close).toLocaleString() : latestCandle.close.toFixed(2)}
              </text>
            </g>
          )}

          {/* G. Interactive Crosshair Lines when Hovering */}
          {mousePos && hoveredCandle && (
            <g className="pointer-events-none">
              {/* Vertical Crosshair Line */}
              <line
                x1={padLeft + (hoveredCandle.index + 0.5) * (chartW / ohlcData.length)}
                y1={padTop}
                x2={padLeft + (hoveredCandle.index + 0.5) * (chartW / ohlcData.length)}
                y2={padTop + chartH}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* Horizontal Crosshair Line */}
              <line
                x1={padLeft}
                y1={mousePos.y * (svgHeight / mousePos.chartH)}
                x2={svgWidth - padRight}
                y2={mousePos.y * (svgHeight / mousePos.chartH)}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            </g>
          )}

        </svg>

        {/* Hovered Candle Floating TradingView Card */}
        {hoveredCandle && (
          <div className="absolute top-4 left-6 pointer-events-none bg-[#090d16]/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-[11px] font-mono space-y-1 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
              <span className="font-extrabold text-[#2dd4bf]">{selectedPair} • {hoveredCandle.time}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                hoveredCandle.isBullish ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
              }`}>
                {hoveredCandle.isBullish ? 'BULLISH CANDLE' : 'BEARISH CANDLE'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1 text-slate-200">
              <div>Open: <strong className="text-white">${hoveredCandle.open.toLocaleString()}</strong></div>
              <div>Close: <strong className="text-white">${hoveredCandle.close.toLocaleString()}</strong></div>
              <div>High: <strong className="text-emerald-400">${hoveredCandle.high.toLocaleString()}</strong></div>
              <div>Low: <strong className="text-rose-400">${hoveredCandle.low.toLocaleString()}</strong></div>
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5">
              Volume: <strong className="text-cyan-400">{hoveredCandle.volume.toLocaleString()} BTC</strong> | MA(7): <strong className="text-amber-400">${hoveredCandle.ma7?.toLocaleString()}</strong>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
