import React, { useState, useMemo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Search, ExternalLink, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { getTxExplorerUrl } from '../services/walletService';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const FILTERS = ['All', 'Buy', 'Sell', 'Bot'];

const DEFAULT_TRADES = [
  { id: 'TX-990182', type: 'BUY',  symbol: 'ETH/USDT', exchange: 'Uniswap V3 (Sepolia)', amount: 0.10, price: 3540.20, total: 354.02,   time: '10m ago',  txHash: '0x94826b52a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', category: 'SEPOLIA DEX' },
  { id: 'TX-990181', type: 'BUY',  symbol: 'BTC/USDT', exchange: 'Binance Pro',           amount: 0.05, price: 67840.50, total: 3392.03, time: '25m ago',  txHash: '0xa89f71c49b201d4a8e9f2b1836c0d4e91234567890abcdef1234567890abcdef', category: 'BOT' },
  { id: 'TX-990180', type: 'SELL', symbol: 'ETH/USDT', exchange: 'OKX',                   amount: 0.20, price: 3580.00, total: 716.00,   time: '1h ago',   txHash: '0xb12345678901234567890123456789012345678901234567890123456789012345', category: 'MANUAL' },
  { id: 'TX-990179', type: 'BUY',  symbol: 'SOL/USDT', exchange: 'Bybit',                 amount: 5.00, price: 145.30,  total: 726.50,   time: '2h ago',   txHash: '0xc23456789012345678901234567890123456789012345678901234567890123456', category: 'BOT' },
  { id: 'TX-990178', type: 'SELL', symbol: 'BTC/USDT', exchange: 'Coinbase',              amount: 0.02, price: 68200.00, total: 1364.00, time: '3h ago',   txHash: '0xd34567890123456789012345678901234567890123456789012345678901234567', category: 'MANUAL' },
];

export const TradeHistorySection = () => {
  const { tradeHistory, autoTradeLogs } = useCrypto();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');

  const masterHistory = useMemo(() => {
    const manual = (tradeHistory || []).map(t => {
      const detectedType = (t.type || t.side || t.action || (t.settleReason || t.exitPrice || t.profit != null ? 'SELL' : 'BUY')).toUpperCase();
      return {
        id:       t.id || `TX-${Math.floor(100000 + Math.random() * 900000)}`,
        type:     detectedType,
        symbol:   (t.symbol || 'BTCUSDT').replace('USDT', '/USDT'),
        exchange: t.exchange || t.sellExchange || t.buyExchange || 'Binance Pro',
        amount:   t.amount || 0.1,
        price:    t.price || t.exitPrice || t.entryPrice || 67840.50,
        total:    t.total || t.invested || (t.amount * t.price) || 6784.05,
        time:     t.time   || 'Just now',
        txHash:   t.txHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        category: t.category || (t.strategy?.includes('Bot') || t.settleReason ? 'BOT' : 'MANUAL'),
      };
    });
    return manual.length >= 1 ? manual : DEFAULT_TRADES;
  }, [tradeHistory]);


  const filtered = useMemo(() =>
    masterHistory.filter(t => {
      const matchSearch = !search ||
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.exchange.toLowerCase().includes(search.toLowerCase()) ||
        t.txHash.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'All'  ? true :
        filter === 'Buy'  ? t.type === 'BUY' :
        filter === 'Sell' ? t.type === 'SELL' :
        filter === 'Bot'  ? t.category === 'BOT' : true;
      return matchSearch && matchFilter;
    }), [masterHistory, search, filter]);

  /* summary stats */
  const totalBuys  = masterHistory.filter(t => t.type === 'BUY').length;
  const totalSells = masterHistory.filter(t => t.type === 'SELL').length;
  const totalVol   = masterHistory.reduce((s, t) => s + (t.total || 0), 0);

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">History</h1>
        <p className="text-sm text-slate-400 mt-0.5">Complete record of all trade executions</p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Trades',  value: masterHistory.length, color: 'text-white' },
          { label: 'Buy Orders',    value: totalBuys,            color: 'text-emerald-400' },
          { label: 'Sell Orders',   value: totalSells,           color: 'text-rose-400' },
          { label: 'Total Volume',  value: `$${fmt(totalVol)}`,  color: 'text-violet-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-[#0d1523] border border-slate-800/70 px-5 py-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol, exchange…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-slate-500 font-medium border-b border-slate-800/70">
                <th className="px-5 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Pair</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Exchange</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition group">
                  <td className="px-5 py-3.5 text-xs text-slate-400">{item.time}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-white">{item.symbol}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.type === 'BUY'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-300">{item.exchange}</td>
                  <td className="px-4 py-3.5 text-xs text-right text-slate-200">{item.amount}</td>
                  <td className="px-4 py-3.5 text-xs text-right text-slate-200">${fmt(item.price)}</td>
                  <td className="px-4 py-3.5 text-xs text-right font-semibold text-emerald-400">${fmt(item.total)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <a
                      href={getTxExplorerUrl(item.txHash, 'sepolia')}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-800/70 flex items-center justify-between">
          <span className="text-xs text-slate-500">{filtered.length} records</span>
          <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

    </div>
  );
};
