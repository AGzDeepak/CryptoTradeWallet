import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Search, Mail, Bell, Bot, Volume2, VolumeX, LogOut, Wallet, Zap, ShieldCheck } from 'lucide-react';

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
    realWallet,
    notifications
  } = useCrypto();

  return (
    <header className="bg-[#0b0c10] border-b border-slate-800/80 px-6 sm:px-8 h-20 flex items-center justify-between z-40 shrink-0 font-sans">
      
      {/* Dashboard Title matching reference screenshot */}
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-extrabold text-[#facc15] tracking-tight font-sans">
          Dashboard
        </h1>
      </div>

      {/* Center Search Bar matching reference screenshot */}
      <div className="relative hidden md:block w-96">
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-[#181a20] border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-[#facc15] transition font-sans shadow-inner"
        />
        <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
      </div>

      {/* Right Controls matching reference screenshot (Mail + Bell + Avatar + Bot Pill) */}
      <div className="flex items-center space-x-4">
        
        {/* Master Bot Autopilot Pill */}
        <button
          onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
          className={`hidden xl:flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono border transition ${
            autoTradingEnabled
              ? 'bg-amber-950/80 text-[#facc15] border-[#facc15]/50 glow-yellow'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <Bot className={`w-4 h-4 ${autoTradingEnabled ? 'text-[#facc15]' : 'text-slate-500'}`} />
          <span>AUTOPILOT: {autoTradingEnabled ? 'ON' : 'PAUSED'}</span>
        </button>

        {/* Dual Wallet Switcher */}
        <div className="hidden sm:flex items-center bg-[#181a20] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setWalletMode('DEMO')}
            className={`px-3 py-1 rounded-lg transition font-bold ${
              walletMode === 'DEMO'
                ? 'bg-[#facc15] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DEMO
          </button>
          <button
            onClick={() => {
              if (realWallet.connected) setWalletMode('REAL');
              else openModal('WALLET');
            }}
            className={`px-3 py-1 rounded-lg transition font-bold ${
              walletMode === 'REAL'
                ? 'bg-[#facc15] text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {realWallet.connected ? realWallet.shortAddress : 'REAL WEB3'}
          </button>
        </div>

        {/* Mail Icon */}
        <button 
          onClick={() => openModal('AI_SUPPORT')}
          className="p-2.5 rounded-xl bg-[#181a20] border border-slate-800 text-slate-300 hover:text-[#facc15] transition"
        >
          <Mail className="w-4 h-4" />
        </button>

        {/* Notification Bell with alert dot */}
        <button
          onClick={() => openModal('NOTIFICATIONS')}
          className="relative p-2.5 rounded-xl bg-[#181a20] border border-slate-800 text-slate-300 hover:text-[#facc15] transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#facc15]"></span>
        </button>

        {/* User Profile Avatar picture matching reference screenshot */}
        <div
          onClick={() => openModal('WALLET')}
          className="w-9 h-9 rounded-full bg-slate-800 border border-[#facc15]/50 overflow-hidden cursor-pointer hover:border-[#facc15] transition flex items-center justify-center font-bold text-[#facc15]"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2.5 rounded-xl bg-[#181a20] border border-slate-800 text-slate-400 hover:text-rose-400 transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>

    </header>
  );
};
