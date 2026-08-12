import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { User, Copy, Check, Wifi, Globe, RefreshCw, Zap, LogIn, Shield } from 'lucide-react';
import { shortAddress, fetchEthBalance } from '../services/walletService';
import { NetworkSwitcherModal } from './NetworkSwitcherModal';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const HOLDINGS = [
  { icon: '₿', bg: 'bg-amber-500/15', color: 'text-amber-400', coin: 'Bitcoin',   sym: 'BTC', amount: 0.2456, avgPrice: 60245,  curPrice: 63521  },
  { icon: 'Ξ', bg: 'bg-cyan-500/15',  color: 'text-cyan-400',  coin: 'Ethereum',  sym: 'ETH', amount: 1.245,  avgPrice: 2950,   curPrice: 3152.2 },
  { icon: '◎', bg: 'bg-violet-500/15',color: 'text-violet-400',coin: 'Solana',    sym: 'SOL', amount: 12.50,  avgPrice: 120.50, curPrice: 147.75 },
  { icon: '✕', bg: 'bg-blue-500/15',  color: 'text-blue-400',  coin: 'Ripple',    sym: 'XRP', amount: 500,    avgPrice: 0.52,   curPrice: 0.55   },
];

export const AccountSection = () => {
  const {
    user, openModal, addNotification, logout,
    realWalletAddress, setRealWalletAddress,
    realWalletNetwork, setRealWalletNetwork,
    setActiveTab
  } = useCrypto();

  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [copiedAddr, setCopiedAddr]             = useState(false);
  const [isConnecting, setIsConnecting]         = useState(false);
  const [ethBalance, setEthBalance]             = useState('0.000000');

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      if (!realWalletAddress) return;
      try {
        const bal = await fetchEthBalance(realWalletAddress, 'sepolia');
        if (mounted && bal !== undefined) setEthBalance(bal.toFixed(6));
      } catch (_) {}
    };
    sync();
    const id = setInterval(sync, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, [realWalletAddress]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts?.[0]) {
          const addr = accounts[0];
          setRealWalletAddress(addr);
          const hexId  = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(hexId, 16);
          const netMap = { 1: 'Ethereum Mainnet', 56: 'BNB Smart Chain', 137: 'Polygon Mainnet', 42161: 'Arbitrum One', 10: 'Optimism', 11155111: 'Sepolia Testnet' };
          setRealWalletNetwork(netMap[chainId] || 'Ethereum Mainnet');
          addNotification(`🦊 MetaMask Connected: ${addr.substring(0, 10)}...`, 'success');
        }
      } else {
        const inputAddr = window.prompt('MetaMask not detected. Paste your 0x address:');
        if (inputAddr?.startsWith('0x')) {
          setRealWalletAddress(inputAddr);
          addNotification(`✅ Wallet connected: ${inputAddr.substring(0, 10)}...`, 'success');
        }
      }
    } catch (err) {
      addNotification(`MetaMask: ${err.message}`, 'warning');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddr = () => {
    if (realWalletAddress) {
      navigator.clipboard.writeText(realWalletAddress);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  const totalPortfolioValue = HOLDINGS.reduce((s, h) => s + h.curPrice * h.amount, 0);
  const totalPnL = HOLDINGS.reduce((s, h) => s + (h.curPrice - h.avgPrice) * h.amount, 0);
  const pnlPct   = totalPortfolioValue > 0 ? (totalPnL / (totalPortfolioValue - totalPnL)) * 100 : 0;

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Portfolio</h1>
        <p className="text-sm text-slate-400 mt-0.5">Your holdings, performance and account overview</p>
      </div>

      {/* Top row: summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Portfolio Value', value: `$${fmt(totalPortfolioValue)}`, color: 'text-white' },
          { label: 'Total P&L',       value: `${totalPnL >= 0 ? '+' : ''}$${fmt(totalPnL)}`, color: totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Return %',        value: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`, color: pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400' },
          { label: 'Holdings',        value: HOLDINGS.length,               color: 'text-violet-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-[#0d1523] border border-slate-800/70 px-5 py-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom row: Holdings + Account Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Holdings table - 2 cols */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0d1523] border border-slate-800/70 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800/70">
            <h2 className="text-sm font-semibold text-white">Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-slate-500 font-medium">
                  <th className="px-5 py-3 text-left">Asset</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Avg. Price</th>
                  <th className="px-4 py-3 text-right">Current</th>
                  <th className="px-5 py-3 text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {HOLDINGS.map((h, i) => {
                  const pnl = (h.curPrice - h.avgPrice) * h.amount;
                  const pct = ((h.curPrice - h.avgPrice) / h.avgPrice) * 100;
                  return (
                    <tr key={i} className="hover:bg-slate-800/20 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${h.bg} flex items-center justify-center text-sm font-bold ${h.color}`}>
                            {h.icon}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{h.sym}</p>
                            <p className="text-[10px] text-slate-500">{h.coin}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-slate-300">{h.amount}</td>
                      <td className="px-4 py-3.5 text-right text-xs text-slate-300">${fmt(h.avgPrice)}</td>
                      <td className="px-4 py-3.5 text-right text-xs font-medium text-white">${fmt(h.curPrice)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <p className={`text-xs font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pnl >= 0 ? '+' : ''}{fmt(pnl)}
                        </p>
                        <p className={`text-[10px] ${pnl >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                          {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Account card - 1 col */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Account</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xl font-bold text-violet-400">
                {user?.avatar || 'D'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name || 'Deepak Kumar'}</p>
                <p className="text-xs text-slate-400">{user?.email || 'deepak@chainblock.io'}</p>
                <p className="text-[10px] text-violet-400 mt-0.5">{user?.role || 'Institutional Quant Trader'}</p>
              </div>
            </div>
          </div>

          {/* Wallet connection card */}
          <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">MetaMask</h2>
              {realWalletAddress && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </span>
              )}
            </div>

            {realWalletAddress ? (
              <div className="space-y-3">
                <div className="bg-[#060d18] rounded-xl px-3 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-mono">{shortAddress(realWalletAddress)}</span>
                  <button onClick={copyAddr} className="text-slate-400 hover:text-white transition">
                    {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Network</span>
                  <button onClick={() => setShowNetworkModal(true)} className="text-violet-400 hover:text-violet-300 flex items-center gap-1 transition">
                    <Globe className="w-3 h-3" />{realWalletNetwork || 'Ethereum'}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Balance</span>
                  <span className="text-white font-medium">{ethBalance} ETH</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {isConnecting ? 'Connecting…' : 'Connect MetaMask'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showNetworkModal && <NetworkSwitcherModal onClose={() => setShowNetworkModal(false)} />}
    </div>
  );
};
