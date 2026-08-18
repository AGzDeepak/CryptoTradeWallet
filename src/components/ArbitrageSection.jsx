import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  Zap, AlertOctagon, CheckCircle, XCircle,
  TrendingUp, Activity, Terminal, DollarSign,
  RefreshCw, ExternalLink, Shield, Cpu,
  AlertTriangle, BarChart2
} from 'lucide-react';

const BACKEND = 'http://localhost:8000';
const WS_URL  = 'ws://localhost:8000/ws/arbitrage';

const fmt$ = (v, d = 2) => v == null ? '—' : '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtPct = (v, d = 3) => v == null ? '—' : Number(v).toFixed(d) + '%';
const fmtBps = v => v == null ? '—' : Number(v).toFixed(1) + ' bps';
const shortHash = h => h ? h.slice(0, 8) + '...' + h.slice(-6) : '—';

const STATUS_COLORS = {
  DETECTED:'text-blue-400', SIMULATING:'text-yellow-400', REJECTED:'text-red-400',
  EXECUTABLE:'text-emerald-400', EXECUTED:'text-purple-400', CONFIRMED:'text-emerald-400',
  FAILED:'text-red-400', REVERTED:'text-orange-400', QUEUED:'text-slate-400'
};

const TAG_COLORS = {
  ARB:'text-violet-400', RISK:'text-yellow-400', EXEC:'text-emerald-400',
  DEX:'text-blue-400', GAS:'text-orange-400', FLASHLOAN:'text-cyan-400',
  SIMULATION:'text-indigo-400', TX:'text-purple-400', SYS:'text-slate-300'
};

const MainnetGate = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-[#0a0f1c] border-2 border-red-500/60 rounded-2xl p-8 max-w-md w-full space-y-5 shadow-2xl shadow-red-500/10">
      <div className="flex items-center gap-3">
        <AlertOctagon className="w-8 h-8 text-red-500 shrink-0" />
        <div>
          <h2 className="text-xl font-extrabold text-red-400 font-mono uppercase tracking-wide">MAINNET — REAL FUNDS</h2>
          <p className="text-xs text-red-300/70 mt-0.5">This action exposes real capital on the blockchain.</p>
        </div>
      </div>
      <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 text-xs text-red-200 space-y-1.5 font-mono">
        <p>⚠ Flash loan arbitrage involves real blockchain transactions.</p>
        <p>⚠ Gas fees, slippage, and MEV can result in net losses.</p>
        <p>⚠ Smart contract interactions are irreversible.</p>
        <p>⚠ Only enable if your contract is deployed and verified.</p>
        <p>⚠ Set MAINNET_ENABLED=true in backend .env to unlock.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold font-mono transition">I UNDERSTAND — ENABLE MAINNET</button>
      </div>
    </div>
  </div>
);

const OpportunityRow = ({ opp, onExecute, onSimulate, loading }) => {
  const profitable = opp.net_profit >= 5;
  return (
    <tr className={'border-b border-slate-800/50 hover:bg-slate-800/20 transition text-xs font-mono ' + (profitable ? '' : 'opacity-50')}>
      <td className="py-2.5 px-3 text-white font-bold">{opp.pair}</td>
      <td className="py-2.5 px-3 text-blue-400">{opp.buy_dex}</td>
      <td className="py-2.5 px-3 text-violet-400">{opp.sell_dex}</td>
      <td className="py-2.5 px-3 text-emerald-400">{fmtPct(opp.spread_pct, 3)}</td>
      <td className="py-2.5 px-3 text-slate-300">{fmt$(opp.input_amount_usd, 0)}</td>
      <td className="py-2.5 px-3 text-cyan-400">{fmt$(opp.flash_loan_fee, 2)}</td>
      <td className="py-2.5 px-3 text-orange-400">{fmt$(opp.gas_cost, 3)}</td>
      <td className={'py-2.5 px-3 font-extrabold ' + (opp.net_profit >= 5 ? 'text-emerald-400' : 'text-red-400')}>{fmt$(opp.net_profit, 2)}</td>
      <td className="py-2.5 px-3 text-slate-300">{fmtBps(opp.profit_bps)}</td>
      <td className="py-2.5 px-3"><span className={STATUS_COLORS[opp.status] || 'text-slate-400'}>{opp.status}</span></td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onSimulate(opp.id)} className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold transition">SIM</button>
          {profitable && <button onClick={() => onExecute(opp.id)} disabled={loading} className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-[10px] font-bold transition">EXEC</button>}
        </div>
      </td>
    </tr>
  );
};

export const ArbitrageSection = () => {
  const { addNotification } = useCrypto();
  const [connected, setConnected] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const wsRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [config, setConfig] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [prices, setPrices] = useState({});
  const [gas, setGas] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [autoExecute, setAutoExecute] = useState(false);
  const [mode, setMode] = useState('paper');
  const [showMainnetGate, setShowMainnetGate] = useState(false);
  const [execLoading, setExecLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [activeTab, setActiveTab] = useState('opportunities');
  const terminalRef = useRef(null);

  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        setConnected(true); setBackendOnline(true);
        addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'SYS', msg: '● Connected to Flash Arbitrage Engine backend (ws://localhost:8000)' });
      };
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'opportunities') setOpportunities(msg.data);
        else if (msg.type === 'stats') setStats(msg.data);
        else if (msg.type === 'market') setPrices(msg.data);
        else if (msg.type === 'gas') setGas(msg.data);
        else if (msg.type === 'trade') setTrades(p => [msg.data, ...p].slice(0, 100));
        else if (msg.type === 'log') addLog(msg);
        else if (msg.type === 'log_history') setLogs(msg.logs || []);
        else if (msg.type === 'emergency_stop') { addNotification('🚨 EMERGENCY STOP', 'danger'); addLog({ ts: new Date().toLocaleTimeString(), level:'ERROR', tag:'SYS', msg:'🚨 EMERGENCY STOP ACTIVATED — All execution halted' }); }
      };
      ws.onclose = () => { setConnected(false); setTimeout(connectWs, 3000); };
      ws.onerror = () => { setBackendOnline(false); setConnected(false); };
    } catch (_) { setBackendOnline(false); }
  }, []);

  useEffect(() => {
    connectWs();
    fetchConfig(); fetchTrades();
    return () => wsRef.current?.close();
  }, []);

  useEffect(() => { if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight; }, [logs]);

  const addLog = (entry) => setLogs(prev => [...prev.slice(-499), entry]);

  const fetchConfig = async () => {
    try { const r = await fetch(BACKEND+'/api/arbitrage/config'); if (r.ok) { const d = await r.json(); setConfig(d); setMode(d.mode); } } catch (_) {}
  };
  const fetchTrades = async () => {
    try { const r = await fetch(BACKEND+'/api/transactions'); if (r.ok) { const d = await r.json(); setTrades(d.trades || []); } } catch (_) {}
  };

  const handleExecute = async (id) => {
    setExecLoading(true);
    try {
      const r = await fetch(BACKEND+'/api/arbitrage/execute', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({opportunity_id:id}) });
      const d = await r.json();
      if (r.ok) { addNotification('✅ Trade executed: +' + fmt$(d.trade?.actual_profit) + ' profit', 'success'); fetchTrades(); }
      else addNotification('❌ ' + d.detail, 'danger');
    } catch (_) { addNotification('❌ Backend not reachable — start the Python server', 'danger'); }
    setExecLoading(false);
  };

  const handleSimulate = async (id) => {
    try {
      const r = await fetch(BACKEND+'/api/arbitrage/simulate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({opportunity_id:id}) });
      if (r.ok) setSimResult(await r.json());
      else addNotification('❌ Backend not reachable', 'danger');
    } catch (_) { addNotification('❌ Backend not reachable', 'danger'); }
  };

  const handleAutoExecute = async (enabled) => {
    setAutoExecute(enabled);
    try { await fetch(BACKEND+'/api/arbitrage/auto-execute', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({enabled}) }); addNotification(enabled ? '⚡ Auto-execute ON' : '⏹ Auto-execute OFF', 'info'); } catch (_) {}
  };

  const handleEmergencyStop = async () => {
    try { await fetch(BACKEND+'/api/emergency-stop', { method:'POST' }); setAutoExecute(false); addNotification('🚨 EMERGENCY STOP activated', 'danger'); } catch (_) { addNotification('❌ Backend not reachable', 'danger'); }
  };

  const handleModeSelect = (m) => {
    if (m === 'mainnet') { setShowMainnetGate(true); return; }
    setMode(m); addNotification('Mode: ' + m.toUpperCase(), 'info');
  };

  const filteredLogs = logFilter === 'ALL' ? logs : logs.filter(l => l.tag === logFilter || l.level === logFilter);
  const executableOpps = opportunities.filter(o => o.net_profit >= 5 && o.status !== 'REJECTED');
  const totalNetProfit = stats?.total_profit ?? 0;
  const winRate = stats?.win_rate ?? 0;

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto pb-12">
      {showMainnetGate && <MainnetGate onConfirm={() => { setMode('mainnet'); setShowMainnetGate(false); addNotification('⚠ MAINNET MODE — Real funds. Set MAINNET_ENABLED=true in .env', 'warning'); }} onCancel={() => setShowMainnetGate(false)} />}

      {/* HEADER */}
      <div className="bg-[#0d1523] border border-slate-800/80 p-5 rounded-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={'w-2.5 h-2.5 rounded-full ' + (connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500')} />
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight font-mono flex items-center gap-2">
                ⚡ FLASH ARBITRAGE ENGINE
                <span className={'px-2 py-0.5 text-xs rounded font-mono font-bold border ' + (mode === 'paper' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : mode === 'testnet' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse')}>
                  {mode === 'paper' ? '📄 PAPER' : mode === 'testnet' ? '🧪 TESTNET' : '🔴 MAINNET'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{connected ? '● Live — ' + (config?.chain_name || 'Arbitrum Sepolia') + ' | Aave V3 Flash Loans | Real-time WebSocket' : '○ Backend offline — run: uvicorn backend.app:app --reload'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['paper','testnet','mainnet'].map(m => (
              <button key={m} onClick={() => handleModeSelect(m)} className={'px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition ' + (mode === m ? (m==='paper'?'bg-blue-600 border-blue-500 text-white':m==='testnet'?'bg-yellow-600 border-yellow-500 text-white':'bg-red-700 border-red-500 text-white') : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500')}>{m.toUpperCase()}</button>
            ))}
            <button onClick={handleEmergencyStop} className="px-3.5 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-800/80 border border-red-700/60 text-red-300 text-xs font-mono font-bold transition flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" /> STOP
            </button>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label:'Net P&L', value:fmt$(totalNetProfit), color: totalNetProfit>=0?'text-emerald-400':'text-red-400', icon:DollarSign },
          { label:'Win Rate', value:winRate+'%', color:'text-blue-400', icon:TrendingUp },
          { label:'Trades', value:stats?.total_trades??0, color:'text-white', icon:Activity },
          { label:'Executable', value:executableOpps.length, color:'text-emerald-400', icon:Zap },
          { label:'Gas Spent', value:fmt$(stats?.total_gas_spent,4), color:'text-orange-400', icon:Cpu },
          { label:'Gas Now', value:gas?gas.gas_price_gwei?.toFixed(4)+' gwei':'—', color:'text-yellow-400', icon:RefreshCw },
          { label:'ETH Price', value:fmt$(prices?.ETH,2), color:'text-indigo-400', icon:BarChart2 },
        ].map((s,i) => (
          <div key={i} className="bg-[#0d1523] border border-slate-800/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1"><s.icon className="w-3 h-3 text-slate-500" /><span className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</span></div>
            <p className={'text-sm font-extrabold font-mono ' + s.color}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* AUTO-EXECUTE */}
      <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">AUTO-EXECUTE:</span>
          <button onClick={() => handleAutoExecute(!autoExecute)} className={'relative w-12 h-6 rounded-full transition-colors ' + (autoExecute?'bg-emerald-600':'bg-slate-700')}>
            <div className={'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ' + (autoExecute?'translate-x-6':'')} />
          </button>
          <span className={'text-xs font-mono font-bold ' + (autoExecute?'text-emerald-400':'text-slate-500')}>{autoExecute?'ON — Watching for profitable opportunities':'OFF'}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto text-xs font-mono text-slate-400 flex-wrap">
          <span>Min:</span><span className="text-white">{fmt$(config?.min_profit_usd)} / {config?.min_profit_bps} bps</span>
          <span className="mx-2 text-slate-700">|</span>
          <span>Max size:</span><span className="text-white">{fmt$(config?.max_trade_size,0)}</span>
          <span className="mx-2 text-slate-700">|</span>
          <span>Max gas:</span><span className="text-white">{fmt$(config?.max_gas_usd)}</span>
        </div>
      </div>

      {/* BACKEND OFFLINE NOTICE */}
      {!backendOnline && (
        <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-2">
            <p className="text-yellow-300 font-bold">Python backend not running — start it to enable live arbitrage:</p>
            <div className="bg-black/40 rounded-lg px-3 py-2 text-emerald-400 space-y-1">
              <p>cd D:\tradetraining</p>
              <p>python -m venv .venv; .venv\Scripts\activate</p>
              <p>pip install -r requirements.txt</p>
              <p>uvicorn backend.app:app --reload --port 8000</p>
            </div>
            <p className="text-slate-400">The dashboard auto-reconnects once the backend starts. All features available at <a href="https://AGzDeepak.github.io/CryptoTradeWallet/" target="_blank" rel="noreferrer" className="text-blue-400 underline">GitHub Pages</a> (Paper mode only, no backend needed).</p>
          </div>
        </div>
      )}

      {/* SIMULATION RESULT */}
      {simResult && (
        <div className="bg-[#060e1c] border border-indigo-500/30 rounded-2xl p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-indigo-400 font-bold uppercase">Simulation: {simResult.pair} — {simResult.simulation}</span>
            <button onClick={() => setSimResult(null)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['Trade Size',fmt$(simResult.input_amount),'text-white'],['Gross Profit',fmt$(simResult.gross_profit),'text-blue-400'],['Flash Fee',fmt$(simResult.flash_loan_fee),'text-cyan-400'],['Gas',fmt$(simResult.gas_cost,4),'text-orange-400'],['Net Profit',fmt$(simResult.net_profit),simResult.net_profit>0?'text-emerald-400 font-extrabold':'text-red-400 font-extrabold'],['Status',simResult.simulation,simResult.simulation==='PASSED'?'text-emerald-400':'text-red-400'],['Buy DEX',simResult.buy_dex,'text-blue-400'],['Sell DEX',simResult.sell_dex,'text-violet-400']].map(([l,v,c]) => (
              <div key={l} className="bg-[#03070f] rounded-lg p-2.5"><p className="text-slate-500 text-[10px] uppercase mb-1">{l}</p><p className={'font-bold '+c}>{v}</p></div>
            ))}
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-1 bg-[#0a1020] rounded-xl p-1 border border-slate-800/60">
        {[{id:'opportunities',label:'Opportunities ('+executableOpps.length+')',icon:Zap},{id:'terminal',label:'Live Terminal',icon:Terminal},{id:'trades',label:'Trades ('+trades.length+')',icon:Activity},{id:'stats',label:'Risk & Config',icon:Shield}].map(t=>(
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold transition ' + (activeTab===t.id?'bg-[#0d1a2e] text-white border border-slate-700/50':'text-slate-500 hover:text-slate-300')}>
            <t.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* OPPORTUNITY TABLE */}
      {activeTab === 'opportunities' && (
        <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-emerald-400" />Live Arbitrage Opportunities</span>
            <span className="text-[10px] font-mono text-slate-500">Real-time · Updating every 2s · Sorted by net profit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-slate-500 font-mono uppercase border-b border-slate-800/40">
                  {['Pair','Buy DEX','Sell DEX','Spread','Size','Flash Fee','Gas','Net Profit','BPS','Status','Action'].map(h=><th key={h} className="py-2.5 px-3 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {opportunities.length === 0 ? (
                  <tr><td colSpan={11} className="py-12 text-center text-slate-500 font-mono text-sm">{connected?'Scanning markets for arbitrage opportunities…':'⚠ Backend offline — start the Python server to see live opportunities'}</td></tr>
                ) : opportunities.map(opp => <OpportunityRow key={opp.id} opp={opp} onExecute={handleExecute} onSimulate={handleSimulate} loading={execLoading} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIVE TERMINAL */}
      {activeTab === 'terminal' && (
        <div className="bg-[#020812] border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2"><Terminal className="w-3.5 h-3.5" />EXECUTION TERMINAL</span>
            <div className="flex items-center gap-1 flex-wrap">
              {['ALL','ARB','RISK','EXEC','DEX','FLASHLOAN','GAS','ERROR'].map(f=>(
                <button key={f} onClick={()=>setLogFilter(f)} className={'px-2 py-0.5 rounded text-[10px] font-mono transition '+(logFilter===f?'bg-slate-600 text-white':'text-slate-500 hover:text-slate-300')}>{f}</button>
              ))}
              <button onClick={()=>setLogs([])} className="text-[10px] text-slate-600 hover:text-slate-400 font-mono ml-2">CLEAR</button>
            </div>
          </div>
          <div ref={terminalRef} className="h-96 overflow-y-auto p-4 font-mono text-xs space-y-0.5" style={{scrollbarWidth:'thin',scrollbarColor:'#1e293b transparent'}}>
            {filteredLogs.length === 0 ? (
              <p className="text-slate-600">{connected?'Waiting for engine events…':'● Backend offline — start the Python server to see live logs'}</p>
            ) : filteredLogs.map((log,i) => (
              <div key={i} className="flex items-start gap-2 hover:bg-slate-900/30 px-1 py-0.5 rounded">
                <span className="text-slate-600 shrink-0">{log.ts}</span>
                <span className={'shrink-0 w-12 text-right ' + (TAG_COLORS[log.tag]||'text-slate-500')}>{log.tag}</span>
                <span className={'flex-1 leading-relaxed ' + (log.level==='ERROR'?'text-red-400':log.level==='WARNING'?'text-yellow-400':'text-slate-300')}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRADE HISTORY */}
      {activeTab === 'trades' && (
        <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/60">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-blue-400" />Transaction History</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-slate-500 font-mono uppercase border-b border-slate-800/40">
                  {['Time','Pair','Mode','Size','Expected','Actual','Gas','TX Hash','Status'].map(h=><th key={h} className="py-2 px-3 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {trades.length === 0 ? <tr><td colSpan={9} className="py-12 text-center text-slate-500 font-mono text-sm">No trades yet — execute an opportunity to see results here</td></tr> : trades.map(t=>(
                  <tr key={t.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 text-xs font-mono">
                    <td className="py-2.5 px-3 text-slate-500">{t.created_at?new Date(t.created_at*1000).toLocaleTimeString():'—'}</td>
                    <td className="py-2.5 px-3 text-white font-bold">{t.pair}</td>
                    <td className="py-2.5 px-3"><span className={'px-1.5 py-0.5 rounded text-[10px] font-bold '+(t.mode==='paper'?'bg-blue-500/20 text-blue-400':t.mode==='testnet'?'bg-yellow-500/20 text-yellow-400':'bg-red-500/20 text-red-400')}>{t.mode?.toUpperCase()}</span></td>
                    <td className="py-2.5 px-3 text-slate-300">{fmt$(t.input_amount,0)}</td>
                    <td className="py-2.5 px-3 text-blue-400">{fmt$(t.expected_profit)}</td>
                    <td className={'py-2.5 px-3 font-bold '+(t.actual_profit>0?'text-emerald-400':t.actual_profit<0?'text-red-400':'text-slate-400')}>{t.actual_profit!=null?(t.actual_profit>0?'+':'')+fmt$(t.actual_profit):'—'}</td>
                    <td className="py-2.5 px-3 text-orange-400">{fmt$(t.gas_cost_usd,4)}</td>
                    <td className="py-2.5 px-3 text-slate-400">{t.tx_hash&&!t.tx_hash.startsWith('PAPER')?<a href={(config?.explorer||'https://sepolia.arbiscan.io')+'/tx/'+t.tx_hash} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">{shortHash(t.tx_hash)}<ExternalLink className="w-3 h-3"/></a>:<span>{shortHash(t.tx_hash)}</span>}</td>
                    <td className={'py-2.5 px-3 font-bold '+(STATUS_COLORS[t.status]||'text-slate-400')}>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RISK & CONFIG */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-white font-mono uppercase flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400"/>Risk Engine Configuration</h3>
            {[['Mode',mode.toUpperCase(),mode==='mainnet'?'text-red-400':mode==='testnet'?'text-yellow-400':'text-blue-400'],['Chain',config?.chain_name||'—','text-white'],['Min Profit USD',fmt$(config?.min_profit_usd),'text-emerald-400'],['Min Profit BPS',config?.min_profit_bps+' bps','text-emerald-400'],['Max Trade Size',fmt$(config?.max_trade_size,0),'text-white'],['Max Slippage',config?.max_slippage_bps+' bps','text-yellow-400'],['Max Gas USD',fmt$(config?.max_gas_usd),'text-orange-400'],['Flash Asset',config?.flash_loan_asset||'USDC','text-cyan-400'],['Aave Pool',config?.aave_pool?shortHash(config.aave_pool):'—','text-slate-400']].map(([l,v,c])=>(
              <div key={l} className="flex items-center justify-between text-xs font-mono border-b border-slate-800/40 pb-2"><span className="text-slate-400">{l}</span><span className={'font-bold '+c}>{v}</span></div>
            ))}
          </div>
          <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-white font-mono uppercase flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-400"/>Performance & P&L</h3>
            {[['Total Trades',stats?.total_trades??0,'text-white'],['Wins',stats?.win_count??0,'text-emerald-400'],['Losses',stats?.loss_count??0,'text-red-400'],['Win Rate',winRate+'%',winRate>=60?'text-emerald-400':'text-yellow-400'],['Total Net P&L',fmt$(totalNetProfit),totalNetProfit>=0?'text-emerald-400':'text-red-400'],['Gas Spent',fmt$(stats?.total_gas_spent,4),'text-orange-400'],['Paper Balance',fmt$(stats?.paper_balance),'text-blue-400'],['Engine Uptime',stats?.uptime_seconds?Math.floor(stats.uptime_seconds/60)+'m '+stats.uptime_seconds%60+'s':'—','text-slate-300']].map(([l,v,c])=>(
              <div key={l} className="flex items-center justify-between text-xs font-mono border-b border-slate-800/40 pb-2"><span className="text-slate-400">{l}</span><span className={'font-bold '+c}>{v}</span></div>
            ))}
          </div>
          <div className="lg:col-span-2 bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-white font-mono uppercase flex items-center gap-2 mb-4"><CheckCircle className="w-4 h-4 text-emerald-400"/>Production Readiness</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[{l:'Backend API',ok:backendOnline},{l:'WebSocket',ok:connected},{l:'Market Data',ok:Object.keys(prices).length>0},{l:'Gas Feed',ok:gas!=null},{l:'Risk Engine',ok:true},{l:'Opportunity Scanner',ok:opportunities.length>0},{l:'Aave V3 Config',ok:!!config?.aave_pool},{l:'Flash Asset',ok:!!config?.flash_loan_asset},{l:'Mode Set',ok:true},{l:'Mainnet Gate',ok:mode!=='mainnet'}].map(({l,ok})=>(
                <div key={l} className={'flex items-center gap-2 p-3 rounded-xl border text-xs font-mono '+(ok?'bg-emerald-900/20 border-emerald-700/30 text-emerald-300':'bg-slate-900/40 border-slate-700/30 text-slate-500')}>
                  {ok?<CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0"/>:<XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0"/>}{l}
                </div>
              ))}
            </div>
            <div className={'mt-4 p-3 rounded-xl text-xs font-mono font-bold text-center border '+(backendOnline&&connected?'bg-emerald-900/20 border-emerald-700/30 text-emerald-400':'bg-red-900/20 border-red-700/30 text-red-400')}>
              {backendOnline&&connected?'✅ PRODUCTION READY — Engine online, scanning markets':'⛔ PRODUCTION BLOCKED — Start Python backend: uvicorn backend.app:app --reload'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
