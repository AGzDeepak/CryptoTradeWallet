import React, { useState, useEffect, useCallback } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  fetchWalletData, isValidEthAddress, shortAddress, formatUsd,
  generateTxId, generateVirtualAddress, isMetaMaskAvailable,
  connectMetaMask, onAccountChanged, onNetworkChanged,
  removeMetaMaskListeners
} from '../services/walletService';
import {
  Wallet, Plus, Copy, Check, ShieldCheck, Zap, Bot, Send,
  CheckCircle2, RefreshCw, TrendingUp, TrendingDown, Activity,
  Lock, AlertCircle, Power, Key, BarChart3, Clock, CircleDollarSign,
  Layers, Globe, ArrowDownLeft, ArrowUpLeft, Loader2, ExternalLink
} from 'lucide-react';

export const WalletSection = () => {
  const {
    wallet, walletMode, setWalletMode,
    realWallet, connectRealWallet,
    realWalletAddress, setRealWalletAddress,
    realWalletNetwork, setRealWalletNetwork,
    realWalletData, setRealWalletData,
    depositFunds, withdrawFunds,
    withdrawalHistory, totalBotProfit,
    addNotification, user,
  } = useCrypto();

  // ─── UI State ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState('overview');
  const [copied, setCopied]             = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSuccess, setTxSuccess]       = useState(null);

  // ─── Address Paste State ──────────────────────────────────────────
  const [showAddressPanel, setShowAddressPanel] = useState(false);
  const [pastedAddress, setPastedAddress]       = useState('');
  const [addressError, setAddressError]         = useState('');

  // ─── Real Wallet Data ─────────────────────────────────────────────
  const [walletData, setWalletData]   = useState(realWalletData);
  const [isFetching, setIsFetching]   = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(realWalletNetwork || 'ethereum');
  const [connectedAddress, setConnectedAddress] = useState(realWalletAddress || realWallet?.address || '');
  const [lastRefresh, setLastRefresh] = useState('');

  useEffect(() => {
    if (realWalletAddress) {
      setConnectedAddress(realWalletAddress);
    }
  }, [realWalletAddress]);

  // ─── Computed values ─────────────────────────────────────────────
  const virtualAddress = generateVirtualAddress(user?.email || 'user@chainblock.io');
  const isRealConnected = walletMode === 'REAL' && !!connectedAddress;

  const displayAddress = isRealConnected ? connectedAddress : virtualAddress;
  const shortAddr      = shortAddress(displayAddress);

  // Real or virtual balance
  const availableBalance = isRealConnected
    ? (walletData?.totalUsd ?? 0)
    : (wallet?.virtualBalance ?? 0);
  const totalEquity  = isRealConnected ? (walletData?.totalUsd ?? 0) : (wallet?.totalEquity ?? 0);
  const todayProfit  = wallet?.todayProfit ?? 0;

  // ─── Deposit form ─────────────────────────────────────────────────
  const [depositAmount, setDepositAmount] = useState('');
  const [depositToken, setDepositToken]   = useState('USDT');
  const [depositChain, setDepositChain]   = useState('Arbitrum One');

  // ─── Withdraw form ────────────────────────────────────────────────
  const [withdrawAmount, setWithdrawAmount]     = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT');
  const [withdrawNetwork, setWithdrawNetwork]   = useState('Arbitrum One');
  const [destAddress, setDestAddress]           = useState('');

  // ─── Fetch live on-chain data ─────────────────────────────────────
  const loadWalletData = useCallback(async (address, network = selectedNetwork) => {
    if (!address || !isValidEthAddress(address)) return;
    setIsFetching(true);
    try {
      const data = await fetchWalletData(address, network);
      setWalletData(data);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      addNotification(`⚠️ Could not fetch wallet data: ${err.message}`, 'warning');
    } finally {
      setIsFetching(false);
    }
  }, [selectedNetwork]);

  // Auto-refresh every 30s when connected
  useEffect(() => {
    if (!connectedAddress) return;
    loadWalletData(connectedAddress, selectedNetwork);
    const interval = setInterval(() => loadWalletData(connectedAddress, selectedNetwork), 30000);
    return () => clearInterval(interval);
  }, [connectedAddress, selectedNetwork]);

  // ─── Connect by pasted address ────────────────────────────────────
  const handleConnectByAddress = async () => {
    const addr = pastedAddress.trim();
    setAddressError('');
    if (!isValidEthAddress(addr)) {
      setAddressError('Invalid address. Must be a valid 0x Ethereum address (42 chars).');
      return;
    }
    setIsConnecting(true);
    try {
      await loadWalletData(addr, selectedNetwork);
      setConnectedAddress(addr);
      setWalletMode('REAL');
      setShowAddressPanel(false);
      setPastedAddress('');
      addNotification(`✅ Wallet connected: ${shortAddress(addr)} — Live balance loaded!`, 'success');
    } catch (err) {
      addNotification(`❌ Could not connect wallet: ${err.message}`, 'danger');
    } finally {
      setIsConnecting(false);
    }
  };

  // ─── Connect via MetaMask extension ──────────────────────────────
  const handleConnectMetaMask = async () => {
    setIsConnecting(true);
    try {
      if (isMetaMaskAvailable()) {
        const { address, networkName } = await connectMetaMask();
        setConnectedAddress(address);
        await loadWalletData(address, selectedNetwork);
        setWalletMode('REAL');
        setShowAddressPanel(false);
        addNotification(`🦊 MetaMask connected: ${shortAddress(address)} on ${networkName}`, 'success');
        onAccountChanged((accounts) => {
          if (!accounts.length) handleDisconnect();
          else {
            setConnectedAddress(accounts[0]);
            loadWalletData(accounts[0], selectedNetwork);
          }
        });
      } else {
        // No extension: show paste panel
        setShowAddressPanel(true);
      }
    } catch (err) {
      addNotification(`❌ MetaMask error: ${err.message}`, 'danger');
    } finally {
      setIsConnecting(false);
    }
  };

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
          setConnectedAddress(accounts[0]);
          await loadWalletData(accounts[0], selectedNetwork);
          setWalletMode('REAL');
          addNotification(`🔄 Switched to MetaMask Account: ${shortAddress(accounts[0])}`, 'success');
        }
      } else {
        handleConnectMetaMask();
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
    setConnectedAddress('');
    setWalletData(null);
    setWalletMode('DEMO');
    setShowAddressPanel(false);
    addNotification('🔌 Wallet disconnected. Switched to Demo mode.', 'info');
  };

  // ─── Deposit ─────────────────────────────────────────────────────
  const handleDeposit = async (e) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) { addNotification('Enter a valid amount.', 'warning'); return; }
    setIsSubmitting(true);
    try {
      depositFunds(num, depositToken);
      const txId = generateTxId('DEP');
      setTxSuccess({ type: 'deposit', amount: num, token: depositToken, txId });
      setDepositAmount('');
      addNotification(`✅ +${formatUsd(num)} ${depositToken} credited! TX: ${txId}`, 'success');
      setTimeout(() => setTxSuccess(null), 5000);
    } finally { setIsSubmitting(false); }
  };

  // ─── Withdraw ────────────────────────────────────────────────────
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount);
    if (isNaN(num) || num <= 0) { addNotification('Enter a valid amount.', 'warning'); return; }
    if (num > availableBalance) { addNotification(`❌ Insufficient! Available: ${formatUsd(availableBalance)}`, 'danger'); return; }
    if (!destAddress.trim()) { addNotification('Enter destination address.', 'warning'); return; }
    setIsSubmitting(true);
    try {
      const result = await withdrawFunds(num, destAddress, withdrawCurrency, withdrawNetwork);
      if (result !== false) {
        const txId = generateTxId('WTH');
        setTxSuccess({ type: 'withdraw', amount: num, token: withdrawCurrency, txId });
        setWithdrawAmount('');
        addNotification(`✅ ${formatUsd(num)} ${withdrawCurrency} withdrawn! TX: ${txId}`, 'success');
        setTimeout(() => setTxSuccess(null), 5000);
      }
    } finally { setIsSubmitting(false); }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const quickPercent = (pct) => setWithdrawAmount((availableBalance * pct).toFixed(2));

  // ─── Asset Filter State (Ethereum vs Bitcoin) ────────────────────
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('ALL'); // 'ALL' | 'ETH' | 'BTC'

  // ─── Assets list ─────────────────────────────────────────────────
  const btcAmt = walletData?.btcBalance ?? 0.2850;
  const btcVal = walletData?.btcUsd ?? (btcAmt * (walletData?.prices?.BTC ?? 67840.50));
  const ethAmt = walletData?.ethBalance ?? 4.8250;
  const ethVal = walletData?.ethUsd ?? (ethAmt * (walletData?.prices?.ETH ?? 3540.20));
  const totVal = Math.max((walletData?.totalUsd || (ethVal + btcVal + 15000)), 1);

  const assets = [
    { symbol: 'BTC',  name: 'Bitcoin (Mainnet / Signet)', icon: '₿', color: 'bg-amber-500',
      amount: btcAmt, usd: btcVal, pct: Math.round((btcVal / totVal) * 100) },
    { symbol: 'ETH',  name: 'Ethereum',  icon: 'Ξ', color: 'bg-indigo-500',
      amount: ethAmt, usd: ethVal, pct: Math.round((ethVal / totVal) * 100) },
    { symbol: 'USDT', name: 'Tether USD', icon: '₮', color: 'bg-teal-500',
      amount: walletData?.usdtBalance ?? (wallet?.virtualBalance ?? 10000),
      usd: walletData?.usdtBalance ?? (wallet?.virtualBalance ?? 10000), pct: 25 },
    { symbol: 'USDC', name: 'USD Coin',  icon: '$', color: 'bg-blue-500',
      amount: walletData?.usdcBalance ?? 5000,
      usd: walletData?.usdcBalance ?? 5000, pct: 15 },
  ];

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'deposit',  label: 'Deposit',  icon: <ArrowDownLeft className="w-3.5 h-3.5" /> },
    { id: 'withdraw', label: 'Withdraw', icon: <ArrowUpLeft className="w-3.5 h-3.5" /> },
    { id: 'history',  label: 'History',  icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 font-sans">

      {/* ══════════════════════════════════════════════════════
          HEADER — Wallet Identity Card
      ══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0d0f1a] via-[#0b0c10] to-[#111827] p-6">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#facc15]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#2dd4bf]/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#facc15] to-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.3)]">
              <Wallet className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">MY WALLET</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  isRealConnected
                    ? 'bg-emerald-950 text-[#2dd4bf] border-[#2dd4bf]'
                    : 'bg-amber-950 text-[#facc15] border-[#facc15]'
                }`}>
                  {isRealConnected ? '🟢 LIVE WEB3' : '🟡 DEMO MODE'}
                </span>
                {isFetching && <Loader2 className="w-4 h-4 text-[#2dd4bf] animate-spin" />}
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-slate-400">{shortAddr}</span>
                <button onClick={() => copyToClipboard(displayAddress, 'Address')}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-[#facc15] transition">
                  {copied === 'Address' ? <Check className="w-3 h-3 text-[#2dd4bf]" /> : <Copy className="w-3 h-3" />}
                </button>
                <span className={`w-2 h-2 rounded-full ${isRealConnected ? 'bg-[#2dd4bf] animate-pulse' : 'bg-slate-600'}`} />
                {isRealConnected && lastRefresh && (
                  <span className="text-[10px] text-slate-500">Updated {lastRefresh}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {!isRealConnected ? (
              <>
                <button onClick={() => setShowAddressPanel(!showAddressPanel)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-teal-600 text-slate-950 font-extrabold text-xs shadow-lg hover:brightness-110 transition">
                  <Key className="w-4 h-4" /> PASTE WALLET ADDRESS
                </button>
                <button onClick={handleConnectMetaMask} disabled={isConnecting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#facc15] text-slate-950 font-extrabold text-xs shadow-lg hover:brightness-110 transition">
                  <Zap className="w-4 h-4" /> {isConnecting ? 'CONNECTING...' : '🦊 METAMASK'}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => loadWalletData(connectedAddress, selectedNetwork)} disabled={isFetching}
                  className="p-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-[#2dd4bf] hover:bg-slate-800 transition">
                  <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={handleDisconnect}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-400 text-xs font-bold hover:bg-rose-900 transition">
                  <Power className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          PASTE WALLET ADDRESS PANEL
      ══════════════════════════════════════════════════════ */}
      {showAddressPanel && (
        <div className="rounded-2xl border border-[#2dd4bf]/40 bg-[#0b0c10] p-6 font-mono shadow-[0_0_40px_rgba(45,212,191,0.07)]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2dd4bf]/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-[#2dd4bf]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Connect Your MetaMask Wallet</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Paste your wallet address — live on-chain balance will be fetched instantly</p>
              </div>
            </div>
            <button onClick={() => { setShowAddressPanel(false); setAddressError(''); setPastedAddress(''); }}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">✕</button>
          </div>

          {/* Steps */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {[
              { step: '1', icon: '🦊', label: 'Open MetaMask', desc: 'Click the fox icon in browser' },
              { step: '2', icon: '📋', label: 'Copy Address',  desc: 'Click your 0x address to copy' },
              { step: '3', icon: '⚡', label: 'Paste & Connect', desc: 'Paste below — live data loads!' },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-3 flex-1 p-3 rounded-xl bg-[#14161d] border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 flex items-center justify-center text-[#2dd4bf] font-extrabold text-xs shrink-0">{s.step}</div>
                <div>
                  <div className="text-white font-bold text-xs">{s.icon} {s.label}</div>
                  <div className="text-slate-400 text-[10px]">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Network selector */}
          <div className="mb-4">
            <label className="text-[10px] text-slate-400 uppercase block mb-1.5">Select Network</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'bitcoin',        label: '₿ Bitcoin Mainnet' },
                { id: 'bitcoinTestnet', label: '🧪 Bitcoin Testnet' },
                { id: 'ethereum',       label: '🔷 Ethereum' },
                { id: 'arbitrum',       label: '🔵 Arbitrum' },
                { id: 'polygon',        label: '🟣 Polygon' },
                { id: 'bsc',            label: '🟡 BNB Chain' },
              ].map(n => (
                <button key={n.id} onClick={() => {
                  setSelectedNetwork(n.id);
                  setRealWalletNetwork(n.id.includes('bitcoin') ? 'Bitcoin Mainnet (BTC)' : n.id);
                }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition border ${
                    selectedNetwork === n.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-[#14161d] border-slate-800 text-slate-400 hover:text-white'
                  }`}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Address input */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={pastedAddress}
                onChange={e => { setPastedAddress(e.target.value); setAddressError(''); }}
                placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d7B41"
                className={`w-full bg-[#14161d] border rounded-xl px-4 py-4 text-white font-mono text-xs outline-none transition pr-28 ${
                  addressError ? 'border-rose-500' : 'border-slate-700 focus:border-[#2dd4bf]'
                }`}
              />
              <button type="button"
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
              <div className="flex items-center gap-2 text-rose-400 text-[11px] font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> {addressError}
              </div>
            )}

            {/* Live validation preview */}
            {pastedAddress && isValidEthAddress(pastedAddress.trim()) && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-[#2dd4bf]/30 text-[#2dd4bf] text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                ✅ Valid address — {shortAddress(pastedAddress.trim())} — Click Connect to fetch live balance
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setShowAddressPanel(false); setAddressError(''); setPastedAddress(''); }}
                className="py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-bold transition">
                Cancel
              </button>
              <button onClick={handleConnectByAddress}
                disabled={isConnecting || !pastedAddress.trim()}
                className="py-3 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50">
                {isConnecting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> FETCHING BALANCE...</>
                  : <><Zap className="w-4 h-4" /> CONNECT & LOAD BALANCE</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          REAL WALLET LIVE BALANCE BANNER (when connected)
      ══════════════════════════════════════════════════════ */}
      {isRealConnected && walletData && (
        <div className="rounded-2xl border border-[#2dd4bf]/30 bg-gradient-to-r from-emerald-950/40 to-[#0b0c10] p-5 font-mono">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2dd4bf]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#2dd4bf] animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase">Live On-Chain Balance</div>
                <div className="text-2xl font-extrabold text-white">{formatUsd(walletData.totalUsd)}</div>
                <div className="text-[10px] text-[#2dd4bf] font-bold">{walletData.networkName || 'Ethereum'} • Last updated: {walletData.lastUpdated}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="p-3 rounded-xl bg-[#14161d] border border-slate-800 text-center min-w-[90px]">
                <div className="text-[10px] text-slate-400">ETH Balance</div>
                <div className="font-extrabold text-indigo-400">{walletData.ethBalance} ETH</div>
                <div className="text-[10px] text-slate-500">{formatUsd(walletData.ethUsd)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#14161d] border border-slate-800 text-center min-w-[90px]">
                <div className="text-[10px] text-slate-400">USDT Balance</div>
                <div className="font-extrabold text-teal-400">{walletData.usdtBalance.toFixed(2)} USDT</div>
                <div className="text-[10px] text-slate-500">{formatUsd(walletData.usdtBalance)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#14161d] border border-slate-800 text-center min-w-[90px]">
                <div className="text-[10px] text-slate-400">USDC Balance</div>
                <div className="font-extrabold text-blue-400">{walletData.usdcBalance.toFixed(2)} USDC</div>
                <div className="text-[10px] text-slate-500">{formatUsd(walletData.usdcBalance)}</div>
              </div>
            </div>
          </div>
          {/* Live ETH price bar */}
          {walletData.prices && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-4 text-xs font-mono">
              {[
                { label: 'ETH', value: formatUsd(walletData.prices.ETH), color: 'text-indigo-400' },
                { label: 'BTC', value: formatUsd(walletData.prices.BTC), color: 'text-amber-400' },
                { label: 'USDT', value: formatUsd(walletData.prices.USDT), color: 'text-teal-400' },
                { label: 'SOL', value: formatUsd(walletData.prices.SOL), color: 'text-purple-400' },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-1.5">
                  <span className="text-slate-500">{p.label}:</span>
                  <span className={`font-bold ${p.color}`}>{p.value}</span>
                </div>
              ))}
              <span className="ml-auto text-slate-600 text-[10px]">via CoinGecko • auto-refresh 30s</span>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          BALANCE STAT CARDS
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {[
          { label: 'Total Balance', value: formatUsd(availableBalance), sub: 'USDT Available', icon: <CircleDollarSign className="w-5 h-5" />, color: 'text-white', accent: '#2dd4bf' },
          { label: 'Total Equity',  value: formatUsd(totalEquity), sub: 'Portfolio Value', icon: <TrendingUp className="w-5 h-5" />, color: 'text-white', accent: '#facc15' },
          { label: 'Bot Profit',   value: `+${formatUsd(totalBotProfit)}`, sub: 'Auto-credited', icon: <Bot className="w-5 h-5" />, color: 'text-[#facc15]', accent: '#facc15' },
          { label: "Today's P&L",  value: formatUsd(todayProfit), sub: todayProfit >= 0 ? 'Positive Day' : 'Loss Today',
            icon: todayProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
            color: todayProfit >= 0 ? 'text-[#2dd4bf]' : 'text-rose-400', accent: todayProfit >= 0 ? '#2dd4bf' : '#f43f5e' },
        ].map(c => (
          <div key={c.label} className="p-5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-2 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{c.label}</span>
              <span style={{ color: c.accent }}>{c.icon}</span>
            </div>
            <div className={`text-2xl font-extrabold ${c.color}`}>{c.value}</div>
            <div className="text-[10px] font-bold" style={{ color: c.accent }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TABS
      ══════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 bg-[#0b0c10] p-1.5 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-bold transition whitespace-nowrap flex-1 justify-center ${
              activeTab === t.id ? 'bg-[#facc15] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Wallet Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Wallet Details</h3>
                <span className="text-[10px] text-[#2dd4bf] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> SECURED
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#14161d] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase mb-1">Wallet Address</div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs font-bold font-mono flex-1 truncate">{displayAddress}</span>
                  <button onClick={() => copyToClipboard(displayAddress, 'Address')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[#facc15] transition shrink-0">
                    {copied === 'Address' ? <Check className="w-3.5 h-3.5 text-[#2dd4bf]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Network', value: walletData?.networkName || 'Arbitrum One', color: 'text-[#2dd4bf]', icon: <Globe className="w-3 h-3" /> },
                  { label: 'Type', value: isRealConnected ? 'Web3 Wallet' : 'Virtual', color: 'text-white', icon: <Key className="w-3 h-3 text-[#facc15]" /> },
                  { label: 'Status', value: isRealConnected ? 'LIVE' : 'DEMO', color: isRealConnected ? 'text-[#2dd4bf]' : 'text-[#facc15]', icon: <Activity className="w-3 h-3" /> },
                  { label: 'Security', value: '256-BIT', color: 'text-emerald-400', icon: <Lock className="w-3 h-3" /> },
                ].map(row => (
                  <div key={row.label} className="p-3 rounded-xl bg-[#14161d] border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1">{row.label}</div>
                    <div className={`font-bold flex items-center gap-1 ${row.color}`}>{row.icon} {row.value}</div>
                  </div>
                ))}
              </div>

              {!isRealConnected && (
                <button onClick={() => setShowAddressPanel(true)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition">
                  <Key className="w-4 h-4" /> PASTE METAMASK ADDRESS TO CONNECT
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setActiveTab('deposit')}
                className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 hover:border-[#facc15]/40 transition flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-[#facc15]/10 group-hover:bg-[#facc15]/20 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-[#facc15]" />
                </div>
                <span className="text-xs font-bold text-white font-mono">DEPOSIT</span>
              </button>
              <button onClick={() => setActiveTab('withdraw')}
                className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 hover:border-rose-500/40 transition flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 flex items-center justify-center">
                  <ArrowUpLeft className="w-5 h-5 text-rose-400" />
                </div>
                <span className="text-xs font-bold text-white font-mono">WITHDRAW</span>
              </button>
            </div>
          </div>

          {/* Assets */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 font-mono space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#facc15]" /> Asset Holdings
                {isRealConnected && <span className="text-[10px] text-[#2dd4bf] font-bold">• LIVE</span>}
              </h3>
              {isRealConnected && (
                <button onClick={() => loadWalletData(connectedAddress)} disabled={isFetching}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-[#2dd4bf] transition">
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {assets.map(asset => (
                <div key={asset.symbol} className="p-4 rounded-xl bg-[#14161d] border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${asset.color} flex items-center justify-center font-bold text-sm text-white shadow`}>
                        {asset.icon}
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-xs">{asset.name}</div>
                        <div className="text-[10px] text-slate-400">{asset.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-white text-xs">{formatUsd(asset.usd)}</div>
                      <div className="text-[10px] text-slate-400">{asset.amount > 0 ? asset.amount.toFixed(4) : '0.00'} {asset.symbol}</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${asset.color}`} style={{ width: `${Math.max(asset.pct, asset.usd > 0 ? 5 : 0)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: DEPOSIT
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'deposit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-5 font-mono">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-[#facc15]" /> Deposit Funds
            </h3>
            {txSuccess?.type === 'deposit' && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-[#2dd4bf] text-[#2dd4bf] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> +{formatUsd(txSuccess.amount)} {txSuccess.token} deposited! TX: {txSuccess.txId}
              </div>
            )}
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1.5">Currency</label>
                  <select value={depositToken} onChange={e => setDepositToken(e.target.value)}
                    className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-3 text-white font-bold text-xs outline-none">
                    <option value="USDT">USDT</option><option value="USDC">USDC</option>
                    <option value="ETH">ETH</option><option value="BTC">BTC</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1.5">Network</label>
                  <select value={depositChain} onChange={e => setDepositChain(e.target.value)}
                    className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-3 text-[#2dd4bf] font-bold text-xs outline-none">
                    <option>Arbitrum One</option><option>Ethereum Mainnet</option>
                    <option>Polygon</option><option>BNB Chain</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1.5">Amount (USD)</label>
                <input type="number" required placeholder="e.g. 1000" value={depositAmount} min="1"
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-4 py-3.5 text-white font-bold text-sm outline-none focus:border-[#facc15]" />
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 5000].map(v => (
                    <button key={v} type="button" onClick={() => setDepositAmount(String(v))}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-[#facc15] text-[10px] font-bold transition flex-1">
                      ${v}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#facc15] hover:brightness-110 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition">
                <Plus className="w-4 h-4 stroke-[3]" /> {isSubmitting ? 'CREDITING...' : 'DEPOSIT FUNDS NOW'}
              </button>
            </form>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div className="flex justify-between"><span>Fee:</span><span className="text-[#2dd4bf] font-bold">$0.00 Zero Fee</span></div>
              <div className="flex justify-between"><span>Min Deposit:</span><span className="text-white font-bold">$1.00</span></div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-4 font-mono">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#2dd4bf]" /> Your Deposit Address
            </h3>
            <div className="flex items-center justify-center p-8 rounded-2xl bg-[#14161d] border border-slate-800">
              <div className="w-32 h-32 grid grid-cols-9 gap-0.5 p-2 bg-white rounded-lg">
                {Array.from({ length: 81 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${[0,1,2,3,4,5,6,9,15,18,24,27,33,36,42,45,51,54,60,63,69,72,73,74,75,76,77,78,10,11,12,20,22,30,47,48,50,57,58,65,66].includes(i) ? 'bg-slate-900' : 'bg-white'}`} />
                ))}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#14161d] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Address ({depositChain})</div>
              <div className="flex items-center gap-2">
                <span className="text-white text-[11px] font-bold font-mono flex-1 truncate">{displayAddress}</span>
                <button onClick={() => copyToClipboard(displayAddress, 'Deposit Address')}
                  className="px-3 py-1.5 rounded-lg bg-[#0b0c10] border border-slate-700 text-[#facc15] text-[10px] font-bold flex items-center gap-1 shrink-0 hover:bg-slate-800 transition">
                  {copied === 'Deposit Address' ? <Check className="w-3 h-3 text-[#2dd4bf]" /> : <Copy className="w-3 h-3" />}
                  {copied === 'Deposit Address' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-300 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              Only send {depositToken} on {depositChain}. Sending wrong assets may result in permanent loss.
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: WITHDRAW
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'withdraw' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-5 font-mono">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-rose-400" /> Withdraw Funds
            </h3>
            {txSuccess?.type === 'withdraw' && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-[#2dd4bf] text-[#2dd4bf] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> -{formatUsd(txSuccess.amount)} {txSuccess.token} sent! TX: {txSuccess.txId}
              </div>
            )}
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1.5">Destination Address</label>
                <input type="text" required placeholder="0x... destination wallet" value={destAddress}
                  onChange={e => setDestAddress(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-xs outline-none focus:border-rose-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1.5">Currency</label>
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
                    <option>Polygon</option><option>TRC20 (TRON)</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-[10px] text-slate-400 uppercase">Amount</label>
                  <span className="text-[10px] text-slate-400">Available: <span className="text-white font-bold">{formatUsd(availableBalance)}</span></span>
                </div>
                <input type="number" required placeholder="e.g. 500" value={withdrawAmount} min="1"
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-4 py-3.5 text-white font-bold text-sm outline-none focus:border-rose-400" />
                <div className="flex gap-2 mt-2">
                  {[0.25, 0.5, 0.75, 1].map(p => (
                    <button key={p} type="button" onClick={() => quickPercent(p)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-rose-400 text-[10px] font-bold transition flex-1">
                      {p === 1 ? 'MAX' : `${p * 100}%`}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={isSubmitting || availableBalance <= 0}
                className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition">
                <Send className="w-4 h-4" /> {isSubmitting ? 'PROCESSING...' : 'CONFIRM & WITHDRAW'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 font-mono space-y-3">
              <h3 className="text-xs font-extrabold text-white uppercase">Fee Summary</h3>
              {[
                { label: 'Available', value: formatUsd(availableBalance), color: 'text-white' },
                { label: 'Network Fee', value: '$0.00 (Free)', color: 'text-[#2dd4bf]' },
                { label: 'Processing', value: 'Instant', color: 'text-white' },
                { label: 'Network', value: withdrawNetwork, color: 'text-[#2dd4bf]' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-[#14161d] border border-slate-800 text-xs">
                  <span className="text-slate-400">{r.label}</span>
                  <span className={`font-bold ${r.color}`}>{r.value}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300 font-mono">
              <div className="flex items-center gap-2 font-bold text-rose-400 mb-2">
                <AlertCircle className="w-4 h-4" /> Important
              </div>
              <p className="text-[11px] leading-relaxed">Double-check the destination address. Crypto transactions are irreversible. Ensure you're using the correct network.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: HISTORY
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 font-mono space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#facc15]" /> Transaction History
            </h3>
            <span className="text-[10px] text-[#2dd4bf] font-bold">{withdrawalHistory?.length ?? 0} RECORDS</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#060810]">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-[#090d16] border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">TX ID</th><th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th><th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Network</th><th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#14161d]">
                {withdrawalHistory?.length > 0 ? (
                  withdrawalHistory.map((w, i) => (
                    <tr key={w.id || i} className="hover:bg-[#181a24] transition">
                      <td className="py-3 px-4 font-bold text-white">{w.id || `WTH-${i + 1}`}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">WITHDRAW</span></td>
                      <td className="py-3 px-4 font-bold text-rose-400">-${w.amount} {w.currency || 'USDT'}</td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[10px]">{shortAddress(w.destinationAddress || w.address || '')}</td>
                      <td className="py-3 px-4 text-indigo-400">{w.networkChain || 'Arbitrum One'}</td>
                      <td className="py-3 px-4"><span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]">{w.status || 'COMPLETED'}</span></td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[10px]">{w.time || 'Just now'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 text-slate-700" />
                      No transactions yet.
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
