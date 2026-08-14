import React from 'react';
import { Sliders, CheckCircle2, Shield, Flame, Target, Cpu } from 'lucide-react';

const MODES = [
  { id: 'Conservative', name: 'Conservative', desc: 'RSI < 35, TP 3%, SL 1.5%', icon: Shield, color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' },
  { id: 'Balanced', name: 'Balanced', desc: 'EMA Cross + RSI 40-60, TP 4%, SL 2%', icon: Target, color: 'border-violet-500/40 text-violet-300 bg-violet-500/10' },
  { id: 'Aggressive', name: 'Aggressive', desc: 'Fast Momentum, TP 6%, SL 3%', icon: Flame, color: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
  { id: 'Custom', name: 'Custom', desc: 'User-configured custom risk rules', icon: Cpu, color: 'border-slate-700 text-slate-300 bg-slate-800/40' },
];

export const StrategyPanel = ({ config, onChangeConfig }) => {

  const handleSelectMode = (modeId) => {
    let modeDefaults = {};
    if (modeId === 'Conservative') {
      modeDefaults = { takeProfitPct: 3.0, stopLossPct: 1.5, maxTradeAmount: 250, cooldownSeconds: 45 };
    } else if (modeId === 'Balanced') {
      modeDefaults = { takeProfitPct: 4.0, stopLossPct: 2.0, maxTradeAmount: 500, cooldownSeconds: 30 };
    } else if (modeId === 'Aggressive') {
      modeDefaults = { takeProfitPct: 6.0, stopLossPct: 3.0, maxTradeAmount: 1000, cooldownSeconds: 15 };
    }
    onChangeConfig({ ...config, strategyMode: modeId, ...modeDefaults });
  };

  return (
    <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Strategy Configuration</h3>
            <p className="text-[11px] text-slate-400">Trading parameters & risk preset selector</p>
          </div>
        </div>
      </div>

      {/* Preset Strategy Modes */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 block">Strategy Preset Mode</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = config.strategyMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMode(m.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? `${m.color} ring-1 ring-violet-500/50 shadow-sm`
                    : 'bg-[#060d18] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{m.name}</span>
                </div>
                <p className="text-[10px] opacity-70 leading-tight">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {/* Trading Pair */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Trading Pair</label>
          <select
            value={config.pair}
            onChange={(e) => onChangeConfig({ ...config, pair: e.target.value })}
            className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-500"
          >
            <option value="ETH/USDT">ETH/USDT (Ethereum)</option>
            <option value="BTC/USDT">BTC/USDT (Bitcoin)</option>
            <option value="SOL/USDT">SOL/USDT (Solana)</option>
            <option value="AVAX/USDT">AVAX/USDT (Avalanche)</option>
          </select>
        </div>

        {/* Max Trade Amount */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Max Trade Amount ($)</label>
          <input
            type="number"
            value={config.maxTradeAmount}
            onChange={(e) => onChangeConfig({ ...config, maxTradeAmount: parseFloat(e.target.value) || 0 })}
            className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-500 font-mono"
          />
        </div>

        {/* Min Trade Amount */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Min Trade Amount ($)</label>
          <input
            type="number"
            value={config.minTradeAmount}
            onChange={(e) => onChangeConfig({ ...config, minTradeAmount: parseFloat(e.target.value) || 0 })}
            className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-violet-500 font-mono"
          />
        </div>

        {/* Take Profit % */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Take-Profit (%)</label>
          <input
            type="number"
            step="0.5"
            value={config.takeProfitPct}
            onChange={(e) => onChangeConfig({ ...config, takeProfitPct: parseFloat(e.target.value) || 0 })}
            className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Stop Loss % */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Stop-Loss (%)</label>
          <input
            type="number"
            step="0.5"
            value={config.stopLossPct}
            onChange={(e) => onChangeConfig({ ...config, stopLossPct: parseFloat(e.target.value) || 0 })}
            className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 outline-none focus:border-rose-500 font-mono"
          />
        </div>

        {/* Max Daily Loss */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Max Daily Loss ($)</label>
          <input
            type="number"
            value={config.maxDailyLoss}
            onChange={(e) => onChangeConfig({ ...config, maxDailyLoss: parseFloat(e.target.value) || 0 })}
            className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-rose-300 outline-none focus:border-rose-500 font-mono"
          />
        </div>

        {/* Cooldown Seconds */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Cooldown Between Trades (s)</label>
          <input
            type="number"
            value={config.cooldownSeconds}
            onChange={(e) => onChangeConfig({ ...config, cooldownSeconds: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-violet-500 font-mono"
          />
        </div>

        {/* Slippage Tolerance % */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Slippage Tolerance (%)</label>
          <input
            type="number"
            step="0.1"
            value={config.slippageTolerancePct}
            onChange={(e) => onChangeConfig({ ...config, slippageTolerancePct: parseFloat(e.target.value) || 0 })}
            className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 outline-none focus:border-amber-500 font-mono"
          />
        </div>

        {/* Gas Limit Protection */}
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Max Trades / Day</label>
          <input
            type="number"
            value={config.maxTradesPerDay}
            onChange={(e) => onChangeConfig({ ...config, maxTradesPerDay: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-violet-500 font-mono"
          />
        </div>
      </div>

      {/* Rules Explanation Box */}
      <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80 text-xs space-y-1.5 font-mono text-slate-400">
        <div className="flex items-center justify-between text-slate-300 font-bold">
          <span>STRATEGY RULE CONDITIONS ({config.strategyMode})</span>
          <span className="text-violet-400">AUTO-CHECKED</span>
        </div>
        <p className="text-[11px]">
          • <strong className="text-emerald-400">BUY Condition:</strong> EMA 12 {'>'} EMA 26 & RSI between 40–65 when flat.
        </p>
        <p className="text-[11px]">
          • <strong className="text-rose-400">SELL Condition:</strong> P/L {'>='} +{config.takeProfitPct}% OR P/L {'<='} -{config.stopLossPct}%.
        </p>
        <p className="text-[11px]">
          • <strong className="text-slate-400">HOLD Condition:</strong> When position is within risk bounds or indicators neutral.
        </p>
      </div>
    </div>
  );
};
