import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { sendRealWeb3Transaction } from '../services/web3Service';
import { apiService } from '../services/apiService';
import { ArrowDownUp, ChevronDown, ArrowRightLeft, ShieldCheck, Zap, ExternalLink, Wallet } from 'lucide-react';

export const OperationSwapTool = () => {
  const { 
    wallet, 
    user,
    executeOrder, 
    marketData, 
    walletMode, 
    setWalletMode, 
    realWallet, 
    connectRealWallet,
    addNotification,
    activeTradeExecutionMode,
    setActiveTradeExecutionMode,
    openModal
  } = useCrypto();

  const [tab, setTab] = useState('Buy');
  const [payCoin, setPayCoin] = useState('USD');
  const [getCoin, setGetCoin] = useState('ETH');
  const [payAmount, setPayAmount] = useState('1000');
  const [showCoinDropdown, setShowCoinDropdown] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const ethCoin = marketData.find(c => c.symbol === 'ETHUSDT') || { basePrice: 3540.20 };
  const btcCoin = marketData.find(c => c.symbol === 'BTCUSDT') || { basePrice: 67840.50 };
  const solCoin = marketData.find(c => c.symbol === 'SOLUSDT') || { basePrice: 184.75 };

  const targetPrice = getCoin === 'BTC' ? btcCoin.basePrice : getCoin === 'SOL' ? solCoin.basePrice : ethCoin.basePrice;
  const estimatedGet = (parseFloat(payAmount || 0) / targetPrice).toFixed(4);

  const currentAvailableBalance = walletMode === 'REAL' && realWallet.connected 
    ? realWallet.balanceUsd 
    : (wallet.virtualBalance ?? 0.00);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (tab !== 'Sell' && currentAvailableBalance <= 0) {
      addNotification(`Insufficient balance! Available balance is $${currentAvailableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Please deposit real funds first.`, 'danger');
      return;
    }

    const symbol = getCoin === 'USD' ? 'ETHUSDT' : `${getCoin}USDT`;
    const side = tab === 'Sell' ? 'SELL' : 'BUY';
    const email = user?.email || 'deepak@chainblock.io';

    if (walletMode === 'REAL') {
      if (!realWallet.connected) {
        connectRealWallet('MetaMask');
        return;
      }

      setIsBroadcasting(true);
      try {
        addNotification('🦊 Opening Web3 Wallet prompt for real on-chain transaction signature...', 'info');
        const ethVal = (amount / targetPrice).toFixed(4);
        const txRes = await sendRealWeb3Transaction(
          realWallet.address,
          '0x71C7656EC7ab88b098defB751B7401B5f6d7B41',
          ethVal,
          realWallet.chainId
        );

        // Record in Python Swap Engine
        await apiService.executePythonSwap(email, side, payCoin, getCoin, amount, 'REAL', realWallet.address);

        executeOrder(side, symbol, 'MetaMask Real Web3', parseFloat(estimatedGet));
        addNotification(`✅ REAL WEB3 PYTHON SWAP BROADCASTED! Tx Hash: ${txRes.txHash.substring(0, 10)}...`, 'success');
      } catch (err) {
        addNotification(`Real Web3 Execution Error: ${err.message}`, 'danger');
      } finally {
        setIsBroadcasting(false);
      }
    } else {
      // Execute in Python Swap Engine
      await apiService.executePythonSwap(email, side, payCoin, getCoin, amount, 'DEMO');
      executeOrder(side, symbol, 'Binance (Python Engine)', parseFloat(estimatedGet));
      addNotification(`✅ Python Swap Engine Executed: ${amount} ${payCoin} -> ${estimatedGet} ${getCoin}`, 'success');
    }
  };

  const handleSwapPairs = () => {
    const temp = payCoin;
    setPayCoin(getCoin);
    setGetCoin(temp);
  };

  return (
    <div className="chainblock-card space-y-4 font-sans relative">
      
      {/* Real vs Mock Execution Mode Toggle */}
      <div className="card-header-baseline">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-extrabold text-white tracking-tight">INSTITUTIONAL DEX SWAP ENGINE</h3>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
              activeTradeExecutionMode === 'REAL' ? 'bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]' : 'bg-amber-950 text-[#facc15] border border-[#facc15]'
            }`}>
              {activeTradeExecutionMode === 'REAL' ? '🟢 REAL ON-CHAIN SWAP' : '🟡 MOCK PAPER SWAP'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono mt-0.5 block">Instant low-slippage execution across Liquidity Pools</span>
        </div>

        <div className="flex items-center bg-[#0b0c10] p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => {
              setActiveTradeExecutionMode('MOCK');
              setWalletMode('DEMO');
              addNotification('🟡 Switched to MOCK TRADE (Paper Swap) Mode!', 'info');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTradeExecutionMode === 'MOCK' ? 'bg-[#facc15] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            MOCK SWAP
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTradeExecutionMode('REAL');
              setWalletMode('REAL');
              if (!realWallet.connected) connectRealWallet('MetaMask');
              addNotification('🟢 Switched to REAL TRADE (Web3 DEX Swap) Mode!', 'success');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTradeExecutionMode === 'REAL' ? 'bg-[#2dd4bf] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>REAL WEB3</span>
          </button>
        </div>
      </div>

      {/* Header & Baseline Alignment */}
      <div className="card-header-baseline">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-extrabold text-white font-mono tracking-tight">
            {walletMode === 'REAL' ? 'REAL ON-CHAIN BUY & SELL' : 'MANUAL BUY & SELL TERMINAL'}
          </h3>
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
              onClick={() => setPayAmount(currentAvailableBalance.toFixed(2))}
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

      {/* Live Balance Bar */}
      <div className={`flex items-center justify-between text-[11px] font-mono px-1 ${
        currentAvailableBalance <= 0 ? 'text-rose-400' : 'text-slate-400'
      }`}>
        <span>{walletMode === 'REAL' ? 'Real Web3 Balance:' : 'Wallet Balance:'}</span>
        <span className="font-bold">
          ${currentAvailableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {walletMode === 'REAL' ? 'USD/ETH' : 'USDT'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleSubmit}
          disabled={isBroadcasting || (tab !== 'Sell' && currentAvailableBalance <= 0)}
          className={`w-full chainblock-btn-emerald disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-extrabold ${
            walletMode === 'REAL' ? 'bg-[#2dd4bf] text-slate-950' : ''
          }`}
        >
          {isBroadcasting ? (
            <span>BROADCASTING WEB3 TX...</span>
          ) : tab !== 'Sell' && currentAvailableBalance <= 0 ? (
            <span>DEPOSIT REAL FUNDS TO BUY</span>
          ) : walletMode === 'REAL' ? (
            <span>EXECUTE REAL ON-CHAIN {tab.toUpperCase()} NOW</span>
          ) : (
            <span>{tab === 'Sell' ? `SELL ${getCoin} NOW` : `BUY ${getCoin} NOW`}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (!realWallet.connected) connectRealWallet('MetaMask');
            openModal('metamask_trade');
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:bg-slate-800 text-amber-300 font-extrabold text-xs uppercase border border-amber-500/40 flex items-center justify-center gap-2 shadow transition"
        >
          <span>🦊 OPEN METAMASK WEB3 TRADE TERMINAL</span>
        </button>
      </div>

    </div>
  );
};
