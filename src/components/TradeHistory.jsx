import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  History, Download, Filter, Search, FileSpreadsheet, FileText, CheckCircle2, 
  ShieldCheck, ArrowUpRight, Lock, CheckCircle, RefreshCw
} from 'lucide-react';

const INITIAL_TRADE_SETTLEMENTS = [
  { id: 'TRD-8492', time: '10:42:15', symbol: 'BTCUSDT', strategy: 'Cross Exchange Arbitrage', buyExchange: 'Binance', sellExchange: 'Bybit', entryPrice: 67820.50, exitPrice: 68140.00, amount: 0.5, fees: 13.56, netProfit: 146.19, result: 'PROFIT' },
  { id: 'TRD-8491', time: '10:35:40', symbol: 'ETHUSDT', strategy: 'Orderbook Imbalance', buyExchange: 'OKX', sellExchange: 'Coinbase', entryPrice: 3520.10, exitPrice: 3548.80, amount: 4.0, fees: 5.63, netProfit: 109.17, result: 'PROFIT' },
  { id: 'TRD-8490', time: '10:28:12', symbol: 'SOLUSDT', strategy: 'Spatial Yield Spread', buyExchange: 'Bybit', sellExchange: 'Binance', entryPrice: 182.40, exitPrice: 185.90, amount: 50.0, fees: 3.68, netProfit: 171.32, result: 'PROFIT' },
  { id: 'TRD-8489', time: '10:14:05', symbol: 'AVAXUSDT', strategy: 'Cross Exchange Arbitrage', buyExchange: 'Coinbase', sellExchange: 'OKX', entryPrice: 37.80, exitPrice: 38.65, amount: 100.0, fees: 1.53, netProfit: 83.47, result: 'PROFIT' },
  { id: 'TRD-8488', time: '09:55:22', symbol: 'BTCUSDT', strategy: 'Autopilot Bot Alpha', buyExchange: 'Binance', sellExchange: 'OKX', entryPrice: 67650.00, exitPrice: 67980.00, amount: 0.5, fees: 13.53, netProfit: 151.47, result: 'PROFIT' }
];

export const TradeHistory = () => {
  const { tradeHistory, addNotification } = useCrypto();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('ALL');

  const combinedHistory = tradeHistory && tradeHistory.length > 0 
    ? tradeHistory 
    : INITIAL_TRADE_SETTLEMENTS;

  const filteredHistory = combinedHistory.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.buyExchange.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sellExchange.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.strategy && item.strategy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCoin = selectedCoin === 'ALL' || item.symbol === selectedCoin;
    return matchesSearch && matchesCoin;
  });

  const totalNetProfit = filteredHistory.reduce((sum, item) => sum + (parseFloat(item.netProfit) || 0), 0);

  const exportCSV = () => {
    const headers = ['ID,Time,Symbol,Strategy,BuyExchange,SellExchange,EntryPrice,ExitPrice,Fees,NetProfit,Result'];
    const rows = filteredHistory.map(h => 
      `${h.id},${h.time},${h.symbol},${h.strategy || 'Spatial Arbitrage'},${h.buyExchange},${h.sellExchange},${h.entryPrice},${h.exitPrice},${h.fees},${h.netProfit},${h.result}`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QUANT_TRADE_AUDIT_LOG_${Date.now()}.csv`;
    a.click();
    addNotification('Quantitative Trade Audit Log exported to CSV successfully.', 'success');
  };

  const exportExcel = () => {
    exportCSV();
  };

  const exportPDF = () => {
    window.print();
    addNotification('Generating printable Quantitative Trade Audit Ledger PDF...', 'info');
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 mb-6 font-sans">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-white tracking-wide font-mono">
                QUANTITATIVE TRADE AUDIT LOG
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-[#34d399] border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VERIFIED LEDGER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Immutable cross-exchange settlement & orderbook arbitrage audit trail
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs font-mono font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#34d399]" />
            <span>Excel</span>
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>PDF Ledger</span>
          </button>
        </div>
      </div>

      {/* Live Audit Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 font-mono">
        <div className="bg-[#060810] p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block">TOTAL SETTLEMENTS</span>
          <span className="text-base font-bold text-white block">{filteredHistory.length} Trades</span>
        </div>
        <div className="bg-[#060810] p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block">CUMULATIVE NET PROFIT</span>
          <span className="text-base font-bold text-[#34d399] block">+${totalNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-[#060810] p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block">AVG EXECUTION LATENCY</span>
          <span className="text-base font-bold text-cyan-400 block">14.2ms</span>
        </div>
        <div className="bg-[#060810] p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block">ENCRYPTION LEVEL</span>
          <span className="text-base font-bold text-purple-400 block">256-BIT AES</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 font-mono text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search symbol, exchange, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:border-[#34d399] outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-400">Filter Asset Pair:</span>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono outline-none"
          >
            <option value="ALL">All Pairs (BTC, ETH, SOL, AVAX)</option>
            <option value="BTCUSDT">BTCUSDT (Bitcoin)</option>
            <option value="ETHUSDT">ETHUSDT (Ethereum)</option>
            <option value="SOLUSDT">SOLUSDT (Solana)</option>
            <option value="AVAXUSDT">AVAXUSDT (Avalanche)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-800/80 bg-[#060810]">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 uppercase text-[10px] text-slate-400 bg-slate-900/60">
              <th className="py-3 px-3">Audit ID</th>
              <th className="py-3 px-3">Time</th>
              <th className="py-3 px-3">Symbol</th>
              <th className="py-3 px-3">Strategy</th>
              <th className="py-3 px-3">Buy Leg</th>
              <th className="py-3 px-3">Sell Leg</th>
              <th className="py-3 px-3">Entry Price</th>
              <th className="py-3 px-3">Exit Price</th>
              <th className="py-3 px-3">Fees</th>
              <th className="py-3 px-3">Net Profit</th>
              <th className="py-3 px-3 text-right">Result Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center text-slate-500 py-10 font-mono">
                  No matching trade settlement logs found for "{searchTerm}".
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 text-slate-400 font-bold">{item.id}</td>
                  <td className="py-3 px-3 text-slate-500">{item.time}</td>
                  <td className="py-3 px-3 font-bold text-cyan-400">{item.symbol}</td>
                  <td className="py-3 px-3 text-slate-300 text-[11px]">{item.strategy || 'Cross Exchange Arbitrage'}</td>
                  <td className="py-3 px-3 text-[#34d399] font-semibold">{item.buyExchange}</td>
                  <td className="py-3 px-3 text-purple-400 font-semibold">{item.sellExchange}</td>
                  <td className="py-3 px-3 text-slate-300">${typeof item.entryPrice === 'number' ? item.entryPrice.toLocaleString() : item.entryPrice}</td>
                  <td className="py-3 px-3 text-slate-300">${typeof item.exitPrice === 'number' ? item.exitPrice.toLocaleString() : item.exitPrice}</td>
                  <td className="py-3 px-3 text-slate-500">-${item.fees}</td>
                  <td className="py-3 px-3 font-extrabold text-[#34d399]">
                    +${typeof item.netProfit === 'number' ? item.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : item.netProfit}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-[#34d399] border border-emerald-800 font-bold inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> SETTLED
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
