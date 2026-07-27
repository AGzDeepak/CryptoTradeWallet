import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Bot, Sliders, Play, Pause, Terminal, Zap, Activity, Flame } from 'lucide-react';

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
    triggerManualPulse
  } = useCrypto();

  return (
    <div className="chainblock-card p-6 rounded-2xl space-y-5 font-sans">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* 1. Left: Bot Branding */}
        <div className="flex items-center space-x-3.5 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-400 via-sky-400 to-indigo-500 p-[1px] shadow-[0_0_20px_rgba(45,212,191,0.3)]">
            <div className="w-full h-full bg-[#0f172a] rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="font-extrabold text-base text-white font-mono tracking-tight">AUTOPILOT & STIMULATION COMMAND DECK</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                autoTradingEnabled 
                  ? 'bg-teal-950/80 text-teal-300 border-teal-500/40 animate-pulse' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {autoTradingEnabled ? '• STIMULATION ACTIVE' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Orderbook Stimulation Technique: Injects high-frequency stochastic liquidity pulses across cross-exchange orderbooks.</p>
          </div>
        </div>

        {/* Controls Cluster */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* 2. Stimulation Technique Controller Pill */}
          <div className="bg-slate-900/90 p-2 px-3 rounded-xl border border-slate-700/80 shrink-0">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-teal-400 font-bold">
                <Zap className="w-3 h-3 text-teal-400" /> Stimulation Mode
              </span>
              <button 
                onClick={() => setStimulationEnabled(!stimulationEnabled)}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${stimulationEnabled ? 'bg-teal-950 text-teal-300' : 'bg-slate-800 text-slate-400'}`}
              >
                {stimulationEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <select
              value={stimulationMode}
              onChange={(e) => setStimulationMode(e.target.value)}
              className="bg-[#0b1120] border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs outline-none focus:border-teal-400"
            >
              <option value="Stochastic Liquidity Pulse">Stochastic Liquidity Pulse</option>
              <option value="Orderbook Depth Injections">Orderbook Depth Injections</option>
              <option value="Monte Carlo Yield Simulation">Monte Carlo Yield Simulation</option>
            </select>
          </div>

          {/* 3. Manual Liquidity Pulse Button */}
          <button
            onClick={triggerManualPulse}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-extrabold text-xs font-mono transition hover:brightness-110 shadow-lg flex items-center gap-1.5 shrink-0"
          >
            <Flame className="w-4 h-4 fill-slate-950" />
            <span>TRIGGER PULSE</span>
          </button>

          {/* 4. Min Profit Target Slider Container */}
          <div className="bg-slate-900/90 p-2 px-3.5 rounded-xl border border-slate-700/80 w-full sm:w-48 shrink-0">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-teal-400" /> Min Target
              </span>
              <span className="text-teal-400 font-extrabold text-xs font-mono">{minProfitThreshold}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.05"
              value={minProfitThreshold}
              onChange={(e) => setMinProfitThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
          </div>

          {/* 5. Bot Cumulative Profit & Activate/Pause Button */}
          <div className="flex items-center space-x-4 pl-2 shrink-0">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">Bot Cum. Profit</span>
              <span className="text-lg font-extrabold text-teal-400">
                +${totalBotProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-400 block">{autoTradeCount} Executions</span>
            </div>

            <button
              onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition border shadow-lg flex items-center gap-1.5 ${
                autoTradingEnabled
                  ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-800'
                  : 'bg-teal-950/80 hover:bg-teal-900 text-teal-300 border-teal-700'
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
      <div className="bg-[#0b1120] p-3.5 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1.5 border-b border-slate-800">
          <span className="flex items-center gap-1.5 font-bold text-slate-200">
            <Terminal className="w-3.5 h-3.5 text-teal-400" /> STIMULATION & EXECUTION LIVE TELEMETRY STREAM:
          </span>
          <span className="text-[10px] text-teal-400 flex items-center gap-1 font-bold">
            <Activity className="w-3 h-3 animate-pulse text-teal-400" /> MODE: {stimulationMode.toUpperCase()}
          </span>
        </div>

        <div className="max-h-24 overflow-y-auto space-y-1.5 no-scrollbar text-[11px] pt-1">
          {stimulationLogs.map((sLog) => (
            <div key={sLog.id} className="flex justify-between items-center text-amber-300/90 font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {sLog.text}
              </span>
              <span className="text-slate-500 text-[10px] ml-2 shrink-0">{sLog.time}</span>
            </div>
          ))}
          {autoTradeLogs.map((log) => (
            <div key={log.id} className="flex justify-between items-center text-slate-300">
              <span className={log.type === 'success' ? 'text-teal-400 font-medium' : 'text-slate-400'}>
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
