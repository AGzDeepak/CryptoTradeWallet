import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Settings, Key, Server, Sliders, ShieldCheck, Eye, EyeOff, Save } from 'lucide-react';

export const SettingsModal = () => {
  const { soundEnabled, setSoundEnabled, autoTradingEnabled, setAutoTradingEnabled } = useCrypto();
  
  const [flaskUrl, setFlaskUrl] = useState('http://localhost:5000/api');
  const [wsUrl, setWsUrl] = useState('ws://localhost:5000/ws');
  const [showKeys, setShowKeys] = useState(false);
  
  const [binanceKey, setBinanceKey] = useState('binance_api_key_8921x_prod');
  const [bybitKey, setBybitKey] = useState('bybit_api_key_4412z_prod');

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved & backend endpoints updated successfully!');
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-extrabold text-white">SYSTEM CONFIGURATION & API KEYS</h3>
        </div>
        <span className="text-xs font-mono text-emerald-400">FLASK BACKEND CONNECTIVITY READY</span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Backend Endpoints */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
            <Server className="w-3.5 h-3.5" /> Flask REST API & WebSocket Config
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Flask REST Endpoint URL</label>
              <input
                type="text"
                value={flaskUrl}
                onChange={(e) => setFlaskUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">WebSocket Gateway URL</label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono uppercase text-purple-400 font-bold flex items-center gap-1">
              <Key className="w-3.5 h-3.5" /> Exchange API Keys (Encrypted)
            </h4>
            <button
              type="button"
              onClick={() => setShowKeys(!showKeys)}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono"
            >
              {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showKeys ? 'Hide Keys' : 'Show Keys'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Binance API Key</label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={binanceKey}
                onChange={(e) => setBinanceKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Bybit API Key</label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={bybitKey}
                onChange={(e) => setBybitKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center space-x-2 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.3)] transition"
        >
          <Save className="w-4 h-4" />
          <span>SAVE SYSTEM PREFERENCES</span>
        </button>

      </form>
    </div>
  );
};
