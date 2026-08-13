import React from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Server, Bell, Volume2, Bot, Shield, Moon, Zap, RefreshCw } from 'lucide-react';

export const SettingsModal = () => {
  const {
    soundEnabled, setSoundEnabled,
    autoTradingEnabled, setAutoTradingEnabled,
    darkMode, setDarkMode
  } = useCrypto();

  const Toggle = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-10 h-5.5 rounded-full relative transition-colors ${on ? 'bg-violet-600' : 'bg-slate-700'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Configure your trading bot and system preferences</p>
      </div>

      {/* Two column grid for main settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Preferences */}
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800/70">
            <h2 className="text-sm font-semibold text-white">Preferences</h2>
          </div>
          <div className="p-5 space-y-0 divide-y divide-slate-800/50">
            {[
              {
                icon: <Volume2 className="w-4 h-4 text-violet-400" />,
                label: 'Sound Effects',
                desc: 'Play audio on trade executions',
                on: soundEnabled,
                toggle: () => setSoundEnabled(!soundEnabled)
              },
              {
                icon: <Bot className="w-4 h-4 text-emerald-400" />,
                label: 'Auto Trading Bot',
                desc: 'Enable automated arbitrage execution',
                on: autoTradingEnabled,
                toggle: () => setAutoTradingEnabled(!autoTradingEnabled)
              },
              {
                icon: <Bell className="w-4 h-4 text-amber-400" />,
                label: 'Push Notifications',
                desc: 'Get alerts for trades & price moves',
                on: true,
                toggle: () => {}
              },
              {
                icon: <Moon className="w-4 h-4 text-blue-400" />,
                label: 'Dark Mode',
                desc: darkMode ? 'Always-on dark theme' : 'Light theme active',
                on: darkMode,
                toggle: () => setDarkMode(!darkMode)
              },
            ].map((item, i) => (

              <div key={i} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <Toggle on={item.on} onToggle={item.toggle} />
              </div>
            ))}
          </div>
        </div>

        {/* Bot Performance */}
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800/70">
            <h2 className="text-sm font-semibold text-white">Bot Performance</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Scan Interval',     value: '400ms',         icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
              { label: 'Min Profit Gate',   value: '0.25%',         icon: <Shield className="w-3.5 h-3.5 text-emerald-400" /> },
              { label: 'Max Position Size', value: '$500 USDT',     icon: <RefreshCw className="w-3.5 h-3.5 text-violet-400" /> },
              { label: 'Take-Profit Mode',  value: 'Auto-Sell ON',  icon: <Bot className="w-3.5 h-3.5 text-cyan-400" /> },
              { label: 'Exchanges Active',  value: 'Binance, Bybit, OKX, Coinbase', icon: <Server className="w-3.5 h-3.5 text-blue-400" /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-0">
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span className="text-sm text-slate-300">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

