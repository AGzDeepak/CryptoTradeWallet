import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  LayoutGrid, 
  User, 
  LineChart, 
  Wallet, 
  Newspaper, 
  Settings, 
  LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, logout } = useCrypto();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'account', label: 'Account', icon: User },
    { id: 'chart', label: 'Chart', icon: LineChart },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-60 bg-[#0b0c10] border-r border-slate-800/80 flex flex-col justify-between p-6 z-30 shrink-0 h-full overflow-y-auto no-scrollbar font-sans">
      <div className="space-y-8">
        
        {/* Brand Emblem matching reference screenshot (Yellow Crescent / Circle) */}
        <div className="flex items-center space-x-3 cursor-pointer pl-2" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-full bg-[#facc15] flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.4)]">
            <div className="w-6 h-6 rounded-full bg-[#0b0c10] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-[#facc15]" />
            </div>
          </div>
        </div>

        {/* Navigation List matching reference screenshot */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id === 'chart' ? 'dashboard' : item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#1a1c23] text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#181a20]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#facc15]' : 'text-slate-500'}`} />
                <span>{item.label}</span>
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
