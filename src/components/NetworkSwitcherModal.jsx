import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { NETWORKS, switchMetaMaskNetwork } from '../services/walletService';
import { Globe, ShieldCheck, Check, AlertCircle, RefreshCw, X } from 'lucide-react';

export const NetworkSwitcherModal = ({ isOpen, onClose }) => {
  const { 
    realWalletNetwork, 
    setRealWalletNetwork, 
    addNotification 
  } = useCrypto();

  if (!isOpen) return null;

  const handleSelectNetwork = async (net) => {
    try {
      const res = await switchMetaMaskNetwork(net);
      if (res?.success) {
        setRealWalletNetwork(net.name);
        addNotification(`🌐 Switched MetaMask network to ${net.name} (${net.type})!`, 'success');
        onClose();
      }
    } catch (err) {
      addNotification(`Network switch error: ${err.message}`, 'warning');
    }
  };

  const mainnets = NETWORKS.filter(n => n.type === 'MAINNET');
  const testnets = NETWORKS.filter(n => n.type === 'TESTNET');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-mono text-xs">
      <div className="relative w-full max-w-lg bg-[#090d16] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0e1320]">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🦊</span>
            <div>
              <div className="font-extrabold text-white uppercase text-sm">METAMASK NETWORK SELECTOR</div>
              <div className="text-[10px] text-slate-400">Switch seamlessly between Mainnet & Testnet EVM Networks</div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Current Connected Network Status */}
          <div className="p-4 rounded-2xl bg-[#0e1626] border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">CURRENT METAMASK NETWORK:</span>
              <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{realWalletNetwork || 'Ethereum Mainnet'}</span>
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          {/* MAINNET NETWORKS SECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>LIVE MAINNET NETWORKS</span>
              </span>
              <span className="text-[9px] text-slate-500 font-normal">Real Value Transactions</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {mainnets.map((net) => {
                const isActive = realWalletNetwork?.toLowerCase().includes(net.name.toLowerCase().replace(' mainnet', ''));
                return (
                  <button
                    key={net.id}
                    onClick={() => handleSelectNetwork(net)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-[#090d16] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{net.icon}</span>
                      <div>
                        <div className="font-extrabold text-xs text-white">{net.name}</div>
                        <div className="text-[10px] text-slate-400">Chain ID #{net.chainId} ({net.nativeCurrency.symbol})</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold text-[9px] uppercase border border-emerald-500/30">
                        SWITCH TO MAINNET
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TESTNET NETWORKS SECTION */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="text-sm">🧪</span>
                <span>DEVELOPMENT TESTNET NETWORKS</span>
              </span>
              <span className="text-[9px] text-slate-500 font-normal">Free Faucet Testing</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {testnets.map((net) => {
                const isActive = realWalletNetwork?.toLowerCase().includes(net.name.toLowerCase());
                return (
                  <button
                    key={net.id}
                    onClick={() => handleSelectNetwork(net)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-950/40 border-amber-500/60 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-[#090d16] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{net.icon}</span>
                      <div>
                        <div className="font-extrabold text-xs text-white">{net.name}</div>
                        <div className="text-[10px] text-slate-400">Chain ID #{net.chainId} ({net.nativeCurrency.symbol})</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isActive && <Check className="w-4 h-4 text-amber-400" />}
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 font-extrabold text-[9px] uppercase border border-amber-500/30">
                        SWITCH TO TESTNET
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
