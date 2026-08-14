import React from 'react';
import { ClipboardList, ExternalLink, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const TradeActivityTable = ({ activityLogs = [] }) => {
  return (
    <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Trading Activity & Immutable Audit Log</h3>
            <p className="text-[11px] text-slate-400">Real-time trade decisions & block explorer links</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
          {activityLogs.length} LOGS
        </span>
      </div>

      {/* Minimalist Activity Log Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[360px] rounded-xl border border-slate-800/80 bg-[#060d18] custom-scrollbar">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0b1320] text-slate-400 text-[11px] uppercase sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Side</th>
              <th className="py-2.5 px-3">Pair</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Price</th>
              <th className="py-2.5 px-3">Gas</th>
              <th className="py-2.5 px-3">Slippage</th>
              <th className="py-2.5 px-3">P/L</th>
              <th className="py-2.5 px-3">Tx Hash</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {activityLogs.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-8 text-center text-slate-500 font-mono">
                  No automated trading activity logged yet. Enable Auto Trading to start scanning.
                </td>
              </tr>
            ) : (
              activityLogs.map((log, idx) => {
                const isBuy = log.side === 'BUY';
                const isSell = log.side === 'SELL';
                const isBlocked = log.side === 'BLOCKED';
                const isHold = log.side === 'HOLD';

                return (
                  <tr key={log.id || idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBuy
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isSell
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isBlocked
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {log.side}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">{log.pair}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{log.amount ? `${log.amount} ETH` : '-'}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">${fmt(log.price, 2)}</td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">${fmt(log.gasCostUsd, 2)}</td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.slippagePct ? `${log.slippagePct}%` : '0.1%'}</td>
                    <td className={`py-2.5 px-3 font-bold whitespace-nowrap ${(log.pnlUsd || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {log.pnlUsd != null ? `${log.pnlUsd >= 0 ? '+' : ''}$${fmt(log.pnlUsd)}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                      {log.txHash ? (
                        <a
                          href={log.explorerUrl || `https://sepolia.etherscan.io/tx/${log.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-400 hover:text-violet-300 flex items-center gap-1 transition"
                        >
                          <span>{log.txHash.substring(0, 10)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          log.status === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.status === 'Blocked'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {log.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
