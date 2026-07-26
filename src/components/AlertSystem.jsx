import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Bell, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AlertSystem = () => {
  const { alerts, setAlerts, notifications } = useCrypto();
  const [target, setTarget] = useState('0.45');
  const [type, setType] = useState('SPREAD');

  const addAlert = (e) => {
    e.preventDefault();
    const newAlert = {
      id: Date.now(),
      type,
      condition: type === 'SPREAD' ? `Spread > ${target}%` : `Net Profit > $${target}`,
      target: parseFloat(target),
      active: true
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 mb-6">
      
      {/* Toast Notifications Display Area */}
      {notifications.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm">
          {notifications.map((n) => (
            <div key={n.id} className="glass-panel-glow p-3.5 rounded-xl border border-cyan-500/50 shadow-2xl flex items-center justify-between space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-cyan-400 animate-bounce" />
                <span className="text-slate-100 font-semibold">{n.message}</span>
              </div>
              <span className="text-[10px] text-slate-500">{n.time}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-extrabold text-white">REAL-TIME ALERT RULE ENGINE</h3>
        </div>
        <span className="text-xs font-mono text-cyan-400">
          Audio & Browser Push Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Alert Form */}
        <form onSubmit={addAlert} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Create New Trigger Rule
          </h4>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">Alert Condition Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
            >
              <option value="SPREAD">Spread Exceeds Threshold (%)</option>
              <option value="PROFIT">Net Arbitrage Profit Exceeds ($)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">Target Value</label>
            <input
              type="number"
              step="0.05"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition"
          >
            ADD ALERT RULE
          </button>
        </form>

        {/* Active Alerts List */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">Active Rules ({alerts.length})</h4>
          {alerts.map((al) => (
            <div key={al.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-200 font-semibold">{al.condition}</span>
              </div>
              <button onClick={() => removeAlert(al.id)} className="text-slate-500 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
