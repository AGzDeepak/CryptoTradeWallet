import React, { useState, useEffect } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { getStoredVaultWallets, saveWalletToVault } from '../../services/walletGeneratorService';
import { fetchEthBalance } from '../../services/walletService';
import { 
  Wallet, Plus, Key, Copy, Check, CheckCircle2, ShieldCheck, 
  ExternalLink, Sparkles, RefreshCw, Trash2, ArrowUpRight
} from 'lucide-react';

export const VaultAccountsTab = ({ onOpenCreateModal, onOpenImportModal }) => {
  const { realWalletAddress, setRealWalletAddress, addNotification } = useCrypto();

  const [vaultList, setVaultList] = useState([]);
  const [copiedAddr, setCopiedAddr] = useState('');
  const [balances, setBalances] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWallets = () => {
    let list = getStoredVaultWallets();
    // If empty, add default active wallet
    if (list.length === 0 && realWalletAddress) {
      list = saveWalletToVault({
        name: 'Primary Web3 Account',
        address: realWalletAddress,
      });
    }
    setVaultList(list);
  };

  useEffect(() => {
    loadWallets();
  }, [realWalletAddress]);

  // Fetch balances for all vault wallets
  const syncVaultBalances = async () => {
    setIsRefreshing(true);
    const newBals = {};
    for (const w of vaultList) {
      try {
        const bal = await fetchEthBalance(w.address, 'sepolia');
        newBals[w.address] = bal !== undefined ? bal.toFixed(4) : '0.0000';
      } catch (_) {
        newBals[w.address] = '0.0000';
      }
    }
    setBalances(newBals);
    setIsRefreshing(false);
    if (addNotification) addNotification('🔄 Vault balances updated.', 'info');
  };

  useEffect(() => {
    if (vaultList.length > 0) {
      syncVaultBalances();
    }
  }, [vaultList.length]);

  const handleCopy = (addr) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(''), 2000);
    if (addNotification) addNotification('Address copied to clipboard.', 'success');
  };

  const handleSetActive = (addr) => {
    if (setRealWalletAddress) {
      setRealWalletAddress(addr);
      if (addNotification) addNotification(`Switched active wallet to: ${addr.substring(0, 8)}...`, 'success');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Non-Custodial Web3 Vault Accounts</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Locally derived BIP-39 cryptographic accounts & multiple wallet management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={syncVaultBalances}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-[#060d18] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition text-xs font-bold"
            title="Refresh Balances"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-3.5 py-2.5 rounded-xl bg-[#060d18] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition text-xs font-bold font-mono flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition text-xs font-bold font-mono flex items-center gap-1.5 shadow-lg shadow-violet-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Wallet</span>
          </button>
        </div>
      </div>

      {/* Wallets List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vaultList.map((walletItem, idx) => {
          const isActive = (realWalletAddress || '').toLowerCase() === walletItem.address.toLowerCase();
          const ethBal = balances[walletItem.address] || '0.0000';

          return (
            <div
              key={walletItem.id || idx}
              className={`rounded-2xl p-4 transition-all duration-300 border relative space-y-3 ${
                isActive
                  ? 'bg-[#0e1726] border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'bg-[#060d18] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Name & Active Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{walletItem.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">BIP-44 EVM</span>
                  </div>
                </div>

                {isActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ACTIVE WALLET
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetActive(walletItem.address)}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 hover:bg-violet-600/30 text-slate-400 hover:text-violet-300 border border-slate-700 hover:border-violet-500/40 transition"
                  >
                    Set as Active ↗
                  </button>
                )}
              </div>

              {/* Address Row */}
              <div className="p-2.5 rounded-xl bg-[#0b1320] border border-slate-800/80 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-300 truncate max-w-[220px]">
                  {walletItem.address}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(walletItem.address)}
                  className="p-1 rounded text-slate-400 hover:text-white transition"
                  title="Copy address"
                >
                  {copiedAddr === walletItem.address ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-violet-400" />}
                </button>
              </div>

              {/* Balances & Explorer link */}
              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">Sepolia Balance</span>
                  <span className="font-bold text-white">{ethBal} ETH</span>
                </div>

                <a
                  href={`https://sepolia.etherscan.io/address/${walletItem.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-400 hover:text-violet-300 text-[11px] flex items-center gap-1 transition"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
