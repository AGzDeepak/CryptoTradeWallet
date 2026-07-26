import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { X, Wallet, Copy, Check, Bell, Sliders, ArrowDownCircle, PlusCircle, LogOut, Trash2, Zap, CheckCircle2, AlertTriangle, Info, AlertOctagon, ShieldCheck, Link2 } from 'lucide-react';

export const GlobalModals = () => {
  const { 
    activeModal, 
    modalData, 
    closeModal, 
    wallet, 
    depositFunds, 
    resetWallet, 
    openModal,
    notifications,
    clearNotifications,
    removeNotification,
    addNotification,
    walletMode,
    setWalletMode,
    realWallet,
    connectRealWallet,
    disconnectRealWallet
  } = useCrypto();

  const [copied, setCopied] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState('MetaMask');
  
  // Deposit state
  const [depositAmount, setDepositAmount] = useState('10000');
  const [depositCurrency, setDepositCurrency] = useState('USDT');

  // Strategy config state
  const [minProfit, setMinProfit] = useState('0.25');
  const [maxGas, setMaxGas] = useState('5.00');

  if (!activeModal) return null;

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr || '0x00D3f92A8c14B9204c3D');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = (e) => {
    e.preventDefault();
    depositFunds(parseFloat(depositAmount), depositCurrency);
    closeModal();
  };

  const handleConnectWeb3 = async () => {
    await connectRealWallet(selectedWalletType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans animate-fade-in">
      <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-mono">
            {activeModal === 'WALLET' && <Wallet className="w-5 h-5 text-cyan-400" />}
            {activeModal === 'DEPOSIT' && <ArrowDownCircle className="w-5 h-5 text-[#34d399]" />}
            {activeModal === 'NOTIFICATIONS' && <Bell className="w-5 h-5 text-purple-400" />}
            {activeModal === 'LOGOUT' && <LogOut className="w-5 h-5 text-rose-400" />}
            {activeModal === 'CONFIG_STRATEGY' && <Sliders className="w-5 h-5 text-cyan-400" />}
            
            {activeModal === 'WALLET' && 'WALLET CONFIGURATION & WEB3'}
            {activeModal === 'DEPOSIT' && 'DEPOSIT MOCK FUNDS'}
            {activeModal === 'NOTIFICATIONS' && 'SYSTEM NOTIFICATIONS LOG'}
            {activeModal === 'LOGOUT' && 'CONFIRM LOGOUT'}
            {activeModal === 'CONFIG_STRATEGY' && `CONFIGURE MODEL: ${modalData?.name || 'STRATEGY'}`}
          </h3>

          <button onClick={closeModal} className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-4 font-mono text-xs">

          {/* 1. WALLET MODAL (DEMO VS REAL WEB3 WALLET CONNECT) */}
          {activeModal === 'WALLET' && (
            <div className="space-y-4">
              
              {/* Wallet Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1 bg-[#161a23] p-1 rounded-xl border border-slate-800 text-xs font-mono font-bold">
                <button
                  onClick={() => setWalletMode('DEMO')}
                  className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                    walletMode === 'DEMO'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>DEMO PAPER WALLET</span>
                </button>
                <button
                  onClick={() => setWalletMode('REAL')}
                  className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                    walletMode === 'REAL'
                      ? 'bg-emerald-500/20 text-[#34d399] border border-[#34d399]/40 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-[#34d399]" />
                  <span>REAL WEB3 WALLET</span>
                </button>
              </div>

              {/* DEMO WALLET VIEW */}
              {walletMode === 'DEMO' && (
                <div className="space-y-3">
                  <div className="bg-[#060810] p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-slate-500 block text-[10px] uppercase">Simulated Arbitrum Address</span>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-cyan-400 font-bold">0x00D3f92A8c14B9204c3D</span>
                      <button onClick={() => copyAddress('0x00D3f92A8c14B9204c3D')} className="text-slate-400 hover:text-cyan-400">
                        {copied ? <Check className="w-4 h-4 text-[#34d399]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Virtual Balance</span>
                      <span className="text-lg font-bold text-white font-mono">${wallet.virtualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Trading Network</span>
                      <span className="text-[#34d399] font-bold block">{wallet.network}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => openModal('DEPOSIT')}
                      className="flex-1 py-2.5 bg-[#34d399] hover:bg-[#6ee7b7] text-black font-bold rounded-xl flex items-center justify-center gap-1.5 font-sans"
                    >
                      <PlusCircle className="w-4 h-4" /> Deposit Demo Funds
                    </button>
                    <button onClick={() => { resetWallet(); closeModal(); }} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-rose-300 font-bold rounded-xl border border-slate-800 font-sans">
                      Reset ($100k)
                    </button>
                  </div>
                </div>
              )}

              {/* REAL WEB3 WALLET VIEW */}
              {walletMode === 'REAL' && (
                <div className="space-y-3 font-sans">
                  {realWallet.connected ? (
                    <div className="space-y-3">
                      <div className="bg-[#060810] p-4 rounded-xl border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#34d399] font-mono">
                          <span className="flex items-center gap-1 font-bold"><ShieldCheck className="w-4 h-4" /> {realWallet.walletType} CONNECTED</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-[#34d399] border border-emerald-800 text-[10px]">{realWallet.networkName}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono">
                          <span className="text-white font-bold">{realWallet.address}</span>
                          <button onClick={() => copyAddress(realWallet.address)} className="text-slate-400 hover:text-cyan-400">
                            {copied ? <Check className="w-4 h-4 text-[#34d399]" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono">
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Real ETH Balance</span>
                          <span className="text-lg font-bold text-white block">{realWallet.balanceEth} ETH</span>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Est. USD Value</span>
                          <span className="text-lg font-bold text-[#34d399] block">${realWallet.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <button
                        onClick={disconnectRealWallet}
                        className="w-full py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-800 font-mono text-xs flex items-center justify-center gap-1.5"
                      >
                        Disconnect Web3 Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono">
                      <span className="text-slate-400 block text-[11px]">Select Web3 Wallet Provider:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {['MetaMask', 'Coinbase Wallet', 'Trust Wallet', 'WalletConnect'].map((wType) => (
                          <button
                            key={wType}
                            type="button"
                            onClick={() => setSelectedWalletType(wType)}
                            className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-bold transition ${
                              selectedWalletType === wType
                                ? 'bg-emerald-950/60 border-[#34d399] text-[#34d399]'
                                : 'bg-[#060810] border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <Link2 className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{wType}</span>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleConnectWeb3}
                        className="w-full py-3 bg-[#34d399] hover:bg-[#6ee7b7] text-black font-extrabold rounded-xl shadow-lg mt-2 font-sans flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>CONNECT {selectedWalletType.toUpperCase()} WALLET</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* 2. DEPOSIT MODAL */}
          {activeModal === 'DEPOSIT' && (
            <form onSubmit={handleConfirmDeposit} className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Select Currency</label>
                <select
                  value={depositCurrency}
                  onChange={(e) => setDepositCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                >
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Deposit Amount ($)</label>
                <input
                  type="number"
                  step="500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[#34d399] font-bold text-sm outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                {['1000', '5000', '10000', '50000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px]"
                  >
                    +${parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#34d399] hover:bg-[#6ee7b7] text-black font-extrabold rounded-xl shadow-lg mt-2 font-sans"
              >
                CONFIRM MOCK DEPOSIT
              </button>
            </form>
          )}

          {/* 3. NOTIFICATIONS MODAL */}
          {activeModal === 'NOTIFICATIONS' && (
            <div className="space-y-3 font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Total Logs: {notifications.length}</span>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => addNotification('Test Trade Alert Triggered (+0.47% Spread)', 'success')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-[10px] font-mono flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Test Trigger
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-mono flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto no-scrollbar space-y-2 font-mono text-xs">
                {notifications.length === 0 ? (
                  <div className="text-center text-slate-500 py-8 font-mono">
                    No active notifications. System operating normally.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-[#060810] rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start space-x-2.5">
                        <div className="mt-0.5">
                          {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#34d399]" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {notif.type === 'danger' && <AlertOctagon className="w-4 h-4 text-rose-400" />}
                          {notif.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold uppercase text-slate-400">{notif.type}</span>
                            <span className="text-[9px] text-slate-500">• {notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-200 mt-0.5 font-sans font-semibold">
                            {notif.message}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-slate-500 hover:text-white shrink-0 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. LOGOUT MODAL */}
          {activeModal === 'LOGOUT' && (
            <div className="space-y-4 text-center">
              <p className="text-slate-300 font-sans text-sm">
                Are you sure you want to exit the Trading Terminal?
              </p>
              <div className="flex space-x-3 pt-2 font-sans">
                <button onClick={() => { closeModal(); }} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl">
                  Confirm Exit
                </button>
                <button onClick={closeModal} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-800">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* 5. CONFIG STRATEGY MODAL */}
          {activeModal === 'CONFIG_STRATEGY' && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Minimum Net Profit Target (%)</label>
                <input
                  type="number"
                  value={minProfit}
                  onChange={(e) => setMinProfit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[#34d399] font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Max Gas Fee Limit ($)</label>
                <input
                  type="number"
                  value={maxGas}
                  onChange={(e) => setMaxGas(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>

              <button
                onClick={() => { alert(`Strategy Parameters Updated! Min Profit: ${minProfit}%`); closeModal(); }}
                className="w-full py-2.5 bg-[#34d399] hover:bg-[#6ee7b7] text-black font-bold rounded-xl font-sans"
              >
                APPLY PARAMETERS
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
