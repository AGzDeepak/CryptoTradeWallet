import React from 'react';
import { AlertTriangle, Flame } from 'lucide-react';

export const MainnetSwitchModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0d1523] border border-rose-900/40 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Switch to Ethereum Mainnet?</h3>
            <p className="text-xs text-rose-400 font-bold">Real Funds Warning</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 space-y-2">
          <p className="leading-relaxed font-bold">
            Mainnet trading uses REAL cryptocurrency and incurs REAL blockchain gas fees.
          </p>
          <p className="text-[11px] text-slate-300">
            Please double-check your Max Trade Amount, Stop Loss, and Max Daily Loss settings before enabling live executions.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Stay on Testnet
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4" /> Switch to Mainnet
          </button>
        </div>
      </div>
    </div>
  );
};
