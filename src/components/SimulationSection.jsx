import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  FlaskConical, 
  Zap, 
  Play, 
  Pause, 
  RefreshCw, 
  Activity, 
  Sliders, 
  Flame, 
  BarChart3, 
  ShieldAlert, 
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export const SimulationSection = () => {
  const { addNotification, audioFx } = useCrypto();

  const [simActive, setSimActive] = useState(true);
  const [simMode, setSimMode] = useState('Monte Carlo Liquidity Injections');
  const [intensity, setIntensity] = useState('300ms High-Frequency');
  const [volatility, setVolatility] = useState('MEDIUM (1.5%)');

  // Simulation Trading Terminal Form State
  const [tradeSide, setTradeSide] = useState('BUY');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [exchange, setExchange] = useState('Binance Pro');
  const [amount, setAmount] = useState('0.5');
  const [orderType, setOrderType] = useState('Market Yield Order');

  // Simulated Account Balance State
  const [simBalance, setSimBalance] = useState(100000);
  const [simProfit, setSimProfit] = useState(4820.50);

  // Simulated Positions & Execution Logs
  const [simPositions, setSimPositions] = useState([
    { id: 'SIM-101', symbol: 'BTCUSDT', side: 'BUY', exchange: 'Binance Pro', qty: '0.50', entryPrice: '$67,420.00', currentPrice: '$67,840.50', pnl: '+$210.25', pnlPct: '+0.62%', status: 'ACTIVE' },
    { id: 'SIM-102', symbol: 'ETHUSDT', side: 'SELL', exchange: 'Bybit Quant', qty: '4.00', entryPrice: '$3,580.00', currentPrice: '$3,540.20', pnl: '+$159.20', pnlPct: '+1.11%', status: 'ACTIVE' }
  ]);

  const [simLogs, setSimLogs] = useState([
    { id: 1, text: '[SIMULATION ENGINE] Monte Carlo Stochastic Simulator Active (300ms Frequency).', time: '09:50:10' },
    { id: 2, text: '[SIMULATED TRADE] Buy Order Executed: 0.50 BTC @ $67,420 (Binance Pro).', time: '09:51:02' },
    { id: 3, text: '[SIMULATED TRADE] Sell Order Executed: 4.00 ETH @ $3,580 (Bybit Quant).', time: '09:52:15' }
  ]);

  const [orderbookDepth, setOrderbookDepth] = useState([
    { exchange: 'Binance Pro', bidDepth: 88.5, askDepth: 74.1, spread: '0.42%' },
    { exchange: 'Bybit Quant', bidDepth: 92.2, askDepth: 85.0, spread: '0.38%' },
    { exchange: 'OKX Institutional', bidDepth: 71.9, askDepth: 81.4, spread: '0.55%' },
    { exchange: 'Coinbase Pro', bidDepth: 79.3, askDepth: 68.8, spread: '0.48%' }
  ]);

  // Execute Simulated Order Handler
  const handleExecuteSimulatedTrade = (e) => {
    e.preventDefault();

    const numQty = parseFloat(amount);
    if (isNaN(numQty) || numQty <= 0) {
      addNotification('Please enter a valid simulation quantity.', 'warning');
      return;
    }

    const priceMap = { BTCUSDT: 67840.50, ETHUSDT: 3540.20, SOLUSDT: 184.75, AVAXUSDT: 38.60 };
    const currentP = priceMap[symbol] || 67840.50;
    const estPnl = (currentP * numQty * (tradeSide === 'BUY' ? 0.012 : -0.012)).toFixed(2);
    const pnlPct = (tradeSide === 'BUY' ? '+1.20%' : '-0.85%');

    const newPos = {
      id: `SIM-${Math.floor(100 + Math.random() * 900)}`,
      symbol,
      side: tradeSide,
      exchange,
      qty: numQty.toFixed(2),
      entryPrice: `$${currentP.toLocaleString()}`,
      currentPrice: `$${currentP.toLocaleString()}`,
      pnl: `+$${Math.abs(estPnl)}`,
      pnlPct,
      status: 'ACTIVE'
    };

    setSimPositions(prev => [newPos, ...prev]);

    const newLog = {
      id: Date.now(),
      text: `[SIMULATED TRADE EXECUTED] ${tradeSide} ${numQty} ${symbol} @ $${currentP.toLocaleString()} (${exchange}).`,
      time: new Date().toLocaleTimeString()
    };
    setSimLogs(prev => [newLog, ...prev]);

    audioFx?.playTradeSuccess();
    addNotification(`Simulated ${tradeSide} order executed for ${symbol} on ${exchange}!`, 'success');
  };

  const handleCloseSimPosition = (posId) => {
    setSimPositions(prev => prev.filter(p => p.id !== posId));
    setSimProfit(prev => prev + 125.50);

    const newLog = {
      id: Date.now(),
      text: `[SIMULATED POSITION SETTLED] Closed ${posId} (+ $125.50 PnL credited).`,
      time: new Date().toLocaleTimeString()
    };
    setSimLogs(prev => [newLog, ...prev]);

    audioFx?.playTradeSuccess();
    addNotification(`Simulated position ${posId} closed successfully!`, 'success');
  };

  const handleQuickPercent = (pct) => {
    const priceMap = { BTCUSDT: 67840.50, ETHUSDT: 3540.20, SOLUSDT: 184.75, AVAXUSDT: 38.60 };
    const maxQty = (simBalance * pct) / (priceMap[symbol] || 67840.50);
    setAmount(maxQty.toFixed(2));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Banner */}
      <div className="chainblock-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#facc15] text-slate-950 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(250,204,21,0.35)] shrink-0">
            <FlaskConical className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">MARKET SIMULATION & TRADING WORKSTATION</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                simActive ? 'bg-emerald-950 text-[#2dd4bf] border-[#2dd4bf] animate-pulse' : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}>
                {simActive ? '• SIMULATOR ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Standalone simulation deck with virtual order placement, depth matrix, and PnL telemetry.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <button
            onClick={() => setSimActive(!simActive)}
            className={`px-4 py-2.5 rounded-xl font-extrabold transition shadow-lg flex items-center gap-1.5 ${
              simActive
                ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                : 'bg-[#2dd4bf] hover:brightness-110 text-slate-950'
            }`}
          >
            {simActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{simActive ? 'PAUSE SIMULATOR' : 'START SIMULATOR'}</span>
          </button>

          <button
            onClick={() => {
              setSimPositions([]);
              setSimProfit(4820.50);
              addNotification('Simulation workspace reset.', 'info');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-slate-300 font-bold hover:text-[#facc15] hover:border-[#facc15] transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-[#facc15]" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* 2. Four Spacious Simulation Account Key Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        
        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Simulated Cash Balance</span>
          <span className="text-xl font-extrabold text-white block">
            ${simBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block font-semibold">USDT Virtual Cash</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#2dd4bf]/30 space-y-1">
          <span className="text-[10px] text-[#2dd4bf] uppercase tracking-wider block font-semibold">Simulated Net Profit</span>
          <span className="text-xl font-extrabold text-[#2dd4bf] block">
            +${simProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2dd4bf]/80 block font-semibold">+4.82% Return</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#facc15]/30 space-y-1">
          <span className="text-[10px] text-[#facc15] uppercase tracking-wider block font-semibold">Simulated Win Rate</span>
          <span className="text-xl font-extrabold text-[#facc15] block">
            98.6%
          </span>
          <span className="text-[10px] text-amber-400/80 block font-semibold">Monte Carlo Engine</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Active Simulations</span>
          <span className="text-xl font-extrabold text-purple-400 block">
            {simPositions.length} Positions Active
          </span>
          <span className="text-[10px] text-purple-400/80 block font-semibold">Live Sandbox Feed</span>
        </div>

      </div>

      {/* 3. SIMULATED TRADING TERMINAL FORM */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-5 font-mono text-xs">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-extrabold text-white uppercase font-mono tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#facc15]" /> SIMULATED TRADING ORDER DECK
          </h3>

          <div className="flex space-x-1 bg-[#14161d] p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTradeSide('BUY')}
              className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-extrabold transition ${
                tradeSide === 'BUY' ? 'bg-[#2dd4bf] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SIMULATED BUY (LONG)
            </button>
            <button
              type="button"
              onClick={() => setTradeSide('SELL')}
              className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-extrabold transition ${
                tradeSide === 'SELL' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SIMULATED SELL (SHORT)
            </button>
          </div>
        </div>

        <form onSubmit={handleExecuteSimulatedTrade} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Target Crypto Pair</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                <option value="BTCUSDT">BTC/USDT ($67,840.50)</option>
                <option value="ETHUSDT">ETH/USDT ($3,540.20)</option>
                <option value="SOLUSDT">SOL/USDT ($184.75)</option>
                <option value="AVAXUSDT">AVAX/USDT ($38.60)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Simulated Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                <option value="Binance Pro">Binance Pro</option>
                <option value="Bybit Quant">Bybit Quant</option>
                <option value="OKX Institutional">OKX Institutional</option>
                <option value="Coinbase Pro">Coinbase Pro</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-[#2dd4bf] font-bold outline-none focus:border-[#facc15]"
              >
                <option value="Market Yield Order">Market Yield Order</option>
                <option value="Limit Shock Order">Limit Shock Order</option>
                <option value="Arbitrage Stop Order">Arbitrage Stop Order</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Execution Quantity</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              />
            </div>

          </div>

          {/* Quick Percentage Size Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#14161d] border border-slate-800">
            <span className="text-slate-400 font-bold text-[11px]">Quick Position Size:</span>
            <div className="grid grid-cols-4 gap-2 w-full sm:w-auto">
              {[
                { label: '25%', pct: 0.25 },
                { label: '50%', pct: 0.50 },
                { label: '75%', pct: 0.75 },
                { label: '100% (MAX)', pct: 1.0 }
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => handleQuickPercent(btn.pct)}
                  className="h-8 px-3 rounded-lg bg-[#0b0c10] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] transition text-center"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Execute Submit Button */}
          <button
            type="submit"
            className={`w-full h-12 rounded-xl font-extrabold font-sans text-xs sm:text-sm tracking-wider uppercase transition shadow-lg ${
              tradeSide === 'BUY'
                ? 'bg-[#2dd4bf] text-slate-950 hover:brightness-110'
                : 'bg-rose-500 text-white hover:brightness-110'
            }`}
          >
            EXECUTE SIMULATED {tradeSide} ORDER FOR {symbol}
          </button>

        </form>

      </div>

      {/* 4. SIMULATED ACTIVE POSITIONS LEDGER */}
      <div className="chainblock-card p-6 space-y-4">
        <div className="card-header-baseline">
          <h3 className="text-sm font-extrabold text-white font-mono tracking-tight">ACTIVE SIMULATED TRADING POSITIONS</h3>
          <span className="text-xs font-mono text-[#2dd4bf] font-bold">{simPositions.length} POSITIONS OPEN</span>
        </div>

        <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-800 font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0b0c10] border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-3 px-4">SIM ID</th>
                <th className="py-3 px-4">Symbol / Side</th>
                <th className="py-3 px-4">Exchange</th>
                <th className="py-3 px-4">Entry Price</th>
                <th className="py-3 px-4">Simulated PnL</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#14161d]">
              {simPositions.length > 0 ? (
                simPositions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-[#181a24] transition">
                    <td className="py-3.5 px-4 font-bold text-white">{pos.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">{pos.symbol}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                        pos.side === 'BUY' ? 'bg-emerald-950 text-[#2dd4bf]' : 'bg-rose-950 text-rose-400'
                      }`}>
                        {pos.side}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{pos.exchange}</td>
                    <td className="py-3.5 px-4 text-slate-300">{pos.entryPrice}</td>
                    <td className="py-3.5 px-4 font-bold text-[#2dd4bf]">{pos.pnl} ({pos.pnlPct})</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleCloseSimPosition(pos.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-bold transition"
                      >
                        CLOSE POSITION
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No active simulated positions. Use the order deck above to place a simulated trade.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Live Orderbook Depth Visual Chart Matrix & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 Cols): Orderbook Depth Visual Chart */}
        <div className="lg:col-span-7 chainblock-card p-6 space-y-5 font-mono text-xs">
          <div className="card-header-baseline">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#facc15]" />
              <h3 className="text-sm font-extrabold text-white tracking-tight">SIMULATED ORDERBOOK BID/ASK DEPTH MATRIX</h3>
            </div>
            <span className="text-[10px] text-slate-400">REAL-TIME LIQUIDITY DEPTH</span>
          </div>

          <div className="space-y-4">
            {orderbookDepth.map((ob) => (
              <div key={ob.exchange} className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">{ob.exchange}</span>
                  <span className="text-[#facc15]">Spread: {ob.spread}</span>
                </div>

                {/* Bid Bar (Teal) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Bid Depth (Buy Demand)</span>
                    <span className="text-[#2dd4bf] font-bold">{ob.bidDepth}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2dd4bf] transition-all duration-500 rounded-full"
                      style={{ width: `${ob.bidDepth}%` }}
                    />
                  </div>
                </div>

                {/* Ask Bar (Rose) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ask Depth (Sell Supply)</span>
                    <span className="text-rose-400 font-bold">{ob.askDepth}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-500 rounded-full"
                      style={{ width: `${ob.askDepth}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 Cols): Live Simulation Telemetry Stream */}
        <div className="lg:col-span-5 chainblock-card p-6 space-y-5 font-mono text-xs">
          <div className="card-header-baseline">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#2dd4bf] animate-pulse" />
              <h3 className="text-sm font-extrabold text-white tracking-tight">SIMULATION TELEMETRY STREAM</h3>
            </div>
            <span className="text-[10px] text-[#2dd4bf] font-bold">LIVE TELEMETRY</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-3 max-h-[360px] overflow-y-auto no-scrollbar">
            {simLogs.map((log) => (
              <div key={log.id} className="pb-2 border-b border-slate-800/60 last:border-none space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>{log.time}</span>
                  <span className="text-[#facc15] font-bold">MONTE CARLO</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] font-mono">{log.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
