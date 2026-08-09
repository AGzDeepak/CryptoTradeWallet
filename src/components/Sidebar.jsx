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
  Zap,
  FileCode2,
  Landmark
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, logout } = useCrypto();

  const navItems = [
    { id: 'dashboard',          label: 'Dashboard',             icon: LayoutGrid },
    { id: 'contractprocess',    label: 'Contract Process',       icon: FileCode2 },
    { id: 'banktransfer',       label: 'Bank to Bank Transfer',  icon: Landmark },
    { id: 'metamaskterminal',   label: 'MetaMask Terminal',     icon: Zap },
    { id: 'realwallet',         label: 'Real Wallet',            icon: Gem },
    { id: 'decentralized',      label: 'Vault Wallet',           icon: ShieldCheck },
    { id: 'papertrading',       label: 'Paper Trading',          icon: ShoppingBag },
    { id: 'account',            label: 'Account',                icon: User },
    { id: 'settings',           label: 'Settings',               icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-gradient-to-b from-[#0b1624] via-[#07101a] to-[#03070d] border-r border-[#68a7ca]/30 flex-col justify-between p-6 z-30 shrink-0 h-full overflow-y-auto no-scrollbar font-sans shadow-2xl">
      <div className="space-y-8">
        
        {/* Brand Emblem */}
        <div className="flex items-center space-x-3 cursor-pointer pl-2" onClick={() => setActiveTab('dashboard')}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] flex items-center justify-center shadow-[0_0_25px_rgba(67,144,188,0.5)] transition hover:scale-105">
            <div className="w-6 h-6 rounded-xl bg-[#07101a] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-lg bg-gradient-to-br from-[#8dbdd8] to-[#dbe9f3] animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xs font-black text-white tracking-tight uppercase font-mono">CryptoTradewallet</h1>
            <span className="text-[10px] text-[#8dbdd8] font-mono font-bold tracking-widest block -mt-0.5">QUANT TERMINAL</span>
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
                    : 'text-slate-400 hover:text-[#dbe9f3] hover:bg-[#101f30]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive
                    ? 'text-[#dbe9f3]'
                    : 'text-[#68a7ca]'
                }`} />
                <span>{item.label}</span>
                {item.id === 'metamaskterminal' && (
                  <span className={`ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-[#4390bc]/30 text-[#dbe9f3] border border-[#8dbdd8]/50' : 'bg-slate-800 text-slate-400'
                  }`}>WEB3</span>
                )}
                {isRealWallet && (
                  <span className={`ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-[#00e676]/20 text-[#00e676]' : 'bg-slate-800 text-slate-400'
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
