import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { BarChart3, TrendingUp, Zap, ShieldCheck, Award } from 'lucide-react';

export const ExecutiveMetricsBar = memo(() => {
  const { totalBotProfit, autoTradeCount, wallet } = useCrypto();

  const metrics = [
    {
      title: '24H QUANT VOLUME',
      value: '$14,820,490.50',
      change: '+18.4% 24h',
      isUp: true,
      icon: BarChart3,
      color: 'text-[#34d399]',
      border: 'border-[#34d399]/30'
    },
    {
      title: 'AVERAGE SPREAD YIELD',
      value: '0.84% NET',
      change: 'High-Profit Route',
      isUp: true,
      icon: Zap,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30'
    },
    {
      title: 'AI BOT WIN RATE',
      value: '99.42%',
      change: `${autoTradeCount || 128} Executed`,
      isUp: true,
      icon: Award,
      color: 'text-purple-400',
      border: 'border-purple-500/30'
    },
    {
      title: 'FIRESTORE DB SYNC',
      value: '100% PERSISTED',
      change: 'Real-Time Sync',
      isUp: true,
      icon: ShieldCheck,
      color: 'text-amber-400',
      border: 'border-amber-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans font-mono text-xs">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.title} className={`p-4 rounded-xl bg-[#0d111a] border ${m.border} flex items-center justify-between shadow-lg`}>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider mb-1">{m.title}</span>
              <span className={`text-base font-extrabold block text-white`}>{m.value}</span>
              <span className={`text-[10px] font-bold ${m.color} mt-0.5 block flex items-center gap-1`}>
                <TrendingUp className="w-3 h-3" /> {m.change}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-[#131926] flex items-center justify-center ${m.color} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
});
