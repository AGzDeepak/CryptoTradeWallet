import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Wallet, RefreshCw, ShoppingBag, ShieldAlert, ArrowDownCircle, PlusCircle, CheckCircle2 } from 'lucide-react';

export const PaperTradingPanel = () => {
  const { wallet, resetWallet, openPositions, tradeHistory, executeOrder, openModal } = useCrypto();

  const [side, setSide] = useState('BUY'); // 'BUY' or 'SELL'
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [exchange, setExchange] = useState('Binance');
  const [amount, setAmount] = useState('0.5');

  const handleManualExecute = (e) => {
    e.preventDefault();
    executeOrder(side, symbol, exchange, parseFloat(amount));
  };

  return (
    <div className="woofi-card space-y-6 font-sans">
      
      {/* Wallet Metric Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-extrabold text-white">MOCK PAPER TRADING TERMINAL</h3>
          </div>
          <span className="text-xs text-rose-400 font-mono flex items-center gap-1 mt-1">
            <ShieldAlert className="w-3.5 h-3.5" /> SANDBOX MODE — ZERO REAL MONEY AT RISK
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => openModal('DEPOSIT')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-xs font-bold transition hover:brightness-110 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Deposit Funds</span>
          </button>
          
          <button
            onClick={resetWallet}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset ($100k)</span>
          </button>
        </div>
      </div>

      {/* Wallet Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="woofi-subcard">
          <span className="text-xs text-slate-400 font-mono uppercase block mb-1">Available Cash</span>
          <span className="text-xl font-extrabold font-mono text-white">
            ${wallet.virtualBalance.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">USDT Available</span>
        </div>

        <div className="woofi-subcard">
          <span className="text-xs text-slate-400 font-mono uppercase block mb-1">Total Net Equity</span>
          <span className="text-xl font-extrabold font-mono text-cyan-400">
            ${wallet.totalEquity.toLocaleString()}
          </span>
          <span className="text-[10px] text-cyan-500/80 font-mono block mt-1">Cash + Active Orders</span>
        </div>

        <div className="woofi-subcard">
          <span className="text-xs text-slate-400 font-mono uppercase block mb-1">Today's Profit</span>
          <span className="text-xl font-extrabold font-mono text-emerald-400">
            +${wallet.todayProfit.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-500/80 font-mono block mt-1">ROI: +{wallet.roiPct}%</span>
        </div>

        <div className="woofi-subcard">
          <span className="text-xs text-slate-400 font-mono uppercase block mb-1">Open / Settled</span>
          <span className="text-xl font-extrabold font-mono text-purple-400">
            {openPositions.length} / {tradeHistory.length}
          </span>
          <span className="text-[10px] text-purple-400/80 font-mono block mt-1">Mock Executions</span>
        </div>
      </div>

      {/* Manual Buy / Sell Order Terminal Form */}
      <div className="bg-[#090b10] p-4 rounded-xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" /> Execute Manual Order (Buy / Sell)
          </h4>

          {/* Side Switch Pills */}
          <div className="flex space-x-1 bg-[#141824] p-1 rounded-full border border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`px-3 py-1 rounded-full font-bold transition ${
                side === 'BUY' ? 'bg-emerald-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`px-3 py-1 rounded-full font-bold transition ${
                side === 'SELL' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        <form onSubmit={handleManualExecute} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Crypto Ticker</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-[#141824] border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="SOLUSDT">SOL/USDT</option>
              <option value="AVAXUSDT">AVAX/USDT</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Target Exchange</label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full bg-[#141824] border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="Binance">Binance</option>
              <option value="Bybit">Bybit</option>
              <option value="OKX">OKX</option>
              <option value="Coinbase">Coinbase</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Amount</label>
            <input
              type="number"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#141824] border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <button
            type="submit"
            className={`w-full h-9 rounded-xl font-bold font-sans text-xs transition border ${
              side === 'BUY'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black border-cyan-400 hover:brightness-110 shadow-lg'
                : 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-500 hover:brightness-110 shadow-lg'
            }`}
          >
            EXECUTE {side} ORDER
          </button>
        </form>
      </div>

    </div>
  );
};
