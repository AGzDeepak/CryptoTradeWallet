import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Wallet, RefreshCw, ShoppingBag, ArrowUpRight, PlusCircle, Bot } from 'lucide-react';

export const PaperTradingPanel = () => {
  const { 
    wallet, 
    resetWallet, 
    openPositions, 
    tradeHistory, 
    executeOrder, 
    openModal, 
    totalBotProfit,
    marketData 
  } = useCrypto();

  const [side, setSide] = useState('BUY');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [exchange, setExchange] = useState('Binance Pro');
  const [amount, setAmount] = useState('0.5');

  const selectedCoin = marketData.find(c => c.symbol === symbol) || marketData[0] || { basePrice: 67840.50 };

  const handleManualExecute = (e) => {
    e.preventDefault();
    executeOrder(side, symbol, exchange, parseFloat(amount));
  };

  const handleQuickPercent = (pct) => {
    const maxQty = ((wallet.virtualBalance || 100000) * pct) / (selectedCoin.basePrice || 67840.50);
    setAmount(maxQty.toFixed(3));
  };

  return (
    <div className="chainblock-card p-5 sm:p-7 space-y-6 font-sans">
      
      {/* 1. Header Bar: Responsive Stack on Mobile, Aligned Row on Desktop */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#facc15] text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-white font-mono tracking-tight">MOCK PAPER TRADING TERMINAL</h3>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-[#facc15] border border-[#facc15]/40">
              SANDBOX
            </span>
          </div>
        </div>

        {/* Action Buttons: Responsive Wrap */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs w-full lg:w-auto">
          <button
            onClick={() => openModal('DEPOSIT')}
            className="flex-1 lg:flex-none h-9 px-3.5 rounded-xl bg-[#facc15] text-slate-950 font-extrabold transition hover:brightness-110 shadow-md flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => openModal('WITHDRAW')}
            className="flex-1 lg:flex-none h-9 px-3.5 rounded-xl bg-[#14161d] border border-slate-700 text-rose-300 font-bold hover:border-rose-500 transition flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>Withdraw</span>
          </button>
          
          <button
            onClick={resetWallet}
            className="flex-1 lg:flex-none h-9 px-3.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-slate-300 font-bold hover:text-[#facc15] hover:border-[#facc15] transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-[#facc15]" />
            <span>Reset ($100k)</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive KPI Cards Grid: 1 Col on Mobile, 2 Cols on Tablet, 4 Cols on Large Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        
        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1.5 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Available Paper Cash</span>
          <span className="text-xl font-extrabold text-white block tracking-tight">
            ${(wallet.virtualBalance || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block">USDT Available</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1.5 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Account Equity</span>
          <span className="text-xl font-extrabold text-[#2dd4bf] block tracking-tight">
            ${(wallet.totalEquity || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2dd4bf]/80 block">Cash + Active Orders</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#facc15]/40 space-y-1.5 shadow-sm">
          <span className="text-[10px] text-[#facc15] uppercase tracking-wider block font-semibold flex items-center gap-1">
            <Bot className="w-3.5 h-3.5 text-[#facc15]" /> Bot Cum. Profit
          </span>
          <span className="text-xl font-extrabold text-[#facc15] block tracking-tight">
            +${(totalBotProfit || 1248.50).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-amber-400/80 block">AI Autopilot Yield</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1.5 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Mock Executions</span>
          <span className="text-xl font-extrabold text-purple-400 block tracking-tight">
            {openPositions.length} Open / {tradeHistory.length} Settled
          </span>
          <span className="text-[10px] text-purple-400/80 block">Live Sandbox Feed</span>
        </div>

      </div>

      {/* 3. Order Execution Form Deck */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-5 font-mono text-xs">
        
        {/* Form Header with Side Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h4 className="text-xs font-mono uppercase text-[#facc15] font-bold flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" /> EXECUTE MOCK PAPER ORDER
          </h4>

          <div className="flex space-x-1 bg-[#14161d] p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-extrabold transition ${
                side === 'BUY'
                  ? 'bg-[#2dd4bf] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              BUY (LONG)
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-extrabold transition ${
                side === 'SELL'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL (SHORT)
            </button>
          </div>
        </div>

        {/* Inputs Grid: Stack on Mobile, 3 Cols on Tablet/Desktop */}
        <form onSubmit={handleManualExecute} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 block mb-1.5 text-[11px] font-bold">Crypto Pair</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="AVAXUSDT">AVAX/USDT</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 text-[11px] font-bold">Target Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                <option value="Binance Pro">Binance Pro</option>
                <option value="Bybit Quant">Bybit Quant</option>
                <option value="OKX Institutional">OKX Institutional</option>
                <option value="Coinbase Pro">Coinbase Pro</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 text-[11px] font-bold">Order Quantity</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              />
            </div>
          </div>

          {/* Quick Size Percentage Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#14161d] border border-slate-800">
            <span className="text-slate-400 font-bold text-[11px]">Quick Size Percentage:</span>
            <div className="grid grid-cols-4 gap-2 w-full sm:w-auto">
              {[
                { label: '25%', pct: 0.25 },
                { label: '50%', pct: 0.50 },
                { label: '75%', pct: 0.75 },
                { label: '100% (MAX)', pct: 1.0 }
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => handleQuickPercent(btn.pct)}
                  className="h-8 px-3 rounded-lg bg-[#0b0c10] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] transition text-center"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            className={`w-full h-12 rounded-xl font-extrabold font-sans text-xs sm:text-sm tracking-wider uppercase transition shadow-lg ${
              side === 'BUY'
                ? 'bg-[#2dd4bf] text-slate-950 hover:brightness-110'
                : 'bg-rose-500 text-white hover:brightness-110'
            }`}
          >
            EXECUTE MOCK {side} ORDER FOR {symbol}
          </button>

        </form>

      </div>

    </div>
  );
};
