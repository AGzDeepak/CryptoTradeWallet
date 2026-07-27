import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { X, Key, ShieldCheck, Lock, CheckCircle2, Server, Eye, EyeOff } from 'lucide-react';

export const AddApiKeyModal = ({ onAddKey }) => {
  const { closeModal, addNotification } = useCrypto();

  const [exchange, setExchange] = useState('Binance Pro');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [ipAddress, setIpAddress] = useState('192.168.1.1');
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConnectApi = (e) => {
    e.preventDefault();

    if (!apiKey.trim() || !apiSecret.trim()) {
      addNotification('API Key and Secret are required!', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newConn = {
        exchange,
        status: 'CONNECTED',
        permissions: 'Read & Trade',
        ip: ipAddress || '192.168.1.1',
        apiKeyMasked: `${apiKey.substring(0, 6)}...${apiKey.slice(-4)}`,
        color: 'text-[#facc15]',
        border: 'border-[#facc15]/40'
      };

      if (onAddKey) onAddKey(newConn);
      addNotification(`Successfully connected ${exchange} API Key!`, 'success');
      setIsSubmitting(false);
      closeModal();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-lg bg-[#14161d] border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#facc15] text-slate-950 flex items-center justify-center font-bold">
              <Key className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-sans tracking-tight">CONNECT EXCHANGE API KEY</h3>
              <p className="text-xs text-slate-400 font-mono">Link exchange API keys for high-speed spatial arbitrage bot execution.</p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-[#0b0c10] border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConnectApi} className="space-y-4 font-mono text-xs">
          
          <div>
            <label className="text-slate-400 block mb-1 font-bold">Select Exchange Gateway *</label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-[#facc15]"
            >
              <option value="Binance Pro">Binance Pro</option>
              <option value="Bybit Quant">Bybit Quant</option>
              <option value="OKX Institutional">OKX Institutional</option>
              <option value="Coinbase Pro">Coinbase Pro</option>
              <option value="KuCoin Pro">KuCoin Pro</option>
              <option value="Kraken Pro">Kraken Pro</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">API Public Key String *</label>
            <input
              type="text"
              required
              placeholder="e.g. binance_api_key_8492049281"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#facc15]"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">API Secret Key *</label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                required
                placeholder="e.g. binance_secret_key_8492049281"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-white outline-none focus:border-[#facc15]"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-bold">IP Whitelist Restriction</label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.1"
              className="w-full bg-[#0b0c10] border border-slate-800 rounded-xl px-3.5 py-2.5 text-[#2dd4bf] font-bold outline-none focus:border-[#facc15]"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#0b0c10] border border-slate-800 space-y-2 text-[11px]">
            <span className="text-[#facc15] font-bold block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#facc15]" /> API Permissions Security Notice:
            </span>
            <p className="text-slate-400 leading-relaxed font-sans">
              Only Enable <strong>Read & Trading</strong> permissions. Never enable withdrawal permissions on exchange API keys.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-3 rounded-xl bg-[#0b0c10] border border-slate-800 text-slate-300 font-bold hover:bg-slate-900 transition"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#facc15] text-slate-950 font-extrabold hover:brightness-110 shadow-lg transition"
            >
              {isSubmitting ? 'CONNECTING...' : 'CONNECT EXCHANGE API KEY'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
