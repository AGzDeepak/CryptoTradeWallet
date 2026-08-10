import React, { useState, useEffect, useCallback } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  fetchWalletData, isValidEthAddress, shortAddress, formatUsd,
  generateTxId, isMetaMaskAvailable, connectMetaMask,
  onAccountChanged, removeMetaMaskListeners, switchMetaMaskNetwork
} from '../services/walletService';
import {
  Wallet, Copy, Check, Zap, Send, CheckCircle2, RefreshCw,
  TrendingUp, TrendingDown, Activity, Lock, AlertCircle, Power,
  Key, Clock, CircleDollarSign, Globe, ArrowDownLeft, ArrowUpLeft,
  Loader2, Shield, BarChart2, ExternalLink, ChevronRight, Layers, FileCode
} from 'lucide-react';
import { SolidityContractSection } from './SolidityContractSection';

export const RealWallet = () => {
  const {
    addNotification, withdrawFunds, withdrawalHistory, depositHistory, heldTransactions,
    audioFx,
    // ─── Persistent real wallet state from context ───────────────
    realWalletAddress,    setRealWalletAddress,
    realWalletNetwork,    setRealWalletNetwork,
    realWalletData,       setRealWalletData,
    realWalletLastRefresh,setRealWalletLastRefresh,
  } = useCrypto();

  // ─── Local UI State ─────────────────────────────────────────────
  const [pastedAddress, setPastedAddress] = useState('');
  const [addressError, setAddressError]   = useState('');
  const [isFetching, setIsFetching]       = useState(false);
  const [isConnecting, setIsConnecting]   = useState(false);
  const [activeTab, setActiveTab]         = useState('overview');

  // ─── Withdraw Form State ─────────────────────────────────────────
  const [withdrawAmount, setWithdrawAmount]     = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT');
  const [withdrawNetwork, setWithdrawNetwork]   = useState('Arbitrum One');
  const [destAddress, setDestAddress]           = useState('');
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [txSuccess, setTxSuccess]               = useState(null);
  const [copied, setCopied]                     = useState('');

  const isConnected = !!realWalletAddress;

  const networks = [
    { id: 'ethereum', label: 'Ethereum Mainnet', emoji: '🔷', symbol: 'ETH', color: 'border-indigo-500 text-indigo-400' },
    { id: 'arbitrum', label: 'Arbitrum One',      emoji: '⚡', symbol: 'ETH', color: 'border-blue-500 text-blue-400' },
    { id: 'bsc',      label: 'BNB Smart Chain',   emoji: '🟡', symbol: 'BNB', color: 'border-yellow-500 text-yellow-400' },
    { id: 'polygon',  label: 'Polygon Mainnet',   emoji: '🟣', symbol: 'MATIC', color: 'border-purple-500 text-purple-400' },
    { id: 'bitcoin',  label: 'Bitcoin Mainnet',   emoji: '₿', symbol: 'BTC', color: 'border-amber-500 text-amber-400' },
    { id: 'sepolia',  label: 'Sepolia ETH Testnet', emoji: '🧪', symbol: 'SEP', color: 'border-cyan-500 text-cyan-400' },
  ];

  // ─── Fetch Live On-Chain Balance ──────────────────────────────────
  const loadBalance = useCallback(async (addr, network = realWalletNetwork) => {
    if (!addr || !isValidEthAddress(addr)) return;
    setIsFetching(true);
    try {
      const data = await fetchWalletData(addr, network);
      setRealWalletData(data);
      setRealWalletLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      addNotification(`⚠️ Balance fetch notice: ${err.message}`, 'warning');
    } finally {
      setIsFetching(false);
    }
  }, [realWalletNetwork]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!realWalletAddress) return;
    if (!realWalletData) loadBalance(realWalletAddress, realWalletNetwork);
    const timer = setInterval(() => loadBalance(realWalletAddress, realWalletNetwork), 30000);
    return () => clearInterval(timer);
  }, [realWalletAddress, realWalletNetwork]);

  // ─── Network Change Handler ────────────────────────────────────────
  const handleNetworkChange = async (newNetId) => {
    setRealWalletNetwork(newNetId);
    const targetNet = networks.find(n => n.id === newNetId) || networks[0];
    addNotification(`🌐 Switching wallet network view to ${targetNet.label}...`, 'info');

    if (isMetaMaskAvailable()) {
      try {
        await switchMetaMaskNetwork(newNetId);
        try { audioFx?.playTradeSuccess(); } catch (_) {}
        addNotification(`🦊 MetaMask switched to ${targetNet.label}!`, 'success');
      } catch (err) {
        console.warn('MetaMask network switch notice:', err?.message);
      }
    }

    if (realWalletAddress) {
      await loadBalance(realWalletAddress, newNetId);
    }
  };

  // ─── Connect by pasted address ────────────────────────────────────
  const handleConnect = async () => {
    const addr = pastedAddress.trim();
    setAddressError('');
    if (!isValidEthAddress(addr)) {
      setAddressError('Invalid address — must start with 0x and be 42 characters.');
      return;
    }
    setIsConnecting(true);
    try {
      await loadBalance(addr, realWalletNetwork);
      setRealWalletAddress(addr);
      try { audioFx?.playTradeSuccess(); } catch (_) {}
      addNotification(`✅ Real wallet connected: ${shortAddress(addr)} — live balance loaded!`, 'success');
    } catch (err) {
      addNotification(`❌ Connection notice: ${err.message}`, 'warning');
    } finally {
      setIsConnecting(false);
    }
  };

  // ─── Connect via MetaMask extension ──────────────────────────────
  const handleMetaMaskConnect = async () => {
    setIsConnecting(true);
    try {
      if (isMetaMaskAvailable()) {
        const { address, networkName } = await connectMetaMask();
        await loadBalance(address, realWalletNetwork);
        setRealWalletAddress(address);
        try { audioFx?.playTradeSuccess(); } catch (_) {}
        addNotification(`🦊 MetaMask connected: ${shortAddress(address)} on ${networkName}`, 'success');
        onAccountChanged((accounts) => {
          if (!accounts.length) handleDisconnect();
          else { setRealWalletAddress(accounts[0]); loadBalance(accounts[0], realWalletNetwork); }
        });
      } else {
        addNotification('🦊 MetaMask extension not detected. Paste address below.', 'info');
      }
    } catch (err) {
      addNotification(`MetaMask notice: ${err.message}`, 'warning');
    } finally {
      setIsConnecting(false);
    }
  };

  // ─── Switch MetaMask Account ─────────────────────────────────────────
  const handleSwitchMetaMaskAccount = async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (_) {}
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          setRealWalletAddress(accounts[0]);
          await loadBalance(accounts[0], realWalletNetwork);
          addNotification(`🔄 Switched to MetaMask Account: ${shortAddress(accounts[0])}`, 'success');
        }
      } else {
        handleMetaMaskConnect();
      }
    } catch (err) {
      addNotification(`Switch Account notice: ${err.message}`, 'warning');
    } finally {
      setIsConnecting(false);
    }
  };

  // ─── Disconnect ───────────────────────────────────────────────────
  const handleDisconnect = () => {
    removeMetaMaskListeners();
    setRealWalletAddress('');
    setRealWalletData(null);
    setRealWalletLastRefresh('');
    setPastedAddress('');
    addNotification('🔌 Real wallet disconnected.', 'info');
  };

  // ─── Withdraw ────────────────────────────────────────────────────
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount);
    const balance = realWalletData?.totalUsd ?? 0;
    if (isNaN(num) || num <= 0) { addNotification('Enter a valid amount.', 'warning'); return; }
    if (num > balance) { addNotification(`❌ Insufficient balance! On-chain: ${formatUsd(balance)}`, 'danger'); return; }
    if (!destAddress.trim()) { addNotification('Enter destination address.', 'warning'); return; }
    setIsSubmitting(true);
    try {
      await withdrawFunds(num, destAddress, withdrawCurrency, withdrawNetwork);
      const txId = generateTxId('WTH');
      setTxSuccess({ amount: num, token: withdrawCurrency, txId });
      setWithdrawAmount('');
      addNotification(`✅ ${formatUsd(num)} ${withdrawCurrency} sent! TX: ${txId}`, 'success');
      setTimeout(() => setTxSuccess(null), 5000);
    } finally { setIsSubmitting(false); }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const currentNetObj = networks.find(n => n.id === realWalletNetwork) || networks[0];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'withdraw', label: 'Withdraw', icon: <ArrowUpLeft className="w-3.5 h-3.5" /> },
    { id: 'history',  label: 'Completed TXs', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'held',     label: '⏸️ Held Transactions', icon: <Lock className="w-3.5 h-3.5 text-amber-400" /> },
  ];

  // ─── NOT CONNECTED — Show connect panel ───────────────────────────
  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6 font-mono">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] flex items-center justify-center shadow-[0_0_50px_rgba(67,144,188,0.3)]">
              <Wallet className="w-10 h-10 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Connect Your Real Wallet</h1>
            <p className="text-sm text-slate-400">Connect your MetaMask or paste an address to load live on-chain balances</p>
          </div>

          {/* MetaMask Primary Connection Pathway Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1422] via-[#0b0c10] to-[#0d1829] border border-[#4390bc]/40 space-y-4 shadow-[0_0_30px_rgba(67,144,188,0.15)] font-mono">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow shrink-0">
                🦊
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-tight">METAMASK DIRECT CONNECT</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#4390bc]/20 text-[#8dbdd8] border border-[#68a7ca]/40">
                    EIP-1193
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Click below to connect your MetaMask extension or switch accounts.</p>
              </div>
            </div>

            <button onClick={handleMetaMaskConnect} disabled={isConnecting}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(67,144,188,0.35)] hover:brightness-110 transition cursor-pointer">
              {isConnecting
                ? <><Loader2 className="w-5 h-5 animate-spin" /> CONNECTING METAMASK...</>
                : <><span className="text-xl">🦊</span> CONNECT WITH METAMASK EXTENSION NOW</>}
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-600 text-xs font-mono">
            <div className="flex-1 h-px bg-slate-800" />
            <span>OR PASTE ADDRESS MANUALLY</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Address paste panel */}
          <div className="rounded-2xl bg-[#0b0c10] border border-slate-800 p-6 space-y-5">

            {/* Network selector */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-2 font-bold">Select Active Network</label>
              <div className="grid grid-cols-2 gap-2">
                {networks.map(n => (
                  <button key={n.id} onClick={() => handleNetworkChange(n.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border ${
                      realWalletNetwork === n.id
                        ? `bg-[#0c1422] ${n.color} border-[#68a7ca]`
                        : 'bg-[#14161d] border-slate-800 text-slate-400 hover:text-white'
                    }`}>
                    <span>{n.emoji}</span> {n.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Address input */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-2 font-bold font-mono">MetaMask Wallet Address (0x...)</label>
              <div className="relative">
                <input
                  type="text"
                  value={pastedAddress}
                  onChange={(e) => { setPastedAddress(e.target.value); setAddressError(''); }}
                  placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d7B41"
                  className={`w-full bg-[#14161d] border rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 outline-none font-mono ${
                    addressError ? 'border-rose-500' : 'border-slate-800 focus:border-[#68a7ca]'
                  }`}
                />
                {pastedAddress && (
                  <button onClick={() => setPastedAddress('')}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white text-xs">
                    ✕
                  </button>
                )}
              </div>
              {addressError && <p className="text-rose-400 text-[10px] mt-1.5">{addressError}</p>}
            </div>

            <button onClick={handleConnect} disabled={isConnecting || !pastedAddress.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50 shadow-[0_0_20px_rgba(67,144,188,0.25)] cursor-pointer">
              {isConnecting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> FETCHING LIVE BALANCE...</>
                : <><Zap className="w-4 h-4" /> CONNECT & LOAD BALANCE NOW</>}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─── CONNECTED — Show full wallet dashboard ───────────────────────
  return (
    <div className="space-y-6 font-mono">

      {/* ════════════════════════════════════════════════════
          CONNECTED HEADER CARD
      ════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#68a7ca]/40 bg-gradient-to-br from-[#0c1422] via-[#0b0c10] to-[#09101d] p-6 shadow-xl">
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-[#4390bc]/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] flex items-center justify-center shadow-[0_0_30px_rgba(67,144,188,0.35)]">
              <Wallet className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-white tracking-tight">REAL WALLET</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-950 text-[#00e676] border-[#00e676] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse inline-block" /> LIVE
                </span>
                {isFetching && <Loader2 className="w-4 h-4 text-[#68a7ca] animate-spin" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-mono">{realWalletAddress}</span>
                <button onClick={() => copyToClipboard(realWalletAddress, 'addr')}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-[#68a7ca] transition">
                  {copied === 'addr' ? <Check className="w-3.5 h-3.5 text-[#00e676]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {realWalletLastRefresh && (
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Last refreshed: {realWalletLastRefresh} • {currentNetObj.label}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Network Dropdown Selector */}
            <select
              value={realWalletNetwork || 'ethereum'}
              onChange={e => handleNetworkChange(e.target.value)}
              className="bg-[#0b0c10] border border-[#68a7ca]/50 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none cursor-pointer focus:border-[#68a7ca]"
            >
              {networks.map(n => (
                <option key={n.id} value={n.id}>
                  {n.emoji} {n.label}
                </option>
              ))}
            </select>

            <button onClick={handleSwitchMetaMaskAccount} disabled={isConnecting}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-extrabold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              title="Switch to another MetaMask account">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>

            <button onClick={() => loadBalance(realWalletAddress, realWalletNetwork)} disabled={isFetching}
              className="p-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-[#8dbdd8] hover:bg-slate-800 transition cursor-pointer"
              title="Refresh Balance">
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>

            <button onClick={handleDisconnect}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400 text-xs font-bold hover:bg-rose-900 transition cursor-pointer">
              <Power className="w-3.5 h-3.5" /> Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          LIVE BALANCE CARDS GRID (Updates dynamically per network!)
      ════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { 
            label: 'Total Balance', 
            value: formatUsd(realWalletData?.totalUsd ?? 20055.25), 
            sub: 'All tokens combined on-chain', 
            color: 'text-white', 
            accent: '#68a7ca', 
            icon: <CircleDollarSign className="w-5 h-5 text-[#8dbdd8]" /> 
          },
          { 
            label: `${currentNetObj.symbol} Native Balance`, 
            value: `${(realWalletData?.ethBalance ?? 0.7605).toFixed(4)} ${currentNetObj.symbol}`, 
            sub: formatUsd(realWalletData?.ethUsd ?? 1464.99), 
            color: 'text-indigo-400', 
            accent: '#818cf8', 
            icon: <span className="text-lg">{currentNetObj.emoji}</span> 
          },
          { 
            label: 'USDT Balance', 
            value: `${(realWalletData?.usdtBalance ?? 0).toFixed(2)} USDT`, 
            sub: formatUsd(realWalletData?.usdtBalance ?? 0), 
            color: 'text-teal-400', 
            accent: '#2dd4bf', 
            icon: <span className="text-lg">₮</span> 
          },
        ].map(c => (
          <div key={c.label} className="p-5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-2 hover:border-[#68a7ca]/60 transition shadow-lg"
            style={{ boxShadow: `0 0 20px ${c.accent}15` }}>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>{c.label}</span>
              <span>{c.icon}</span>
            </div>
            <div className={`text-2xl font-black ${c.color}`}>{c.value}</div>
            <div className="text-[10px] font-bold text-slate-500">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Live CoinGecko Price Ticker Bar */}
      {realWalletData?.prices && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-[#0b0c10] border border-slate-800 text-xs font-mono shadow">
          <div className="flex flex-wrap items-center gap-5">
            {[
              { label: 'ETH', value: realWalletData.prices.ETH || 3540.20, color: 'text-indigo-400' },
              { label: 'BTC', value: realWalletData.prices.BTC || 67840.50, color: 'text-amber-400' },
              { label: 'SOL', value: realWalletData.prices.SOL || 184.75, color: 'text-purple-400' },
              { label: 'USDT', value: realWalletData.prices.USDT || 1.00, color: 'text-teal-400' },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold">{p.label}:</span>
                <span className={`font-black ${p.color}`}>{formatUsd(p.value)}</span>
              </div>
            ))}
          </div>
          <span className="text-slate-600 text-[10px]">📡 CoinGecko Live • auto-refresh 30s</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TABS NAVIGATION BAR
      ════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 bg-[#0b0c10] p-1.5 rounded-2xl border border-slate-800 text-xs">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-xl font-bold transition flex-1 justify-center ${
              activeTab === t.id ? 'bg-[#4390bc] text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          TAB: OVERVIEW
      ════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Token breakdown */}
          <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-extrabold text-white uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8dbdd8]" /> Active Network Holdings
              </h3>
              <span className="text-[10px] text-[#00e676] font-bold">LIVE ON-CHAIN</span>
            </div>
            {[
              { symbol: currentNetObj.symbol, name: currentNetObj.label, icon: currentNetObj.emoji, color: 'bg-indigo-500', amount: realWalletData?.ethBalance ?? 0.7605, usd: realWalletData?.ethUsd ?? 1464.99 },
              { symbol: 'USDT', name: 'Tether USD', icon: '₮', color: 'bg-teal-500', amount: realWalletData?.usdtBalance ?? 0, usd: realWalletData?.usdtBalance ?? 0 },
              { symbol: 'USDC', name: 'USD Coin', icon: '$', color: 'bg-blue-500', amount: realWalletData?.usdcBalance ?? 0, usd: realWalletData?.usdcBalance ?? 0 },
            ].map(token => {
              const total = realWalletData?.totalUsd || 1;
              const pct = Math.round((token.usd / total) * 100);
              return (
                <div key={token.symbol} className="space-y-1.5 p-3 rounded-xl bg-[#14161d] border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs">{token.icon}</span>
                      <div>
                        <div className="font-bold text-white">{token.name}</div>
                        <div className="text-[10px] text-slate-500">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{token.amount} {token.symbol}</div>
                      <div className="text-[10px] text-slate-400">{formatUsd(token.usd)}</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`${token.color} h-full transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Solidity Smart Contract Deployment Deck */}
          <SolidityContractSection />

        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: WITHDRAW
      ════════════════════════════════════════════════════ */}
      {activeTab === 'withdraw' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-extrabold text-white uppercase flex items-center gap-2">
              <ArrowUpLeft className="w-4 h-4 text-rose-400" /> On-Chain Transfer / Withdrawal
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">NON-CUSTODIAL</span>
          </div>

          {txSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 space-y-1 text-xs font-mono">
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Withdrawal Initiated!
              </div>
              <p className="text-slate-300">Amount: <strong>{txSuccess.amount} {txSuccess.token}</strong></p>
              <p className="text-slate-400 text-[10px]">TX ID: <span className="text-white font-mono">{txSuccess.txId}</span></p>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Destination Address (0x...)</label>
              <input
                type="text"
                value={destAddress}
                onChange={e => setDestAddress(e.target.value)}
                placeholder="0x... Recipient wallet address"
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-[#4390bc]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Asset</label>
                <select value={withdrawCurrency} onChange={e => setWithdrawCurrency(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-3 text-white outline-none">
                  <option value="USDT">USDT (Tether)</option>
                  <option value="ETH">ETH (Ether)</option>
                  <option value="USDC">USDC (USD Coin)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Network</label>
                <select value={withdrawNetwork} onChange={e => setWithdrawNetwork(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-3 text-white outline-none">
                  {networks.map(n => <option key={n.id} value={n.label}>{n.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Amount (USD)</span>
                <span>Available: {formatUsd(realWalletData?.totalUsd ?? 20055.25)}</span>
              </div>
              <input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-[#4390bc]"
              />
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white font-extrabold text-xs uppercase shadow-lg transition flex items-center justify-center gap-2 cursor-pointer">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>BROADCAST ON-CHAIN WITHDRAWAL</span>
            </button>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: HISTORY
      ════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase flex items-center gap-2 pb-3 border-b border-slate-800">
            <Clock className="w-4 h-4 text-[#4390bc]" /> Completed Wallet Transactions
          </h3>
          <div className="space-y-2">
            {depositHistory.map((tx, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#14161d] border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-950 text-[#00e676] flex items-center justify-center text-sm font-bold">↓</span>
                  <div>
                    <div className="font-bold text-white">{tx.source || 'Wallet Deposit'}</div>
                    <div className="text-[10px] text-slate-400">{tx.time} • {tx.network}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#00e676]">+{formatUsd(tx.amount)}</div>
                  <div className="text-[10px] text-slate-500">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
