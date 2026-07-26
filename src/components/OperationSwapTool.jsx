import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { ArrowDownUp, ChevronDown } from 'lucide-react';

export const OperationSwapTool = () => {
  const { wallet, executeOrder } = useCrypto();
  const [tab, setTab] = useState('Buy'); // 'Buy' | 'Sell' | 'Exchange'
  const [payCoin, setPayCoin] = useState('USD');
  const [getCoin, setGetCoin] = useState('ETH');
  const [payAmount, setPayAmount] = useState('1321.21');

  const ethPrice = 1333.71;
  const estimatedGet = (parseFloat(payAmount || 0) / ethPrice).toFixed(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;

    executeOrder(tab === 'Sell' ? 'SELL' : 'BUY', `${getCoin}USDT`, 'Binance', parseFloat(estimatedGet));
  };

  return (
    <div className="chainblock-card space-y-4 font-sans">
      
      {/* Header & Tabs */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-white">Operation</h3>

        <div className="flex items-center space-x-1 bg-[#11141b] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['Buy', 'Sell', 'Exchange'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg transition font-semibold ${
                tab === t
                  ? 'bg-[#1b202c] text-white font-bold shadow-md border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* YOU PAY INPUT CONTAINER */}
      <div className="bg-[#11141b] p-3.5 rounded-xl border border-slate-800 space-y-1">
        <div className="text-[11px] text-slate-500 font-mono">You pay</div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-[#161a23] border border-slate-800 px-2.5 py-1 rounded-lg text-xs text-white font-semibold cursor-pointer">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-bold">$</span>
            <span>{payCoin}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b2a24] text-[#34d399] border border-[#34d399]/40"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* SWAP CENTER ARROWS BUTTON */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={() => { const temp = payCoin; setPayCoin(getCoin); setGetCoin(temp); }}
          className="w-8 h-8 rounded-full bg-[#161a23] border border-slate-700 flex items-center justify-center text-[#34d399] shadow-lg hover:rotate-180 transition-transform duration-300"
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {/* YOU GET INPUT CONTAINER */}
      <div className="bg-[#11141b] p-3.5 rounded-xl border border-slate-800 space-y-1">
        <div className="text-[11px] text-slate-500 font-mono">You get</div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-[#161a23] border border-slate-800 px-2.5 py-1 rounded-lg text-xs text-white font-semibold cursor-pointer">
            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">Ξ</span>
            <span>{getCoin}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <span className="text-sm font-bold font-mono text-[#34d399]">
            {estimatedGet}
          </span>
        </div>
      </div>

      {/* Exchange Rate */}
      <div className="text-center text-[11px] font-mono text-slate-500 pt-1">
        1 ETH = $1,333.71
      </div>

      {/* Submit Button (Emerald Green Rounded Button) */}
      <button
        onClick={handleSubmit}
        className="w-full chainblock-btn-emerald"
      >
        {tab === 'Sell' ? 'Sell Ethereum' : 'Buy Ethereum'}
      </button>

    </div>
  );
};
