import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  LayoutGrid, 
  User, 
  Wallet, 
  Settings, 
  LogOut,
  ShoppingBag,
  FlaskConical,
  Gem,
  ShieldCheck,
  Users,
  Zap
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, logout } = useCrypto();

  const navItems = [
    { id: 'dashboard',        label: 'Dashboard',         icon: LayoutGrid },
    { id: 'metamaskterminal', label: 'MetaMask Terminal', icon: Zap },
    { id: 'realwallet',       label: 'Real Wallet',        icon: Gem },
    { id: 'decentralized',    label: 'Vault Wallet',       icon: ShieldCheck },
    { id: 'team',             label: 'Team Desk',          icon: Users },
    { id: 'papertrading',     label: 'Paper Trading',      icon: ShoppingBag },
    { id: 'account',          label: 'Account',            icon: User },
    { id: 'settings',         label: 'Settings',           icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-gradient-to-b from-[#090e1a] via-[#060812] to-[#04050a] border-r border-slate-800/80 flex-col justify-between p-6 z-30 shrink-0 h-full overflow-y-auto no-scrollbar font-sans shadow-2xl">
      <div className="space-y-8">
        
        {/* Brand Emblem */}
        <div className="flex items-center space-x-3 cursor-pointer pl-2" onClick={() => setActiveTab('dashboard')}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] transition hover:scale-105">
            <div className="w-6 h-6 rounded-xl bg-[#060812] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight uppercase font-mono">CHAINBLOCK</h1>
            <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest block -mt-0.5">QUANT TERMINAL</span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRealWallet = item.id === 'realwallet';
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'chainblock-nav-active'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-500'
                }`} />
                <span>{item.label}</span>
                {item.id === 'metamaskterminal' && (
                  <span className={`ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-500'
                  }`}>WEB3</span>
                )}
                {isRealWallet && (
                  <span className={`ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-[#2dd4bf]/20 text-[#2dd4bf]' : 'bg-slate-800 text-slate-500'
                  }`}>LIVE</span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom Log out Item matching reference screenshot */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-[#181a20] text-xs font-semibold transition"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
