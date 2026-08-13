import React, { useState, useEffect, useCallback } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  fetchWalletData, isValidEthAddress, shortAddress, formatUsd,
  generateTxId, isMetaMaskAvailable, connectMetaMask,
  onAccountChanged, removeMetaMaskListeners, getTxExplorerUrl, switchMetaMaskNetwork
} from '../services/walletService';
import {
  Wallet, Copy, Check, Send, RefreshCw, ArrowDownLeft, ArrowUpLeft,
  Loader2, ExternalLink, ShieldCheck, Globe, LogIn, Activity, TrendingUp, CircleDollarSign
} from 'lucide-react';

import { getNativeBalance } from '../services/dexService';

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
    withdrawalHistory, totalBotProfit,
    addNotification
  } = useCrypto();

  const [activeTab, setActiveTab]       = useState('Overview');
  const [copied, setCopied]             = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetching, setIsFetching]     = useState(false);
  const [lastRefresh, setLastRefresh]   = useState('');

  // Deposit form
  const [depositAmt, setDepositAmt]     = useState('');
  const [depositNote, setDepositNote]   = useState('');
  const [depositDone, setDepositDone]   = useState(false);

  // Withdraw form
  const [withdrawAmt, setWithdrawAmt]   = useState('');
  const [withdrawAddr, setWithdrawAddr] = useState('');
  const [withdrawDone, setWithdrawDone] = useState(false);

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
        await loadWalletData(address, realWalletNetwork);
        addNotification(`🦊 MetaMask Connected: ${shortAddress(address)} on ${networkName}`, 'success');
      } else {
        const inputAddr = window.prompt('Enter your 0x wallet address:', '0x71C7656EC7ab88b098defB751B7401B5f6d7B41');
        if (inputAddr && isValidEthAddress(inputAddr)) {
          setRealWalletAddress(inputAddr);
          await loadWalletData(inputAddr, realWalletNetwork);
          addNotification(`✅ Wallet connected: ${shortAddress(inputAddr)}`, 'success');
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

  const handleDeposit = (e) => {
    e.preventDefault();
    if (!depositAmt || isNaN(depositAmt) || parseFloat(depositAmt) <= 0) return;
    depositFunds?.(parseFloat(depositAmt));
    setDepositDone(true);
    setDepositAmt('');
    setTimeout(() => setDepositDone(false), 3000);
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (!withdrawAmt || isNaN(withdrawAmt) || parseFloat(withdrawAmt) <= 0) return;
    withdrawFunds?.(parseFloat(withdrawAmt));
    setWithdrawDone(true);
    setWithdrawAmt('');
    setWithdrawAddr('');
    setTimeout(() => setWithdrawDone(false), 3000);
  };

  const balance    = wallet?.virtualBalance ?? 0;
  const ethBal     = realWalletData?.balance?.eth ?? realWallet?.balanceEth ?? 0;
  const usdBal     = realWalletData?.balance?.usd ?? realWallet?.balanceUsd ?? 0;
  const txCount    = realWalletData?.txCount ?? 0;

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
        className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition"
      />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Wallet</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your virtual and on-chain wallet balances</p>
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
              {/* MetaMask connection */}
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Connect your wallet</p>
                    <p className="text-xs text-slate-400 mt-1">Connect MetaMask to view on-chain balances and activity</p>
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
                  {/* Connected wallet info */}
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

                  {/* On-chain stats */}
                  {realWalletData && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'ETH Balance', value: `${ethBal.toFixed(6)} ETH` },
                        { label: 'USD Value',   value: `$${fmt(usdBal)}` },
                        { label: 'Transactions', value: txCount.toLocaleString() },
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

          {/* DEPOSIT */}
          {activeTab === 'Deposit' && (
            <form onSubmit={handleDeposit} className="max-w-md space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Deposit Funds</h3>
              </div>
              <InputField
                label="Amount (USDT)"
                placeholder="Enter amount to deposit…"
                type="number"
                value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                rightLabel={`Balance: $${fmt(balance)} USDT`}
              />
              <InputField
                label="Note (optional)"
                placeholder="E.g. Bank transfer, crypto swap…"
                value={depositNote}
                onChange={e => setDepositNote(e.target.value)}
              />
              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
                  depositDone
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {depositDone ? '✓ Deposited successfully' : 'Deposit Funds'}
              </button>
            </form>
          )}

          {/* WITHDRAW */}
          {activeTab === 'Withdraw' && (
            <form onSubmit={handleWithdraw} className="max-w-md space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpLeft className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">Withdraw Funds</h3>
              </div>
              <InputField
                label="Amount (USDT)"
                placeholder="Enter amount to withdraw…"
                type="number"
                value={withdrawAmt}
                onChange={e => setWithdrawAmt(e.target.value)}
                rightLabel={`Available: $${fmt(balance)} USDT`}
              />
              <InputField
                label="Destination Address"
                placeholder="0x…"
                value={withdrawAddr}
                onChange={e => setWithdrawAddr(e.target.value)}
              />
              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
                  withdrawDone
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {withdrawDone ? '✓ Withdrawal submitted' : 'Withdraw Funds'}
              </button>
            </form>
          )}

          {/* HISTORY */}
          {activeTab === 'History' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white mb-4">Transaction History</h3>
              {(withdrawalHistory || []).length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(withdrawalHistory || []).map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                          {tx.type === 'DEPOSIT'
                            ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                            : <ArrowUpLeft className="w-4 h-4 text-rose-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}</p>
                          <p className="text-[10px] text-slate-500">{tx.time || 'Just now'}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'DEPOSIT' ? '+' : '-'}${fmt(tx.amount)}
                      </span>
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
