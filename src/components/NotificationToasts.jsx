import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';

export const NotificationToasts = () => {
  const { notifications, removeNotification } = useCrypto();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 space-y-2.5 max-w-sm w-full pointer-events-none font-sans">
      {notifications.slice(0, 4).map((notif) => (
        <div
          key={notif.id}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 animate-slide-in transition-all duration-300 font-mono text-xs ${
            notif.type === 'success'
              ? 'bg-[#0a1f18]/95 text-emerald-300 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : notif.type === 'warning'
              ? 'bg-[#261c0a]/95 text-amber-300 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : notif.type === 'danger'
              ? 'bg-[#260a10]/95 text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              : 'bg-[#0f172a]/95 text-cyan-300 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
          }`}
        >
          <div className="flex items-start space-x-2.5">
            <div className="mt-0.5 shrink-0">
              {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {notif.type === 'danger' && <AlertOctagon className="w-4 h-4 text-rose-400" />}
              {notif.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[10px] uppercase tracking-wider opacity-80">
                  {notif.type}
                </span>
                <span className="text-[9px] opacity-60">• {notif.time}</span>
              </div>
              <p className="font-sans text-xs font-semibold leading-snug mt-0.5 text-white">
                {notif.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => removeNotification(notif.id)}
            className="text-slate-400 hover:text-white shrink-0 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
