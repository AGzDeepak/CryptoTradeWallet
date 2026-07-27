import React, { useState, memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Cpu, ToggleLeft, ToggleRight, Sparkles, Sliders, Flame, Zap } from 'lucide-react';

export const AiStrategyPanel = memo(() => {
  const { openModal, triggerManualPulse, stimulationMode } = useCrypto();
  const [strategies, setStrategies] = useState([
    {
      id: 'stimulation_engine',
      name: 'Orderbook Yield Stimulation Engine',
      desc: 'Injects stochastic liquidity pulses and depth pressure to stimulate high-yield Buy & Sell execution pathways across exchange orderbooks.',
      status: true,
      profitability: '+24.6% MoM',
      risk: 'OPTIMIZED',
      winRate: '99.4%',
      activeTrades: 5
    },
    {
      id: 'cross_exchange',
      name: 'Cross Exchange Arbitrage',
      desc: 'Scans orderbooks across Binance, Bybit, OKX & Coinbase to execute instant low-latency spatial price discrepancy trades.',
      status: true,
      profitability: '+18.4% MoM',
      risk: 'LOW (0.02%)',
      winRate: '98.4%',
      activeTrades: 3
    },
    {
      id: 'triangular',
      name: 'Triangular Arbitrage',
      desc: 'Executes 3-leg cyclic conversion trades within single exchange liquidity pools.',
      status: true,
      profitability: '+12.8% MoM',
      risk: 'VERY LOW',
      winRate: '99.1%',
      activeTrades: 1
    }
  ]);

  const toggleStrategy = (id) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, status: !s.status } : s));
  };

  return (
    <div className="chainblock-card space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-extrabold text-white">AI BOT STRATEGIES & STIMULATION ENGINE</h3>
        </div>
        <span className="text-[10px] font-mono text-[#34d399] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> 3 MODELS ACTIVE
        </span>
      </div>

      <div className="space-y-3">
        {strategies.map((strat) => (
          <div
            key={strat.id}
            className={`p-3.5 rounded-xl border space-y-3 transition ${
              strat.id === 'stimulation_engine'
                ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/80'
                : 'bg-[#11141b] border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <h4 className="font-extrabold text-xs text-white truncate">{strat.name}</h4>
                {strat.id === 'stimulation_engine' && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-mono font-bold flex items-center gap-0.5 shrink-0">
                    <Zap className="w-2.5 h-2.5 fill-black" /> STIMULATION
                  </span>
                )}
              </div>
              <button onClick={() => toggleStrategy(strat.id)} className="text-[#34d399] shrink-0">
                {strat.status ? <ToggleRight className="w-6 h-6 text-[#34d399]" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">{strat.desc}</p>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#161a23] font-mono text-[10px]">
              <div>
                <span className="text-slate-500 block uppercase text-[9px]">Win Rate</span>
                <span className="text-cyan-400 font-bold">{strat.winRate}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[9px]">Yield Profitability</span>
                <span className="text-[#34d399] font-bold">{strat.profitability}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 font-mono">
              {strat.id === 'stimulation_engine' ? (
                <button
                  onClick={triggerManualPulse}
                  className="flex-1 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[11px] font-extrabold hover:brightness-110 shadow-md flex items-center justify-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5 fill-black" />
                  <span>FIRE STIMULATION PULSE</span>
                </button>
              ) : (
                <button
                  onClick={() => toggleStrategy(strat.id)}
                  className={`flex-1 h-8 rounded-lg text-[11px] font-bold transition border ${
                    strat.status
                      ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-800'
                      : 'bg-emerald-950/60 hover:bg-emerald-900 text-[#34d399] border-emerald-800'
                  }`}
                >
                  {strat.status ? 'Disable' : 'Enable'}
                </button>
              )}

              <button
                onClick={() => openModal('CONFIG_STRATEGY', strat)}
                className="h-8 px-3 rounded-lg bg-[#161a23] hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-700 flex items-center gap-1 shrink-0"
              >
                <Sliders className="w-3 h-3" />
                <span>Config</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
