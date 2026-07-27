import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ArrowDownUp, ChevronDown, ArrowRightLeft } from 'lucide-react';

export const OperationSwapTool = () => {
  const { wallet, executeOrder, marketData } = useCrypto();
  const [tab, setTab] = useState('Buy');
  const [payCoin, setPayCoin] = useState('USD');
  const [getCoin, setGetCoin] = useState('ETH');
  const [payAmount, setPayAmount] = useState('1000');
  const [showCoinDropdown, setShowCoinDropdown] = useState(false);

  const ethCoin = marketData.find(c => c.symbol === 'ETHUSDT') || { basePrice: 3540.20 };
  const btcCoin = marketData.find(c => c.symbol === 'BTCUSDT') || { basePrice: 67840.50 };
  const solCoin = marketData.find(c => c.symbol === 'SOLUSDT') || { basePrice: 184.75 };

  const targetPrice = getCoin === 'BTC' ? btcCoin.basePrice : getCoin === 'SOL' ? solCoin.basePrice : ethCoin.basePrice;
  const estimatedGet = (parseFloat(payAmount || 0) / targetPrice).toFixed(4);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;

    const symbol = getCoin === 'USD' ? 'ETHUSDT' : `${getCoin}USDT`;
    executeOrder(tab === 'Sell' ? 'SELL' : 'BUY', symbol, 'Binance', parseFloat(estimatedGet));
  };

  const handleSwapPairs = () => {
    const temp = payCoin;
    setPayCoin(getCoin);
    setGetCoin(temp);
  };

  return (
    <div className="chainblock-card space-y-4 font-sans relative">
      
      {/* Header & Baseline Alignment */}
      <div className="card-header-baseline">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-extrabold text-white font-mono tracking-tight">MANUAL BUY & SELL TERMINAL</h3>
        </div>

        <div className="flex items-center space-x-1 bg-[#0b1120] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['Buy', 'Sell', 'Exchange'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg transition font-semibold ${
                tab === t
                  ? 'bg-slate-800 text-teal-400 font-bold shadow-md border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* YOU PAY INPUT CONTAINER */}
      <div className="bg-[#0b1120] p-4 rounded-xl border border-slate-800 space-y-1.5">
        <div className="text-[11px] text-slate-400 font-mono">You Pay (USD)</div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-white font-semibold">
            <span className="w-4 h-4 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center text-[10px] font-bold">$</span>
            <span>{payCoin}</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={`$${payAmount}`}
              onChange={(e) => setPayAmount(e.target.value.replace('$', ''))}
              className="bg-transparent text-right text-sm font-bold font-mono text-white outline-none w-28"
            />
            <button
              onClick={() => setPayAmount(wallet.virtualBalance.toFixed(2))}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-400 border border-teal-500/40"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* SWAP ARROWS BUTTON */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleSwapPairs}
          className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-teal-400 shadow-lg hover:rotate-180 transition-transform duration-300"
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {/* YOU GET INPUT CONTAINER */}
      <div className="bg-[#0b1120] p-4 rounded-xl border border-slate-800 space-y-1.5 relative">
        <div className="text-[11px] text-slate-400 font-mono">You Receive Asset</div>
        
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCoinDropdown(!showCoinDropdown)}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white font-semibold transition"
            >
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                {getCoin.charAt(0)}
              </span>
              <span>{getCoin}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showCoinDropdown && (
              <div className="absolute top-10 left-0 z-50 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl w-32 font-mono text-xs space-y-1">
                {['ETH', 'BTC', 'SOL'].map((coin) => (
                  <button
                    key={coin}
                    type="button"
                    onClick={() => { setGetCoin(coin); setShowCoinDropdown(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                      getCoin === coin ? 'bg-teal-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-sm font-bold font-mono text-teal-400">
            {estimatedGet}
          </span>
        </div>
      </div>

      {/* Dynamic Rate */}
      <div className="text-center text-[11px] font-mono text-slate-400 pt-1">
        1 {getCoin} = ${targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full chainblock-btn-emerald"
      >
        {tab === 'Sell' ? `SELL ${getCoin} NOW` : `BUY ${getCoin} NOW`}
      </button>

    </div>
  );
};
