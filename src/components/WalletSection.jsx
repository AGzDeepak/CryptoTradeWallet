import React, { useState, useEffect, useCallback } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  fetchWalletData, isValidEthAddress, shortAddress, formatUsd,
  generateTxId, isMetaMaskAvailable, connectMetaMask,
  onAccountChanged, removeMetaMaskListeners, getTxExplorerUrl, switchMetaMaskNetwork
} from '../services/walletService';
import {
  Wallet, Copy, Check, Send, RefreshCw, ArrowDownLeft, ArrowUpLeft,
  Loader2, ExternalLink, ShieldCheck, Globe, LogIn, Activity, TrendingUp, CircleDollarSign,
  XCircle, CheckCircle2, Info
} from 'lucide-react';

import { getNativeBalance, getDexConfig } from '../services/dexService';
import { sendRealWeb3Transaction, isWeb3Available, SUPPORTED_NETWORKS } from '../services/web3Service';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const TABS = ['Overview', 'Deposit', 'Withdraw', 'History'];

export const WalletSection = () => {
  const {
    wallet, walletMode, setWalletMode,
    realWallet, connectRealWallet,
    realWalletAddress, setRealWalletAddress,
    realWalletNetwork, setRealWalletNetwork,
    realWalletData, setRealWalletData,
    depositFunds, withdrawFunds,
    withdrawalHistory, setWithdrawalHistory,
    totalBotProfit, addNotification
  } = useCrypto();

  const [activeTab, setActiveTab]       = useState('Overview');
  const [copied, setCopied]             = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetching, setIsFetching]     = useState(false);
  const [lastRefresh, setLastRefresh]   = useState('');

  // Mode Selection ('WEB3' | 'PAPER')
  const [depMode, setDepMode]           = useState('WEB3');
  const [withMode, setWithMode]         = useState('WEB3');

  // Deposit Form State
  const [depositAmt, setDepositAmt]     = useState('0.01');
  const [depositTo, setDepositTo]       = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depTxResult, setDepTxResult]   = useState(null);
  const [depError, setDepError]         = useState('');

  // Withdraw Form State
  const [withdrawAmt, setWithdrawAmt]   = useState('0.01');
  const [withdrawAddr, setWithdrawAddr] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withTxResult, setWithTxResult] = useState(null);
  const [withError, setWithError]       = useState('');

  // Custom transaction history state
  const [txHistory, setTxHistory]       = useState([
    {
      id: 'TX-9021',
      type: 'DEPOSIT',
      mode: 'Web3 MetaMask',
      amount: 0.05,
      symbol: 'ETH',
      usdValue: 157.50,
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d7B41',
      time: '10 mins ago',
      status: 'CONFIRMED',
      txHash: '0x7f39a82b...41b0'
    }
  ]);

  const connectedAddress = realWalletAddress || realWallet?.address || '';
  const isConnected      = !!connectedAddress;

  const loadWalletData = useCallback(async (address) => {
    if (!address || !isValidEthAddress(address)) return;
    setIsFetching(true);
    try {
      const liveBal = await getNativeBalance(address);
      const ethNum  = parseFloat(liveBal || 0);
      const ethPrice = 3150.00;
      setRealWalletData({
        balance: { eth: ethNum, usd: ethNum * ethPrice },
        txCount: ethNum > 0 ? 12 : 0
      });
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      addNotification(`Wallet sync: ${err.message}`, 'warning');
    } finally {
      setIsFetching(false);
    }
  }, [addNotification, setRealWalletData]);



  useEffect(() => {
    if (!connectedAddress) return;
    loadWalletData(connectedAddress);
    const interval = setInterval(() => loadWalletData(connectedAddress), 15000);
    return () => clearInterval(interval);
  }, [connectedAddress, loadWalletData]);


  const handleConnectMetaMask = async () => {
    setIsConnecting(true);
    try {
      if (isMetaMaskAvailable()) {
        const { address, networkName } = await connectMetaMask();
        setRealWalletAddress(address);
        setWalletMode('REAL');
        await loadWalletData(address);
        addNotification(`🦊 Connected: ${shortAddress(address)} on ${networkName}`, 'success');
      } else {
        const inputAddr = window.prompt('Enter your 0x wallet address:', '0x71C7656EC7ab88b098defB751B7401B5f6d7B41');
        if (inputAddr && isValidEthAddress(inputAddr)) {
          setRealWalletAddress(inputAddr);
          await loadWalletData(inputAddr);
          addNotification(`✅ Connected: ${shortAddress(inputAddr)}`, 'success');
        }
      }
    } catch (err) {
      addNotification(`Connection failed: ${err.message}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  // ── Execute Deposit Function ────────────────────────────────────────────────
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepError('');
    setDepTxResult(null);

    const amt = parseFloat(depositAmt);
    if (isNaN(amt) || amt <= 0) {
      setDepError('Please enter a valid deposit amount greater than 0.');
      return;
    }

    setIsDepositing(true);
    try {
      if (depMode === 'WEB3') {
        if (!isConnected) {
          throw new Error('Please connect your MetaMask wallet first to execute a Web3 deposit.');
        }

        // Target address to deposit to (default: user's own wallet or platform router)
        const targetAddr = depositTo?.trim() && isValidEthAddress(depositTo.trim())
          ? depositTo.trim()
          : connectedAddress;

        // Broadcast Web3 transaction via MetaMask
        const result = await sendRealWeb3Transaction(connectedAddress, targetAddr, String(amt));
        setDepTxResult(result);

        // Record in history log
        const newTx = {
          id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'DEPOSIT',
          mode: 'Web3 MetaMask',
          amount: amt,
          symbol: 'ETH',
          usdValue: amt * 3150,
          address: targetAddr,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'CONFIRMED',
          txHash: result.txHash,
          explorerUrl: result.explorerUrl
        };
        setTxHistory(prev => [newTx, ...prev]);
        depositFunds?.(amt * 3150, 'USDT', 'Web3 MetaMask Deposit');
        addNotification(`💰 Web3 Deposit Submitted: ${amt} ETH — Tx: ${result.txHash.slice(0, 10)}…`, 'success');
      } else {
        // Paper Wallet Instant Deposit
        depositFunds?.(amt * 1000, 'USDT', 'Paper Wallet Top-Up');
        const newTx = {
          id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'DEPOSIT',
          mode: 'Paper Virtual',
          amount: amt * 1000,
          symbol: 'USDT',
          usdValue: amt * 1000,
          address: 'Paper Trading Vault',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'CONFIRMED',
          txHash: `0x${Math.random().toString(16).substring(2)}${Date.now()}`
        };
        setTxHistory(prev => [newTx, ...prev]);
        setDepTxResult({
          txHash: newTx.txHash,
          status: 'CONFIRMED',
          isPaper: true
        });
        addNotification(`✅ Paper Deposit: +$${fmt(amt * 1000)} USDT credited`, 'success');
      }
    } catch (err) {
      setDepError(err?.message || 'Deposit transaction failed.');
    } finally {
      setIsDepositing(false);
    }
  };

  // ── Execute Withdraw Function ──────────────────────────────────────────────
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithError('');
    setWithTxResult(null);

    const amt = parseFloat(withdrawAmt);
    if (isNaN(amt) || amt <= 0) {
      setWithError('Please enter a valid withdrawal amount greater than 0.');
      return;
    }

    setIsWithdrawing(true);
    try {
      if (withMode === 'WEB3') {
        if (!isConnected) {
          throw new Error('Please connect your MetaMask wallet first to execute a Web3 withdrawal.');
        }

        const targetAddr = withdrawAddr?.trim();
        if (!targetAddr || !isValidEthAddress(targetAddr)) {
          throw new Error('Please enter a valid destination 0x EVM address.');
        }

        // Broadcast Web3 withdrawal transaction via MetaMask
        const result = await sendRealWeb3Transaction(connectedAddress, targetAddr, String(amt));
        setWithTxResult(result);

        const newTx = {
          id: `WITH-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'WITHDRAW',
          mode: 'Web3 MetaMask',
          amount: amt,
          symbol: 'ETH',
          usdValue: amt * 3150,
          address: targetAddr,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'CONFIRMED',
          txHash: result.txHash,
          explorerUrl: result.explorerUrl
        };
        setTxHistory(prev => [newTx, ...prev]);
        addNotification(`🚀 Web3 Withdrawal Sent: ${amt} ETH to ${shortAddress(targetAddr)}`, 'success');
      } else {
        // Paper Wallet Withdrawal
        const targetAddr = withdrawAddr?.trim() || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41';
        await withdrawFunds?.(amt * 1000, targetAddr);
        const newTx = {
          id: `WITH-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'WITHDRAW',
          mode: 'Paper Virtual',
          amount: amt * 1000,
          symbol: 'USDT',
          usdValue: amt * 1000,
          address: targetAddr,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'CONFIRMED',
          txHash: `0x${Math.random().toString(16).substring(2)}${Date.now()}`
        };
        setTxHistory(prev => [newTx, ...prev]);
        setWithTxResult({
          txHash: newTx.txHash,
          status: 'CONFIRMED',
          isPaper: true
        });
        addNotification(`✅ Paper Withdrawal: -$${fmt(amt * 1000)} USDT processed`, 'success');
      }
    } catch (err) {
      setWithError(err?.message || 'Withdrawal failed.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const balance    = wallet?.virtualBalance ?? 0;
  const ethBal     = realWalletData?.balance?.eth ?? realWallet?.balanceEth ?? 0;
  const usdBal     = realWalletData?.balance?.usd ?? realWallet?.balanceUsd ?? 0;

  const InputField = ({ label, placeholder, value, onChange, type = 'text', rightLabel }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-400 font-medium">{label}</label>
        {rightLabel && <span className="text-[10px] text-slate-500">{rightLabel}</span>}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition font-mono"
      />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Wallet</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your virtual and on-chain wallet deposits & withdrawals</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Virtual Balance', value: `$${fmt(balance)}`,        color: 'text-white',       icon: <CircleDollarSign className="w-5 h-5 text-violet-400" />, bg: 'bg-violet-500/15' },
          { label: 'ETH Balance',     value: `${ethBal.toFixed(4)} ETH`, color: 'text-cyan-400',   icon: <Wallet className="w-5 h-5 text-cyan-400" />,            bg: 'bg-cyan-500/15'   },
          { label: 'USD Value',       value: `$${fmt(usdBal)}`,          color: 'text-white',       icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,     bg: 'bg-emerald-500/15'},
          { label: 'Bot Profit',      value: `+$${fmt(totalBotProfit)}`, color: 'text-emerald-400', icon: <Activity className="w-5 h-5 text-amber-400" />,         bg: 'bg-amber-500/15'  },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main content card */}
      <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-slate-800/70">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === t
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t}
            </button>
          ))}
          <div className="flex-1" />
          {isConnected && (
            <button
              onClick={() => loadWalletData(connectedAddress)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              {lastRefresh ? `Updated ${lastRefresh}` : 'Sync'}
            </button>
          )}
        </div>

        <div className="p-6">

          {/* OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className="space-y-5">
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Connect your wallet</p>
                    <p className="text-xs text-slate-400 mt-1">Connect MetaMask to execute live Web3 deposits and withdrawals</p>
                  </div>
                  <button
                    onClick={handleConnectMetaMask}
                    disabled={isConnecting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
                  >
                    {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    {isConnecting ? 'Connecting…' : 'Connect MetaMask'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#060d18] rounded-xl p-4 space-y-2">
                      <p className="text-[11px] text-slate-500 uppercase font-medium">Wallet Address</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white">{shortAddress(connectedAddress)}</span>
                        <button onClick={() => copyText(connectedAddress, 'addr')} className="text-slate-400 hover:text-white transition shrink-0">
                          {copied === 'addr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{connectedAddress}</p>
                    </div>
                    <div className="bg-[#060d18] rounded-xl p-4 space-y-2">
                      <p className="text-[11px] text-slate-500 uppercase font-medium">Network</p>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-sm text-white">{realWalletNetwork || 'Ethereum Mainnet'}</span>
                      </div>
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        Connected
                      </p>
                    </div>
                  </div>

                  {realWalletData && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'ETH Balance', value: `${ethBal.toFixed(6)} ETH` },
                        { label: 'USD Value',   value: `$${fmt(usdBal)}` },
                        { label: 'Transactions', value: (txHistory.length).toString() },
                      ].map((item, i) => (
                        <div key={i} className="bg-[#060d18] rounded-xl p-3.5 text-center">
                          <p className="text-[10px] text-slate-500 mb-1">{item.label}</p>
                          <p className="text-sm font-semibold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DEPOSIT TAB */}
          {activeTab === 'Deposit' && (
            <form onSubmit={handleDepositSubmit} className="max-w-xl space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Deposit Gateway</h3>
              </div>

              {/* Mode Selector */}
              <div className="flex rounded-xl bg-[#060d18] p-1 border border-slate-700/60 gap-1">
                <button
                  type="button"
                  onClick={() => { setDepMode('WEB3'); setDepError(''); setDepTxResult(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                    depMode === 'WEB3'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🦊 Web3 MetaMask (Live On-Chain)
                </button>
                <button
                  type="button"
                  onClick={() => { setDepMode('PAPER'); setDepError(''); setDepTxResult(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                    depMode === 'PAPER'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💵 Paper Wallet (Simulation)
                </button>
              </div>

              {depMode === 'WEB3' && (
                <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <span>
                    Executing a Web3 Deposit will prompt <strong>MetaMask</strong> to sign and broadcast a live on-chain transaction.
                  </span>
                </div>
              )}

              <InputField
                label={depMode === 'WEB3' ? 'Amount (ETH)' : 'Amount (USDT)'}
                placeholder="Enter deposit amount…"
                type="number"
                value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                rightLabel={
                  depMode === 'WEB3'
                    ? `Live ETH Bal: ${ethBal.toFixed(4)} ETH`
                    : `Virtual Bal: $${fmt(balance)} USDT`
                }
              />

              {depMode === 'WEB3' && (
                <InputField
                  label="Destination Address (Optional)"
                  placeholder={isConnected ? connectedAddress : '0x… (Default: Connected Wallet)'}
                  value={depositTo}
                  onChange={e => setDepositTo(e.target.value)}
                  rightLabel={isConnected ? shortAddress(connectedAddress) : 'MetaMask disconnected'}
                />
              )}

              {depError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{depError}</span>
                </div>
              )}

              {depTxResult && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Deposit Transaction Confirmed ✓
                  </div>
                  <div className="bg-[#060d18] rounded-lg px-3 py-2 text-[11px] text-slate-400 font-mono break-all">
                    {depTxResult.txHash}
                  </div>
                  {depTxResult.explorerUrl && (
                    <a href={depTxResult.explorerUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition">
                      <ExternalLink className="w-3.5 h-3.5" /> View on Explorer ↗
                    </a>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isDepositing}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  isDepositing
                    ? 'opacity-60 cursor-not-allowed bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                }`}
              >
                {isDepositing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing Deposit…</>
                ) : (
                  <><ArrowDownLeft className="w-4 h-4" /> {depMode === 'WEB3' ? 'Execute Web3 Deposit via MetaMask' : 'Deposit to Paper Balance'}</>
                )}
              </button>
            </form>
          )}

          {/* WITHDRAW TAB */}
          {activeTab === 'Withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="max-w-xl space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpLeft className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">Withdrawal Gateway</h3>
              </div>

              {/* Mode Selector */}
              <div className="flex rounded-xl bg-[#060d18] p-1 border border-slate-700/60 gap-1">
                <button
                  type="button"
                  onClick={() => { setWithMode('WEB3'); setWithError(''); setWithTxResult(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                    withMode === 'WEB3'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🦊 Web3 MetaMask (Live On-Chain)
                </button>
                <button
                  type="button"
                  onClick={() => { setWithMode('PAPER'); setWithError(''); setWithTxResult(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                    withMode === 'PAPER'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💵 Paper Wallet (Simulation)
                </button>
              </div>

              {withMode === 'WEB3' && (
                <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <span>
                    Web3 Withdrawal will transfer native tokens on-chain to the destination 0x address via <strong>MetaMask</strong>.
                  </span>
                </div>
              )}

              <InputField
                label={withMode === 'WEB3' ? 'Amount (ETH)' : 'Amount (USDT)'}
                placeholder="Enter withdrawal amount…"
                type="number"
                value={withdrawAmt}
                onChange={e => setWithdrawAmt(e.target.value)}
                rightLabel={
                  withMode === 'WEB3'
                    ? `Live ETH Bal: ${ethBal.toFixed(4)} ETH`
                    : `Available: $${fmt(balance)} USDT`
                }
              />

              <InputField
                label="Destination Address (0x EVM)"
                placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d7B41"
                value={withdrawAddr}
                onChange={e => setWithdrawAddr(e.target.value)}
                rightLabel={isConnected ? `From: ${shortAddress(connectedAddress)}` : 'Connect MetaMask'}
              />

              {withError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{withError}</span>
                </div>
              )}

              {withTxResult && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Withdrawal Broadcast On-Chain ✓
                  </div>
                  <div className="bg-[#060d18] rounded-lg px-3 py-2 text-[11px] text-slate-400 font-mono break-all">
                    {withTxResult.txHash}
                  </div>
                  {withTxResult.explorerUrl && (
                    <a href={withTxResult.explorerUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition">
                      <ExternalLink className="w-3.5 h-3.5" /> View on Explorer ↗
                    </a>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isWithdrawing}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  isWithdrawing
                    ? 'opacity-60 cursor-not-allowed bg-rose-600 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                }`}
              >
                {isWithdrawing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing Withdrawal…</>
                ) : (
                  <><ArrowUpLeft className="w-4 h-4" /> {withMode === 'WEB3' ? 'Execute Web3 Withdrawal via MetaMask' : 'Withdraw from Paper Balance'}</>
                )}
              </button>
            </form>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'History' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Deposit & Withdrawal History</h3>
                <span className="text-xs text-slate-500">{txHistory.length} records</span>
              </div>

              {txHistory.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">No transaction records found</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {txHistory.map((tx, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#060d18] border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'DEPOSIT' ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                        }`}>
                          {tx.type === 'DEPOSIT'
                            ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                            : <ArrowUpLeft className="w-4 h-4 text-rose-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{tx.type}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-medium">{tx.mode}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{tx.address ? shortAddress(tx.address) : 'Vault'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount} {tx.symbol || 'USDT'}
                          </p>
                          <p className="text-[10px] text-slate-500">{tx.time || 'Just now'}</p>
                        </div>
                        {tx.explorerUrl && (
                          <a href={tx.explorerUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
