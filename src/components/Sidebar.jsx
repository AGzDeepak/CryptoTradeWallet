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
  Zap,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, openModal, notifications } = useCrypto();

  const overviewItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'markets', label: 'Market Scanner', icon: LineChart },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'trades', label: 'Audit Ledger', icon: ArrowLeftRight }
  ];

  const accountItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.length || '12' },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#0b0f19]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between p-5 z-30 shrink-0 h-full overflow-y-auto no-scrollbar font-sans shadow-2xl">
      <div className="space-y-6">
        
        {/* Brand Logo Banner */}
        <div className="flex items-center space-x-3 cursor-pointer p-1" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#34d399] via-cyan-400 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(52,211,153,0.4)]">
            <div className="w-full h-full bg-[#080b12] rounded-xl flex items-center justify-center">
              <Box className="w-5 h-5 fill-[#34d399] stroke-[#34d399]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white font-mono leading-none">
              Crypto<span className="text-[#34d399]">Bot</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400 font-semibold tracking-wider">AI QUANT QUANTUM</span>
          </div>
        </div>

        {/* Python Server Status Pill */}
        <div className="p-2.5 rounded-xl bg-[#121827] border border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Python Backend</span>
          <span className="text-[#34d399] font-extrabold text-[10px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-ping"></span> ONLINE
          </span>
        </div>

        {/* Category 1: OVERVIEW */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase px-3 block mb-2 font-mono">
            OVERVIEW TERMINAL
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
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121827]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#34d399]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category 2: ACCOUNT */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase px-3 block mb-2 font-mono">
            ACCOUNT & SETTINGS
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
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121827]'
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
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-500/40 text-[#34d399] text-xs font-bold transition shadow-sm font-mono"
        >
          <Bot className="w-4 h-4 text-[#34d399]" />
          <span>AI Support Desk</span>
        </button>

        <button
          onClick={() => openModal('FEEDBACK')}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-[#121827] transition font-mono"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>Add Feedback</span>
        </button>
      </div>
    </aside>
  );
};
