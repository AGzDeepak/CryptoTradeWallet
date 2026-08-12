import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  LayoutDashboard,
  BarChart2,
  ArrowLeftRight,
  Briefcase,
  ClipboardList,
  Settings,
  Wallet,
  LogOut,
  Moon
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, logout } = useCrypto();

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'exchanges',    label: 'Market',         icon: BarChart2 },
    { id: 'papertrading', label: 'Trade',          icon: ArrowLeftRight },
    { id: 'tradehistory', label: 'History',        icon: ClipboardList },
    { id: 'account',      label: 'Portfolio',      icon: Briefcase },
    { id: 'wallet',       label: 'Wallet',         icon: Wallet },
    { id: 'settings',     label: 'Settings',       icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-56 shrink-0 h-full flex-col bg-[#080f1c] border-r border-slate-800/60 z-30 overflow-y-auto no-scrollbar">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-800/60">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 w-full text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20 group-hover:bg-violet-500 transition">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">CryptoBot</div>
            <div className="text-[10px] text-slate-500 leading-tight">Trading Dashboard</div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-800/60 space-y-0.5">
        {/* Dark mode toggle (visual only) */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-400 font-medium">Dark Mode</span>
          </div>
          <div className="w-9 h-5 bg-violet-600 rounded-full relative cursor-pointer">
            <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Log out</span>
        </button>
      </div>

    </aside>
  );
};
