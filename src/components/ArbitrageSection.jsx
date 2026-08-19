import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  Zap, AlertOctagon, CheckCircle, XCircle, TrendingUp, Activity,
  Terminal, DollarSign, RefreshCw, ExternalLink, Shield, Cpu,
  AlertTriangle, BarChart2, Play, Square, Eye, Clock, ChevronRight,
  Layers, Target, GitBranch, Hash, Flame, TrendingDown
} from 'lucide-react';

const BACKEND = 'http://localhost:8000';
const WS_URL  = 'ws://localhost:8000/ws/arbitrage';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt$ = (v, d = 2) => v == null ? '—' : '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtPct = (v, d = 3) => v == null ? '—' : Number(v).toFixed(d) + '%';
const fmtBps = v => v == null ? '—' : Number(v).toFixed(1) + ' bps';
const shortHash = h => h ? h.slice(0, 10) + '...' + h.slice(-8) : '—';
const fmtAge = s => s < 1 ? '<1s' : s < 60 ? s.toFixed(0)+'s' : (s/60).toFixed(1)+'m';

// ── Execution State Machine ───────────────────────────────────────────────────
const EXEC_STATES = [
  'IDLE', 'OPPORTUNITY_FOUND', 'VALIDATING', 'REQUOTING',
  'RISK_CHECK', 'SIMULATING', 'APPROVED', 'SUBMITTING',
  'PENDING', 'CONFIRMED', 'SETTLED'
];

const EXEC_STATE_COLORS = {
  IDLE: 'text-slate-500', OPPORTUNITY_FOUND: 'text-blue-400',
  VALIDATING: 'text-yellow-400', REQUOTING: 'text-orange-400',
  RISK_CHECK: 'text-purple-400', SIMULATING: 'text-indigo-400',
  APPROVED: 'text-emerald-400', SUBMITTING: 'text-cyan-400',
  PENDING: 'text-yellow-300', CONFIRMED: 'text-emerald-400',
  SETTLED: 'text-emerald-500'
};

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

const READINESS_BADGE = {
  'READY TO TRADE':        { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', dot: 'bg-emerald-400', label: '✅ READY TO TRADE' },
  'READY — SIMULATION ONLY': { bg: 'bg-blue-500/20 border-blue-500/40 text-blue-300',    dot: 'bg-blue-400',    label: '📄 PAPER MODE' },
  'READY — TESTNET':       { bg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300', dot: 'bg-yellow-400',  label: '🧪 TESTNET READY' },
  'NOT READY':             { bg: 'bg-red-500/20 border-red-500/40 text-red-300',           dot: 'bg-red-500',    label: '⛔ NOT READY' },
  'CIRCUIT BREAKER':       { bg: 'bg-red-600/30 border-red-500/60 text-red-300 animate-pulse', dot: 'bg-red-500 animate-ping', label: '🚨 CIRCUIT BREAKER' },
  'TRADING':               { bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300 animate-pulse', dot: 'bg-purple-400 animate-ping', label: '⚡ TRADING' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

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

// Execution State Machine display
const ExecStateMachine = ({ execState, isExecuting }) => (
  <div className="bg-[#06101e] border border-slate-800/60 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-3">
      <Layers className="w-3.5 h-3.5 text-indigo-400" />
      <span className="text-xs font-mono font-bold text-slate-300 uppercase">Execution State Machine</span>
    </div>
    <div className="flex items-center gap-0.5 flex-wrap">
      {EXEC_STATES.map((s, i) => {
        const curIdx = EXEC_STATES.indexOf(execState);
        const isPast = i < curIdx;
        const isCur  = i === curIdx;
        return (
          <React.Fragment key={s}>
            <div className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all ${
              isCur  ? EXEC_STATE_COLORS[s] + ' bg-slate-800 border border-slate-600 scale-105' :
              isPast ? 'text-slate-600' : 'text-slate-700'
            }`}>
              {isCur && isExecuting && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-ping mr-1" />}
              {s}
            </div>
            {i < EXEC_STATES.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-slate-700 shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

// Best Opportunity Breakdown Panel
const BestOpportunityPanel = ({ opp, onExecute, onSimulate, readiness, loading }) => {
  if (!opp) return (
    <div className="bg-[#06101e] border border-slate-800/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2">
      <Target className="w-8 h-8 text-slate-700" />
      <p className="text-xs font-mono text-slate-600">Scanning for executable opportunity…</p>
    </div>
  );

  const isReady = readiness?.all_passed;
  const profit = opp.net_profit ?? 0;
  const roi = opp.input_amount_usd > 0 ? (profit / opp.input_amount_usd * 100) : 0;
  const ageS = opp.age_seconds ?? ((Date.now()/1000) - (opp.created_at ?? 0));

  return (
    <div className={`bg-[#06101e] border rounded-xl p-4 space-y-3 ${profit >= 5 ? 'border-emerald-700/40' : 'border-slate-800/60'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${profit >= 5 ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="text-sm font-extrabold text-white font-mono">{opp.pair}</span>
          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-mono rounded">{opp.buy_dex}</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] font-mono rounded">{opp.sell_dex}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <Clock className="w-3 h-3" />
          <span className={ageS > 10 ? 'text-red-400' : 'text-slate-400'}>{fmtAge(ageS)} old</span>
        </div>
      </div>

      {/* P&L Breakdown */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {[
          ['Spread', fmtPct(opp.spread_pct, 3), 'text-emerald-400'],
          ['Trade Size', fmt$(opp.input_amount_usd, 0), 'text-white'],
          ['Flash Fee', fmt$(opp.flash_loan_fee, 3), 'text-cyan-400'],
          ['DEX Fees', fmt$(opp.swap_fees, 3), 'text-blue-400'],
          ['Gas', fmt$(opp.gas_cost, 4), 'text-orange-400'],
          ['MEV/Slip', fmt$((opp.mev_cost ?? 0) + (opp.slippage_cost ?? 0), 3), 'text-yellow-400'],
          ['NET PROFIT', fmt$(profit), profit >= 5 ? 'text-emerald-400 font-extrabold text-sm' : 'text-red-400 font-extrabold text-sm'],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-[#020c18] rounded-lg p-2 text-center">
            <p className="text-[9px] font-mono text-slate-600 uppercase mb-0.5">{l}</p>
            <p className={`font-bold font-mono text-xs ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-1 text-slate-500"><Target className="w-3 h-3" />ROI: <span className="text-white">{roi.toFixed(4)}%</span></div>
        <div className="flex items-center gap-1 text-slate-500"><BarChart2 className="w-3 h-3" />Profit BPS: <span className="text-white">{fmtBps(opp.profit_bps)}</span></div>
        <div className="flex items-center gap-1 text-slate-500"><Shield className="w-3 h-3" />Confidence: <span className="text-white">{opp.confidence ? (opp.confidence * 100).toFixed(0) + '%' : '—'}</span></div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSimulate(opp.id)}
          className="flex-1 py-2 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-700/40 text-indigo-300 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" /> SIMULATE
        </button>
        <button
          onClick={() => onExecute(opp.id)}
          disabled={loading || !isReady || profit < 5}
          className={`flex-1 py-2 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
            isReady && profit >= 5 && !loading
              ? 'bg-emerald-700/60 hover:bg-emerald-700/80 border-emerald-600/60 text-white'
              : 'bg-slate-800/40 border-slate-700/30 text-slate-600 cursor-not-allowed'
          }`}
          title={!isReady ? 'System not ready — check 22-Point Audit' : profit < 5 ? 'Profit below threshold' : 'Execute Flash Trade'}
        >
          <Zap className="w-3.5 h-3.5" />
          {loading ? 'EXECUTING…' : 'EXECUTE FLASH TRADE'}
        </button>
      </div>
      {!isReady && (
        <p className="text-[10px] font-mono text-red-400/80 text-center">⛔ System not ready — see 22-Point Audit tab</p>
      )}
    </div>
  );
};

// Flash Loan Panel
const FlashLoanPanel = ({ opp, config }) => {
  const borrow = opp?.input_amount_usd ?? 0;
  const premium = opp?.flash_loan_fee ?? borrow * 0.0005;
  const repay = borrow + premium;
  return (
    <div className="bg-[#06101e] border border-cyan-900/40 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Flame className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-xs font-mono font-bold text-slate-300 uppercase">Flash Loan Structure</span>
        <span className="ml-auto px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-mono rounded border border-cyan-500/30">Aave V3</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {[
          ['Provider', 'Aave V3 (Arbitrum)', 'text-cyan-400'],
          ['Flash Asset', config?.flash_loan_asset || 'USDC', 'text-white'],
          ['Borrow Amount', fmt$(borrow, 0), 'text-white'],
          ['Premium (0.05%)', fmt$(premium, 3), 'text-yellow-400'],
          ['Repayment', fmt$(repay, 2), 'text-orange-400'],
          ['Deadline', '~30 seconds', 'text-slate-400'],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-[#020c18] rounded-lg p-2">
            <p className="text-[9px] text-slate-600 uppercase mb-0.5">{l}</p>
            <p className={`font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>
      {opp && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-[#020c18] rounded-lg px-3 py-2">
          <GitBranch className="w-3 h-3" />
          Route:
          <span className="text-blue-400">{opp.buy_dex}</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-white font-bold">{opp.pair?.split('/')[0]}</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-violet-400">{opp.sell_dex}</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-cyan-400">Repay Aave</span>
        </div>
      )}
    </div>
  );
};

// Pre-Trade Checklist
const PreTradeChecklist = ({ opp, gas, connected, prices }) => {
  const now = Date.now() / 1000;
  const quoteAge = opp ? (now - (opp.created_at ?? now)) : 999;
  const checks = [
    { label: 'Backend Connected', ok: connected,                      detail: connected ? 'WS Active' : 'Offline' },
    { label: 'Market Data',       ok: Object.keys(prices).length > 0, detail: Object.keys(prices).length > 0 ? prices.ETH ? fmt$(prices.ETH) + ' ETH' : 'Live' : 'Stale' },
    { label: 'Gas Feed',          ok: gas != null,                    detail: gas ? gas.gas_price_gwei?.toFixed(4) + ' gwei' : 'No data' },
    { label: 'Opportunity Live',  ok: !!opp,                         detail: opp ? opp.pair : 'None found' },
    { label: 'Quote Fresh',       ok: quoteAge < 15,                 detail: quoteAge < 999 ? fmtAge(quoteAge) + ' old' : '—' },
    { label: 'Profitable',        ok: (opp?.net_profit ?? 0) >= 5,   detail: opp ? fmt$(opp.net_profit) + ' net' : '—' },
    { label: 'Gas Acceptable',    ok: (gas?.gas_cost_usd ?? 999) < 5, detail: gas ? fmt$(gas.gas_cost_usd, 4) + ' USD' : '—' },
    { label: 'Spread Positive',   ok: (opp?.spread_pct ?? 0) > 0,   detail: opp ? fmtPct(opp.spread_pct, 3) : '—' },
  ];
  const passCount = checks.filter(c => c.ok).length;
  return (
    <div className="bg-[#06101e] border border-slate-800/60 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">Pre-Trade Checklist</span>
        </div>
        <span className={`text-xs font-mono font-bold ${passCount === checks.length ? 'text-emerald-400' : 'text-yellow-400'}`}>
          {passCount}/{checks.length} PASS
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {checks.map(({ label, ok, detail }) => (
          <div key={label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-mono ${
            ok ? 'bg-emerald-900/20 border-emerald-800/40 text-emerald-300' : 'bg-red-900/15 border-red-800/30 text-red-400'
          }`}>
            {ok ? <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> : <XCircle className="w-3 h-3 text-red-400 shrink-0" />}
            <div>
              <div className="font-bold">{label}</div>
              <div className="text-[9px] opacity-70">{detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Transaction Monitor
const TxMonitor = ({ trade, config }) => {
  if (!trade) return (
    <div className="bg-[#06101e] border border-slate-800/60 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-600 text-xs font-mono">
      <Hash className="w-4 h-4" /> No transactions yet — execute a flash trade to see TX details here
    </div>
  );
  const profitDelta = trade.actual_profit != null && trade.expected_profit != null
    ? trade.actual_profit - trade.expected_profit : null;
  const explorerBase = config?.explorer || 'https://sepolia.arbiscan.io';
  return (
    <div className="bg-[#06101e] border border-purple-900/40 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Hash className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-mono font-bold text-slate-300 uppercase">Transaction Monitor</span>
        <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${STATUS_COLORS[trade.status] || 'text-slate-400'}`}>
          {trade.status}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
        {[
          ['Pair', trade.pair, 'text-white'],
          ['Mode', trade.mode?.toUpperCase(), trade.mode === 'paper' ? 'text-blue-400' : trade.mode === 'testnet' ? 'text-yellow-400' : 'text-red-400'],
          ['Size', fmt$(trade.input_amount, 0), 'text-white'],
          ['Expected P&L', fmt$(trade.expected_profit), 'text-blue-400'],
          ['Actual P&L', trade.actual_profit != null ? (trade.actual_profit > 0 ? '+' : '') + fmt$(trade.actual_profit) : 'Pending…', trade.actual_profit > 0 ? 'text-emerald-400 font-extrabold' : 'text-red-400 font-extrabold'],
          ['Gas Used', fmt$(trade.gas_cost_usd, 4), 'text-orange-400'],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-[#020c18] rounded-lg p-2">
            <p className="text-[9px] text-slate-600 uppercase mb-0.5">{l}</p>
            <p className={`font-bold ${c}`}>{v}</p>
          </div>
        ))}
      </div>
      {profitDelta != null && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono border ${
          profitDelta >= 0 ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-300' : 'bg-red-900/20 border-red-700/30 text-red-300'
        }`}>
          {profitDelta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          P&L vs Expected: {profitDelta >= 0 ? '+' : ''}{fmt$(profitDelta)} ({profitDelta >= 0 ? 'better' : 'worse'} than projected)
        </div>
      )}
      {trade.tx_hash && !trade.tx_hash.startsWith('PAPER') && (
        <a href={`${explorerBase}/tx/${trade.tx_hash}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/20 border border-blue-700/30 text-blue-400 text-xs font-mono hover:bg-blue-900/30 transition">
          <ExternalLink className="w-3.5 h-3.5" /> {shortHash(trade.tx_hash)} — View on Explorer
        </a>
      )}
      {trade.tx_hash?.startsWith('PAPER') && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-700/30 text-slate-500 text-xs font-mono">
          <Hash className="w-3.5 h-3.5" /> {trade.tx_hash} (Paper Trade — no on-chain TX)
        </div>
      )}
    </div>
  );
};

// Opportunity Table Row
const OpportunityRow = ({ opp, onExecute, onSimulate, loading, readiness }) => {
  const profitable = opp.net_profit >= 5;
  const isReady = readiness?.all_passed;
  return (
    <tr className={'border-b border-slate-800/50 hover:bg-slate-800/20 transition text-xs font-mono ' + (profitable ? '' : 'opacity-40')}>
      <td className="py-2.5 px-3 text-white font-bold">{opp.pair}</td>
      <td className="py-2.5 px-3 text-blue-400">{opp.buy_dex}</td>
      <td className="py-2.5 px-3 text-violet-400">{opp.sell_dex}</td>
      <td className="py-2.5 px-3 text-emerald-400">{fmtPct(opp.spread_pct, 3)}</td>
      <td className="py-2.5 px-3 text-slate-300">{fmt$(opp.input_amount_usd, 0)}</td>
      <td className="py-2.5 px-3 text-cyan-400">{fmt$(opp.flash_loan_fee, 3)}</td>
      <td className="py-2.5 px-3 text-orange-400">{fmt$(opp.gas_cost, 4)}</td>
      <td className={'py-2.5 px-3 font-extrabold ' + (opp.net_profit >= 5 ? 'text-emerald-400' : 'text-red-400')}>{fmt$(opp.net_profit)}</td>
      <td className="py-2.5 px-3 text-slate-300">{fmtBps(opp.profit_bps)}</td>
      <td className="py-2.5 px-3"><span className={STATUS_COLORS[opp.status] || 'text-slate-400'}>{opp.status}</span></td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onSimulate(opp.id)} className="px-2 py-1 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 text-[10px] font-bold transition border border-indigo-800/40">SIM</button>
          {profitable && <button onClick={() => onExecute(opp.id)} disabled={loading || !isReady} className="px-2 py-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/70 disabled:opacity-30 text-white text-[10px] font-bold transition border border-emerald-700/40">EXEC</button>}
        </div>
      </td>
    </tr>
  );
};
// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export const ArbitrageSection = () => {
  const { addNotification } = useCrypto();

  // ── Connection State ────────────────────────────────────────────────────────
  const [connected, setConnected] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const wsRef = useRef(null);

  // ── Engine State ────────────────────────────────────────────────────────────
  const [status, setStatus]           = useState(null);
  const [readiness, setReadiness]     = useState(null);
  const [config, setConfig]           = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [trades, setTrades]           = useState([]);
  const [stats, setStats]             = useState(null);
  const [prices, setPrices]           = useState({});
  const [gas, setGas]                 = useState(null);
  const [logs, setLogs]               = useState([]);

  // ── UI State ────────────────────────────────────────────────────────────────
  const [logFilter, setLogFilter]     = useState('ALL');
  const [autoExecute, setAutoExecute] = useState(false);
  const [mode, setMode]               = useState('paper');
  const [showMainnetGate, setShowMainnetGate] = useState(false);
  const [execLoading, setExecLoading] = useState(false);
  const [simResult, setSimResult]     = useState(null);
  const [activeTab, setActiveTab]     = useState('execute');
  const [execState, setExecState]     = useState('IDLE');
  const [lastTrade, setLastTrade]     = useState(null);
  const terminalRef = useRef(null);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const executableOpps = opportunities.filter(o => o.net_profit >= 5 && o.status !== 'REJECTED');
  const bestOpp        = executableOpps.sort((a, b) => b.net_profit - a.net_profit)[0] ?? null;
  const totalNetProfit = stats?.total_profit ?? 0;
  const winRate        = stats?.win_rate ?? 0;
  const readinessKey   = status || 'NOT READY';
  const badge          = READINESS_BADGE[readinessKey] || READINESS_BADGE['NOT READY'];

  // ── WebSocket ────────────────────────────────────────────────────────────────
  const addLog = useCallback((entry) =>
    setLogs(prev => [...prev.slice(-499), entry]), []);

  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        setConnected(true);
        setBackendOnline(true);
        addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'SYS', msg: '● Connected — Flash Arbitrage Engine ws://localhost:8000' });
      };
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          case 'opportunities':
            setOpportunities(msg.data.map(o => ({ ...o, age_seconds: (Date.now()/1000) - (o.created_at ?? 0) })));
            break;
          case 'stats':
            setStats(msg.data);
            if (msg.data.readiness_status) setStatus(msg.data.readiness_status);
            setAutoExecute(!!msg.data.auto_execute);
            break;
          case 'market': setPrices(msg.data); break;
          case 'gas':    setGas(msg.data); break;
          case 'trade':
            setTrades(p => [msg.data, ...p].slice(0, 100));
            setLastTrade(msg.data);
            setExecState(msg.data.status === 'CONFIRMED' ? 'CONFIRMED' : msg.data.status === 'FAILED' ? 'IDLE' : 'PENDING');
            break;
          case 'log': addLog(msg); break;
          case 'log_history': setLogs(msg.logs || []); break;
          case 'emergency_stop':
            addNotification('🚨 EMERGENCY STOP', 'danger');
            addLog({ ts: new Date().toLocaleTimeString(), level: 'ERROR', tag: 'SYS', msg: '🚨 EMERGENCY STOP ACTIVATED — All execution halted' });
            setExecState('IDLE');
            break;
          default: break;
        }
      };
      ws.onclose = () => { setConnected(false); setTimeout(connectWs, 3000); };
      ws.onerror = () => { setBackendOnline(false); setConnected(false); };
    } catch (_) { setBackendOnline(false); }
  }, [addLog, addNotification]);

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    connectWs();
    fetchConfig();
    fetchTrades();
    fetchReadiness();
    const iv = setInterval(() => { fetchReadiness(); fetchTrades(); }, 5000);
    return () => { clearInterval(iv); wsRef.current?.close(); };
  }, []);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [logs]);

  // ── API Calls ─────────────────────────────────────────────────────────────────
  const fetchReadiness = async () => {
    try {
      const r = await fetch(BACKEND + '/api/arbitrage/readiness');
      if (r.ok) { const d = await r.json(); setReadiness(d); setStatus(d.status); }
    } catch (_) {}
  };

  const fetchConfig = async () => {
    try {
      const r = await fetch(BACKEND + '/api/arbitrage/config');
      if (r.ok) { const d = await r.json(); setConfig(d); setMode(d.mode); }
    } catch (_) {}
  };

  const fetchTrades = async () => {
    try {
      const r = await fetch(BACKEND + '/api/transactions');
      if (r.ok) { const d = await r.json(); setTrades(d.trades || []); if (d.trades?.length) setLastTrade(d.trades[0]); }
    } catch (_) {}
  };

  // ── Action Handlers ───────────────────────────────────────────────────────────
  const handleExecute = async (id) => {
    if (!readiness?.all_passed) { addNotification('⛔ System not ready — check 22-Point Audit', 'danger'); return; }
    setExecLoading(true);
    setExecState('VALIDATING');
    addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'EXEC', msg: `▶ Initiating flash trade for opportunity ${id}` });
    try {
      setExecState('RISK_CHECK');
      addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'RISK', msg: '⚙ Running 18-point risk engine checks...' });
      await new Promise(r => setTimeout(r, 300));
      setExecState('SIMULATING');
      addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'SIMULATION', msg: '🔬 Simulating via eth_call before broadcast...' });
      await new Promise(r => setTimeout(r, 400));
      setExecState('SUBMITTING');
      addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'EXEC', msg: '📡 Submitting transaction to mempool...' });

      const r = await fetch(BACKEND + '/api/arbitrage/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: id })
      });
      const d = await r.json();
      if (r.ok) {
        setExecState('CONFIRMED');
        addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'TX', msg: `✅ Trade CONFIRMED: +${fmt$(d.trade?.actual_profit)} | TX: ${d.trade?.tx_hash || 'PAPER'}` });
        addNotification('✅ Trade executed: +' + fmt$(d.trade?.actual_profit) + ' profit', 'success');
        setLastTrade(d.trade);
        fetchTrades();
      } else {
        setExecState('IDLE');
        addLog({ ts: new Date().toLocaleTimeString(), level: 'ERROR', tag: 'EXEC', msg: `❌ Execution failed: ${d.detail}` });
        addNotification('❌ ' + d.detail, 'danger');
      }
    } catch (err) {
      setExecState('IDLE');
      addLog({ ts: new Date().toLocaleTimeString(), level: 'ERROR', tag: 'EXEC', msg: '❌ Backend not reachable — start the Python server' });
      addNotification('❌ Backend not reachable', 'danger');
    }
    setExecLoading(false);
  };

  const handleSimulate = async (id) => {
    setExecState('SIMULATING');
    addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'SIMULATION', msg: `🔬 Simulating opportunity ${id}...` });
    try {
      const r = await fetch(BACKEND + '/api/arbitrage/simulate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: id })
      });
      if (r.ok) {
        const d = await r.json();
        setSimResult(d);
        setExecState('IDLE');
        setActiveTab('execute');
        addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'SIMULATION', msg: `✔ Simulation ${d.simulation}: Net ${fmt$(d.net_profit)} | ${d.reason}` });
      } else {
        setExecState('IDLE');
        addNotification('❌ Backend not reachable', 'danger');
      }
    } catch (_) {
      setExecState('IDLE');
      addNotification('❌ Backend not reachable', 'danger');
    }
  };

  const handleAutoExecute = async (enabled) => {
    setAutoExecute(enabled);
    try {
      await fetch(BACKEND + '/api/arbitrage/auto-execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      addLog({ ts: new Date().toLocaleTimeString(), level: 'INFO', tag: 'SYS', msg: enabled ? '⚡ Auto-execute ENABLED' : '⏹ Auto-execute DISABLED' });
      addNotification(enabled ? '⚡ Auto-execute ON' : '⏹ Auto-execute OFF', 'info');
    } catch (_) {}
  };

  const handleEmergencyStop = async () => {
    try {
      await fetch(BACKEND + '/api/emergency-stop', { method: 'POST' });
      setAutoExecute(false);
      setExecState('IDLE');
      addNotification('🚨 EMERGENCY STOP activated', 'danger');
    } catch (_) { addNotification('❌ Backend not reachable', 'danger'); }
  };

  const handleModeSelect = (m) => {
    if (m === 'mainnet') { setShowMainnetGate(true); return; }
    setMode(m);
    addNotification('Mode: ' + m.toUpperCase(), 'info');
  };

  // ── Filter/Derived ─────────────────────────────────────────────────────────
  const filteredLogs = logFilter === 'ALL' ? logs : logs.filter(l => l.tag === logFilter || l.level === logFilter);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto pb-12">
      {showMainnetGate && (
        <MainnetGate
          onConfirm={() => { setMode('mainnet'); setShowMainnetGate(false); addNotification('⚠ MAINNET MODE — Real funds. Set MAINNET_ENABLED=true in .env', 'warning'); }}
          onCancel={() => setShowMainnetGate(false)}
        />
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1523] border border-slate-800/80 p-5 rounded-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={'w-2.5 h-2.5 rounded-full ' + (connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500')} />
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight font-mono flex items-center gap-2 flex-wrap">
                ⚡ FLASH ARBITRAGE ENGINE
                <span className={'px-2 py-0.5 text-xs rounded font-mono font-bold border ' +
                  (mode === 'paper' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                   mode === 'testnet' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                   'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse')}>
                  {mode === 'paper' ? '📄 PAPER' : mode === 'testnet' ? '🧪 TESTNET' : '🔴 MAINNET'}
                </span>
                {/* Readiness badge */}
                <span className={`px-2.5 py-0.5 text-xs rounded-lg font-mono font-bold border flex items-center gap-1.5 ${badge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {badge.label}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {connected
                  ? `● Live — ${config?.chain_name || 'Arbitrum Sepolia'} | Aave V3 Flash Loans | Exec State: ${execState}`
                  : '○ Backend offline — run: python -m uvicorn backend.app:app --port 8000'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['paper', 'testnet', 'mainnet'].map(m => (
              <button key={m} onClick={() => handleModeSelect(m)}
                className={'px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition ' +
                  (mode === m
                    ? (m === 'paper' ? 'bg-blue-600 border-blue-500 text-white' : m === 'testnet' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-red-700 border-red-500 text-white')
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500')}>
                {m.toUpperCase()}
              </button>
            ))}
            <button onClick={handleEmergencyStop}
              className="px-3.5 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-800/80 border border-red-700/60 text-red-300 text-xs font-mono font-bold transition flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" /> E-STOP
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Net P&L',    value: fmt$(totalNetProfit),              color: totalNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400', icon: DollarSign },
          { label: 'Win Rate',   value: winRate + '%',                     color: 'text-blue-400',    icon: TrendingUp },
          { label: 'Trades',     value: stats?.total_trades ?? 0,          color: 'text-white',       icon: Activity },
          { label: 'Executable', value: executableOpps.length,             color: 'text-emerald-400', icon: Zap },
          { label: 'Best Opp',   value: bestOpp ? fmt$(bestOpp.net_profit) : '—', color: 'text-emerald-400', icon: Target },
          { label: 'Gas Spent',  value: fmt$(stats?.total_gas_spent, 4),  color: 'text-orange-400',  icon: Cpu },
          { label: 'Gas Now',    value: gas ? gas.gas_price_gwei?.toFixed(4) + ' gwei' : '—', color: 'text-yellow-400', icon: Flame },
          { label: 'ETH Price',  value: fmt$(prices?.ETH, 2),              color: 'text-indigo-400',  icon: BarChart2 },
        ].map((s, i) => (
          <div key={i} className="bg-[#0d1523] border border-slate-800/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</span>
            </div>
            <p className={'text-sm font-extrabold font-mono ' + s.color}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── AUTO-EXECUTE CONTROL ────────────────────────────────────────────── */}
      <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">AUTO-EXECUTE:</span>
          <button onClick={() => handleAutoExecute(!autoExecute)}
            className={'relative w-12 h-6 rounded-full transition-colors ' + (autoExecute ? 'bg-emerald-600' : 'bg-slate-700')}>
            <div className={'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ' + (autoExecute ? 'translate-x-6' : '')} />
          </button>
          <span className={'text-xs font-mono font-bold ' + (autoExecute ? 'text-emerald-400' : 'text-slate-500')}>
            {autoExecute ? '⚡ ON — Watching for profitable opportunities' : 'OFF'}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto text-xs font-mono text-slate-400 flex-wrap">
          <span>Min:</span><span className="text-white">{fmt$(config?.min_profit_usd)} / {config?.min_profit_bps} bps</span>
          <span className="mx-2 text-slate-700">|</span>
          <span>Max size:</span><span className="text-white">{fmt$(config?.max_trade_size, 0)}</span>
          <span className="mx-2 text-slate-700">|</span>
          <span>Max gas:</span><span className="text-white">{fmt$(config?.max_gas_usd)}</span>
        </div>
      </div>

      {/* ── BACKEND OFFLINE ─────────────────────────────────────────────────── */}
      {!backendOnline && (
        <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-2">
            <p className="text-yellow-300 font-bold">Python backend not running — start it to enable live arbitrage:</p>
            <div className="bg-black/40 rounded-lg px-3 py-2 text-emerald-400 space-y-1">
              <p>cd D:\tradetraining</p>
              <p>python -m uvicorn backend.app:app --port 8000 --host 127.0.0.1</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TABS ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-[#0a1020] rounded-xl p-1 border border-slate-800/60 overflow-x-auto">
        {[
          { id: 'execute',       label: '⚡ Execute',           icon: Zap },
          { id: 'opportunities', label: 'Opportunities (' + executableOpps.length + ')', icon: Target },
          { id: 'terminal',      label: 'Terminal',             icon: Terminal },
          { id: 'readiness',     label: '22-Pt Audit',          icon: Shield },
          { id: 'trades',        label: 'Trades (' + trades.length + ')', icon: Activity },
          { id: 'stats',         label: 'Risk & Config',        icon: BarChart2 },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={'flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold transition ' +
              (activeTab === t.id ? 'bg-[#0d1a2e] text-white border border-slate-700/50' : 'text-slate-500 hover:text-slate-300')}>
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: EXECUTE — Main Flash Trade Panel
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'execute' && (
        <div className="space-y-4">
          {/* State Machine */}
          <ExecStateMachine execState={execState} isExecuting={execLoading} />

          {/* 2-col layout: Best Opp | Flash Loan Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BestOpportunityPanel
              opp={bestOpp}
              onExecute={handleExecute}
              onSimulate={handleSimulate}
              readiness={readiness}
              loading={execLoading}
            />
            <FlashLoanPanel opp={bestOpp} config={config} />
          </div>

          {/* Pre-Trade Checklist */}
          <PreTradeChecklist opp={bestOpp} gas={gas} connected={connected} prices={prices} />

          {/* Simulation Result */}
          {simResult && (
            <div className="bg-[#060e1c] border border-indigo-500/30 rounded-2xl p-4 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-indigo-400 font-bold uppercase flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Simulation Result: {simResult.pair} —
                  <span className={simResult.simulation === 'PASSED' ? 'text-emerald-400' : 'text-red-400'}>{simResult.simulation}</span>
                </span>
                <button onClick={() => setSimResult(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ['Trade Size', fmt$(simResult.input_amount), 'text-white'],
                  ['Gross Profit', fmt$(simResult.gross_profit), 'text-blue-400'],
                  ['Flash Fee', fmt$(simResult.flash_loan_fee), 'text-cyan-400'],
                  ['Gas', fmt$(simResult.gas_cost, 4), 'text-orange-400'],
                  ['Net Profit', fmt$(simResult.net_profit), simResult.net_profit > 0 ? 'text-emerald-400 font-extrabold' : 'text-red-400 font-extrabold'],
                  ['Status', simResult.simulation, simResult.simulation === 'PASSED' ? 'text-emerald-400' : 'text-red-400'],
                  ['Buy DEX', simResult.buy_dex, 'text-blue-400'],
                  ['Sell DEX', simResult.sell_dex, 'text-violet-400'],
                ].map(([l, v, c]) => (
                  <div key={l} className="bg-[#03070f] rounded-lg p-2.5">
                    <p className="text-slate-500 text-[10px] uppercase mb-1">{l}</p>
                    <p className={'font-bold ' + c}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="text-slate-500 bg-[#03070f] rounded-lg px-3 py-2">Reason: {simResult.reason}</div>
            </div>
          )}

          {/* Transaction Monitor */}
          <TxMonitor trade={lastTrade} config={config} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: OPPORTUNITIES TABLE
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'opportunities' && (
        <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Live Arbitrage Opportunities
            </span>
            <span className="text-[10px] font-mono text-slate-500">Real-time · {opportunities.length} detected · Sorted by net profit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-slate-500 font-mono uppercase border-b border-slate-800/40">
                  {['Pair','Buy DEX','Sell DEX','Spread','Size','Flash Fee','Gas','Net Profit','BPS','Status','Action'].map(h =>
                    <th key={h} className="py-2.5 px-3 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {opportunities.length === 0 ? (
                  <tr><td colSpan={11} className="py-12 text-center text-slate-500 font-mono text-sm">
                    {connected ? 'Scanning markets for arbitrage opportunities…' : '⚠ Backend offline — start Python server'}
                  </td></tr>
                ) : opportunities.map(opp => (
                  <OpportunityRow key={opp.id} opp={opp} onExecute={handleExecute} onSimulate={handleSimulate} loading={execLoading} readiness={readiness} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: LIVE TERMINAL
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'terminal' && (
        <div className="bg-[#020812] border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> EXECUTION TERMINAL
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {['ALL','ARB','RISK','EXEC','DEX','FLASHLOAN','GAS','SIMULATION','TX','ERROR'].map(f => (
                <button key={f} onClick={() => setLogFilter(f)}
                  className={'px-2 py-0.5 rounded text-[10px] font-mono transition ' + (logFilter === f ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300')}>
                  {f}
                </button>
              ))}
              <button onClick={() => setLogs([])} className="text-[10px] text-slate-600 hover:text-slate-400 font-mono ml-2">CLEAR</button>
            </div>
          </div>
          <div ref={terminalRef} className="h-96 overflow-y-auto p-4 font-mono text-xs space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
            {filteredLogs.length === 0 ? (
              <p className="text-slate-600">{connected ? 'Waiting for engine events…' : '● Backend offline'}</p>
            ) : filteredLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 hover:bg-slate-900/30 px-1 py-0.5 rounded">
                <span className="text-slate-600 shrink-0 w-20">{log.ts}</span>
                <span className={'shrink-0 w-14 text-right ' + (TAG_COLORS[log.tag] || 'text-slate-500')}>{log.tag}</span>
                <span className={'flex-1 leading-relaxed ' + (log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARNING' ? 'text-yellow-400' : 'text-slate-300')}>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: 22-POINT READINESS AUDIT
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'readiness' && (
        <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-extrabold text-white font-mono uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> 22-Point Production Readiness Audit
            </h3>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${badge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${badge.dot}`} /> {readiness?.status_message || 'Fetching…'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(readiness?.checks || []).map((chk, i) => (
              <div key={chk.id} className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-mono ${
                chk.passed ? 'bg-emerald-900/15 border-emerald-700/30' : 'bg-red-900/15 border-red-700/30'
              }`}>
                <span className="text-slate-600 shrink-0 w-5 text-right">{String(i + 1).padStart(2, '0')}</span>
                {chk.passed
                  ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                <div className="min-w-0">
                  <p className={`font-bold truncate ${chk.passed ? 'text-emerald-300' : 'text-red-300'}`}>{chk.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{chk.detail}</p>
                </div>
              </div>
            ))}
          </div>
          {readiness && (
            <div className={`text-xs font-mono font-bold text-center p-3 rounded-xl border ${
              readiness.all_passed ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-400' : 'bg-red-900/20 border-red-700/30 text-red-400'
            }`}>
              {readiness.all_passed
                ? `✅ ALL 22 CHECKS PASSED — ${readiness.status_message}`
                : `⛔ ${readiness.status_message}`}
            </div>
          )}
          <div className="flex justify-end">
            <button onClick={fetchReadiness} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition">
              <RefreshCw className="w-3 h-3" /> Refresh Audit
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: TRADE HISTORY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'trades' && (
        <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Transaction History
            </span>
            <button onClick={fetchTrades} className="flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-slate-500 font-mono uppercase border-b border-slate-800/40">
                  {['Time','Pair','Mode','Size','Expected','Actual','Δ P&L','Gas','TX Hash','Status'].map(h =>
                    <th key={h} className="py-2 px-3 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {trades.length === 0
                  ? <tr><td colSpan={10} className="py-12 text-center text-slate-500 font-mono text-sm">No trades yet — execute an opportunity to see results here</td></tr>
                  : trades.map(t => {
                    const delta = t.actual_profit != null && t.expected_profit != null ? t.actual_profit - t.expected_profit : null;
                    return (
                      <tr key={t.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 text-xs font-mono">
                        <td className="py-2.5 px-3 text-slate-500">{t.created_at ? new Date(t.created_at * 1000).toLocaleTimeString() : '—'}</td>
                        <td className="py-2.5 px-3 text-white font-bold">{t.pair}</td>
                        <td className="py-2.5 px-3">
                          <span className={'px-1.5 py-0.5 rounded text-[10px] font-bold ' +
                            (t.mode === 'paper' ? 'bg-blue-500/20 text-blue-400' : t.mode === 'testnet' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400')}>
                            {t.mode?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{fmt$(t.input_amount, 0)}</td>
                        <td className="py-2.5 px-3 text-blue-400">{fmt$(t.expected_profit)}</td>
                        <td className={'py-2.5 px-3 font-bold ' + (t.actual_profit > 0 ? 'text-emerald-400' : t.actual_profit < 0 ? 'text-red-400' : 'text-slate-400')}>
                          {t.actual_profit != null ? (t.actual_profit > 0 ? '+' : '') + fmt$(t.actual_profit) : '—'}
                        </td>
                        <td className={'py-2.5 px-3 text-[10px] ' + (delta == null ? 'text-slate-600' : delta >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {delta != null ? (delta >= 0 ? '▲' : '▼') + fmt$(Math.abs(delta)) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-orange-400">{fmt$(t.gas_cost_usd, 4)}</td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {t.tx_hash && !t.tx_hash.startsWith('PAPER')
                            ? <a href={`${config?.explorer || 'https://sepolia.arbiscan.io'}/tx/${t.tx_hash}`} target="_blank" rel="noreferrer"
                                className="text-blue-400 hover:underline flex items-center gap-1">
                                {shortHash(t.tx_hash)} <ExternalLink className="w-3 h-3" />
                              </a>
                            : <span className="text-slate-600">{shortHash(t.tx_hash)}</span>}
                        </td>
                        <td className={'py-2.5 px-3 font-bold ' + (STATUS_COLORS[t.status] || 'text-slate-400')}>{t.status}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: RISK & CONFIG
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Risk Config */}
          <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-white font-mono uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Risk Engine Configuration
            </h3>
            {[
              ['Mode', mode.toUpperCase(), mode === 'mainnet' ? 'text-red-400' : mode === 'testnet' ? 'text-yellow-400' : 'text-blue-400'],
              ['Chain', config?.chain_name || '—', 'text-white'],
              ['Min Profit USD', fmt$(config?.min_profit_usd), 'text-emerald-400'],
              ['Min Profit BPS', config?.min_profit_bps + ' bps', 'text-emerald-400'],
              ['Max Trade Size', fmt$(config?.max_trade_size, 0), 'text-white'],
              ['Max Slippage', config?.max_slippage_bps + ' bps', 'text-yellow-400'],
              ['Max Gas USD', fmt$(config?.max_gas_usd), 'text-orange-400'],
              ['Max Daily Loss', fmt$(config?.max_daily_loss_usd, 0), 'text-red-400'],
              ['Flash Asset', config?.flash_loan_asset || 'USDC', 'text-cyan-400'],
              ['Aave Pool', config?.aave_pool ? shortHash(config.aave_pool) : '—', 'text-slate-400'],
            ].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between text-xs font-mono border-b border-slate-800/40 pb-2">
                <span className="text-slate-400">{l}</span>
                <span className={'font-bold ' + c}>{v}</span>
              </div>
            ))}
          </div>

          {/* Performance */}
          <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-white font-mono uppercase flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" /> Performance & P&L
            </h3>
            {[
              ['Total Trades', stats?.total_trades ?? 0, 'text-white'],
              ['Wins', stats?.win_count ?? 0, 'text-emerald-400'],
              ['Losses', stats?.loss_count ?? 0, 'text-red-400'],
              ['Win Rate', winRate + '%', winRate >= 60 ? 'text-emerald-400' : 'text-yellow-400'],
              ['Total Net P&L', fmt$(totalNetProfit), totalNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'],
              ['Gas Spent', fmt$(stats?.total_gas_spent, 4), 'text-orange-400'],
              ['Paper Balance', fmt$(stats?.paper_balance), 'text-blue-400'],
              ['Daily Loss Used', fmt$(stats?.daily_loss_usd ?? 0), 'text-yellow-400'],
              ['Engine Uptime', stats?.uptime_seconds ? Math.floor(stats.uptime_seconds / 60) + 'm ' + (stats.uptime_seconds % 60) + 's' : '—', 'text-slate-300'],
            ].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between text-xs font-mono border-b border-slate-800/40 pb-2">
                <span className="text-slate-400">{l}</span>
                <span className={'font-bold ' + c}>{v}</span>
              </div>
            ))}
          </div>

          {/* System Health */}
          <div className="lg:col-span-2 bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-white font-mono uppercase flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> System Health
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { l: 'Backend API', ok: backendOnline },
                { l: 'WebSocket', ok: connected },
                { l: 'Market Data', ok: Object.keys(prices).length > 0 },
                { l: 'Gas Feed', ok: gas != null },
                { l: 'Risk Engine', ok: readiness?.checks?.find(c => c.id === 'risk_engine')?.passed ?? true },
                { l: 'Opp Scanner', ok: opportunities.length > 0 },
                { l: 'Aave V3 Config', ok: !!config?.aave_pool },
                { l: 'Flash Asset', ok: !!config?.flash_loan_asset },
                { l: 'Mode Set', ok: true },
                { l: 'Circuit Breaker', ok: readiness?.checks?.find(c => c.id === 'circuit_breaker')?.passed ?? true },
              ].map(({ l, ok }) => (
                <div key={l} className={'flex items-center gap-2 p-3 rounded-xl border text-xs font-mono ' +
                  (ok ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-300' : 'bg-slate-900/40 border-slate-700/30 text-slate-500')}>
                  {ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  {l}
                </div>
              ))}
            </div>
            <div className={'mt-4 p-3 rounded-xl text-xs font-mono font-bold text-center border ' +
              (readiness?.all_passed && connected
                ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-400'
                : 'bg-red-900/20 border-red-700/30 text-red-400')}>
              {readiness?.all_passed && connected
                ? `✅ ${readiness.status_message}`
                : '⛔ SYSTEM NOT READY — Start Python backend or check configuration'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
