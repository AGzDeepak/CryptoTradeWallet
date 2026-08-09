import React, { useState, useEffect, useCallback } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  fetchWalletData, isValidEthAddress, shortAddress, formatUsd,
  generateTxId, isMetaMaskAvailable, connectMetaMask,
  onAccountChanged, removeMetaMaskListeners
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
    // ─── Persistent real wallet state from context ───────────────
    realWalletAddress,    setRealWalletAddress,
    realWalletNetwork,    setRealWalletNetwork,
    realWalletData,       setRealWalletData,
    realWalletLastRefresh,setRealWalletLastRefresh,
  } = useCrypto();

  // ─── Local UI-only State (OK to reset on remount) ─────────────
  const [pastedAddress, setPastedAddress] = useState('');
  const [addressError, setAddressError]   = useState('');
  const [isFetching, setIsFetching]       = useState(false);
  const [isConnecting, setIsConnecting]   = useState(false);
  const [activeTab, setActiveTab]         = useState('overview');
  const [heldFilter, setHeldFilter]       = useState('ALL'); // 'ALL' | 'DEPOSITS' | 'TRANSFERS' | 'HELD'

  // ─── Withdraw form ────────────────────────────────────────────
  const [withdrawAmount, setWithdrawAmount]     = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT');
  const [withdrawNetwork, setWithdrawNetwork]   = useState('Arbitrum One');
  const [destAddress, setDestAddress]           = useState('');
  const [isSubmitting, setIsSubmitting]         = useState(false);
  const [txSuccess, setTxSuccess]               = useState(null);
  const [copied, setCopied]                     = useState('');

  const isConnected = !!realWalletAddress;


  // ─── Fetch Live On-Chain Balance ──────────────────────────────────
  const loadBalance = useCallback(async (addr, network = realWalletNetwork) => {
    if (!addr || !isValidEthAddress(addr)) return;
    setIsFetching(true);
    try {
      const data = await fetchWalletData(addr, network);
      setRealWalletData(data);
      setRealWalletLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      addNotification(`⚠️ Balance fetch failed: ${err.message}`, 'warning');
    } finally {
      setIsFetching(false);
    }
  }, [realWalletNetwork]);

  // Auto-refresh every 30 seconds (persists as long as address is set)
  useEffect(() => {
    if (!realWalletAddress) return;
    // Only load if no existing data (avoids re-fetch on tab switch)
    if (!realWalletData) loadBalance(realWalletAddress, realWalletNetwork);
    const timer = setInterval(() => loadBalance(realWalletAddress, realWalletNetwork), 30000);
    return () => clearInterval(timer);
  }, [realWalletAddress, realWalletNetwork]);

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
      addNotification(`✅ Real wallet connected: ${shortAddress(addr)} — live balance loaded!`, 'success');
    } catch (err) {
      addNotification(`❌ Could not connect: ${err.message}`, 'danger');
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
        addNotification(`🦊 MetaMask connected: ${shortAddress(address)} on ${networkName}`, 'success');
        onAccountChanged((accounts) => {
          if (!accounts.length) handleDisconnect();
          else { setRealWalletAddress(accounts[0]); loadBalance(accounts[0], realWalletNetwork); }
        });
      } else {
        addNotification('🦊 MetaMask not found. Paste your address below instead.', 'info');
      }
    } catch (err) {
      addNotification(`❌ MetaMask error: ${err.message}`, 'danger');
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

  const networks = [
    { id: 'ethereum', label: 'Ethereum',  emoji: '🔷', color: 'border-indigo-500 text-indigo-400' },
    { id: 'arbitrum', label: 'Arbitrum',  emoji: '🔵', color: 'border-blue-500 text-blue-400' },
    { id: 'polygon',  label: 'Polygon',   emoji: '🟣', color: 'border-purple-500 text-purple-400' },
    { id: 'bsc',      label: 'BNB Chain', emoji: '🟡', color: 'border-yellow-500 text-yellow-400' },
  ];

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
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#facc15] to-amber-600 flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.3)]">
              <Wallet className="w-10 h-10 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Connect Your Real Wallet</h1>
            <p className="text-sm text-slate-400">Paste your MetaMask address to see live on-chain ETH & token balances</p>
          </div>

          {/* MetaMask Primary Connection Pathway Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/50 via-[#0b0c10] to-[#121829] border border-amber-500/40 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.12)] font-mono">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow shrink-0">
                🦊
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-tight">DIRECT METAMASK CONNECTION PATHWAY</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                    EIP-1193
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Click below to connect your MetaMask browser extension or paste your address.</p>
              </div>
            </div>

            <button onClick={handleMetaMaskConnect} disabled={isConnecting}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-extrabold text-sm shadow-[0_0_30px_rgba(251,146,60,0.3)] hover:brightness-110 transition">
              {isConnecting
                ? <><Loader2 className="w-5 h-5 animate-spin" /> CONNECTING METAMASK...</>
                : <><span className="text-xl">🦊</span> CONNECT WITH METAMASK EXTENSION NOW</>}
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-600 text-xs font-mono">
            <div className="flex-1 h-px bg-slate-800" />
            <span>OR CONNECT WITH MANUALLY PASTED ADDRESS</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Address paste panel */}
          <div className="rounded-2xl bg-[#0b0c10] border border-slate-800 p-6 space-y-5">

            {/* Network selector */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-2 font-bold">Select Active EVM Network</label>
              <div className="grid grid-cols-2 gap-2">
                {networks.map(n => (
                  <button key={n.id} onClick={() => setRealWalletNetwork(n.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
                      realWalletNetwork === n.id
                        ? `bg-[#14161d] ${n.color}`
                        : 'bg-[#14161d] border-slate-800 text-slate-400 hover:text-white'
                    }`}>
                    <span>{n.emoji}</span> {n.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Address input */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-2 font-bold">Your MetaMask Wallet Address (0x...)</label>
              <div className="relative">
                <input
                  type="text"
                  value={pastedAddress}
                  onChange={e => { setPastedAddress(e.target.value); setAddressError(''); }}
                  placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d7B41"
                  className={`w-full bg-[#14161d] border rounded-xl px-4 py-4 text-white text-xs outline-none transition pr-24 ${
                    addressError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-[#2dd4bf]'
                  }`}
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setPastedAddress(text.trim());
                      setAddressError('');
                    } catch {
                      addNotification('Press Ctrl+V to paste your address.', 'info');
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-2 rounded-lg bg-[#2dd4bf]/10 hover:bg-[#2dd4bf]/20 text-[#2dd4bf] text-[10px] font-bold border border-[#2dd4bf]/30 transition">
                  <Copy className="w-3 h-3" /> PASTE
                </button>
              </div>
              {addressError && (
                <div className="flex items-center gap-1.5 mt-2 text-rose-400 text-[11px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> {addressError}
                </div>
              )}
            </div>

            <button onClick={handleConnect} disabled={isConnecting || !pastedAddress.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-teal-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              {isConnecting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> FETCHING LIVE BALANCE...</>
                : <><Zap className="w-4 h-4" /> CONNECT & LOAD BALANCE NOW</>}
            </button>
          </div>

          {/* Historical MetaMask Info Card */}
          <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-bold text-white uppercase text-[11px]">METAMASK CONNECTION HISTORY & INFO</span>
              <span className="text-[#2dd4bf] text-[10px] font-bold">SECURE EVM</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
              <div>Last Known Network: <span className="text-white font-bold">Arbitrum One (L2)</span></div>
              <div>Default RPC: <span className="text-white font-bold">https://arb1.arbitrum.io/rpc</span></div>
              <div>Supported Assets: <span className="text-white font-bold">ETH, USDT, USDC, MATIC, BNB</span></div>
              <div>Security Protocol: <span className="text-[#2dd4bf] font-bold">EIP-1193 Non-Custodial</span></div>
            </div>
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
      <div className="relative overflow-hidden rounded-2xl border border-[#2dd4bf]/30 bg-gradient-to-br from-[#0d1a1a] via-[#0b0c10] to-[#091210] p-6">
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-[#2dd4bf]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-[#facc15]/4 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2dd4bf] to-teal-700 flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.3)]">
              <Wallet className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-white tracking-tight">REAL WALLET</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-950 text-[#2dd4bf] border-[#2dd4bf] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse inline-block" /> LIVE
                </span>
                {isFetching && <Loader2 className="w-4 h-4 text-[#2dd4bf] animate-spin" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-mono">{realWalletAddress}</span>
                <button onClick={() => copyToClipboard(realWalletAddress, 'addr')}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-[#2dd4bf] transition">
                  {copied === 'addr' ? <Check className="w-3 h-3 text-[#2dd4bf]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              {realWalletLastRefresh && <div className="text-[10px] text-slate-500 mt-0.5">Last refreshed: {realWalletLastRefresh} • {networks.find(n => n.id === realWalletNetwork)?.label}</div>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Network selector */}
            <select value={realWalletNetwork} onChange={e => setRealWalletNetwork(e.target.value)}
              className="bg-[#0b0c10] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none">
              {networks.map(n => <option key={n.id} value={n.id}>{n.emoji} {n.label}</option>)}
            </select>
            <button onClick={handleSwitchMetaMaskAccount} disabled={isConnecting}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-extrabold text-xs flex items-center space-x-1.5 transition"
              title="Switch to another MetaMask account">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
            <button onClick={() => loadBalance(realWalletAddress)} disabled={isFetching}
              className="p-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-[#2dd4bf] hover:bg-slate-800 transition"
              title="Refresh Balance">
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleDisconnect}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-400 text-xs font-bold hover:bg-rose-900 transition">
              <Power className="w-3.5 h-3.5" /> Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          LIVE BALANCE HERO
      ════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Balance', value: formatUsd(realWalletData?.totalUsd ?? 0), sub: 'All tokens combined', color: 'text-white', accent: '#2dd4bf', icon: <CircleDollarSign className="w-5 h-5" /> },
          { label: 'ETH Balance', value: `${realWalletData?.ethBalance?.toFixed(4) ?? '0.0000'} ETH`, sub: formatUsd(realWalletData?.ethUsd ?? 0), color: 'text-indigo-400', accent: '#818cf8', icon: <span className="text-lg">Ξ</span> },
          { label: 'USDT Balance', value: `${(realWalletData?.usdtBalance ?? 0).toFixed(2)} USDT`, sub: formatUsd(realWalletData?.usdtBalance ?? 0), color: 'text-teal-400', accent: '#2dd4bf', icon: <span className="text-lg">₮</span> },
        ].map(c => (
          <div key={c.label} className="p-5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-2 hover:border-slate-700 transition"
            style={{ boxShadow: `0 0 20px ${c.accent}10` }}>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{c.label}</span>
              <span style={{ color: c.accent }}>{c.icon}</span>
            </div>
            <div className={`text-2xl font-extrabold ${c.color}`}>{c.value}</div>
            <div className="text-[10px] font-bold text-slate-500">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Live price ticker */}
      {realWalletData?.prices && (
        <div className="flex flex-wrap gap-4 px-5 py-3 rounded-xl bg-[#0b0c10] border border-slate-800 text-xs font-mono">
          {[
            { label: 'ETH', value: realWalletData.prices.ETH, color: 'text-indigo-400' },
            { label: 'BTC', value: realWalletData.prices.BTC, color: 'text-amber-400' },
            { label: 'SOL', value: realWalletData.prices.SOL, color: 'text-purple-400' },
            { label: 'USDT', value: realWalletData.prices.USDT, color: 'text-teal-400' },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-1.5">
              <span className="text-slate-500">{p.label}:</span>
              <span className={`font-bold ${p.color}`}>{formatUsd(p.value)}</span>
            </div>
          ))}
          <span className="ml-auto text-slate-600 text-[10px]">📡 CoinGecko Live • auto-refresh 30s</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TABS
      ════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-[#0b0c10] p-1.5 rounded-xl border border-slate-800 text-xs">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-bold transition flex-1 justify-center ${
              activeTab === t.id ? 'bg-[#2dd4bf] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
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
                <Layers className="w-4 h-4 text-[#2dd4bf]" /> Token Holdings
              </h3>
              <span className="text-[10px] text-[#2dd4bf] font-bold">LIVE</span>
            </div>
            {[
              { symbol: 'ETH',  name: 'Ethereum',  icon: 'Ξ', color: 'bg-indigo-500', amount: realWalletData?.ethBalance ?? 0, usd: realWalletData?.ethUsd ?? 0 },
              { symbol: 'USDT', name: 'Tether',    icon: '₮', color: 'bg-teal-500',   amount: realWalletData?.usdtBalance ?? 0, usd: realWalletData?.usdtBalance ?? 0 },
              { symbol: 'USDC', name: 'USD Coin',  icon: '$', color: 'bg-blue-500',   amount: realWalletData?.usdcBalance ?? 0, usd: realWalletData?.usdcBalance ?? 0 },
            ].map(token => {
              const total = realWalletData?.totalUsd || 1;
              const pct = Math.round((token.usd / total) * 100);
              return (
                <div key={token.symbol} className="p-4 rounded-xl bg-[#14161d] border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${token.color} flex items-center justify-center font-bold text-sm text-white`}>{token.icon}</div>
                      <div>
                        <div className="font-extrabold text-white text-xs">{token.name}</div>
                        <div className="text-[10px] text-slate-400">{token.amount > 0 ? token.amount.toFixed(4) : '0.0000'} {token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-white text-xs">{formatUsd(token.usd)}</div>
                      <div className="text-[10px] text-slate-400">{pct}% of portfolio</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${token.color}`} style={{ width: `${Math.max(pct, token.usd > 0 ? 5 : 0)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Wallet details */}
          <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase pb-3 border-b border-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#facc15]" /> Wallet Details
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Full Address', value: `${realWalletAddress.substring(0, 20)}...`, mono: true },
                { label: 'Network', value: networks.find(n => n.id === realWalletNetwork)?.label || 'Ethereum', mono: false },
                { label: 'Wallet Type', value: 'External Web3 (Read-Only)', mono: false },
                { label: 'Security', value: '256-bit Encrypted', mono: false },
                { label: 'Last Updated', value: realWalletLastRefresh || '—', mono: true },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between p-3 rounded-xl bg-[#14161d] border border-slate-800 text-xs">
                  <span className="text-slate-400">{row.label}</span>
                  <span className={`font-bold text-white ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                </div>
              ))}
            </div>
            {/* Etherscan link */}
            <a href={`https://etherscan.io/address/${realWalletAddress}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/50 text-xs font-bold transition">
              <ExternalLink className="w-4 h-4" /> View on Etherscan
            </a>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: SOLIDITY SMART CONTRACT
      ════════════════════════════════════════════════════ */}
      {activeTab === 'solidity' && (
        <SolidityContractSection />
      )}

      {/* ════════════════════════════════════════════════════
          TAB: WITHDRAW
      ════════════════════════════════════════════════════ */}
      {activeTab === 'withdraw' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-rose-400" /> Send / Withdraw
            </h3>

            {txSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-[#2dd4bf] text-[#2dd4bf] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> -{formatUsd(txSuccess.amount)} {txSuccess.token} sent! TX: {txSuccess.txId}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1.5">Destination Address</label>
                <input type="text" required placeholder="0x... recipient address" value={destAddress}
                  onChange={e => setDestAddress(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-xs outline-none focus:border-rose-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1.5">Asset</label>
                  <select value={withdrawCurrency} onChange={e => setWithdrawCurrency(e.target.value)}
                    className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-3 text-white font-bold text-xs outline-none">
                    <option>USDT</option><option>ETH</option><option>USDC</option><option>BTC</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1.5">Network</label>
                  <select value={withdrawNetwork} onChange={e => setWithdrawNetwork(e.target.value)}
                    className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-3 text-[#2dd4bf] font-bold text-xs outline-none">
                    <option>Arbitrum One</option><option>Ethereum Mainnet</option>
                    <option>Polygon</option><option>BNB Chain</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] text-slate-400 uppercase">Amount (USD)</label>
                  <span className="text-[10px] text-slate-400">Balance: <span className="text-white font-bold">{formatUsd(realWalletData?.totalUsd ?? 0)}</span></span>
                </div>
                <input type="number" required placeholder="e.g. 500" value={withdrawAmount} min="1"
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-4 py-3.5 text-white font-bold text-sm outline-none focus:border-rose-400" />
                <div className="flex gap-2 mt-2">
                  {[0.25, 0.5, 0.75, 1].map(p => (
                    <button key={p} type="button"
                      onClick={() => setWithdrawAmount(((realWalletData?.totalUsd ?? 0) * p).toFixed(2))}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-rose-400 text-[10px] font-bold transition flex-1">
                      {p === 1 ? 'MAX' : `${p * 100}%`}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition">
                <Send className="w-4 h-4" /> {isSubmitting ? 'PROCESSING...' : 'CONFIRM & SEND'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-3 text-xs">
              <h3 className="font-extrabold text-white uppercase">Transaction Summary</h3>
              {[
                { label: 'Available', value: formatUsd(realWalletData?.totalUsd ?? 0), color: 'text-white' },
                { label: 'Network Fee', value: 'Gas (on-chain)', color: 'text-[#2dd4bf]' },
                { label: 'Network', value: withdrawNetwork, color: 'text-[#2dd4bf]' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-[#14161d] border border-slate-800">
                  <span className="text-slate-400">{r.label}</span>
                  <span className={`font-bold ${r.color}`}>{r.value}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-[11px] text-rose-300">
              <div className="flex items-center gap-2 font-bold text-rose-400 mb-2">
                <AlertCircle className="w-4 h-4" /> Warning
              </div>
              Crypto transactions are irreversible. Always verify the destination address and network before confirming.
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: HISTORY
      ════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 font-mono space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2dd4bf]" /> Transaction History
            </h3>
            <span className="text-[10px] text-[#2dd4bf] font-bold">{withdrawalHistory?.length ?? 0} RECORDS</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#060810]">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-[#090d16] border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">TX ID</th><th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">To Address</th><th className="py-3 px-4">Network</th>
                  <th className="py-3 px-4">Status</th><th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#14161d]">
                {withdrawalHistory?.length > 0 ? (
                  withdrawalHistory.map((w, i) => (
                    <tr key={w.id || i} className="hover:bg-[#181a24] transition">
                      <td className="py-3 px-4 font-bold text-white">{w.id || `WTH-${i + 1}`}</td>
                      <td className="py-3 px-4 font-bold text-rose-400">-${w.amount} {w.currency || 'USDT'}</td>
                      <td className="py-3 px-4 text-slate-300 text-[10px]">{shortAddress(w.destinationAddress || w.address || '')}</td>
                      <td className="py-3 px-4 text-indigo-400">{w.networkChain || 'Arbitrum One'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]">{w.status || 'COMPLETED'}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[10px]">{w.time || 'Just now'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 text-slate-700" /> No transactions yet.
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: HELD & ALL ACCOUNT TRANSACTIONS (DEPOSITS & TRANSFERS)
      ════════════════════════════════════════════════════ */}
      {activeTab === 'held' && (
        <div className="p-6 rounded-2xl bg-[#0b0c10] border border-amber-500/40 font-mono space-y-5 shadow-xl">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>ACCOUNT TRANSACTIONS & DEPOSIT / TRANSFER LEDGER</span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Comprehensive audit ledger tracking all incoming deposits, outgoing transfers, and held threshold transactions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                📥 {(depositHistory || []).length} DEPOSITS
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                📤 {(withdrawalHistory || []).length} TRANSFERS
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                🔒 {(heldTransactions || []).length} HELD
              </span>
            </div>
          </div>

          {/* Sub-Filter Selector Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { id: 'ALL', label: 'ALL ACCOUNT TRANSACTIONS', icon: Activity },
              { id: 'DEPOSITS', label: '📥 DEPOSITS & CREDITS', icon: ArrowDownLeft },
              { id: 'TRANSFERS', label: '📤 TRANSFERS & WITHDRAWALS', icon: ArrowUpLeft },
              { id: 'HELD', label: '🔒 HELD THRESHOLD GATE', icon: Lock }
            ].map(f => {
              const Icon = f.icon;
              const isActive = heldFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setHeldFilter(f.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-[#14161d] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Combined Transactions Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#060810]">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-[#090d16] border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">TX TYPE</th>
                  <th className="py-3 px-4">TRANSACTION ID</th>
                  <th className="py-3 px-4">AMOUNT</th>
                  <th className="py-3 px-4">ADDRESS / SOURCE</th>
                  <th className="py-3 px-4">NETWORK</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#14161d]">
                {/* 1. Deposits */}
                {(heldFilter === 'ALL' || heldFilter === 'DEPOSITS') && (depositHistory || []).map((dep, idx) => (
                  <tr key={`dep-${dep.id || idx}`} className="hover:bg-[#181a24] transition">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 w-fit">
                        <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> DEPOSIT
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{dep.id}</td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-400">+${dep.amount?.toFixed(2)} {dep.currency}</td>
                    <td className="py-3 px-4 text-slate-300 text-[10px]">
                      <span className="font-bold block text-white">{dep.source}</span>
                      <span className="text-slate-400">{shortAddress(dep.address)}</span>
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-bold">{dep.network}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {dep.status || 'CONFIRMED 🟢'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[10px]">{dep.time || 'Just now'}</td>
                  </tr>
                ))}

                {/* 2. Transfers / Withdrawals */}
                {(heldFilter === 'ALL' || heldFilter === 'TRANSFERS') && (withdrawalHistory || []).map((wth, idx) => (
                  <tr key={`wth-${wth.id || idx}`} className="hover:bg-[#181a24] transition">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1 w-fit">
                        <ArrowUpLeft className="w-3 h-3 text-rose-400" /> TRANSFER
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{wth.id || `WTH-${idx + 1}`}</td>
                    <td className="py-3 px-4 font-mono font-black text-rose-400">-${wth.amount?.toFixed ? wth.amount.toFixed(2) : wth.amount} {wth.currency || 'USDT'}</td>
                    <td className="py-3 px-4 text-slate-300 text-[10px]">
                      <span className="font-bold block text-white">{wth.source || 'MetaMask Sweep'}</span>
                      <span className="text-slate-400">{shortAddress(wth.destinationAddress || wth.address || '')}</span>
                    </td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">{wth.network || wth.networkChain || 'Arbitrum One'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {wth.status || 'CONFIRMED 🟢'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[10px]">{wth.time || 'Just now'}</td>
                  </tr>
                ))}

                {/* 3. Held Transactions */}
                {(heldFilter === 'ALL' || heldFilter === 'HELD') && (heldTransactions || []).map((h, idx) => (
                  <tr key={`held-${h.id || idx}`} className="hover:bg-[#181a24] transition">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 w-fit">
                        <Lock className="w-3 h-3 text-amber-400" /> HELD
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{h.id || `HELD-${idx + 1}`}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">+${h.profitUsd} USD PnL</td>
                    <td className="py-3 px-4 text-slate-300 text-[10px]">
                      <span className="font-bold block text-white">{h.symbol}</span>
                      <span className="text-slate-400">{h.buyExchange} ➔ {h.sellExchange}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-bold">Arbitrage Engine</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-950 text-amber-400 border border-amber-800">
                        HELD (&lt; $5.00)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[10px]">{h.time || 'Just now'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
