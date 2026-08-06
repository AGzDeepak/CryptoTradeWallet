import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { sendRealWeb3Transaction, SUPPORTED_NETWORKS, isWeb3Available } from '../services/web3Service';
import { X, Zap, ShieldCheck, ExternalLink, RefreshCw, ArrowRightLeft, CheckCircle2, AlertTriangle, Wallet } from 'lucide-react';

export const MetaMaskTradeModal = () => {
  const { 
    activeModal, 
    closeModal, 
    realWallet, 
    connectRealWallet, 
    addNotification, 
    executeOrder,
    user
  } = useCrypto();

  const [tradePair, setTradePair] = useState('ETHUSDT');
  const [tradeSide, setTradeSide] = useState('BUY');
  const [tradeAmountEth, setTradeAmountEth] = useState('0.05');
  const [targetRouter, setTargetRouter] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d7B41');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [txResult, setTxResult] = useState(null);

  if (activeModal !== 'metamask_trade') return null;

  const currentNetwork = SUPPORTED_NETWORKS[realWallet?.chainId || 42161] || {
    name: 'Arbitrum One',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io'
  };

  const handleExecuteMetaMaskTrade = async (e) => {
    e.preventDefault();
    const amt = parseFloat(tradeAmountEth);
    if (isNaN(amt) || amt <= 0) {
      addNotification('Please enter a valid ETH amount.', 'warning');
      return;
    }

    if (!realWallet.connected) {
      const connected = await connectRealWallet('MetaMask');
      if (!connected) return;
    }

    setIsBroadcasting(true);
    setTxResult(null);

    try {
      addNotification('🦊 Opening MetaMask extension window for on-chain transaction confirmation...', 'info');

      const userAddr = realWallet.address || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41';
      const txRes = await sendRealWeb3Transaction(
        userAddr,
        targetRouter,
        tradeAmountEth,
        realWallet.chainId || 42161
      );

      setTxResult(txRes);
      executeOrder(tradeSide, tradePair, 'MetaMask Web3 DEX', amt * 3540.20);
      addNotification(`✅ ON-CHAIN METAMASK TRADE BROADCASTED! Tx: ${txRes.txHash.substring(0, 12)}...`, 'success');
    } catch (err) {
      addNotification(`MetaMask Trade Error: ${err.message}`, 'danger');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="w-full max-w-lg bg-[#0b0c10] border border-[#2dd4bf]/40 rounded-2xl p-6 space-y-5 font-mono shadow-[0_0_50px_rgba(45,212,191,0.15)] relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-extrabold shadow">
              🦊
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-tight">METAMASK ON-CHAIN WEB3 TRADE</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf] font-bold">
                  LIVE WEB3
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Direct EIP-1193 MetaMask transaction execution</span>
            </div>
          </div>

          <button 
            onClick={closeModal}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallet Status Banner */}
        <div className="p-3.5 rounded-xl bg-[#14161d] border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-[#2dd4bf]" />
            <div>
              <span className="text-[10px] text-slate-400 block">CONNECTED METAMASK:</span>
              <span className="font-bold text-white truncate block max-w-[180px]">
                {realWallet.connected ? realWallet.address : 'Click to Connect MetaMask'}
              </span>
            </div>
          </div>

          {!realWallet.connected ? (
            <button
              onClick={() => connectRealWallet('MetaMask')}
              className="px-3 py-1.5 rounded-lg bg-[#2dd4bf] text-slate-950 font-extrabold text-[10px] uppercase shadow hover:brightness-110 transition"
            >
              Connect MetaMask
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]">
              {currentNetwork.name}
            </span>
          )}
        </div>

        {/* Trade Form */}
        <form onSubmit={handleExecuteMetaMaskTrade} className="space-y-4">
          
          {/* Pair & Side Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Trading Pair</label>
              <select
                value={tradePair}
                onChange={(e) => setTradePair(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold outline-none focus:border-[#2dd4bf]"
              >
                <option value="ETHUSDT">ETH / USDT (Ethereum)</option>
                <option value="BTCUSDT">BTC / USDT (Bitcoin)</option>
                <option value="SOLUSDT">SOL / USDT (Solana)</option>
                <option value="ARBUSDT">ARB / USDT (Arbitrum)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Trade Direction</label>
              <div className="grid grid-cols-2 gap-1 bg-[#14161d] p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTradeSide('BUY')}
                  className={`py-1.5 rounded-lg font-extrabold transition ${
                    tradeSide === 'BUY' ? 'bg-[#2dd4bf] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setTradeSide('SELL')}
                  className={`py-1.5 rounded-lg font-extrabold transition ${
                    tradeSide === 'SELL' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
              <span>Trade Amount (ETH)</span>
              <span>Available: {realWallet.balanceEth || 1.8540} ETH</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={tradeAmountEth}
                onChange={(e) => setTradeAmountEth(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-3 text-sm text-white font-bold font-mono outline-none focus:border-[#2dd4bf] pr-20"
              />
              <button
                type="button"
                onClick={() => setTradeAmountEth('0.25')}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-800 text-[#2dd4bf] font-bold text-[10px] border border-slate-700"
              >
                25% MAX
              </button>
            </div>
          </div>

          {/* Router Target Address */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">DEX Swap Router Contract</label>
            <input
              type="text"
              value={targetRouter}
              onChange={(e) => setTargetRouter(e.target.value)}
              className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-mono outline-none focus:border-[#2dd4bf]"
            />
          </div>

          {/* Result Banner */}
          {txResult && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-[#2dd4bf] space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2dd4bf] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> ON-CHAIN TX BROADCASTED!
                </span>
                <span className="text-[10px] text-emerald-300">STATUS: SUCCESS</span>
              </div>
              <a
                href={txResult.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-white hover:underline flex items-center gap-1 font-bold truncate block"
              >
                <span>Tx Hash: {txResult.txHash}</span>
                <ExternalLink className="w-3 h-3 text-[#2dd4bf]" />
              </a>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isBroadcasting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-teal-500 hover:brightness-110 text-slate-950 font-extrabold text-xs uppercase shadow-[0_0_25px_rgba(45,212,191,0.3)] transition flex items-center justify-center gap-2"
          >
            {isBroadcasting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Waiting for MetaMask Signature...</span>
              </>
            ) : (
              <>
                <span>🦊 CONFIRM & SIGN IN METAMASK NOW</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
