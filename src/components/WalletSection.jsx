import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Wallet, ArrowUpRight, Plus, Copy, Check, ExternalLink, ShieldCheck, Zap, Bot, ArrowDownUp, RefreshCw, Send } from 'lucide-react';

export const WalletSection = () => {
  const { 
    wallet, 
    walletMode, 
    setWalletMode, 
    realWallet, 
    connectRealWallet, 
    disconnectRealWallet, 
    openModal, 
    depositFunds, 
    withdrawFunds, 
    withdrawalHistory, 
    totalBotProfit,
    addNotification
  } = useCrypto();

  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState('5000');
  const [withdrawAmount, setWithdrawAmount] = useState('1000');
  const [destAddress, setDestAddress] = useState('0x71C765b28F3D140a831C28190d7B41');
  const [network, setNetwork] = useState('Arbitrum One');

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    addNotification('Wallet address copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (!isNaN(num) && num > 0) {
      depositFunds(num, 'USDT');
      setDepositAmount('');
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount);
    if (!isNaN(num) && num > 0) {
      await withdrawFunds(num, destAddress, 'USDT', network);
      setWithdrawAmount('');
    }
  };

  const balances = [
    { symbol: 'USDT', name: 'Tether USD', amount: `${(wallet.virtualBalance || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`, valUsd: `$${(wallet.virtualBalance || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: '₮', bg: 'bg-[#2dd4bf] text-slate-950' },
    { symbol: 'BTC', name: 'Bitcoin', amount: '0.2342 BTC', valUsd: '$15,888.24', icon: '₿', bg: 'bg-amber-500 text-slate-950' },
    { symbol: 'ETH', name: 'Ethereum', amount: '2.4510 ETH', valUsd: '$8,677.03', icon: 'Ξ', bg: 'bg-indigo-500 text-white' },
    { symbol: 'SOL', name: 'Solana', amount: '45.80 SOL', valUsd: '$8,461.55', icon: '≡', bg: 'bg-purple-500 text-white' },
    { symbol: 'AVAX', name: 'Avalanche', amount: '120.00 AVAX', valUsd: '$4,632.00', icon: '▲', bg: 'bg-rose-500 text-white' },
    { symbol: 'XRP', name: 'Ripple', amount: '5,000.00 XRP', valUsd: '$3,120.00', icon: '✕', bg: 'bg-sky-500 text-white' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Wallet Mode Header Banner */}
      <div className="chainblock-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#facc15] flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.35)]">
            <Wallet className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">INSTITUTIONAL CRYPTO WALLET</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                walletMode === 'REAL' ? 'bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]' : 'bg-amber-950 text-[#facc15] border border-[#facc15]'
              }`}>
                {walletMode === 'REAL' ? 'REAL WEB3 WALLET' : 'DEMO PAPER WALLET'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Manage deposits, withdrawals, Web3 keys, and Firestore transaction ledgers.</p>
          </div>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center bg-[#0b0c10] p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setWalletMode('DEMO')}
            className={`px-4 py-2 rounded-xl transition font-bold ${
              walletMode === 'DEMO' ? 'bg-[#facc15] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            DEMO ($100k)
          </button>
          <button
            onClick={() => {
              if (realWallet.connected) setWalletMode('REAL');
              else connectRealWallet('MetaMask');
            }}
            className={`px-4 py-2 rounded-xl transition font-bold ${
              walletMode === 'REAL' ? 'bg-[#facc15] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {realWallet.connected ? realWallet.shortAddress : 'CONNECT WEB3'}
          </button>
        </div>
      </div>

      {/* Wallet Balance Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Equity & Operations */}
        <div className="lg:col-span-2 chainblock-card p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase block mb-1">Available Cash Balance</span>
              <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                ${(wallet.virtualBalance || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </span>
              <span className="text-xs text-slate-400 font-mono block mt-1">
                Total Equity: ${(wallet.totalEquity || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => openModal('DEPOSIT')}
                className="px-4 py-2.5 rounded-xl bg-[#facc15] text-slate-950 font-extrabold text-xs font-mono hover:brightness-110 shadow-lg flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>DEPOSIT</span>
              </button>
              <button
                onClick={() => openModal('WITHDRAW')}
                className="px-4 py-2.5 rounded-xl bg-[#14161d] border border-slate-700 text-rose-300 font-extrabold text-xs font-mono hover:border-rose-500 hover:bg-rose-950/40 flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
                <span>WITHDRAW</span>
              </button>
            </div>
          </div>

          {/* Web3 Address Box */}
          <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Public Address ({network})</span>
              <span className="text-white font-bold">{walletMode === 'REAL' && realWallet.connected ? realWallet.address : '0x71C765b28F3D140a831C28190d7B41'}</span>
            </div>
            <button
              onClick={() => copyAddress(walletMode === 'REAL' && realWallet.connected ? realWallet.address : '0x71C765b28F3D140a831C28190d7B41')}
              className="p-2 rounded-xl bg-[#14161d] border border-slate-700 text-slate-300 hover:text-[#facc15] transition flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2dd4bf]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Quick Forms Split (Deposit & Withdraw Forms) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Quick Deposit Form */}
            <form onSubmit={handleDepositSubmit} className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-3 font-mono">
              <span className="text-xs font-bold text-[#facc15] flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Quick Deposit Funds
              </span>
              <input
                type="number"
                placeholder="Amount in USDT (e.g. 5000)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#facc15]"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[#facc15] text-slate-950 font-bold text-xs hover:brightness-110 shadow-md">
                CREDIT WALLET NOW
              </button>
            </form>

            {/* Quick Withdraw Form */}
            <form onSubmit={handleWithdrawSubmit} className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-3 font-mono">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Send className="w-4 h-4" /> Quick Withdraw Crypto
              </span>
              <input
                type="number"
                placeholder="Amount in USDT"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md">
                EXECUTE WITHDRAWAL
              </button>
            </form>

          </div>

        </div>

        {/* Right 1 Col: Bot Cumulative Profit & Security Badges */}
        <div className="chainblock-card p-6 space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <span className="text-xs text-slate-400 font-mono uppercase block mb-1">Bot Cumulative Profit</span>
            <span className="text-3xl font-extrabold font-mono text-[#facc15] block">
              +${(totalBotProfit || 1248.50).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-mono block mt-1">Directly deposited into Cash Balance</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#0b0c10] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Datastore Sync</span>
              <span className="text-[#2dd4bf] font-bold">FIRESTORE ACTIVE</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0c10] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Security Encryption</span>
              <span className="text-indigo-400 font-bold">256-BIT SSL</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0c10] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Withdrawal Gate</span>
              <span className="text-[#facc15] font-bold">AUTO-VERIFIED</span>
            </div>
          </div>
        </div>

      </div>

      {/* Asset Balances Grid */}
      <div className="chainblock-card p-6 space-y-4">
        <div className="card-header-baseline">
          <h3 className="text-sm font-extrabold text-white font-mono tracking-tight">ASSET BALANCES BREAKDOWN</h3>
          <span className="text-xs font-mono text-[#facc15] font-bold">6 ASSETS SUPPORTED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((b) => (
            <div key={b.symbol} className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800/80 flex items-center justify-between font-mono">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full ${b.bg} flex items-center justify-center font-bold text-sm shadow-md`}>
                  {b.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs">{b.name}</h4>
                  <span className="text-[10px] text-slate-400">{b.amount}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-white text-xs block">{b.valUsd}</span>
                <span className="text-[10px] text-[#2dd4bf] font-bold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal & Deposit Transaction History Table */}
      <div className="chainblock-card p-6 space-y-4">
        <div className="card-header-baseline">
          <h3 className="text-sm font-extrabold text-white font-mono tracking-tight">PERSISTENT FIRESTORE WITHDRAWAL HISTORY</h3>
          <span className="text-xs font-mono text-slate-400">REAL-TIME FIRESTORE DATASTORE</span>
        </div>

        <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-800">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-[#0b0c10] border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-3 px-4">TX ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Destination Address</th>
                <th className="py-3 px-4">Network</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#14161d]">
              {withdrawalHistory && withdrawalHistory.length > 0 ? (
                withdrawalHistory.map((w) => (
                  <tr key={w.id} className="hover:bg-[#181a24] transition">
                    <td className="py-3 px-4 font-bold text-white">{w.id}</td>
                    <td className="py-3 px-4 font-bold text-[#facc15]">${w.amount} {w.currency}</td>
                    <td className="py-3 px-4 text-slate-300">{w.destinationAddress || w.address}</td>
                    <td className="py-3 px-4 text-indigo-400">{w.networkChain || 'Arbitrum One'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]">
                        {w.status || 'COMPLETED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-slate-400 text-[10px]">{w.txHash ? w.txHash.substring(0, 10) + '...' : '0x71c7...39b1'}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-[#181a24] transition">
                  <td className="py-3 px-4 font-bold text-white">WTH-4892</td>
                  <td className="py-3 px-4 font-bold text-[#facc15]">$5,000.00 USDT</td>
                  <td className="py-3 px-4 text-slate-300">0x71C765b28F3D140a831C28190d7B41</td>
                  <td className="py-3 px-4 text-indigo-400">Arbitrum One</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]">
                      COMPLETED
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-slate-400 text-[10px]">0x8f2a...39b1</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
