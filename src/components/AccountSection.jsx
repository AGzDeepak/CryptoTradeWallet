import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { User, ShieldCheck, Key, Lock, Bell, Sliders, Server, Cpu, Copy, Check, Download, LogOut, CheckCircle2, ShieldAlert, Zap, Globe, Smartphone } from 'lucide-react';

export const AccountSection = () => {
  const { user, openModal, addNotification, soundEnabled, setSoundEnabled, logout } = useCrypto();
  const [copiedId, setCopiedId] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(true);
  const [riskProfile, setRiskProfile] = useState('BALANCED');
  const [rebalanceFreq, setRebalanceFreq] = useState('1h');

  const copyId = () => {
    navigator.clipboard.writeText('9482-QUANT-PRO');
    setCopiedId(true);
    addNotification('Account ID copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const apiConnections = [
    { exchange: 'Binance Pro', status: 'CONNECTED', permissions: 'Read & Trade', ip: '192.168.1.1', color: 'text-[#facc15]', border: 'border-[#facc15]/30' },
    { exchange: 'Bybit Quant', status: 'CONNECTED', permissions: 'Full Arbitrage', ip: '192.168.1.1', color: 'text-[#2dd4bf]', border: 'border-[#2dd4bf]/30' },
    { exchange: 'OKX Institutional', status: 'CONNECTED', permissions: 'Read & Trade', ip: '192.168.1.1', color: 'text-purple-400', border: 'border-purple-500/30' },
    { exchange: 'Coinbase Pro', status: 'CONNECTED', permissions: 'Read & Trade', ip: '192.168.1.1', color: 'text-sky-400', border: 'border-sky-500/30' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Trader Profile Hero Card */}
      <div className="chainblock-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-full border-2 border-[#facc15] overflow-hidden shadow-[0_0_25px_rgba(250,204,21,0.35)] shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white font-sans tracking-tight">Deepak Quant Trader</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#facc15] text-slate-950">
                VIP TIER 4 INSTITUTIONAL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">deepak.quant@tradebot.io • ID: #9482-QUANT-PRO</p>
            
            <div className="flex items-center space-x-4 mt-2 text-xs font-mono">
              <span className="text-[#2dd4bf] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> KYC LEVEL 3 VERIFIED
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-400 font-bold">UNLIMITED ARBITRAGE PLAN</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={copyId}
            className="px-4 py-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-slate-200 text-xs font-mono font-bold hover:text-[#facc15] transition flex items-center gap-1.5"
          >
            {copiedId ? <Check className="w-4 h-4 text-[#2dd4bf]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedId ? 'COPIED ID' : 'COPY ACCOUNT ID'}</span>
          </button>
          <button
            onClick={() => openModal('SETTINGS')}
            className="px-4 py-2.5 rounded-xl bg-[#facc15] text-slate-950 text-xs font-mono font-extrabold hover:brightness-110 shadow-md flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4 stroke-[2.5]" />
            <span>EDIT ACCOUNT</span>
          </button>
        </div>
      </div>

      {/* 2 Column Split: Exchange API Keys & Security Safeguards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 Cols): Exchange API Key Matrix */}
        <div className="lg:col-span-8 chainblock-card p-6 space-y-6">
          <div className="card-header-baseline">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-[#facc15]" />
              <h3 className="text-sm font-extrabold text-white font-mono tracking-tight">MULTI-EXCHANGE QUANT API KEYS</h3>
            </div>
            <button
              onClick={() => openModal('SETTINGS')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[#facc15] font-mono text-xs font-bold hover:bg-slate-800"
            >
              + ADD NEW API KEY
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            {apiConnections.map((api) => (
              <div key={api.exchange} className={`p-4 rounded-2xl bg-[#0b0c10] border ${api.border} space-y-2`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-xs">{api.exchange}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 ${api.color} border border-slate-800`}>
                    {api.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Permissions:</span>
                    <span className="text-white font-bold">{api.permissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IP Lock:</span>
                    <span className="text-[#2dd4bf] font-bold">{api.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 Cols): Security & Authentication Options */}
        <div className="lg:col-span-4 chainblock-card p-6 space-y-6 font-mono text-xs">
          <div className="card-header-baseline">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-[#facc15]" />
              <h3 className="text-sm font-extrabold text-white tracking-tight">SECURITY SAFEGUARDS</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Two-Factor Auth (2FA)</span>
                <span className="text-[10px] text-slate-400">Authenticator App / YubiKey</span>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
                className="w-4 h-4 accent-[#facc15] cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">IP Auto-Lock Guard</span>
                <span className="text-[10px] text-slate-400">Lock Bot to Verified Subnets</span>
              </div>
              <input
                type="checkbox"
                checked={ipWhitelist}
                onChange={() => setIpWhitelist(!ipWhitelist)}
                className="w-4 h-4 accent-[#facc15] cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Sound FX Alerts</span>
                <span className="text-[10px] text-slate-400">Audio trigger on profit settlement</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={() => setSoundEnabled(!soundEnabled)}
                className="w-4 h-4 accent-[#facc15] cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Bot Autopilot Trading Risk Preferences */}
      <div className="chainblock-card p-6 space-y-4 font-mono text-xs">
        <div className="card-header-baseline">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#facc15]" />
            <h3 className="text-sm font-extrabold text-white tracking-tight">BOT AUTOPILOT RISK PREFERENCES</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-slate-400 block font-bold text-xs">Trading Risk Profile</label>
            <div className="grid grid-cols-3 gap-3">
              {['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRiskProfile(mode)}
                  className={`py-2.5 rounded-xl font-bold transition border ${
                    riskProfile === mode
                      ? 'bg-[#facc15] text-slate-950 border-[#facc15]'
                      : 'bg-[#0b0c10] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-400 block font-bold text-xs">Rebalance Frequency</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: '1h', label: 'EVERY 1H' },
                { id: '6h', label: 'EVERY 6H' },
                { id: 'realtime', label: 'REAL-TIME' }
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setRebalanceFreq(freq.id)}
                  className={`py-2.5 rounded-xl font-bold transition border ${
                    rebalanceFreq === freq.id
                      ? 'bg-[#2dd4bf] text-slate-950 border-[#2dd4bf]'
                      : 'bg-[#0b0c10] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
