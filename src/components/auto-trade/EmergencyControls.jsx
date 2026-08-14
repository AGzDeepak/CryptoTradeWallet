import React from 'react';
import { Pause, Square, Octagon, AlertOctagon, XCircle } from 'lucide-react';

export const EmergencyControls = ({
  onPauseBot,
  onStopAutoTrading,
  onClosePosition,
  onEmergencyStop,
  isPaused,
  hasActivePosition,
}) => {
  return (
    <div className="rounded-2xl bg-[#0d1523] border border-rose-900/30 p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Emergency Controls & Safety Interlocks</h3>
            <p className="text-[11px] text-slate-400">Instant trade cancellation & safety shutdown</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* PAUSE BOT */}
        <button
          type="button"
          onClick={onPauseBot}
          className={`py-3 px-3 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border ${
            isPaused
              ? 'bg-amber-500/30 text-amber-200 border-amber-500/50 shadow-sm'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
          }`}
        >
          <Pause className="w-3.5 h-3.5" />
          <span>{isPaused ? 'RESUME BOT' : 'PAUSE BOT'}</span>
        </button>

        {/* STOP AUTO TRADING */}
        <button
          type="button"
          onClick={onStopAutoTrading}
          className="py-3 px-3 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
        >
          <Square className="w-3.5 h-3.5" />
          <span>STOP AUTO TRADING</span>
        </button>

        {/* CLOSE POSITION */}
        <button
          type="button"
          onClick={onClosePosition}
          disabled={!hasActivePosition}
          className={`py-3 px-3 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border ${
            hasActivePosition
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
              : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>CLOSE POSITION</span>
        </button>

        {/* EMERGENCY STOP */}
        <button
          type="button"
          onClick={onEmergencyStop}
          className="py-3 px-3 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-600/20"
        >
          <Octagon className="w-3.5 h-3.5 fill-current" />
          <span>EMERGENCY STOP</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-500 text-center italic">
        * Emergency stop immediately prevents all new automated trade submissions and halts the strategy engine loop.
      </p>
    </div>
  );
};
