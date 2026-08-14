import React from 'react';
import { Bot, Play, Pause, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export const BotStatusCard = ({
  autoTradingEnabled,
  onToggleAutoTrading,
  botStatus = 'Monitoring Market', // 'Monitoring Market' | 'Evaluating Strategy' | 'Cooldown Active' | 'Paused' | 'Emergency Stopped'
  lastSignal = null, // { signal: 'BUY'|'SELL'|'HOLD', reason, confidence, metrics }
  cooldownRemainingSec = 0,
}) => {
  const signal = lastSignal?.signal || 'HOLD';
  const confidence = lastSignal?.confidence || 50;

  return (
    <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-4 shadow-sm">
      {/* Top Bar: Bot Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Auto Trading Controller</h3>
            <p className="text-[11px] text-slate-400">Automated buy & sell engine</p>
          </div>
        </div>

        {/* Minimalist OFF / ON Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-400">AUTO TRADING</span>
          <button
            type="button"
            onClick={onToggleAutoTrading}
            className={`w-14 h-7 rounded-full transition-colors duration-300 relative p-1 flex items-center shadow-inner ${
              autoTradingEnabled
                ? 'bg-emerald-500 shadow-emerald-500/20'
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center text-[9px] font-bold ${
                autoTradingEnabled ? 'translate-x-7 text-emerald-600' : 'translate-x-0 text-slate-600'
              }`}
            >
              {autoTradingEnabled ? 'ON' : 'OFF'}
            </div>
          </button>
        </div>
      </div>

      {/* Bot Status Pill Indicator */}
      <div className="p-3 rounded-xl bg-[#060d18] border border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Bot Activity Status</span>
        <span
          className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border ${
            botStatus === 'Emergency Stopped'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
              : botStatus === 'Paused'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : cooldownRemainingSec > 0
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : autoTradingEnabled
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${autoTradingEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          {cooldownRemainingSec > 0 ? `Cooldown (${cooldownRemainingSec}s)` : botStatus}
        </span>
      </div>

      {/* Last Signal Explanation Display Box */}
      <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Last Bot Signal Evaluation</span>
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${
              signal === 'BUY'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : signal === 'SELL'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            SIGNAL: {signal}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300 font-mono">
          <p className="leading-snug">
            <strong className="text-slate-400">Reason:</strong> {lastSignal?.reason || 'Market monitoring active. Awaiting strategy setup conditions.'}
          </p>

          {lastSignal?.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400">
              <div>RSI: <strong className="text-white">{lastSignal.metrics.rsi}</strong></div>
              <div>Trend: <strong className="text-white">{lastSignal.metrics.trend}</strong></div>
              <div>EMA 12/26: <strong className="text-white">{lastSignal.metrics.ema12 > lastSignal.metrics.ema26 ? 'Bullish' : 'Bearish'}</strong></div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
            <span className="text-slate-400">Model Strategy Confidence Score:</span>
            <span className="font-bold text-amber-300">{confidence}%</span>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            * Note: Confidence scores represent statistical strategy model fit and do NOT guarantee profit.
          </p>
        </div>
      </div>
    </div>
  );
};
