import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  User, ShieldCheck, Key, Lock, Copy, Check, LogOut, Zap, RefreshCw, 
  ExternalLink, ArrowUpRight, Shield, Activity, Globe, CheckCircle2, 
  Wallet, AlertCircle, LogIn 
} from 'lucide-react';
import { AddApiKeyModal } from './AddApiKeyModal';
import { shortAddress, fetchEthBalance, switchToEthereumMainnet, switchToSepoliaTestnet } from '../services/walletService';
import { NetworkSwitcherModal } from './NetworkSwitcherModal';

export const AccountSection = () => {
  const { 
    user, 
    openModal, 
    activeModal, 
    addNotification, 
    soundEnabled, 
    setSoundEnabled, 
    logout,
    realWalletAddress,
    setRealWalletAddress,
    realWalletNetwork,
    setRealWalletNetwork,
    switchRealWalletAccount,
    connectRealWallet,
    setActiveTab
  } = useCrypto();

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  const [ethBalance, setEthBalance] = useState('0.000000');

  // Live On-Chain Balance Sync Effect
  useEffect(() => {
    let isMounted = true;
    const syncLiveBalance = async () => {
      if (realWalletAddress) {
        try {
          const bal = await fetchEthBalance(realWalletAddress, 'sepolia');
          if (isMounted && bal !== undefined) {
            setEthBalance(bal.toFixed(6));
          }
        } catch (_) {}
      }
    };

    syncLiveBalance();
    const interval = setInterval(syncLiveBalance, 4000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [realWalletAddress]);

  const activeAddr = realWalletAddress || '';
  const displayAddressShort = activeAddr ? shortAddress(activeAddr) : '0x...';
  const accountName = activeAddr ? `MetaMask Account (${displayAddressShort})` : 'MetaMask Wallet';
  const accountEmail = activeAddr ? `Address: ${activeAddr}` : 'Connect MetaMask extension to view EVM account ID';
  const accountId = activeAddr ? activeAddr : 'NOT CONNECTED';
  const initials = activeAddr ? '🦊' : '🦊';

  const copyId = () => {
    if (!activeAddr) {
      handleConnectMetaMask();
      return;
    }
    try {
      navigator.clipboard.writeText(activeAddr);
      setCopiedId(true);
      addNotification(`MetaMask Account Address ${activeAddr.substring(0, 10)}... copied to clipboard!`, 'info');
      setTimeout(() => setCopiedId(false), 2000);
    } catch (_) {}
  };

  const copyMetaMaskAddress = () => {
    if (!realWalletAddress) return;
    try {
      navigator.clipboard.writeText(realWalletAddress);
      setCopiedAddress(true);
      addNotification(`MetaMask address ${realWalletAddress.substring(0, 10)}... copied!`, 'info');
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (_) {}
  };

  // Dedicated 1-Click Real MetaMask Connect Handler
  const handleConnectMetaMask = async () => {
    setIsConnectingMetaMask(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          const addr = accounts[0];
          setRealWalletAddress(addr);
          
          // Get Network chainId
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          const netName = chainId === 11155111 ? 'Sepolia Testnet' : chainId === 42161 ? 'Arbitrum One' : chainId === 137 ? 'Polygon Mainnet' : chainId === 56 ? 'BNB Smart Chain' : 'Ethereum Mainnet';
          setRealWalletNetwork(netName);

          addNotification(`🦊 MetaMask Connected: ${addr.substring(0, 10)}... on ${netName}`, 'success');
        } else {
          addNotification('No accounts found in MetaMask extension.', 'warning');
        }
      } else {
        const inputAddr = window.prompt('MetaMask Extension not detected. Enter your EVM address (0x...):', '0x71C7656EC7ab88b098defB751B7401B5f6d7B41');
        if (inputAddr && inputAddr.startsWith('0x')) {
          setRealWalletAddress(inputAddr);
          addNotification(`✅ Wallet Connected: ${inputAddr.substring(0, 10)}...`, 'success');
        }
      }
    } catch (err) {
      addNotification(`MetaMask error: ${err.message}`, 'warning');
    } finally {
      setIsConnectingMetaMask(false);
    }
  };

  // Interactive Account Switcher using wallet_requestPermissions
  const handleSwitchAccount = async () => {
    setIsConnectingMetaMask(true);
    try {
      if (switchRealWalletAccount) {
        await switchRealWalletAccount();
      } else if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          setRealWalletAddress(accounts[0]);
          addNotification(`🔄 Switched to MetaMask Account: ${accounts[0].substring(0, 10)}...`, 'success');
        }
      }
    } catch (err) {
      addNotification(`Switch Account notice: ${err.message}`, 'warning');
    } finally {
      setIsConnectingMetaMask(false);
    }
  };

  // Disconnect Handler
  const handleDisconnectMetaMask = () => {
    setRealWalletAddress('');
    addNotification('MetaMask account disconnected.', 'info');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Dynamic MetaMask Trader Profile Hero Card */}
      <div className="chainblock-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-center font-extrabold font-mono text-3xl shadow-[0_0_25px_rgba(245,158,11,0.35)] shrink-0">
            🦊
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white font-sans tracking-tight">
                {realWalletAddress ? `MetaMask Account (${shortAddress(realWalletAddress)})` : 'MetaMask Web3 Account'}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase ${realWalletAddress ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                {realWalletAddress ? `${realWalletNetwork || 'Arbitrum One'} • CONNECTED 🟢` : 'METAMASK DISCONNECTED'}
              </span>
            </div>
            
            <p className="text-xs text-slate-300 font-mono mt-1 break-all">
              {realWalletAddress ? (
                <>
                  <strong className="text-amber-400">METAMASK ID:</strong> <span className="text-white font-bold">{realWalletAddress}</span>
                </>
              ) : (
                <span className="text-slate-400">No MetaMask address linked — click Connect below to import EVM account info.</span>
              )}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono">
              <span className="text-[#2dd4bf] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2dd4bf]" /> {realWalletAddress ? 'EIP-1193 SECURE PROVIDER' : 'EVM METAMASK SUPPORTED'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-white font-bold flex items-center gap-1">
                <span>ON-CHAIN BALANCE:</span>
                <span className="text-[#facc15] font-extrabold">{ethBalance} ETH</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          {realWalletAddress ? (
            <button
              onClick={copyId}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold hover:brightness-110 transition flex items-center gap-1.5 shadow"
            >
              {copiedId ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId ? 'COPIED METAMASK ID' : `COPY METAMASK ID (${shortAddress(realWalletAddress)})`}</span>
            </button>
          ) : (
            <button
              onClick={handleConnectMetaMask}
              disabled={isConnectingMetaMask}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase hover:brightness-110 transition shadow-lg flex items-center gap-1.5"
            >
              <span>🦊 CONNECT METAMASK ACCOUNT</span>
            </button>
          )}

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>

      {/* ================= DEDICATED METAMASK WEB3 INTEGRATION & ACCOUNT INFO CARD ================= */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e1626] via-[#0a0d16] to-[#04060a] border border-[#2dd4bf]/40 space-y-5 shadow-[0_0_30px_rgba(45,212,191,0.1)] font-mono text-xs">
        
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 font-extrabold text-3xl shadow-lg shrink-0">
              🦊
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white uppercase tracking-tight">METAMASK WEB3 INTEGRATION & ACCOUNT CONTROL</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]">
                  EIP-1193 DIRECT PROVIDER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full 1-Click MetaMask account connection, account switching, network delegation, and Web3 Terminal access
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await switchToEthereumMainnet();
                  setRealWalletNetwork('Ethereum Mainnet');
                  addNotification('🌐 Switched to Ethereum Mainnet!', 'success');
                } catch (err) {
                  addNotification(`Mainnet error: ${err.message}`, 'warning');
                }
              }}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs flex items-center space-x-1 transition hover:brightness-110 shadow"
            >
              <span>🌐 MAINNET</span>
            </button>

            <button
              onClick={async () => {
                try {
                  await switchToSepoliaTestnet();
                  setRealWalletNetwork('Sepolia Testnet');
                  addNotification('🧪 Switched to Sepolia Testnet!', 'success');
                } catch (err) {
                  addNotification(`Testnet error: ${err.message}`, 'warning');
                }
              }}
              className="px-3 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-xs flex items-center space-x-1 transition hover:bg-amber-500/30"
            >
              <span>🧪 TESTNET</span>
            </button>

            <button
              onClick={() => setShowNetworkModal(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-extrabold text-xs transition flex items-center space-x-1"
            >
              <span>⚙️ ALL NETWORKS</span>
            </button>

            {realWalletAddress ? (
              <button
                onClick={handleSwitchAccount}
                disabled={isConnectingMetaMask}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-extrabold text-xs flex items-center space-x-1.5 transition"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>SWITCH ACCOUNT</span>
              </button>
            ) : (
              <button
                onClick={handleConnectMetaMask}
                disabled={isConnectingMetaMask}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg flex items-center space-x-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>CONNECT METAMASK</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('metamaskterminal')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold text-xs uppercase shadow hover:brightness-110 transition flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>MetaMask Terminal</span>
            </button>
          </div>
        </div>

        {/* METAMASK CONNECTED / DISCONNECTED GRID */}
        {realWalletAddress ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Connected Address Card */}
              <div className="p-4 rounded-xl bg-[#090d16] border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>CONNECTED METAMASK ADDRESS:</span>
                  <span className="text-emerald-400 font-bold">CONNECTED 🟢</span>
                </div>

                <div className="text-xs font-bold text-white font-mono break-all flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>{realWalletAddress}</span>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={copyMetaMaskAddress}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#2dd4bf] text-[10px] font-bold border border-slate-700 flex items-center gap-1"
                  >
                    {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAddress ? 'COPIED' : 'COPY ADDRESS'}</span>
                  </button>

                  <button
                    onClick={handleSwitchAccount}
                    disabled={isConnectingMetaMask}
                    className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isConnectingMetaMask ? 'animate-spin' : ''}`} />
                    <span>SWITCH ACCOUNT</span>
                  </button>

                  <button
                    onClick={handleDisconnectMetaMask}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-[10px] font-bold border border-rose-800"
                  >
                    DISCONNECT
                  </button>
                </div>
              </div>

              {/* 2. Network & RPC Status Card */}
              <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">ACTIVE EVM DELEGATE NETWORK:</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{realWalletNetwork || 'Arbitrum One'}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500">
                    NETWORK OK 🟢
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                  <div>RPC Node: <span className="text-cyan-400 font-mono">https://arb1.arbitrum.io/rpc</span></div>
                  <div>Gas Token: <span className="text-amber-400 font-mono">{ethBalance} ETH</span></div>
                </div>
              </div>

              {/* 3. Non-Custodial Protocol Security Specs */}
              <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">EIP-1193 PROTOCOL SECURITY:</span>
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Non-Custodial Keys Protected</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                  Private keys remain 100% encrypted in your local MetaMask browser extension. Trade approvals prompt directly in your extension window.
                </p>
              </div>

            </div>
          </div>
        ) : (
          /* Disconnected State Hero Action Card */
          <div className="p-6 rounded-2xl bg-[#070a11] border border-amber-500/30 space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center text-3xl font-bold shadow-lg">
              🦊
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-white uppercase">MetaMask Wallet Disconnected</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Connect your MetaMask browser extension to enable live Web3 DEX trading, direct SepoliaETH testnet transfers, and Solidity contract deployments.
              </p>
            </div>

            <button
              onClick={handleConnectMetaMask}
              disabled={isConnectingMetaMask}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:brightness-110 transition inline-flex items-center space-x-2"
            >
              <span>🦊 CONNECT METAMASK EXTENSION NOW</span>
            </button>
          </div>
        )}

      </div>

      <NetworkSwitcherModal 
        isOpen={showNetworkModal} 
        onClose={() => setShowNetworkModal(false)} 
      />

    </div>
  );
};
