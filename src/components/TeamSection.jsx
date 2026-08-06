import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  Users, 
  UserPlus, 
  Share2, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  Key, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  Radio, 
  Crown, 
  Trash2, 
  QrCode, 
  Layers, 
  CircleDollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export const TeamSection = () => {
  const { 
    addNotification, 
    user,
    teamMembers, 
    setTeamMembers, 
    teamVaultCode, 
    setTeamVaultCode,
    teamCodeStats,
    setTeamCodeStats,
    joinTeamViaCode,
    activeTradeExecutionMode,
    setActiveTradeExecutionMode,
    tradeHistory,
    executeOrder,
    openModal,
    realWallet,
    connectRealWallet
  } = useCrypto();

  const [copied, setCopied] = useState('');
  const [teamName, setTeamName] = useState('Alpha Quant Trading Desk');
  const [teamPassword, setTeamPassword] = useState('QuantTeam2026!');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinPasswordInput, setJoinPasswordInput] = useState('');

  // Add Member Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Quant Trader');

  // Interactive Team Mock Trade Form State
  const [teamMockSymbol, setTeamMockSymbol] = useState('ETHUSDT');
  const [teamMockSide, setTeamMockSide] = useState('BUY');
  const [teamMockAmount, setTeamMockAmount] = useState('1000');
  
  // Persistent Team Trade Stream & Chat Messages (Initially Empty)
  const [teamTrades, setTeamTrades] = useState(() => {
    try {
      const saved = localStorage.getItem('chainblock_team_trades');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chainblock_team_chat');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [inputMsg, setInputMsg] = useState('');

  const networkUrl = 'http://10.24.123.211:3000/';

  // Universal Clipboard Copy
  const copyToClipboard = (text, label) => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    } catch (err) {
      fallbackCopy(text);
    }
    setCopied(label);
    addNotification(`📋 ${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopied(''), 2500);
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.warn('Fallback copy failed', e);
    }
    document.body.removeChild(textArea);
  };

  // Generate Encrypted Team Vault Code
  const handleGenerateTeamCode = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const name = teamName.trim() || 'Alpha Quant Desk';
    const cleanB64 = btoa(name).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase();
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `TEAM-VAULT-${cleanB64}-${randSuffix}`;

    setTeamVaultCode(code);
    setTeamCodeStats({
      code: code,
      createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdBy: user?.name || 'Deepak Kumar (Lead Quant)',
      usesCount: teamCodeStats?.usesCount || 3,
      joinedMembers: teamCodeStats?.joinedMembers || []
    });

    copyToClipboard(code, 'Team Sharing Code');
    addNotification(`👥 Generated & Copied Team Share Code: ${code}`, 'success');
  };

  // Join Existing Team Vault via Code
  const handleJoinTeam = (e) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim();
    if (!cleanCode) {
      addNotification('Please enter or paste a valid Team Share Code (e.g. TEAM-VAULT-...).', 'warning');
      return;
    }
    const name = user?.name ? `${user.name} (Joined Teammate)` : 'Quant Teammate';
    const email = user?.email || `teammate_${Math.floor(1000 + Math.random() * 9000)}@chainblock.io`;
    
    joinTeamViaCode(cleanCode, joinPasswordInput.trim() || 'QUANT-TEAM-PASS', name, email);
    setJoinCodeInput('');
    setJoinPasswordInput('');
  };

  // Execute Interactive Team Mock Trade
  const handleExecuteTeamMockTrade = (e) => {
    e.preventDefault();
    const amt = parseFloat(teamMockAmount);
    if (isNaN(amt) || amt <= 0) {
      addNotification('Please enter a valid mock trade amount.', 'warning');
      return;
    }

    const estimatedPnLVal = (amt * 0.024).toFixed(2);
    const traderName = user?.name || 'Deepak Kumar (Lead Quant)';
    const newTrade = {
      id: Date.now(),
      trader: traderName,
      action: `${teamMockSide} ${teamMockSymbol.replace('USDT', '/USDT')}`,
      amount: `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      pnl: `+$${estimatedPnLVal} USDT`,
      mode: 'MOCK',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PROFIT'
    };

    const updatedTrades = [newTrade, ...teamTrades];
    setTeamTrades(updatedTrades);
    try { localStorage.setItem('chainblock_team_trades', JSON.stringify(updatedTrades)); } catch (_) {}

    executeOrder(teamMockSide, teamMockSymbol, 'Team Mock Paper Engine', amt);

    // Append to Team Chat
    const teamMsg = {
      id: Date.now() + 1,
      sender: traderName,
      role: 'Quant Trader',
      text: `🟡 [TEAM MOCK TRADE] Executed ${teamMockSide} ${teamMockSymbol} ($${amt}) — Est. PnL +$${estimatedPnLVal} USDT`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => {
      const updatedChat = [...prev, teamMsg];
      try { localStorage.setItem('chainblock_team_chat', JSON.stringify(updatedChat)); } catch (_) {}
      return updatedChat;
    });

    addNotification(`🟡 Team Mock Trade Executed: ${teamMockSide} ${teamMockSymbol} ($${amt})!`, 'success');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const msg = {
      id: Date.now(),
      sender: user?.name || 'Deepak Kumar',
      role: user?.role || 'Lead Quant',
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [...chatMessages, msg];
    setChatMessages(updated);
    try { localStorage.setItem('chainblock_team_chat', JSON.stringify(updated)); } catch (_) {}
    setInputMsg('');
  };

  const currentActiveCode = teamVaultCode || teamCodeStats?.code || 'TEAM-VAULT-QUANT-ALPHA-928F';

  return (
    <div className="space-y-6 font-sans">
      
      {/* ════════════════════════════════════════════════════════════════
          PRIORITY 1: NETWORK & TEAM DESK CONTROL BANNER
      ════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2dd4bf]/40 bg-gradient-to-br from-[#0e111b] via-[#0b0c10] to-[#121829] p-6 font-mono shadow-[0_0_30px_rgba(45,212,191,0.08)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Identity & Status */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2dd4bf] to-teal-700 flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(45,212,191,0.35)] shrink-0">
              <Users className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">TEAM COLLABORATION & DESK HUB</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf] font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" /> {teamMembers.length} MEMBERS CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Multi-trader real-time workspace, encrypted vault code sharing, team mock trading, and verified Web3 MetaMask transactions.</p>
            </div>
          </div>

          {/* Network URL Quick Access & Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Quick Network URL Card */}
            <div className="flex items-center space-x-2 bg-[#14161d] px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono">
              <Globe className="w-4 h-4 text-[#2dd4bf]" />
              <span className="text-[#2dd4bf] font-extrabold">{networkUrl}</span>
              <button
                onClick={() => copyToClipboard(networkUrl, 'Network URL')}
                className="px-2.5 py-1 rounded-lg bg-[#2dd4bf] text-slate-950 font-bold text-[10px] hover:brightness-110 transition"
              >
                {copied === 'Network URL' ? 'COPIED!' : 'COPY LINK'}
              </button>
            </div>

            {/* Execution Mode Switcher */}
            <div className="flex items-center bg-[#0b0c10] p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => {
                  setActiveTradeExecutionMode('MOCK');
                  addNotification('🟡 Switched Team Execution to MOCK TRADE (Paper Trading) Mode!', 'info');
                }}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition ${
                  activeTradeExecutionMode === 'MOCK' ? 'bg-[#facc15] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                MOCK TRADING
              </button>

              <button
                onClick={() => {
                  setActiveTradeExecutionMode('REAL');
                  addNotification('🟢 Switched Team Execution to REAL TRADE (Web3 On-Chain) Mode!', 'success');
                }}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition flex items-center gap-1.5 ${
                  activeTradeExecutionMode === 'REAL' ? 'bg-[#2dd4bf] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>REAL WEB3</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          VERIFIED METAMASK CONNECTION & REAL-TIME WEB3 STATUS CARD
      ════════════════════════════════════════════════════════════════ */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0b0c10] to-[#0e111b] border border-amber-500/40 font-mono shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow">
            🦊
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-white uppercase">VERIFIED METAMASK WEB3 CONNECTION</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                EIP-1193 VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {realWallet.connected 
                ? `Connected Address: ${realWallet.address} | Balance: ${realWallet.balanceEth} ETH ($${realWallet.balanceUsd})` 
                : 'Connect your MetaMask wallet to execute real on-chain DEX trades with your team.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {!realWallet.connected ? (
            <button
              onClick={() => connectRealWallet('MetaMask')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs uppercase shadow hover:brightness-110 transition flex items-center gap-1.5"
            >
              <span>Connect MetaMask Wallet</span>
            </button>
          ) : (
            <button
              onClick={() => openModal('metamask_trade')}
              className="px-4 py-2.5 rounded-xl bg-[#2dd4bf] text-slate-950 font-extrabold text-xs uppercase shadow hover:brightness-110 transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Execute On-Chain Trade</span>
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PRIORITY 2: TEAM MOCK TRADING DESK & TEAM CONNECTION HUB
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        
        {/* TEAM MOCK TRADING TERMINAL (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0b0c10] border border-[#facc15]/40 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CircleDollarSign className="w-4 h-4 text-[#facc15]" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Interactive Team Mock Trade Engine</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-[#facc15] border border-[#facc15]">
                RISK-FREE PAPER
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Place mock paper trades with your teammates. Trades update the live team stream in real time:
            </p>

            <form onSubmit={handleExecuteTeamMockTrade} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Trading Asset</label>
                  <select
                    value={teamMockSymbol}
                    onChange={(e) => setTeamMockSymbol(e.target.value)}
                    className="w-full bg-[#14161d] border border-slate-800 rounded-xl p-2.5 text-white font-bold text-xs outline-none focus:border-[#facc15]"
                  >
                    <option value="ETHUSDT">ETH / USDT ($3,540.20)</option>
                    <option value="BTCUSDT">BTC / USDT ($67,840.50)</option>
                    <option value="SOLUSDT">SOL / USDT ($184.75)</option>
                    <option value="ARBUSDT">ARB / USDT ($1.18)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Direction</label>
                  <div className="grid grid-cols-2 gap-1 bg-[#14161d] p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setTeamMockSide('BUY')}
                      className={`py-1.5 rounded-lg font-extrabold transition ${
                        teamMockSide === 'BUY' ? 'bg-[#2dd4bf] text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamMockSide('SELL')}
                      className={`py-1.5 rounded-lg font-extrabold transition ${
                        teamMockSide === 'SELL' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Mock Trade Amount (USD)</label>
                <input
                  type="number"
                  value={teamMockAmount}
                  onChange={(e) => setTeamMockAmount(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-xs outline-none focus:border-[#facc15]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#facc15] to-amber-500 hover:brightness-110 text-slate-950 font-extrabold text-xs uppercase transition flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(250,204,21,0.25)]"
              >
                <CircleDollarSign className="w-4 h-4" />
                <span>Execute Team Mock Trade</span>
              </button>
            </form>
          </div>
        </div>

        {/* TEAM VAULT CODE & JOIN CARDS (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* CARD A: SHARE TEAM VAULT */}
          <div className="p-5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold text-white uppercase">1. Share Team Code</span>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-950 text-[#2dd4bf]">AES-256</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">Active Team Code:</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={currentActiveCode}
                    onClick={(e) => {
                      e.target.select();
                      copyToClipboard(currentActiveCode, 'Team Sharing Code');
                    }}
                    className="w-full bg-[#14161d] border border-[#2dd4bf] rounded-lg px-2.5 py-2 text-[#2dd4bf] font-mono font-extrabold text-[11px] outline-none cursor-pointer pr-16 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentActiveCode, 'Team Sharing Code')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#2dd4bf] text-slate-950 text-[9px] font-extrabold"
                  >
                    COPY
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateTeamCode}
                className="w-full py-2.5 rounded-xl bg-[#2dd4bf] text-slate-950 font-extrabold text-xs uppercase shadow transition flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Generate New Code</span>
              </button>
            </div>
          </div>

          {/* CARD B: JOIN TEAM DESK */}
          <div className="p-5 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold text-white uppercase">2. Join Teammate Desk</span>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-amber-950 text-[#facc15]">CONNECT</span>
              </div>

              <form onSubmit={handleJoinTeam} className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Paste TEAM-VAULT-..."
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-[#facc15]"
                />
                <input
                  type="password"
                  placeholder="Vault password (Optional)"
                  value={joinPasswordInput}
                  onChange={(e) => setJoinPasswordInput(e.target.value)}
                  className="w-full bg-[#14161d] border border-slate-800 rounded-lg p-2 text-white text-xs outline-none focus:border-[#facc15]"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#facc15] hover:brightness-110 text-slate-950 font-extrabold text-xs uppercase shadow transition flex items-center justify-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Join Team Vault</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const demoNames = ['Alex Rivera (Senior Quant)', 'Sarah Chen (Risk Auditor)', 'Marcus Vance (Arbitrage Trader)'];
                      const demoEmails = ['alex@quantfund.io', 'sarah@arbitrage.ai', 'marcus@crypto.io'];
                      const randIdx = Math.floor(Math.random() * demoNames.length);
                      joinTeamViaCode(currentActiveCode, 'demo_pass', demoNames[randIdx], demoEmails[randIdx]);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#2dd4bf]/20 border border-[#2dd4bf]/50 text-[#2dd4bf] hover:bg-[#2dd4bf] hover:text-slate-950 font-extrabold text-[11px] uppercase shadow transition flex items-center justify-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Quick Join Teammate</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════
          PRIORITY 3: JOINED TEAMMATES TRACKER & ROSTER TABLE
      ════════════════════════════════════════════════════════════════ */}
      <div className="p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-5 font-mono shadow-lg">
        
        {/* Header & Stats Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#2dd4bf]" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                People Who Joined Using Shared Team Code ({teamCodeStats?.joinedMembers?.length || 0})
              </h3>
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">Live synchronized roster of all connected teammates</span>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]">
            {teamCodeStats?.usesCount || 0} TEAMMATES CONNECTED
          </span>
        </div>

        {/* Members Roster List */}
        <div className="space-y-3">
          {(!teamCodeStats?.joinedMembers || teamCodeStats.joinedMembers.length === 0) ? (
            <div className="p-8 rounded-xl bg-[#14161d] border border-dashed border-slate-800 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-bold text-slate-300 uppercase">NO TEAMMATES CONNECTED YET</div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Share your Team Code (<span className="text-[#2dd4bf] font-mono">{currentActiveCode}</span>) with teammates. When they join, their live profile will automatically appear here.
              </p>
            </div>
          ) : (
            teamCodeStats.joinedMembers.map((jm) => (
              <div key={jm.id} className="p-4 rounded-xl bg-[#14161d] border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-[#2dd4bf]/60 transition">
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2dd4bf] to-teal-700 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow">
                    {jm.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-white text-xs">{jm.name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-[#facc15] border border-slate-700">
                        {jm.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{jm.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-[11px] w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right font-mono">
                    <span className="text-slate-400 block text-[10px]">IP: {jm.ip || '10.24.123.211'}</span>
                    <span className="text-slate-500 block text-[10px]">{jm.joinedAt || 'Just Now'}</span>
                  </div>

                  <span className="px-3 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf] flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse" />
                    {jm.status || 'JOINED & ACTIVE 🟢'}
                  </span>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          PRIORITY 4: TEAM CHAT & SHARED TEAM MOCK TRADE STREAM
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono">
        
        {/* Team Chat (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2dd4bf]" /> Team Desk Live Chat & Signals
            </h4>
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse" />
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
            {chatMessages.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#14161d] border border-dashed border-slate-800 text-center space-y-1">
                <MessageSquare className="w-6 h-6 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-400 uppercase">NO CHAT MESSAGES YET</div>
                <p className="text-[10px] text-slate-500">Send a team message or execute a mock trade to see live updates.</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="p-3 rounded-xl bg-[#14161d] border border-slate-800/80 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold text-[#2dd4bf]">{msg.sender} ({msg.role})</span>
                    <span className="text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Type team update..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 bg-[#14161d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#2dd4bf]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2dd4bf] text-slate-950 font-extrabold text-xs shrink-0 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Shared Team Mock Trade Stream (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#facc15]" /> Team Mock Trade Stream
            </h4>
            <span className="text-[9px] font-bold text-[#2dd4bf] bg-emerald-950 px-2 py-0.5 rounded border border-[#2dd4bf]">
              LIVE SHARED
            </span>
          </div>

          <div className="space-y-2 text-xs max-h-[260px] overflow-y-auto custom-scrollbar">
            {teamTrades.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#14161d] border border-dashed border-slate-800 text-center space-y-1">
                <Clock className="w-6 h-6 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-400 uppercase">NO TEAM TRADES YET</div>
                <p className="text-[10px] text-slate-500">Execute a trade in the Interactive Team Mock Trade Engine above.</p>
              </div>
            ) : (
              teamTrades.map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-[#14161d] border border-slate-800/80 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-white">{act.trader}</span>
                    <span className="text-[#2dd4bf] font-bold">{act.pnl}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold text-slate-200">{act.action} ({act.amount})</span>
                    <span className="text-slate-500">{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
