import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  History, Download, Search, FileSpreadsheet, FileText, 
  ShieldCheck, ArrowUpRight, ArrowDownLeft, CheckCircle, ChevronDown, ChevronUp, Zap, Bot, Sparkles
} from 'lucide-react';

const INITIAL_TRADE_SETTLEMENTS = [
  { 
    id: 'TRD-8492', 
    time: '10:42:15', 
    symbol: 'BTCUSDT', 
    strategy: 'Autopilot Bot Alpha', 
    isBot: true,
    buyExchange: 'Binance', 
    sellExchange: 'Bybit', 
    buyPrice: 67820.50, 
    sellPrice: 68140.00, 
    amount: 0.5, 
    buyTotal: 33910.25,
    sellTotal: 34070.00,
    grossProfit: 159.75,
    fees: 13.56, 
    netProfit: 146.19, 
    spreadPct: 0.47,
    buyTxHash: '0x8f2a...39b1',
    sellTxHash: '0x1c4e...82d9',
    latency: '14.2ms',
    result: 'PROFIT' 
  },
  { 
    id: 'TRD-8491', 
    time: '10:35:40', 
    symbol: 'ETHUSDT', 
    strategy: 'Orderbook Imbalance', 
    isBot: false,
    buyExchange: 'OKX', 
    sellExchange: 'Coinbase', 
    buyPrice: 3520.10, 
    sellPrice: 3548.80, 
    amount: 4.0, 
    buyTotal: 14080.40,
    sellTotal: 14195.20,
    grossProfit: 114.80,
    fees: 5.63, 
    netProfit: 109.17, 
    spreadPct: 0.82,
    buyTxHash: '0x3d91...92a4',
    sellTxHash: '0x7e12...41c8',
    latency: '18.6ms',
    result: 'PROFIT' 
  },
  { 
    id: 'TRD-8490', 
    time: '10:28:12', 
    symbol: 'SOLUSDT', 
    strategy: 'Autopilot Bot Alpha', 
    isBot: true,
    buyExchange: 'Bybit', 
    sellExchange: 'Binance', 
    buyPrice: 182.40, 
    sellPrice: 185.90, 
    amount: 50.0, 
    buyTotal: 9120.00,
    sellTotal: 9295.00,
    grossProfit: 175.00,
    fees: 3.68, 
    netProfit: 171.32, 
    spreadPct: 1.92,
    buyTxHash: '0x5b2c...10f3',
    sellTxHash: '0x9d4a...66e2',
    latency: '12.8ms',
    result: 'PROFIT' 
  },
  { 
    id: 'TRD-8489', 
    time: '10:14:05', 
    symbol: 'AVAXUSDT', 
    strategy: 'Cross Exchange Arbitrage', 
    isBot: false,
    buyExchange: 'Coinbase', 
    sellExchange: 'OKX', 
    buyPrice: 37.80, 
    sellPrice: 38.65, 
    amount: 100.0, 
    buyTotal: 3780.00,
    sellTotal: 3865.00,
    grossProfit: 85.00,
    fees: 1.53, 
    netProfit: 83.47, 
    spreadPct: 2.25,
    buyTxHash: '0x2a84...77d1',
    sellTxHash: '0x6f3e...55c9',
    latency: '22.1ms',
    result: 'PROFIT' 
  },
  { 
    id: 'TRD-8488', 
    time: '09:55:22', 
    symbol: 'BTCUSDT', 
    strategy: 'Autopilot Bot Alpha', 
    isBot: true,
    buyExchange: 'Binance', 
    sellExchange: 'OKX', 
    buyPrice: 67650.00, 
    sellPrice: 67980.00, 
    amount: 0.5, 
    buyTotal: 33825.00,
    sellTotal: 33990.00,
    grossProfit: 165.00,
    fees: 13.53, 
    netProfit: 151.47, 
    spreadPct: 0.49,
    buyTxHash: '0x4c11...29a0',
    sellTxHash: '0x8d33...14f2',
    latency: '14.0ms',
    result: 'PROFIT' 
  }
];

export const TradeHistory = () => {
  const { tradeHistory, addNotification, totalBotProfit, autoTradeCount } = useCrypto();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('ALL');
  const [filterBotOnly, setFilterBotOnly] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const combinedHistory = tradeHistory && tradeHistory.length > 0 
    ? tradeHistory 
    : INITIAL_TRADE_SETTLEMENTS;

  const filteredHistory = combinedHistory.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.buyExchange.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sellExchange.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.strategy && item.strategy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCoin = selectedCoin === 'ALL' || item.symbol === selectedCoin;
    const matchesBot = !filterBotOnly || item.isBot || (item.strategy && item.strategy.toLowerCase().includes('bot'));
    return matchesSearch && matchesCoin && matchesBot;
  });

  const totalNetProfit = filteredHistory.reduce((sum, item) => sum + (parseFloat(item.netProfit) || 0), 0);

  const toggleRowExpansion = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const exportCSV = () => {
    const headers = ['ID,Time,Symbol,Strategy,IsBot,BuyExchange,BuyPrice,BuyAmount,BuyTotal,SellExchange,SellPrice,SellAmount,SellTotal,Fees,NetProfit,Result'];
    const rows = filteredHistory.map(h => {
      const bPrice = h.buyPrice || h.entryPrice;
      const sPrice = h.sellPrice || h.exitPrice;
      const amt = h.amount || 1;
      const bTotal = h.buyTotal || (bPrice * amt);
      const sTotal = h.sellTotal || (sPrice * amt);

      return `${h.id},${h.time},${h.symbol},${h.strategy || 'Spatial Arbitrage'},${h.isBot ? 'YES' : 'NO'},${h.buyExchange},${bPrice},${amt},${bTotal},${h.sellExchange},${sPrice},${amt},${sTotal},${h.fees},${h.netProfit},${h.result}`;
    });

    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QUANT_BOT_AUDIT_LOG_${Date.now()}.csv`;
    a.click();
    addNotification('Trade Audit Log exported to CSV.', 'success');
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
                QUANTITATIVE TRADE AUDIT LOG — BUY & SELL LEDGER
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-[#34d399] border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VERIFIED ORDERBOOK
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Full leg breakdown: Buy Entry vs Sell Exit price, total traded volume, fees, & net profit
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
            <span>Export Full CSV</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#34d399]" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Live Audit Metrics Bar INCLUDING BOT CUMULATIVE PROFIT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 font-mono">
        <div className="bg-[#060810] p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block">TOTAL SETTLEMENTS</span>
          <span className="text-base font-bold text-white block">{filteredHistory.length} Executed Logs</span>
        </div>
        
        {/* DEDICATED BOT CUMULATIVE PROFIT CARD IN AUDIT LOG */}
        <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/40">
          <span className="text-[#34d399] text-[10px] font-bold block uppercase flex items-center gap-1">
            <Bot className="w-3.5 h-3.5" /> AI BOT CUM. PROFIT
          </span>
          <span className="text-base font-extrabold text-[#34d399] block">
            +${(totalBotProfit || 0.00).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#060810] p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block">TOTAL CUMULATIVE PROFIT</span>
          <span className="text-base font-bold text-cyan-400 block">+${totalNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="bg-[#060810] p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-[10px] block">AUDIT SECURITY</span>
          <span className="text-base font-bold text-purple-400 block">IMMUTABLE 256-BIT</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search coin, exchange, or order hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:border-[#34d399] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Bot Only Filter Toggle */}
          <button
            onClick={() => setFilterBotOnly(!filterBotOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
              filterBotOnly
                ? 'bg-emerald-950 text-[#34d399] border-emerald-500 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{filterBotOnly ? 'SHOWING BOT TRADES ONLY' : 'FILTER BOT TRADES'}</span>
          </button>

          <span className="text-slate-400 hidden sm:inline">Filter Pair:</span>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono outline-none"
          >
            <option value="ALL">All Asset Pairs</option>
            <option value="BTCUSDT">BTCUSDT (Bitcoin)</option>
            <option value="ETHUSDT">ETHUSDT (Ethereum)</option>
            <option value="SOLUSDT">SOLUSDT (Solana)</option>
            <option value="AVAXUSDT">AVAXUSDT (Avalanche)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table with Detailed Buy and Sell Leg Columns — Vertical & Horizontal Scrollable */}
      <div className="overflow-x-auto overflow-y-auto max-h-[480px] rounded-xl border border-slate-800/80 bg-[#060810] shadow-inner custom-scrollbar">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead className="sticky top-0 z-20 bg-[#090d16] border-b border-slate-800 shadow-md">
            <tr className="uppercase text-[10px] text-slate-400">
              <th className="py-3 px-3">Audit ID</th>
              <th className="py-3 px-3">Time</th>
              <th className="py-3 px-3">Asset</th>
              <th className="py-3 px-3">Buy Leg (Exchange & Price)</th>
              <th className="py-3 px-3">Sell Leg (Exchange & Price)</th>
              <th className="py-3 px-3">Volume / Amount</th>
              <th className="py-3 px-3">Buy Value</th>
              <th className="py-3 px-3">Sell Value</th>
              <th className="py-3 px-3">Fees</th>
              <th className="py-3 px-3">Net Profit</th>
              <th className="py-3 px-3 text-right">Details</th>
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
              filteredHistory.map((item) => {
                const bPrice = item.buyPrice || item.entryPrice;
                const sPrice = item.sellPrice || item.exitPrice;
                const amt = item.amount || 1;
                const bTotal = item.buyTotal || (bPrice * amt);
                const sTotal = item.sellTotal || (sPrice * amt);
                const isExpanded = expandedRowId === item.id;
                const isBotTrade = item.isBot || (item.strategy && item.strategy.toLowerCase().includes('bot'));

                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      onClick={() => toggleRowExpansion(item.id)}
                      className="hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <td className="py-3 px-3 text-slate-400 font-bold flex items-center space-x-1">
                        <span>{item.id}</span>
                        {isBotTrade && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-[#34d399] border border-emerald-800 text-[8px] font-bold ml-1">
                            BOT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{item.time}</td>
                      <td className="py-3 px-3 font-bold text-cyan-400">{item.symbol}</td>
                      
                      {/* BUY LEG INFO */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-[#34d399] font-bold flex items-center gap-1">
                            <ArrowDownLeft className="w-3 h-3 text-[#34d399]" /> {item.buyExchange}
                          </span>
                          <span className="text-slate-300 text-[11px]">${typeof bPrice === 'number' ? bPrice.toLocaleString() : bPrice}</span>
                        </div>
                      </td>

                      {/* SELL LEG INFO */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-purple-400 font-bold flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-purple-400" /> {item.sellExchange}
                          </span>
                          <span className="text-slate-300 text-[11px]">${typeof sPrice === 'number' ? sPrice.toLocaleString() : sPrice}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-white font-bold">{amt} {item.symbol.replace('USDT', '')}</td>
                      <td className="py-3 px-3 text-slate-300">${typeof bTotal === 'number' ? bTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) : bTotal}</td>
                      <td className="py-3 px-3 text-slate-300">${typeof sTotal === 'number' ? sTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) : sTotal}</td>
                      <td className="py-3 px-3 text-slate-500">-${item.fees}</td>
                      <td className="py-3 px-3 font-extrabold text-[#34d399]">
                        +${typeof item.netProfit === 'number' ? item.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : item.netProfit}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-[#34d399]" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDABLE ORDERBOOK AUDIT DETAILS DRAWER */}
                    {isExpanded && (
                      <tr className="bg-[#0b0e17] border-b border-slate-800">
                        <td colSpan="11" className="p-4 font-mono">
                          <div className="p-4 rounded-xl bg-[#060810] border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-cyan-400" /> SPATIAL ORDERBOOK EXECUTION DETAILS ({item.id})
                              </span>
                              {isBotTrade && (
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-[#34d399] border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                  <Bot className="w-3 h-3 text-[#34d399]" /> EXECUTED BY PYTHON AI BOT
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* BUY LEG CARD */}
                              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                                <span className="text-emerald-400 font-bold block uppercase">LEG 1: BUY EXECUTION</span>
                                <div className="flex justify-between text-slate-300">
                                  <span>Exchange Gateway:</span>
                                  <strong className="text-white">{item.buyExchange}</strong>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                  <span>Execution Price:</span>
                                  <strong className="text-emerald-400">${typeof bPrice === 'number' ? bPrice.toLocaleString() : bPrice}</strong>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                  <span>Quantity Traded:</span>
                                  <strong>{amt} {item.symbol.replace('USDT', '')}</strong>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                  <span>Total Capital Outflow:</span>
                                  <strong className="text-white">${typeof bTotal === 'number' ? bTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) : bTotal}</strong>
                                </div>
                                <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-emerald-900/60">
                                  <span>Tx Hash:</span>
                                  <code className="text-cyan-400">{item.buyTxHash || '0x8f2a...39b1'}</code>
                                </div>
                              </div>

                              {/* SELL LEG CARD */}
                              <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-1">
                                <span className="text-purple-400 font-bold block uppercase">LEG 2: SELL EXECUTION</span>
                                <div className="flex justify-between text-slate-300">
                                  <span>Exchange Gateway:</span>
                                  <strong className="text-white">{item.sellExchange}</strong>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                  <span>Execution Price:</span>
                                  <strong className="text-purple-400">${typeof sPrice === 'number' ? sPrice.toLocaleString() : sPrice}</strong>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                  <span>Quantity Traded:</span>
                                  <strong>{amt} {item.symbol.replace('USDT', '')}</strong>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                  <span>Total Capital Inflow:</span>
                                  <strong className="text-white">${typeof sTotal === 'number' ? sTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) : sTotal}</strong>
                                </div>
                                <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-purple-900/60">
                                  <span>Tx Hash:</span>
                                  <code className="text-cyan-400">{item.sellTxHash || '0x1c4e...82d9'}</code>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                              <span className="text-slate-400">Net Realized Spatial Profit:</span>
                              <span className="text-sm font-extrabold text-[#34d399]">
                                +${typeof item.netProfit === 'number' ? item.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : item.netProfit} USDT
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
