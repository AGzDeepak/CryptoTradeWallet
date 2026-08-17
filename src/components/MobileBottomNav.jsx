import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  LayoutGrid, 
  ShoppingBag, 
  FlaskConical, 
  Wallet, 
  User, 
  Settings,
  Gem,
  ShieldCheck,
  Users,
  Zap,
  Cpu
} from 'lucide-react';

export const MobileBottomNav = () => {
  const { activeTab, setActiveTab } = useCrypto();

  const navItems = [
    { id: 'trade', label: 'Trade', icon: Zap },
    { id: 'market', label: 'Market', icon: LayoutGrid },
    { id: 'portfolio', label: 'Portfolio', icon: User },
    { id: 'risk', label: 'Risk', icon: ShieldCheck },
    { id: 'automation', label: 'Auto', icon: Cpu },
    { id: 'arbitrage', label: 'Arbitrage', icon: Gem }
  ];



  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0b0c10]/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] font-sans">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition duration-200 ${
                isActive
                  ? 'text-[#facc15] font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-[#facc15]' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#facc15] shadow-[0_0_8px_#facc15]" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-mono whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
