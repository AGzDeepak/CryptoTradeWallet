import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Server, Bell, Volume2, Bot, Shield, Moon, Zap, RefreshCw, Copy, Check, ExternalLink, Code, Globe } from 'lucide-react';

const CONTRACT_GROUPS = [
  {
    network: 'Ethereum Mainnet',
    chain: 'ETH',
    badge: 'bg-violet-500/20 text-violet-300',
    contracts: [
      { name: 'Uniswap V2 Router', type: 'DEX Router', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', url: 'https://etherscan.io/address/0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
      { name: 'Wrapped ETH (WETH)', type: 'Wrapped Native', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', url: 'https://etherscan.io/token/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
      { name: 'Tether USD (USDT)', type: 'ERC-20 Token', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', url: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7' },
      { name: 'USD Coin (USDC)', type: 'ERC-20 Token', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', url: 'https://etherscan.io/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
      { name: 'DAI Stablecoin', type: 'ERC-20 Token', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', url: 'https://etherscan.io/token/0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      { name: 'Wrapped BTC (WBTC)', type: 'ERC-20 Token', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', url: 'https://etherscan.io/token/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
    ]
  },
  {
    network: 'BNB Smart Chain',
    chain: 'BSC',
    badge: 'bg-amber-500/20 text-amber-300',
    contracts: [
      { name: 'PancakeSwap V2 Router', type: 'DEX Router', address: '0x10ED43C718714eb63d5aA57B78B54704E256024E', url: 'https://bscscan.com/address/0x10ED43C718714eb63d5aA57B78B54704E256024E' },
      { name: 'Wrapped BNB (WBNB)', type: 'Wrapped Native', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', url: 'https://bscscan.com/token/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
      { name: 'Tether USD (USDT)', type: 'BEP-20 Token', address: '0x55d398326f99059fF775485246999027B3197955', url: 'https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955' },
      { name: 'USD Coin (USDC)', type: 'BEP-20 Token', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', url: 'https://bscscan.com/token/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
    ]
  },
  {
    network: 'Polygon PoS',
    chain: 'Polygon',
    badge: 'bg-purple-500/20 text-purple-300',
    contracts: [
      { name: 'QuickSwap Router', type: 'DEX Router', address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', url: 'https://polygonscan.com/address/0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff' },
      { name: 'Wrapped MATIC (WMATIC)', type: 'Wrapped Native', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', url: 'https://polygonscan.com/token/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' },
      { name: 'Tether USD (USDT)', type: 'ERC-20 Token', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', url: 'https://polygonscan.com/token/0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
      { name: 'USD Coin (USDC)', type: 'ERC-20 Token', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', url: 'https://polygonscan.com/token/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
    ]
  },
  {
    network: 'Arbitrum One',
    chain: 'Arbitrum',
    badge: 'bg-cyan-500/20 text-cyan-300',
    contracts: [
      { name: 'SushiSwap Router', type: 'DEX Router', address: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', url: 'https://arbiscan.io/address/0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506' },
      { name: 'Tether USD (USDT)', type: 'ERC-20 Token', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', url: 'https://arbiscan.io/token/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' },
      { name: 'USD Coin (USDC)', type: 'ERC-20 Token', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', url: 'https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
    ]
  },
  {
    network: 'Base & Avalanche',
    chain: 'Base / AVAX',
    badge: 'bg-emerald-500/20 text-emerald-300',
    contracts: [
      { name: 'Uniswap V2 Router (Base)', type: 'DEX Router', address: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24', url: 'https://basescan.org/address/0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24' },
      { name: 'TraderJoe V1 Router (Avax)', type: 'DEX Router', address: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4', url: 'https://snowtrace.io/address/0x60aE616a2155Ee3d9A68541Ba4544862310933d4' },
    ]
  }
];

export const SettingsModal = () => {
  const {
    soundEnabled, setSoundEnabled,
    autoTradingEnabled, setAutoTradingEnabled,
    darkMode, setDarkMode
  } = useCrypto();

  const [copiedKey, setCopiedKey] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(CONTRACT_GROUPS[0].network);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const Toggle = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-10 h-5.5 rounded-full relative transition-colors ${on ? 'bg-violet-600' : 'bg-slate-700'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  const activeGroupData = CONTRACT_GROUPS.find(g => g.network === selectedGroup) || CONTRACT_GROUPS[0];

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Configure system preferences & inspect verified smart contract addresses</p>
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

      {/* Official Smart Contract Addresses Section */}
      <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 overflow-hidden space-y-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-800/70 gap-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Verified Smart Contract Addresses</h2>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CONTRACT_GROUPS.map(g => (
              <button
                key={g.network}
                onClick={() => setSelectedGroup(g.network)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition ${
                  selectedGroup === g.network
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                    : 'bg-[#060d18] text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                {g.chain}
              </button>
            ))}
          </div>
        </div>

        {/* Contract Table List */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              {activeGroupData.network} Contracts
            </span>
            <span className="text-[11px] text-slate-500">
              {activeGroupData.contracts.length} Verified Addresses
            </span>
          </div>

          <div className="space-y-2">
            {activeGroupData.contracts.map((c, i) => {
              const copyKey = `${activeGroupData.network}-${i}`;
              const isCopied = copiedKey === copyKey;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/60 hover:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{c.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {c.type}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 break-all select-all">
                      {c.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => copyToClipboard(c.address, copyKey)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                      }`}
                      title="Copy Contract Address"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>

                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-violet-300 border border-slate-700/60 transition"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};


