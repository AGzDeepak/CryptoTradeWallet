import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Search, ChevronDown, Bot, Volume2, VolumeX, LogOut, Wallet, ShieldCheck, Zap } from 'lucide-react';

export const Header = () => {
  const { 
    autoTradingEnabled, 
    setAutoTradingEnabled, 
    soundEnabled, 
    setSoundEnabled,
    openModal,
    user,
    logout,
    walletMode,
    setWalletMode,
    realWallet
  } = useCrypto();

  return (
    <header className="bg-[#11141b] border-b border-slate-800/80 px-6 h-16 flex items-center justify-between z-40 shrink-0 font-sans">
      
      {/* Title */}
      <h1 className="text-xl font-extrabold text-white tracking-tight">Dashboard</h1>

      {/* Center Search Bar */}
      <div className="relative hidden md:block w-72">
        <input
          type="text"
          placeholder="Search pair, symbol or exchange..."
          className="w-full bg-[#161a23] border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-[#34d399] transition font-mono"
        />
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
      </div>

      {/* Right Controls: Dual Wallet Mode Toggle + Currency Pill + Profile Badge + Logout */}
      <div className="flex items-center space-x-3">
        
        {/* Dual Wallet Mode Switcher (DEMO vs REAL WEB3) */}
        <div className="flex items-center bg-[#161a23] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setWalletMode('DEMO')}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition font-bold ${
              walletMode === 'DEMO'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="hidden lg:inline">DEMO</span>
          </button>

          <button
            onClick={() => {
              if (realWallet.connected) {
                setWalletMode('REAL');
              } else {
                openModal('WALLET');
              }
            }}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition font-bold ${
              walletMode === 'REAL'
                ? 'bg-emerald-500/20 text-[#34d399] border border-[#34d399]/40 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Wallet className="w-3 h-3 text-[#34d399]" />
            <span className="hidden lg:inline">{realWallet.connected ? realWallet.shortAddress : 'REAL WEB3'}</span>
          </button>
        </div>

        {/* Master Bot Autopilot Toggle */}
        <button
          onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            autoTradingEnabled
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse'
              : 'bg-slate-900 text-slate-400 border-slate-700'
          }`}
        >
          <Bot className={`w-3.5 h-3.5 ${autoTradingEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="hidden xl:inline">BOT: {autoTradingEnabled ? 'AUTOPILOT ON' : 'PAUSED'}</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-[#161a23] border border-slate-800 text-slate-400 hover:text-white transition"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#34d399]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* USDT Currency Pill Dropdown */}
        <div
          onClick={() => openModal('DEPOSIT')}
          className="flex items-center space-x-2 bg-[#161a23] border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer hover:border-slate-700 transition"
        >
          <span className="w-4 h-4 rounded-full bg-[#34d399] text-black font-bold flex items-center justify-center text-[10px]">T</span>
          <span className="text-white">USDT</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* User Profile Badge */}
        <div
          onClick={() => openModal('WALLET')}
          className="flex items-center space-x-2 bg-[#161a23] border border-slate-800 px-2.5 py-1.5 rounded-xl cursor-pointer hover:border-slate-700 transition"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs font-mono">
            {user.avatar || 'D'}
          </div>
          <span className="text-xs font-bold text-slate-200 hidden sm:inline">{user.name}</span>
        </div>

        {/* Quick Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-xl bg-[#161a23] border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-800 transition"
          title="Sign Out / Switch Account"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>

    </header>
  );
};
