import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { History, Download, Filter, Search, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';

export const TradeHistory = () => {
  const { tradeHistory } = useCrypto();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('ALL');

  const filteredHistory = tradeHistory.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.buyExchange.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sellExchange.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCoin = selectedCoin === 'ALL' || item.symbol === selectedCoin;
    return matchesSearch && matchesCoin;
  });

  const exportCSV = () => {
    const headers = ['Time,Symbol,Strategy,BuyExchange,SellExchange,EntryPrice,ExitPrice,Fees,NetProfit,Result'];
    const rows = filteredHistory.map(h => 
      `${h.time},${h.symbol},${h.strategy},${h.buyExchange},${h.sellExchange},${h.entryPrice},${h.exitPrice},${h.fees},${h.netProfit},${h.result}`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto_arbitrage_trade_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 mb-6">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-extrabold text-white">QUANTITATIVE TRADE AUDIT LOG</h3>
            <span className="text-xs text-slate-400 font-mono">Immutable trade settlement ledger</span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => alert('Exporting Excel Audit File...')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => alert('Generating PDF Quantitative Report...')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 font-mono text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search coin or exchange..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-400">Filter Coin:</span>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
          >
            <option value="ALL">All Pairs</option>
            <option value="BTCUSDT">BTCUSDT</option>
            <option value="ETHUSDT">ETHUSDT</option>
            <option value="SOLUSDT">SOLUSDT</option>
            <option value="AVAXUSDT">AVAXUSDT</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 uppercase text-[11px] text-slate-400">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Strategy</th>
              <th className="py-2.5 px-3">Leg 1 (Buy)</th>
              <th className="py-2.5 px-3">Leg 2 (Sell)</th>
              <th className="py-2.5 px-3">Entry Price</th>
              <th className="py-2.5 px-3">Exit Price</th>
              <th className="py-2.5 px-3">Fees</th>
              <th className="py-2.5 px-3">Net Profit</th>
              <th className="py-2.5 px-3 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredHistory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-3 text-slate-500">{item.time}</td>
                <td className="py-3 px-3 font-bold text-cyan-400">{item.symbol}</td>
                <td className="py-3 px-3 text-slate-400 text-[11px]">{item.strategy}</td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">{item.buyExchange}</td>
                <td className="py-3 px-3 text-purple-400 font-semibold">{item.sellExchange}</td>
                <td className="py-3 px-3 text-slate-300">${item.entryPrice}</td>
                <td className="py-3 px-3 text-slate-300">${item.exitPrice}</td>
                <td className="py-3 px-3 text-slate-500">-${item.fees}</td>
                <td className="py-3 px-3 font-extrabold text-emerald-400">+${item.netProfit}</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    PROFIT
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
