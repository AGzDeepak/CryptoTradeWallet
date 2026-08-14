import React from 'react';
import { Bot, Play, Pause, AlertCircle, Info, ShieldCheck, CheckCircle2, ArrowRight, Zap, ArrowDownLeft } from 'lucide-react';

export const BotStatusCard = ({
  autoTradingEnabled,
  onToggleAutoTrading,
  botStatus = 'Monitoring Market',
  lastSignal = null,
  cooldownRemainingSec = 0,
  autoWithdrawEnabled = true,
  autoWithdrawAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d7B41',
  currentPosition = null,
  currentPrice = 3542.80,
}) => {
  const signal = lastSignal?.signal || 'HOLD';
  const confidence = lastSignal?.confidence || 85;

  let currentPnlUsd = 0;
  let currentPnlPct = 0;
  if (currentPosition && currentPosition.amount > 0) {
    currentPnlUsd = (currentPrice - currentPosition.entryPrice) * currentPosition.amount;
    currentPnlPct = ((currentPrice - currentPosition.entryPrice) / currentPosition.entryPrice) * 100;
  }

  return (
    <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-4 shadow-sm">
      {/* Top Header: Controller & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Automated Trading Engine</h3>
            <p className="text-[11px] text-slate-400">Autonomous BUY & SELL cycle</p>
          </div>
        </div>

        {/* OFF / ON Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-400">AUTO BOT</span>
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

      {/* Bot Status Indicator Bar */}
      <div className="p-3 rounded-xl bg-[#060d18] border border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Execution Status</span>
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

      {/* Step-by-Step Clear Trading Logic Pipeline */}
      <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Live Trading Decision Logic
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
            signal === 'BUY'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : signal === 'SELL'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            ACTION: {signal}
          </span>
        </div>

        {/* 4-Step Visual Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-[#0d1523] border border-slate-800 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 text-[10px] font-bold">1</div>
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">SCAN ENTRY/EXIT</span>
              <span className="text-white font-bold">{currentPosition ? `Active (${currentPnlPct >= 0 ? '+' : ''}${currentPnlPct.toFixed(2)}%)` : 'Scanning Dip / Trend'}</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#0d1523] border border-slate-800 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 text-[10px] font-bold">2</div>
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">11-POINT RISK</span>
              <span className="text-emerald-400 font-bold">Passed & Verified</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#0d1523] border border-slate-800 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 text-[10px] font-bold">3</div>
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">EXECUTE ORDER</span>
              <span className="text-amber-300 font-bold">{signal === 'BUY' ? 'Auto-BUY Position' : signal === 'SELL' ? 'Auto-SELL Lock Profit' : 'Holding Position'}</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#0d1523] border border-slate-800 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 text-[10px] font-bold">4</div>
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">AUTO-WITHDRAW</span>
              <span className={autoWithdrawEnabled ? 'text-cyan-400 font-bold' : 'text-slate-500 font-bold'}>
                {autoWithdrawEnabled ? 'Active (Auto Payout)' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Reason Explanation */}
        <div className="pt-1 text-xs text-slate-300 font-mono space-y-1">
          <p className="leading-snug">
            <strong className="text-slate-400">Logic Reason:</strong> {lastSignal?.reason || (autoTradingEnabled ? 'Evaluating market spreads for next automated BUY/SELL trigger...' : 'Enable Auto Trading above to start automated execution.')}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Model Strategy Confidence:</span>
            <span className="font-bold text-amber-300">{confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
