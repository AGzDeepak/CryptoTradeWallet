import React, { memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Server, ShieldCheck } from 'lucide-react';

export const ExchangeStatus = memo(() => {
  const { exchangeHealth } = useCrypto();

  const exchanges = [
    { name: 'Binance', logo: 'BNB', logoBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', ...exchangeHealth.Binance },
    { name: 'Bybit', logo: 'BYB', logoBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40', ...exchangeHealth.Bybit },
    { name: 'OKX', logo: 'OKX', logoBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40', ...exchangeHealth.OKX },
    { name: 'Coinbase', logo: 'CB', logoBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40', ...exchangeHealth.Coinbase }
  ];

  return (
    <div className="chainblock-card space-y-3 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-[#34d399] shrink-0" />
          <h3 className="text-sm font-extrabold text-white tracking-tight">EXCHANGE API INFRASTRUCTURE</h3>
        </div>
        <span className="text-[10px] font-mono text-[#34d399] flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" /> LIVE
        </span>
      </div>

      {/* Stacked Full-Width Exchange Row Cards (No Squeezing) */}
      <div className="space-y-2 font-mono text-xs">
        {exchanges.map((ex) => (
          <div
            key={ex.name}
            className="p-3 rounded-xl bg-[#11141b] border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
          >
            {/* Left: Logo + Name + Status */}
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono font-bold text-xs ${ex.logoBg}`}>
                {ex.logo}
              </div>
              <div>
                <h4 className="font-bold text-xs text-white leading-none">{ex.name}</h4>
                <span className="text-[9px] text-[#34d399] flex items-center gap-1 mt-1 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-ping"></span> ONLINE • {ex.uptime || '99.99%'}
                </span>
              </div>
            </div>

            {/* Right: Latency & Rate Limit */}
            <div className="text-right">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-[#34d399] border border-emerald-800 block mb-0.5">
                {ex.ping || '14ms'}
              </span>
              <span className="text-[9px] text-slate-500 block">12% Used</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
