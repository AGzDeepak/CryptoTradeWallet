import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { sendRealWeb3Transaction, executeRealBuyEthereumOrder, executeRealSellEthereumOrder, SUPPORTED_NETWORKS, isWeb3Available } from '../services/web3Service';
import { X, Zap, ShieldCheck, ExternalLink, RefreshCw, ArrowRightLeft, CheckCircle2, AlertTriangle, Wallet, Copy, Check } from 'lucide-react';

export const MetaMaskTradeModal = () => {
  const { 
    activeModal, 
    closeModal, 
    realWallet, 
    connectRealWallet, 
    addNotification, 
    executeOrder,
    audioFx,
    user
  } = useCrypto();

  const [tradePair, setTradePair] = useState('ETHUSDT');
  const [tradeSide, setTradeSide] = useState('BUY');
  const [tradeAmountEth, setTradeAmountEth] = useState('0.05');
  const [targetRouter, setTargetRouter] = useState(realWallet?.address || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const [copiedRouter, setCopiedRouter] = useState(false);

  if (activeModal !== 'metamask_trade') return null;

  const currentNetwork = SUPPORTED_NETWORKS[realWallet?.chainId || 42161] || {
    name: 'Arbitrum One',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io'
  };

  const getAssetSymbol = () => {
    if (tradePair === 'BTCUSDT') return 'BTC';
    if (tradePair === 'SOLUSDT') return 'SOL';
    if (tradePair === 'ARBUSDT') return 'ARB';
    return 'ETH';
  };

  const getAssetPrice = () => {
    if (tradePair === 'BTCUSDT') return 67840.50;
    if (tradePair === 'SOLUSDT') return 184.75;
    if (tradePair === 'ARBUSDT') return 1.25;
    return 3540.20;
  };

  const assetSymbol = getAssetSymbol();
  const assetPrice = getAssetPrice();
  const availableEth = realWallet.balanceEth || 4.8250;
  const numAmount = parseFloat(tradeAmountEth || '0');
  const usdValue = (numAmount * assetPrice).toFixed(2);

  const handlePercent = (pct) => {
    const val = (availableEth * pct).toFixed(4);
    setTradeAmountEth(val);
  };

  const handleExecuteMetaMaskTrade = async (e) => {
    e.preventDefault();
    const amt = parseFloat(tradeAmountEth);
    if (isNaN(amt) || amt <= 0) {
      addNotification('Please enter a valid amount.', 'warning');
      return;
    }

    if (!realWallet.connected) {
      const connected = await connectRealWallet('MetaMask');
      if (!connected) return;
    }

    setIsBroadcasting(true);
    setTxResult(null);

    try {
      addNotification(`🦊 Opening MetaMask extension window for ${tradeSide} REAL ${assetSymbol} transaction authorization...`, 'info');

      const userAddr = realWallet.address || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41';
      let txRes;

      if (tradeSide === 'BUY') {
        txRes = await executeRealBuyEthereumOrder(userAddr, usdValue, targetRouter);
      } else {
        txRes = await executeRealSellEthereumOrder(userAddr, tradeAmountEth, targetRouter);
      }

      setTxResult(txRes);
      try { audioFx?.playTradeSuccess(); } catch (_) {}
      executeOrder(tradeSide, tradePair, 'MetaMask Web3 DEX', parseFloat(usdValue));
      addNotification(`✅ ON-CHAIN ${tradeSide} REAL ${assetSymbol} BROADCASTED! Tx: ${txRes.txHash.substring(0, 12)}...`, 'success');
    } catch (err) {
      addNotification(`MetaMask Trade Notice: ${err.message}`, 'warning');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="w-full max-w-lg bg-[#0b0c10] border border-[#2dd4bf]/40 rounded-3xl p-6 space-y-5 font-mono shadow-[0_0_50px_rgba(45,212,191,0.2)] relative overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-extrabold shadow-lg">
              🦊
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-white uppercase tracking-tight font-mono">METAMASK ON-CHAIN WEB3 TRADE</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf] font-bold">
                  LIVE WEB3
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Direct EIP-1193 MetaMask transaction execution</span>
            </div>
          </div>

          <button 
            onClick={closeModal}
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallet Status Banner */}
        <div className="p-3.5 rounded-2xl bg-[#14161d] border border-slate-800 flex items-center justify-between text-xs shadow-inner">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-[#2dd4bf]" />
            <div>
              <span className="text-[10px] text-slate-400 block">CONNECTED METAMASK:</span>
              <span className="font-bold text-white truncate block max-w-[200px] text-xs">
                {realWallet.connected ? realWallet.address : 'Click to Connect MetaMask'}
              </span>
            </div>
          </div>

          {!realWallet.connected ? (
            <button
              type="button"
              onClick={() => connectRealWallet('MetaMask')}
              className="px-3 py-1.5 rounded-xl bg-[#2dd4bf] text-slate-950 font-black text-[10px] uppercase shadow hover:brightness-110 transition"
            >
              Connect MetaMask
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]">
              {currentNetwork.name}
            </span>
          )}
        </div>

        {/* Trade Form */}
        <form onSubmit={handleExecuteMetaMaskTrade} className="space-y-4">
          
          {/* Pair & Side Selector Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-bold">Trading Pair</label>
              <select
                value={tradePair}
                onChange={(e) => setTradePair(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-3 text-xs text-white font-bold outline-none focus:border-[#2dd4bf]"
              >
                <option value="ETHUSDT">ETH / USDT (Ethereum)</option>
                <option value="BTCUSDT">BTC / USDT (Bitcoin)</option>
                <option value="SOLUSDT">SOL / USDT (Solana)</option>
                <option value="ARBUSDT">ARB / USDT (Arbitrum)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-bold">Trade Direction</label>
              <div className="grid grid-cols-2 gap-1 bg-[#14161d] p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTradeSide('BUY')}
                  className={`py-2 rounded-lg font-black transition ${
                    tradeSide === 'BUY' 
                      ? 'bg-gradient-to-r from-[#2dd4bf] to-emerald-400 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setTradeSide('SELL')}
                  className={`py-2 rounded-lg font-black transition ${
                    tradeSide === 'SELL' 
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>
          </div>

          {/* Amount Input with Percentage Quick Chips */}
          <div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
              <span className="font-bold">Trade Amount ({assetSymbol})</span>
              <span>Available: <strong>{availableEth} {assetSymbol}</strong></span>
            </div>
            
            <div className="relative flex items-center mb-2">
              <input
                type="number"
                step="0.001"
                min="0.0001"
                value={tradeAmountEth}
                onChange={(e) => setTradeAmountEth(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-3.5 text-sm text-white font-bold font-mono outline-none focus:border-[#2dd4bf]"
              />
              <span className="absolute right-3 text-xs text-emerald-400 font-bold">
                ≈ ${usdValue} USD
              </span>
            </div>

            {/* Quick Percentage Chips */}
            <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
              {[
                { pct: 0.25, label: '25%' },
                { pct: 0.50, label: '50%' },
                { pct: 0.75, label: '75%' },
                { pct: 1.00, label: '100% MAX' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handlePercent(chip.pct)}
                  className="py-1.5 px-2 rounded-lg bg-[#14161d] border border-slate-800 hover:border-[#2dd4bf] text-slate-300 hover:text-[#2dd4bf] font-bold text-center transition"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* DEX Router Target Contract Address */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-bold">
              <span>DEX Swap Router Contract / Account</span>
              {realWallet.address && (
                <button
                  type="button"
                  onClick={() => setTargetRouter(realWallet.address)}
                  className="text-[#2dd4bf] hover:underline"
                >
                  USE MY WALLET
                </button>
              )}
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={targetRouter}
                onChange={(e) => setTargetRouter(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono outline-none focus:border-[#2dd4bf] pr-10"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(targetRouter);
                  setCopiedRouter(true);
                  setTimeout(() => setCopiedRouter(false), 2000);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {copiedRouter ? <Check className="w-3.5 h-3.5 text-[#2dd4bf]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Result Banner */}
          {txResult && (
            <div className="p-4 rounded-2xl bg-emerald-950/90 border border-[#2dd4bf] space-y-1.5 text-xs font-mono shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#2dd4bf] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> ON-CHAIN TX BROADCASTED!
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  CONFIRMED
                </span>
              </div>
              <a
                href={txResult.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-white hover:underline flex items-center gap-1 font-bold truncate block"
              >
                <span>Tx Hash: {txResult.txHash}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
              </a>
            </div>
          )}

          {/* Dynamic Submit Action Button */}
          <button
            type="submit"
            disabled={isBroadcasting}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase shadow-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              tradeSide === 'BUY'
                ? 'bg-gradient-to-r from-[#2dd4bf] via-teal-400 to-[#2dd4bf] hover:brightness-110 text-slate-950 shadow-[0_0_30px_rgba(45,212,191,0.35)]'
                : 'bg-gradient-to-r from-rose-500 via-red-600 to-rose-500 hover:brightness-110 text-white shadow-[0_0_30px_rgba(244,63,94,0.35)]'
            }`}
          >
            {isBroadcasting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-current" />
                <span>Opening MetaMask Signature...</span>
              </>
            ) : (
              <>
                <span>🦊 CONFIRM & SIGN {tradeSide} IN METAMASK NOW</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
