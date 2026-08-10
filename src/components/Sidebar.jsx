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
    { id: 'dashboard',        label: 'Dashboard',           icon: LayoutGrid },
    { id: 'contractprocess',  label: 'Contract Process',     icon: FileCode2 },
    { id: 'banktransfer',     label: 'Bank Transfer',        icon: Landmark },
    { id: 'metamaskterminal', label: 'MetaMask Terminal',    icon: Zap,        badge: 'WEB3' },
    { id: 'realwallet',       label: 'Real Wallet',          icon: Gem,        badge: 'LIVE' },
    { id: 'decentralized',    label: 'Vault Wallet',         icon: ShieldCheck },
    { id: 'papertrading',     label: 'Paper Trading',        icon: ShoppingBag },
    { id: 'account',          label: 'Account',              icon: User },
    { id: 'settings',         label: 'Settings',             icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 h-full flex-col justify-between bg-gradient-to-b from-[#0b1624] via-[#07101a] to-[#03070d] border-r border-[#68a7ca]/25 z-30 overflow-y-auto no-scrollbar font-sans shadow-2xl">

      {/* Top: Brand + Nav */}
      <div className="flex flex-col gap-6 p-5">

        {/* Brand Emblem */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 px-2 py-1 rounded-2xl hover:bg-white/5 transition w-full text-left"
        >
          <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] flex items-center justify-center shadow-[0_0_22px_rgba(67,144,188,0.5)] hover:scale-105 transition-transform">
            <div className="w-5.5 h-5.5 rounded-xl bg-[#07101a] flex items-center justify-center">
              <div className="w-3 h-3 rounded-lg bg-gradient-to-br from-[#8dbdd8] to-[#dbe9f3] animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-black text-white tracking-tight uppercase font-mono leading-tight truncate">CryptoTradeWallet</div>
            <div className="text-[9px] text-[#8dbdd8] font-mono font-bold tracking-widest uppercase">QUANT TERMINAL</div>
          </div>
        </button>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#68a7ca]/20 to-transparent" />

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'chainblock-nav-active'
                    : 'text-slate-400 hover:text-[#dbe9f3] hover:bg-[#101f30]/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#dbe9f3]' : 'text-[#68a7ca]'}`} />
                <span className="flex-1 truncate text-left">{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? item.badge === 'LIVE'
                        ? 'bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30'
                        : 'bg-[#4390bc]/30 text-[#dbe9f3] border border-[#8dbdd8]/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Logout */}
      <div className="p-5 border-t border-slate-800/60">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 text-xs font-semibold transition-all"
        >
          <LogOut className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
