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
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const SimulationSection = () => {
  const { marketData, addNotification, audioFx } = useCrypto();

  const [simActive, setSimActive] = useState(false);
  const [simMode, setSimMode] = useState('Monte Carlo Liquidity Injections');
  const [intensity, setIntensity] = useState('300ms High-Frequency');
  const [volatility, setVolatility] = useState('MEDIUM (1.5%)');
  const [targetSymbol, setTargetSymbol] = useState('BTCUSDT');

  const [simLogs, setSimLogs] = useState([
    { id: 1, text: '[SIMULATION ENGINE] Initialized Monte Carlo Stochastic Liquidity Generator.', type: 'info', time: '09:45:10' },
    { id: 2, text: '[LIQUIDITY SHOCK] Injected +$1.4M Bid Depth across Binance BTC/USDT (+1.85% Spread).', type: 'success', time: '09:46:02' },
    { id: 3, text: '[PROBE EXECUTED] Simulated spatial route: Buy Bybit @ $67,420 -> Sell OKX @ $68,680 (+$630.00 PnL).', type: 'success', time: '09:47:15' }
  ]);

  const [orderbookDepth, setOrderbookDepth] = useState([
    { exchange: 'Binance Pro', bidDepth: 84.5, askDepth: 72.1, spread: '0.42%', color: '#facc15' },
    { exchange: 'Bybit Quant', bidDepth: 91.2, askDepth: 88.0, spread: '0.38%', color: '#2dd4bf' },
    { exchange: 'OKX Institutional', bidDepth: 68.9, askDepth: 79.4, spread: '0.55%', color: '#c084fc' },
    { exchange: 'Coinbase Pro', bidDepth: 77.3, askDepth: 65.8, spread: '0.48%', color: '#38bdf8' }
  ]);

  const handleFireShock = () => {
    const timeStr = new Date().toLocaleTimeString();
    const sym = targetSymbol;
    const spreads = ['+1.65%', '+2.40%', '+3.15%', '+4.80%'];
    const pnl = (Math.random() * 800 + 200).toFixed(2);
    const randSpread = spreads[Math.floor(Math.random() * spreads.length)];

    const newLog = {
      id: Date.now(),
      text: `[MONTE CARLO SHOCK FIRED] Injected ${volatility} volatility shock into ${sym} orderbook (${randSpread} Spread, +$${pnl} PnL).`,
      type: 'success',
      time: timeStr
    };

    setSimLogs(prev => [newLog, ...prev]);

    // Update Orderbook Depths visually
    setOrderbookDepth(prev => prev.map(ob => ({
      ...ob,
      bidDepth: Math.min(100, parseFloat((ob.bidDepth + (Math.random() * 15 - 5)).toFixed(1))),
      askDepth: Math.min(100, parseFloat((ob.askDepth + (Math.random() * 15 - 5)).toFixed(1)))
    })));

    audioFx?.playTradeSuccess();
    addNotification(`Simulated Liquidity Shock Fired on ${sym} (${randSpread} yield spread)!`, 'success');
  };

  const handleResetSim = () => {
    setSimLogs([
      { id: Date.now(), text: '[SIMULATOR RESET] Simulation telemetry reset to baseline state.', type: 'info', time: new Date().toLocaleTimeString() }
    ]);
    addNotification('Simulation telemetry reset to baseline.', 'info');
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
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">QUANTITATIVE MARKET SIMULATION WORKSTATION</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                simActive ? 'bg-emerald-950 text-[#2dd4bf] border-[#2dd4bf] animate-pulse' : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}>
                {simActive ? '• SIMULATOR RUNNING' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Simulate high-frequency orderbook liquidity depth, Monte Carlo volatility shocks, and yield spreads.</p>
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
            onClick={handleResetSim}
            className="px-4 py-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-slate-300 font-bold hover:text-[#facc15] hover:border-[#facc15] transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-[#facc15]" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* 2. Simulation Configuration Parameters Deck */}
      <div className="chainblock-card p-6 space-y-6 font-mono text-xs">
        <div className="card-header-baseline">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#facc15]" />
            <h3 className="text-sm font-extrabold text-white tracking-tight">SIMULATION PARAMETERS & VOLATILITY CONTROLS</h3>
          </div>
          <span className="text-[10px] text-[#2dd4bf] font-bold">MONTE CARLO V2.4</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div>
            <label className="text-slate-400 block mb-1.5 font-bold text-[11px]">Simulation Mode</label>
            <select
              value={simMode}
              onChange={(e) => setSimMode(e.target.value)}
              className="w-full h-11 bg-[#0b0c10] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
            >
              <option value="Monte Carlo Liquidity Injections">Monte Carlo Injections</option>
              <option value="Orderbook Depth Shock">Orderbook Depth Shock</option>
              <option value="High-Frequency Stress Test">Volatility Stress Test</option>
              <option value="Triangulation Yield Probe">Triangulation Yield Probe</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1.5 font-bold text-[11px]">Tick Frequency</label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full h-11 bg-[#0b0c10] border border-slate-800 rounded-xl px-3 text-[#2dd4bf] font-bold outline-none focus:border-[#facc15]"
            >
              <option value="100ms Micro-Burst">100ms Micro-Burst</option>
              <option value="300ms High-Frequency">300ms High-Frequency</option>
              <option value="800ms Standard">800ms Standard</option>
              <option value="2000ms Slow Probe">2000ms Slow Probe</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1.5 font-bold text-[11px]">Volatility Shock Level</label>
            <select
              value={volatility}
              onChange={(e) => setVolatility(e.target.value)}
              className="w-full h-11 bg-[#0b0c10] border border-slate-800 rounded-xl px-3 text-purple-400 font-bold outline-none focus:border-[#facc15]"
            >
              <option value="LOW (0.5%)">LOW (0.5% Delta)</option>
              <option value="MEDIUM (1.5%)">MEDIUM (1.5% Delta)</option>
              <option value="HIGH (3.5%)">HIGH (3.5% Delta)</option>
              <option value="EXTREME (8.0%)">EXTREME (8.0% Delta)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1.5 font-bold text-[11px]">Target Ticker Symbol</label>
            <select
              value={targetSymbol}
              onChange={(e) => setTargetSymbol(e.target.value)}
              className="w-full h-11 bg-[#0b0c10] border border-slate-800 rounded-xl px-3 text-[#facc15] font-bold outline-none focus:border-[#facc15]"
            >
              <option value="BTCUSDT">BTC/USDT ($67,840.50)</option>
              <option value="ETHUSDT">ETH/USDT ($3,540.20)</option>
              <option value="SOLUSDT">SOL/USDT ($184.75)</option>
              <option value="AVAXUSDT">AVAX/USDT ($38.60)</option>
            </select>
          </div>

        </div>

        {/* Primary Simulation Fire Trigger Button */}
        <button
          onClick={handleFireShock}
          className="w-full py-4 rounded-xl bg-[#facc15] text-slate-950 font-extrabold text-sm font-sans tracking-wider uppercase transition hover:brightness-110 shadow-[0_0_20px_rgba(250,204,21,0.3)] flex items-center justify-center gap-2"
        >
          <Flame className="w-5 h-5 fill-slate-950" />
          <span>FIRE MONTE CARLO LIQUIDITY SHOCK ON {targetSymbol}</span>
        </button>

      </div>

      {/* 3. Live Orderbook Depth Visual Chart Matrix & Telemetry */}
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
            <span className="text-[10px] text-[#2dd4bf] font-bold">LIVE STREAM</span>
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
