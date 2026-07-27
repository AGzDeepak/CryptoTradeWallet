import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Wallet, RefreshCw, ShoppingBag, ArrowUpRight, PlusCircle, Bot, ShieldCheck, Zap, TrendingUp, DollarSign } from 'lucide-react';

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
    <div className="chainblock-card p-6 sm:p-8 space-y-8 font-sans">
      
      {/* 1. Header Bar with Clear Title and Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#facc15] text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.35)] shrink-0">
            <Wallet className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-extrabold text-white font-mono tracking-tight">MOCK PAPER TRADING TERMINAL</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-[#facc15] border border-[#facc15]/40">
                SANDBOX MODE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Simulated order execution deck — Zero real money at risk.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => openModal('DEPOSIT')}
            className="px-4 py-2.5 rounded-xl bg-[#facc15] text-slate-950 text-xs font-mono font-extrabold hover:brightness-110 shadow-md flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>DEPOSIT</span>
          </button>

          <button
            onClick={() => openModal('WITHDRAW')}
            className="px-4 py-2.5 rounded-xl bg-[#14161d] border border-slate-700 text-rose-300 text-xs font-mono font-bold hover:border-rose-500 transition flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
            <span>WITHDRAW</span>
          </button>
          
          <button
            onClick={resetWallet}
            className="px-4 py-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-slate-300 text-xs font-mono font-bold hover:text-[#facc15] hover:border-[#facc15] transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-[#facc15]" />
            <span>RESET ($100K)</span>
          </button>
        </div>
      </div>

      {/* 2. Four Spacious Metric Key Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        
        <div className="p-5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Available Paper Cash</span>
          <span className="text-2xl font-extrabold text-white block">
            ${(wallet.virtualBalance || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block font-semibold">USDT Available</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Total Account Equity</span>
          <span className="text-2xl font-extrabold text-[#2dd4bf] block">
            ${(wallet.totalEquity || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2dd4bf] block font-semibold">Cash + Active Orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0c10] border border-[#facc15]/30 space-y-2">
          <span className="text-xs text-[#facc15] uppercase tracking-wider block font-semibold flex items-center gap-1">
            <Bot className="w-3.5 h-3.5" /> Bot Cum. Profit
          </span>
          <span className="text-2xl font-extrabold text-[#facc15] block">
            +${(totalBotProfit || 1248.50).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-amber-400 block font-semibold">AI Autopilot Yield</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Mock Executions</span>
          <span className="text-2xl font-extrabold text-purple-400 block">
            {openPositions.length} Open / {tradeHistory.length} Settled
          </span>
          <span className="text-[10px] text-purple-400 block font-semibold font-mono">Live Sandbox Feed</span>
        </div>

      </div>

      {/* 3. Order Execution Form Deck */}
      <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-6 font-mono text-xs">
        
        {/* Order Direction Switcher (BUY vs SELL) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#facc15]" />
            <h4 className="text-sm font-extrabold text-white uppercase font-sans tracking-tight">
              MANUAL ORDER EXECUTION FORM
            </h4>
          </div>

          <div className="flex space-x-2 bg-[#14161d] p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`px-5 py-2 rounded-lg font-extrabold transition text-xs ${
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
              className={`px-5 py-2 rounded-lg font-extrabold transition text-xs ${
                side === 'SELL'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL (SHORT)
            </button>
          </div>
        </div>

        {/* Input Controls Form */}
        <form onSubmit={handleManualExecute} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="space-y-2">
              <label className="text-slate-400 block font-bold text-xs">Crypto Pair</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                <option value="BTCUSDT">BTC/USDT ($67,840.50)</option>
                <option value="ETHUSDT">ETH/USDT ($3,540.20)</option>
                <option value="SOLUSDT">SOL/USDT ($184.75)</option>
                <option value="AVAXUSDT">AVAX/USDT ($38.60)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 block font-bold text-xs">Target Exchange Gateway</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                <option value="Binance Pro">Binance Pro</option>
                <option value="Bybit Quant">Bybit Quant</option>
                <option value="OKX Institutional">OKX Institutional</option>
                <option value="Coinbase Pro">Coinbase Pro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 block font-bold text-xs">Order Quantity</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#facc15]"
              />
            </div>

          </div>

          {/* Quick Position Size Percentage Buttons */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#14161d] border border-slate-800">
            <span className="text-slate-400 font-bold">Quick Size Percentage:</span>
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
                  className="px-3.5 py-1.5 rounded-lg bg-[#0b0c10] hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold text-xs transition"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Execute Submit Button */}
          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-extrabold font-sans text-sm tracking-wider uppercase transition shadow-xl ${
              side === 'BUY'
                ? 'bg-[#2dd4bf] text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(45,212,191,0.3)]'
                : 'bg-rose-500 text-white hover:brightness-110 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
            }`}
          >
            EXECUTE MOCK {side} ORDER FOR {symbol}
          </button>

        </form>

      </div>

    </div>
  );
};
