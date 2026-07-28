import React, { useState, memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Cpu, ToggleLeft, ToggleRight, Sparkles, Sliders } from 'lucide-react';

export const AiStrategyPanel = memo(() => {
  const { openModal } = useCrypto();
  const [strategies, setStrategies] = useState([
    {
      id: 'cross_exchange',
      name: 'Cross Exchange Spatial Arbitrage',
      desc: 'Scans orderbooks across Binance, Bybit, OKX & Coinbase to execute instant low-latency spatial price discrepancy trades.',
      status: true,
      profitability: '+18.4% MoM',
      risk: 'LOW (0.02%)',
      winRate: '98.4%',
      activeTrades: 3
    },
    {
      id: 'triangular',
      name: 'Triangular Arbitrage Engine',
      desc: 'Executes 3-leg cyclic conversion trades within single exchange liquidity pools.',
      status: true,
      profitability: '+12.8% MoM',
      risk: 'VERY LOW',
      winRate: '99.1%',
      activeTrades: 1
    },
    {
      id: 'statistical_arb',
      name: 'Statistical Mean Reversion',
      desc: 'Monitors co-integrated cryptocurrency pairs to execute delta-neutral spread trades.',
      status: true,
      profitability: '+15.2% MoM',
      risk: 'LOW',
      winRate: '97.8%',
      activeTrades: 2
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
          <h3 className="text-sm font-extrabold text-white font-mono">AI QUANT BOT STRATEGIES</h3>
        </div>
        <span className="text-[10px] font-mono text-[#2dd4bf] flex items-center gap-1 font-bold">
          <Sparkles className="w-3.5 h-3.5" /> 3 MODELS ACTIVE
        </span>
      </div>

      <div className="space-y-3">
        {strategies.map((strat) => (
          <div
            key={strat.id}
            className="p-3.5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-3 transition hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-white truncate font-mono">{strat.name}</h4>
              <button onClick={() => toggleStrategy(strat.id)} className="text-[#2dd4bf] shrink-0">
                {strat.status ? <ToggleRight className="w-6 h-6 text-[#2dd4bf]" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{strat.desc}</p>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#14161d] font-mono text-[10px]">
              <div>
                <span className="text-slate-500 block uppercase text-[9px]">Win Rate</span>
                <span className="text-cyan-400 font-bold">{strat.winRate}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[9px]">Yield Profitability</span>
                <span className="text-[#2dd4bf] font-bold">{strat.profitability}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 font-mono">
              <button
                onClick={() => toggleStrategy(strat.id)}
                className={`flex-1 h-8 rounded-xl text-[11px] font-bold transition border ${
                  strat.status
                    ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-800'
                    : 'bg-emerald-950/60 hover:bg-emerald-900 text-[#2dd4bf] border-emerald-800'
                }`}
              >
                {strat.status ? 'Disable Strategy' : 'Enable Strategy'}
              </button>

              <button
                onClick={() => openModal('CONFIG_STRATEGY', strat)}
                className="h-8 px-3.5 rounded-xl bg-[#14161d] hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-700 flex items-center gap-1 shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Config</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
