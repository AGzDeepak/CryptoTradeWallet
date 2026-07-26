import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';

export const TransactionsWidget = () => {
  const { setActiveTab } = useCrypto();

  const transactions = [
    { coin: 'Bitcoin', date: '2 Oct 2022, 06:23 PM', amount: '+0.0982 BTC', usd: '$480.50', isUp: true },
    { coin: 'Ethereum', date: '1 Oct 2022, 09:23 PM', amount: '-0.0982 ETH', usd: '$183.43', isUp: false },
    { coin: 'Cardano', date: '29 Sept 2022, 12:23 PM', amount: '+1,843 ADA', usd: '$2,000.87', isUp: true },
    { coin: 'Cardano', date: '28 Sept 2022, 01:23 PM', amount: '+1,843 ADA', usd: '$2,000.87', isUp: true }
  ];

  return (
    <div className="chainblock-card space-y-4 font-sans">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <h3 className="text-base font-extrabold text-white">Transactions</h3>
        <button
          onClick={() => setActiveTab('trades')}
          className="text-xs text-slate-400 hover:text-[#34d399] font-mono flex items-center gap-1"
        >
          <span>See All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3 font-mono text-xs">
        {transactions.map((tx, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#11141b] border border-slate-800/80 hover:border-slate-700 transition">
            
            {/* Left: Direction Icon + Coin Name + Date */}
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                tx.isUp
                  ? 'bg-emerald-950/80 text-[#34d399] border border-emerald-800/60'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
              }`}>
                {tx.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>

              <div>
                <span className="font-extrabold text-white text-xs block leading-none">{tx.coin}</span>
                <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">{tx.date}</span>
              </div>
            </div>

            {/* Right: Amount & USD Equivalent */}
            <div className="text-right">
              <span className={`font-extrabold text-xs block ${tx.isUp ? 'text-[#34d399]' : 'text-rose-400'}`}>
                {tx.amount}
              </span>
              <span className="text-[10px] text-slate-500 font-sans block">{tx.usd}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
