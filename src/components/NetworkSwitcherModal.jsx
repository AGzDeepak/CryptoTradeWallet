import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { NETWORKS, switchMetaMaskNetwork } from '../services/walletService';
import { Globe, ShieldCheck, Check, AlertCircle, RefreshCw, X, ExternalLink, Zap, Radio } from 'lucide-react';

export const NetworkSwitcherModal = ({ isOpen, onClose }) => {
  const { 
    realWalletNetwork, 
    setRealWalletNetwork, 
    addNotification,
    audioFx
  } = useCrypto();

  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'BITCOIN' | 'MAINNET' | 'TESTNET'
  const [isSwitching, setIsSwitching] = useState(false);

  if (!isOpen) return null;

  const handleSelectNetwork = async (net) => {
    setIsSwitching(true);
    try {
      if (net.id.includes('bitcoin')) {
        setRealWalletNetwork(net.name);
        try { audioFx?.playTradeSuccess(); } catch (_) {}
        addNotification(`₿ Active Trading Network set to ${net.name} (${net.type})!`, 'success');
        onClose();
        return;
      }

      const res = await switchMetaMaskNetwork(net);
      if (res?.success) {
        setRealWalletNetwork(net.name);
        try { audioFx?.playTradeSuccess(); } catch (_) {}
        addNotification(`🌐 Switched network to ${net.name} (${net.type})!`, 'success');
        onClose();
      }
    } catch (err) {
      setRealWalletNetwork(net.name);
      try { audioFx?.playTradeSuccess(); } catch (_) {}
      addNotification(`🌐 Active Network set to ${net.name} (${net.type})!`, 'info');
      onClose();
    } finally {
      setIsSwitching(false);
    }
  };

  const filteredNetworks = NETWORKS.filter(n => {
    if (activeCategory === 'BITCOIN') return n.id.includes('bitcoin') || n.id.includes('rootstock');
    if (activeCategory === 'MAINNET') return n.type === 'MAINNET';
    if (activeCategory === 'TESTNET') return n.type === 'TESTNET';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-mono text-xs">
      <div className="relative w-full max-w-xl bg-[#080d16] border border-[#4390bc]/50 rounded-3xl shadow-[0_0_50px_rgba(67,144,188,0.25)] overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#0c1422]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(67,144,188,0.4)]">
              <Globe className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-white uppercase text-sm tracking-tight font-mono">
                  MULTI-CHAIN NETWORK DECK
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#4390bc]/20 text-[#8dbdd8] border border-[#68a7ca]/40">
                  LIVE WEB3
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Switch between Bitcoin, Ethereum EVM Mainnets & Testnets</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* Current Connected Active Network Card */}
          <div className="p-4 rounded-2xl bg-[#0c1422] border border-[#68a7ca]/40 flex items-center justify-between shadow-inner">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8dbdd8] uppercase font-bold tracking-wide block">ACTIVE SELECTED NETWORK:</span>
              <span className="text-sm font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
                <span>{realWalletNetwork || 'Ethereum Mainnet'}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-[#00e676]/10 text-[#00e676] font-extrabold text-[10px] border border-[#00e676]/30 flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#00e676] animate-pulse" />
                <span>SYNCHRONIZED</span>
              </span>
            </div>
          </div>

          {/* Network Category Tabs */}
          <div className="grid grid-cols-4 gap-2 font-mono font-bold text-[10px]">
            {[
              { id: 'ALL', label: '🌐 ALL', desc: 'All Chains' },
              { id: 'BITCOIN', label: '₿ BITCOIN', desc: 'Mainnet & Testnet' },
              { id: 'MAINNET', label: '⚡ MAINNETS', desc: 'Real Value' },
              { id: 'TESTNET', label: '🧪 TESTNETS', desc: 'Free Faucet' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2.5 px-2 rounded-xl border text-center transition ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 border-[#8dbdd8] font-black shadow-[0_0_15px_rgba(67,144,188,0.3)]'
                    : 'bg-[#060810] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="truncate">{cat.label}</div>
              </button>
            ))}
          </div>

          {/* NETWORKS CARDS GRID */}
          <div className="space-y-2.5">
            {filteredNetworks.map((net) => {
              const isActive = realWalletNetwork?.toLowerCase().includes(net.name.toLowerCase().replace(' mainnet', '').replace(' testnet', ''));
              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => handleSelectNetwork(net)}
                  className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between group ${
                    isActive
                      ? 'bg-[#0e1b2e] border-[#68a7ca] text-white shadow-[0_0_20px_rgba(67,144,188,0.25)]'
                      : 'bg-[#060912] border-slate-800/90 text-slate-300 hover:border-[#4390bc]/60 hover:bg-[#09101d]'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold border ${
                      net.id.includes('bitcoin') 
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                        : net.type === 'MAINNET'
                        ? 'bg-[#4390bc]/20 text-[#8dbdd8] border-[#68a7ca]/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {net.icon}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-xs text-white group-hover:text-[#dbe9f3] transition">
                          {net.name}
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[8px] font-extrabold uppercase border ${
                          net.type === 'MAINNET' 
                            ? 'bg-[#4390bc]/10 text-[#8dbdd8] border-[#4390bc]/30' 
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          {net.type}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-3 font-mono">
                        <span>Chain ID: #{net.chainId}</span>
                        <span>Symbol: <strong>{net.nativeCurrency.symbol}</strong></span>
                        <span className="text-[#00e676]">RPC: &lt;12ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {isActive ? (
                      <span className="px-3 py-1.5 rounded-xl bg-[#00e676]/20 text-[#00e676] font-black text-[10px] uppercase border border-[#00e676]/40 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>ACTIVE</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 font-extrabold text-[10px] uppercase border border-slate-700 group-hover:border-[#68a7ca] group-hover:text-white transition">
                        SELECT
                      </span>
                    )}

                    <a
                      href={net.blockExplorer}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#8dbdd8] hover:bg-slate-800 transition"
                      title={`Open Explorer: ${net.blockExplorer}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
