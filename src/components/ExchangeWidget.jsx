import React, { useState, useEffect, memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Maximize2, ArrowDownUp, ChevronDown, Check, Sparkles } from 'lucide-react';

const COIN_PRICES = {
  USDT: 1.0,
  USDC: 1.0,
  BTC: 67840.50,
  ETH: 3540.20,
  SOL: 184.75,
  AVAX: 38.60
};

export const ExchangeWidget = memo(() => {
  const { wallet, executeOrder, openModal, marketData } = useCrypto();
  
  const [tab, setTab] = useState('Buy'); // 'Buy' | 'Sell' | 'Swap'
  const [spendCoin, setSpendCoin] = useState('USDT');
  const [receiveCoin, setReceiveCoin] = useState('ETH');
  const [spendAmount, setSpendAmount] = useState('1000');
  const [percentage, setPercentage] = useState(25);
  
  // Dropdown open states
  const [showSpendDropdown, setShowSpendDropdown] = useState(false);
  const [showReceiveDropdown, setShowReceiveDropdown] = useState(false);

  // Get dynamic prices from live market stream if available
  const getPrice = (sym) => {
    if (sym === 'USDT' || sym === 'USDC') return 1.0;
    const match = marketData.find(c => c.symbol.startsWith(sym));
    return match ? match.basePrice : (COIN_PRICES[sym] || 100);
  };

  const spendPrice = getPrice(spendCoin);
  const receivePrice = getPrice(receiveCoin);

  // Exchange rate ratio
  const exchangeRate = spendPrice / receivePrice;
  const estimatedReceive = (parseFloat(spendAmount || 0) * exchangeRate).toFixed(4);

  // Update spend amount when slider changes
  const handleSliderChange = (e) => {
    const pct = parseInt(e.target.value);
    setPercentage(pct);
    const maxBalance = spendCoin === 'USDT' || spendCoin === 'USDC' ? wallet.virtualBalance : 2.5;
    const calc = (maxBalance * (pct / 100)).toFixed(2);
    setSpendAmount(calc);
  };

  // Swap spend and receive currencies
  const swapCurrencies = () => {
    const temp = spendCoin;
    setSpendCoin(receiveCoin);
    setReceiveCoin(temp);
  };

  // Execute Swap/Buy/Sell Trade
  const handleTradeExecution = (e) => {
    e.preventDefault();
    const amount = parseFloat(spendAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid spend amount');
      return;
    }

    const symbol = spendCoin === 'USDT' || spendCoin === 'USDC' ? `${receiveCoin}USDT` : `${spendCoin}USDT`;
    const side = tab === 'Sell' ? 'SELL' : 'BUY';
    const orderQty = spendCoin === 'USDT' || spendCoin === 'USDC' ? parseFloat(estimatedReceive) : amount;

    const success = executeOrder(side, symbol, 'Binance', orderQty);
    if (success) {
      setSpendAmount('500');
    }
  };

  return (
    <div className="bg-[#0c101c] p-5 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden font-sans will-change-transform">
      
      {/* Fee Discount Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 px-3.5 py-2 rounded-xl border border-rose-500/30 flex items-center justify-between text-xs font-mono mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span className="text-rose-200 font-semibold">Get 2.5% off fees for next</span>
        </div>
        <span className="text-rose-300 font-bold">16:09:46</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-100">Exchange</h3>
          <p className="text-xs text-slate-400">Advanced trading tool</p>
        </div>
        <button
          onClick={() => openModal('DEPOSIT')}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          title="Fullscreen / Options"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-[#060810] p-1 rounded-xl border border-slate-800/80 mb-4 font-semibold text-xs">
        {['Buy', 'Sell', 'Swap'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-1.5 rounded-lg transition ${
              tab === t
                ? 'bg-slate-800 text-white font-bold shadow-md'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Wallet Balance Info */}
      <div className="flex items-center justify-between mb-2 px-1 text-xs font-mono">
        <span className="text-slate-400">Wallet balance</span>
        <span className="text-cyan-400 font-bold">${wallet.virtualBalance.toLocaleString()} USDT</span>
      </div>

      {/* SPEND INPUT CONTAINER */}
      <div className="bg-[#060810] p-3.5 rounded-xl border border-slate-800/80 mb-2 space-y-1 relative">
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>Spend</span>
          <button onClick={() => setSpendAmount(wallet.virtualBalance.toFixed(2))} className="text-cyan-400 hover:underline">
            Max
          </button>
        </div>

        <div className="flex items-center justify-between">
          <input
            type="number"
            value={spendAmount}
            onChange={(e) => setSpendAmount(e.target.value)}
            className="bg-transparent text-lg font-bold font-mono text-white outline-none w-3/5"
            placeholder="0.00"
          />

          {/* Spend Currency Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowSpendDropdown(!showSpendDropdown); setShowReceiveDropdown(false); }}
              className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs text-white font-semibold cursor-pointer hover:border-slate-700"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-black">
                {spendCoin.slice(0, 1)}
              </span>
              <span>{spendCoin}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showSpendDropdown && (
              <div className="absolute right-0 top-9 z-30 bg-[#0c101c] border border-slate-700 rounded-xl shadow-2xl p-1.5 w-32 font-mono text-xs space-y-1">
                {['USDT', 'USDC', 'BTC', 'ETH', 'SOL'].map((coin) => (
                  <button
                    key={coin}
                    onClick={() => { setSpendCoin(coin); setShowSpendDropdown(false); }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
                  >
                    <span>{coin}</span>
                    {spendCoin === coin && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SWAP CENTER ICON BUTTON */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={swapCurrencies}
          className="w-8 h-8 rounded-full bg-[#121829] border border-slate-700 flex items-center justify-center text-cyan-400 shadow-lg hover:rotate-180 transition-transform duration-300"
          title="Swap Currencies"
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {/* RECEIVE INPUT CONTAINER */}
      <div className="bg-[#060810] p-3.5 rounded-xl border border-slate-800/80 mb-3 space-y-1 relative">
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>Receive</span>
          <span>Estimated</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold font-mono text-cyan-400">
            {estimatedReceive}
          </span>

          {/* Receive Currency Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowReceiveDropdown(!showReceiveDropdown); setShowSpendDropdown(false); }}
              className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs text-white font-semibold cursor-pointer hover:border-slate-700"
            >
              <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                {receiveCoin.slice(0, 1)}
              </span>
              <span>{receiveCoin}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showReceiveDropdown && (
              <div className="absolute right-0 top-9 z-30 bg-[#0c101c] border border-slate-700 rounded-xl shadow-2xl p-1.5 w-32 font-mono text-xs space-y-1">
                {['ETH', 'BTC', 'SOL', 'AVAX', 'USDT'].map((coin) => (
                  <button
                    key={coin}
                    onClick={() => { setReceiveCoin(coin); setShowReceiveDropdown(false); }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200"
                  >
                    <span>{coin}</span>
                    {receiveCoin === coin && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exchange Rate & Percentage Slider */}
      <div className="space-y-3 font-mono text-xs mb-4">
        <div className="flex justify-between items-center text-slate-500 text-[11px]">
          <span>Rate: 1 {spendCoin} = {exchangeRate.toFixed(6)} {receiveCoin}</span>
          <span className="text-cyan-400 font-bold">{percentage}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={percentage}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Gas Fee Info */}
      <div className="flex items-center justify-between text-xs font-mono pt-2.5 border-t border-slate-800/80 mb-4">
        <span className="text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span> Est. Gas fee
        </span>
        <span className="text-white font-semibold">$2.50 USD</span>
      </div>

      {/* Submit Action Button */}
      <button
        onClick={handleTradeExecution}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs tracking-wider shadow-lg border border-cyan-400 flex items-center justify-center space-x-2 transition uppercase"
      >
        <span>{tab} {receiveCoin} Now</span>
        <span>›</span>
      </button>

    </div>
  );
});
