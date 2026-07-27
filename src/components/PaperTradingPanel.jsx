import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Wallet, RefreshCw, ShoppingBag, ShieldAlert, ArrowUpRight, PlusCircle, Bot, TrendingUp, Sliders, Play, XCircle } from 'lucide-react';

export const PaperTradingPanel = () => {
  const { 
    wallet, 
    resetWallet, 
    openPositions, 
    closePosition,
    tradeHistory, 
    executeOrder, 
    openModal, 
    totalBotProfit,
    marketData 
  } = useCrypto();

  const [side, setSide] = useState('BUY'); // 'BUY' or 'SELL'
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [exchange, setExchange] = useState('Binance');
  const [amount, setAmount] = useState('0.5');
  const [orderType, setOrderType] = useState('MARKET');

  const selectedCoin = marketData.find(c => c.symbol === symbol) || marketData[0] || { basePrice: 67840.50 };

  const handleManualExecute = (e) => {
    e.preventDefault();
    executeOrder(side, symbol, exchange, parseFloat(amount));
  };

  const handleQuickPercent = (pct) => {
    const maxQty = (wallet.virtualBalance * pct) / selectedCoin.basePrice;
    setAmount(maxQty.toFixed(3));
  };

  return (
    <div className="chainblock-card space-y-6 font-sans">
      
      {/* Wallet Metric Header */}
      <div className="card-header-baseline">
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-[#facc15]" />
          <div>
            <h3 className="text-base font-extrabold text-white font-mono tracking-tight">MOCK PAPER TRADING TERMINAL</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => openModal('DEPOSIT')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#facc15] text-slate-950 text-xs font-bold transition hover:brightness-110 shadow-md font-mono"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => openModal('WITHDRAW')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#14161d] border border-slate-700 text-rose-300 text-xs font-mono font-semibold transition hover:border-rose-500"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Withdraw</span>
          </button>
          
          <button
            onClick={resetWallet}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#facc15]" />
            <span>Reset ($100k)</span>
          </button>
        </div>
      </div>

      {/* Wallet Metrics Grid with Bot Cumulative Profit */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="chainblock-subcard">
          <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Available Paper Cash</span>
          <span className="text-xl font-extrabold font-mono text-white">
            ${(wallet.virtualBalance || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">USDT Available</span>
        </div>

        <div className="chainblock-subcard">
          <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Total Account Equity</span>
          <span className="text-xl font-extrabold font-mono text-teal-400">
            ${(wallet.totalEquity || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-teal-500/80 font-mono block mt-1">Cash + Active Orders</span>
        </div>

        <div className="chainblock-subcard border-[#facc15]/40 bg-amber-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#facc15] font-mono font-bold uppercase flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> Bot Cum. Profit
            </span>
          </div>
          <span className="text-xl font-extrabold font-mono text-[#facc15]">
            +${(totalBotProfit || 1248.50).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-amber-400/80 font-mono block mt-1">AI Autopilot Yield</span>
        </div>

        <div className="chainblock-subcard">
          <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Open / Settled</span>
          <span className="text-xl font-extrabold font-mono text-purple-400">
            {openPositions.length} / {tradeHistory.length}
          </span>
          <span className="text-[10px] text-purple-400/80 font-mono block mt-1">Mock Executions</span>
        </div>
      </div>

      {/* Manual Buy / Sell Order Terminal Form */}
      <div className="bg-[#0b0c10] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h4 className="text-xs font-mono uppercase text-[#facc15] font-bold flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" /> EXECUTE MOCK PAPER ORDER
          </h4>

          {/* Side Switch Pills */}
          <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`px-4 py-1 rounded-lg font-extrabold transition ${
                side === 'BUY' ? 'bg-[#2dd4bf] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              BUY (LONG)
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`px-4 py-1 rounded-lg font-extrabold transition ${
                side === 'SELL' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL (SHORT)
            </button>
          </div>
        </div>

        <form onSubmit={handleManualExecute} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Crypto Pair</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-[#facc15]"
              >
                <option value="BTCUSDT">BTC/USDT ($67,840.50)</option>
                <option value="ETHUSDT">ETH/USDT ($3,540.20)</option>
                <option value="SOLUSDT">SOL/USDT ($184.75)</option>
                <option value="AVAXUSDT">AVAX/USDT ($38.60)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Target Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-[#facc15]"
              >
                <option value="Binance">Binance</option>
                <option value="Bybit">Bybit</option>
                <option value="OKX">OKX</option>
                <option value="Coinbase">Coinbase</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Order Quantity</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-[#facc15]"
              />
            </div>
          </div>

          {/* Position Percentage Quick Sliders */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">Quick Size:</span>
            <div className="flex space-x-2">
              {[0.25, 0.50, 0.75, 1.0].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickPercent(pct)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold"
                >
                  {pct * 100}%
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-extrabold font-sans text-xs transition shadow-lg ${
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
