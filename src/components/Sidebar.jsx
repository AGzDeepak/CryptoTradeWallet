import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  LayoutGrid, 
  LineChart, 
  Briefcase, 
  ArrowLeftRight, 
  Newspaper, 
  Bell, 
  Users, 
  Settings, 
  HelpCircle, 
  MessageSquare,
  Box,
  Bot,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, openModal, notifications } = useCrypto();

  const overviewItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'vibrant_wellness', label: 'Vibrant Wellness', icon: Sparkles, highlight: true },
    { id: 'markets', label: 'Market', icon: LineChart },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'trades', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'news', label: 'News', icon: Newspaper }
  ];

  const accountItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.length || '12' },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-60 bg-[#11141b] border-r border-slate-800/80 flex flex-col justify-between p-5 z-30 shrink-0 h-full overflow-y-auto no-scrollbar font-sans">
      <div className="space-y-6">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-[#34d399] flex items-center justify-center text-black font-extrabold shadow-[0_0_12px_rgba(52,211,153,0.4)]">
            <Box className="w-5 h-5 fill-black stroke-black" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white font-mono">
            chain<span className="text-[#34d399]">block</span>
          </span>
        </div>

        {/* Category 1: OVERVIEW */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase px-3 block mb-2">
            OVERVIEW
          </span>
          <div className="space-y-1">
            {overviewItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'chainblock-nav-active'
                      : item.highlight
                      ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 hover:bg-[#34d399]/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive || item.highlight ? 'text-[#34d399]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category 2: ACCOUNT */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase px-3 block mb-2">
            ACCOUNT
          </span>
          <div className="space-y-1">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => item.id === 'notifications' ? openModal('NOTIFICATIONS') : setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'chainblock-nav-active'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#34d399]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Section: AI Support & Feedback */}
      <div className="space-y-2 pt-4 border-t border-slate-800/80">
        <button
          onClick={() => openModal('AI_SUPPORT')}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-500/40 text-[#34d399] text-xs font-bold transition shadow-sm"
        >
          <Bot className="w-4 h-4 text-[#34d399]" />
          <span>AI Support Desk</span>
        </button>

        <button
          onClick={() => openModal('FEEDBACK')}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800/50 transition"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>Add Feedback</span>
        </button>
      </div>
    </aside>
  );
};
