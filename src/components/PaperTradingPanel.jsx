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
    <div className="chainblock-card space-y-5 font-sans">
      
      {/* Standardized Header Baseline matching design system */}
      <div className="card-header-baseline pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#facc15] text-slate-950 flex items-center justify-center font-bold shrink-0">
            <Wallet className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-extrabold text-white font-mono tracking-tight">MOCK PAPER TRADING TERMINAL</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-[#facc15] border border-[#facc15]/40">
              SANDBOX
            </span>
          </div>
        </div>

        {/* Action Buttons with Identical Height and Padding */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => openModal('DEPOSIT')}
            className="h-8 px-3 rounded-xl bg-[#facc15] text-slate-950 font-bold transition hover:brightness-110 shadow-md flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => openModal('WITHDRAW')}
            className="h-8 px-3 rounded-xl bg-[#14161d] border border-slate-700 text-rose-300 font-bold hover:border-rose-500 transition flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Withdraw</span>
          </button>
          
          <button
            onClick={resetWallet}
            className="h-8 px-3 rounded-xl bg-[#0b0c10] border border-slate-700 text-slate-300 font-bold hover:text-[#facc15] hover:border-[#facc15] transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#facc15]" />
            <span>Reset ($100k)</span>
          </button>
        </div>
      </div>

      {/* 4 Equal KPI Metric Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#0b0c10] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Available Cash</span>
          <span className="text-lg font-extrabold text-white block">
            ${(wallet.virtualBalance || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block font-normal">USDT Available</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b0c10] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Account Equity</span>
          <span className="text-lg font-extrabold text-[#2dd4bf] block">
            ${(wallet.totalEquity || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2dd4bf]/80 block font-normal">Cash + Active Orders</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b0c10] border border-[#facc15]/30 space-y-1">
          <span className="text-[10px] text-[#facc15] uppercase block font-semibold flex items-center gap-1">
            <Bot className="w-3 h-3" /> Bot Cum. Profit
          </span>
          <span className="text-lg font-extrabold text-[#facc15] block">
            +${(totalBotProfit || 1248.50).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-amber-400/80 block font-normal">AI Autopilot Yield</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0b0c10] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Mock Executions</span>
          <span className="text-lg font-extrabold text-purple-400 block">
            {openPositions.length} Open / {tradeHistory.length} Settled
          </span>
          <span className="text-[10px] text-purple-400/80 block font-normal">Live Sandbox Feed</span>
        </div>
      </div>

      {/* Order Execution Form */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-4 font-mono text-xs">
        
        {/* Form Header with Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h4 className="text-xs font-mono uppercase text-[#facc15] font-bold flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" /> EXECUTE MOCK PAPER ORDER
          </h4>

          <div className="flex space-x-1 bg-[#14161d] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`h-7 px-3 rounded-lg font-extrabold transition ${
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
              className={`h-7 px-3 rounded-lg font-extrabold transition ${
                side === 'SELL'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL (SHORT)
            </button>
          </div>
        </div>

        {/* Standardized Form Inputs */}
        <form onSubmit={handleManualExecute} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Crypto Pair</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full h-10 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                <option value="BTCUSDT">BTC/USDT ($67,840.50)</option>
                <option value="ETHUSDT">ETH/USDT ($3,540.20)</option>
                <option value="SOLUSDT">SOL/USDT ($184.75)</option>
                <option value="AVAXUSDT">AVAX/USDT ($38.60)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Target Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full h-10 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                <option value="Binance Pro">Binance Pro</option>
                <option value="Bybit Quant">Bybit Quant</option>
                <option value="OKX Institutional">OKX Institutional</option>
                <option value="Coinbase Pro">Coinbase Pro</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Order Quantity</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-10 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              />
            </div>
          </div>

          {/* Quick Size Percentage Pills */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#14161d] border border-slate-800">
            <span className="text-slate-400 font-bold text-[11px]">Quick Size Percentage:</span>
            <div className="flex space-x-2">
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
                  className="h-7 px-2.5 rounded-lg bg-[#0b0c10] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] transition"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Execute Submit Button */}
          <button
            type="submit"
            className={`w-full h-11 rounded-xl font-extrabold font-sans text-xs tracking-wider uppercase transition shadow-lg ${
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
