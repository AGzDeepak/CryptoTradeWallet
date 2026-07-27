import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Bot, Sliders, Play, Pause, Terminal, Zap, Activity, Flame, Sparkles } from 'lucide-react';

export const AutoTraderBar = memo(() => {
  const { 
    autoTradingEnabled, 
    setAutoTradingEnabled,
    minProfitThreshold,
    setMinProfitThreshold,
    autoTradeLogs,
    totalBotProfit,
    autoTradeCount,
    stimulationEnabled,
    setStimulationEnabled,
    stimulationMode,
    setStimulationMode,
    stimulationLogs,
    triggerManualPulse,
    triggerStimulationPulse
  } = useCrypto();

  const handleTurboStimulate = () => {
    triggerStimulationPulse('Monte Carlo Micro-Burst Pulse (300ms)');
  };

  return (
    <div className="chainblock-card p-6 rounded-2xl space-y-5 font-sans">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* 1. Left: Bot Branding */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-[#facc15] text-slate-950 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(250,204,21,0.35)]">
            <Bot className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="font-extrabold text-base text-white font-mono tracking-tight">HIGH-FREQUENCY STIMULATION COMMAND DECK</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                autoTradingEnabled 
                  ? 'bg-emerald-950 text-[#2dd4bf] border-[#2dd4bf] animate-pulse' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {autoTradingEnabled ? '• TURBO STIMULATION 300MS' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Orderbook Stimulation Engine: Injects 300ms Monte Carlo stochastic liquidity pulses across exchange orderbooks.</p>
          </div>
        </div>

        {/* Controls Cluster */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* 2. Stimulation Technique Controller Pill */}
          <div className="bg-[#0b0c10] p-2 px-3 rounded-xl border border-slate-800 shrink-0">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-[#facc15] font-bold">
                <Zap className="w-3 h-3 text-[#facc15]" /> Stimulation Mode
              </span>
              <button 
                onClick={() => setStimulationEnabled(!stimulationEnabled)}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${stimulationEnabled ? 'bg-emerald-950 text-[#2dd4bf]' : 'bg-slate-800 text-slate-400'}`}
              >
                {stimulationEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <select
              value={stimulationMode}
              onChange={(e) => setStimulationMode(e.target.value)}
              className="bg-[#14161d] border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono text-xs outline-none focus:border-[#facc15]"
            >
              <option value="Monte Carlo Micro-Burst Pulse">Monte Carlo Micro-Burst (300ms)</option>
              <option value="Stochastic Liquidity Pulse">Stochastic Liquidity Pulse</option>
              <option value="Orderbook Depth Injections">Orderbook Depth Injections</option>
            </select>
          </div>

          {/* 3. High-Speed Turbo Stimulation Button */}
          <button
            onClick={handleTurboStimulate}
            className="px-4 py-2.5 rounded-xl bg-[#facc15] text-slate-950 font-extrabold text-xs font-mono transition hover:brightness-110 shadow-lg flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>TURBO STIMULATION (300MS)</span>
          </button>

          {/* 4. Min Profit Target Slider Container */}
          <div className="bg-[#0b0c10] p-2 px-3.5 rounded-xl border border-slate-800 w-full sm:w-48 shrink-0">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-[#facc15]" /> Min Target
              </span>
              <span className="text-[#facc15] font-extrabold text-xs font-mono">{minProfitThreshold}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.05"
              value={minProfitThreshold}
              onChange={(e) => setMinProfitThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#facc15]"
            />
          </div>

          {/* 5. Bot Cumulative Profit & Activate/Pause Button */}
          <div className="flex items-center space-x-4 pl-2 shrink-0">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Bot Cum. Profit</span>
              <span className="text-lg font-extrabold text-[#facc15]">
                +${totalBotProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-400 block">{autoTradeCount} Executions</span>
            </div>

            <button
              onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition border shadow-lg flex items-center gap-1.5 ${
                autoTradingEnabled
                  ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-800'
                  : 'bg-emerald-950 hover:bg-emerald-900 text-[#2dd4bf] border-[#2dd4bf]'
              }`}
            >
              {autoTradingEnabled ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE BOT</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>ACTIVATE BOT</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Auto-Execution & Stimulation Live Stream Terminal */}
      <div className="bg-[#0b0c10] p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1.5 border-b border-slate-800">
          <span className="flex items-center gap-1.5 font-bold text-slate-200">
            <Terminal className="w-3.5 h-3.5 text-[#facc15]" /> HIGH-FREQUENCY STIMULATION & TELEMETRY STREAM:
          </span>
          <span className="text-[10px] text-[#2dd4bf] flex items-center gap-1 font-bold">
            <Activity className="w-3 h-3 animate-pulse text-[#2dd4bf]" /> MODE: {stimulationMode.toUpperCase()} (300MS)
          </span>
        </div>

        <div className="max-h-24 overflow-y-auto space-y-1.5 no-scrollbar text-[11px] pt-1">
          {stimulationLogs.map((sLog) => (
            <div key={sLog.id} className="flex justify-between items-center text-[#facc15] font-mono">
              <span className="flex items-center gap-1.5 text-[#facc15]">
                <Flame className="w-3.5 h-3.5 text-[#facc15] shrink-0" /> {sLog.text}
              </span>
              <span className="text-slate-500 text-[10px] ml-2 shrink-0">{sLog.time}</span>
            </div>
          ))}
          {autoTradeLogs.map((log) => (
            <div key={log.id} className="flex justify-between items-center text-slate-300">
              <span className={log.type === 'success' ? 'text-[#2dd4bf] font-medium' : 'text-slate-400'}>
                {log.text}
              </span>
              <span className="text-slate-500 text-[10px] ml-2 shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});
