import React from 'react';
import { Bot, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AutoTradeEnableModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1523] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Enable Automatic Trading?</h3>
            <p className="text-xs text-slate-400">Confirm execution interlocks</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800 text-xs text-slate-300 space-y-2">
          <p className="leading-relaxed">
            The trading engine will continuously evaluate live market conditions and may prepare trades according to your configured strategy and risk limits.
          </p>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>11-Point Risk Manager Active & Guarding Capital</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-400/20 transition flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" /> Enable Auto Trading
          </button>
        </div>
      </div>
    </div>
  );
};
