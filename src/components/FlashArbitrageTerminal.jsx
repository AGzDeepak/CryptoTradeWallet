import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  Zap, ShieldCheck, ArrowRightLeft, Layers, Play, Pause, RefreshCw, 
  Activity, CheckCircle2, AlertTriangle, ExternalLink, Bot, Terminal, 
  TrendingUp, Lock, Coins, Cpu, ChevronRight, DollarSign, ArrowUpRight
} from 'lucide-react';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const FLASH_PROVIDERS = [
  { id: 'aave', name: 'Aave V3 Flash Pool', feePct: 0.05, maxLiquidityUsd: 5000000, icon: '⚡' },
  { id: 'balancer', name: 'Balancer V2 Vaults', feePct: 0.00, maxLiquidityUsd: 10000000, icon: '⚖️' },
  { id: 'uniswap', name: 'Uniswap V3 Flash Swaps', feePct: 0.05, maxLiquidityUsd: 8000000, icon: '🦄' },
  { id: 'equalizer', name: 'Equalizer Flash Engine', feePct: 0.00, maxLiquidityUsd: 2500000, icon: '🌐' },
];

const PRESET_LOANS = [25000, 100000, 250000, 500000, 1000000];

export const FlashArbitrageTerminal = () => {
  const { 
    wallet, setWallet, addNotification, audioFx, marketData,
    tradeHistory, setTradeHistory, totalBotProfit, setTotalBotProfit
  } = useCrypto();

  const [providerId, setProviderId]       = useState('aave');
  const [loanAmount, setLoanAmount]       = useState(250000);
  const [targetPair, setTargetPair]       = useState('ETH/USDT');
  const [dexBuy, setDexBuy]               = useState('Uniswap V3');
  const [dexSell, setDexSell]             = useState('SushiSwap');
  const [isExecuting, setIsExecuting]     = useState(false);
  const [execStep, setExecStep]           = useState(0); // 0=idle, 1=borrow, 2=swap1, 3=swap2, 4=repay, 5=settled
  const [flashBotActive, setFlashBotActive] = useState(false);

  const [flashLogs, setFlashLogs]         = useState([
    {
      id: 'FLASH-9901',
      time: new Date(Date.now() - 180000).toLocaleTimeString(),
      pair: 'ETH/USDT',
      loanUsd: 250000,
      provider: 'Aave V3',
      buyDex: 'Uniswap V3',
      sellDex: 'SushiSwap',
      spreadPct: 0.82,
      grossProfitUsd: 2050.00,
      loanFeeUsd: 125.00,
      netProfitUsd: 1925.00,
      txHash: '0x94826b52a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
      status: 'SUCCESS'
    }
  ]);

  const [flashStats, setFlashStats] = useState({
    totalVolumeLoaned: 1250000,
    totalFlashTrades: 5,
    totalFlashProfitUsd: 8420.50
  });

  const selectedProvider = useMemo(() => 
    FLASH_PROVIDERS.find(p => p.id === providerId) || FLASH_PROVIDERS[0],
    [providerId]
  );

  const ethPrice = marketData?.find(c => c.symbol === 'ETHUSDT')?.basePrice || 3540.20;
  const spreadPct = 0.74; // Simulated live DEX price delta
  const grossProfitUsd = parseFloat((loanAmount * (spreadPct / 100)).toFixed(2));
  const loanFeeUsd = parseFloat((loanAmount * (selectedProvider.feePct / 100)).toFixed(2));
  const gasFeeUsd = 14.50;
  const netProfitUsd = parseFloat((grossProfitUsd - loanFeeUsd - gasFeeUsd).toFixed(2));

  /* ── Execute Single Atomic Flash Arbitrage Transaction ─────────── */
  const handleExecuteFlashTrade = async () => {
    if (netProfitUsd <= 0) {
      addNotification('⚠️ Flash Arbitrage Cancelled: Net profit is 0 or negative after fees!', 'warning');
      return;
    }

    setIsExecuting(true);
    setExecStep(1);

    try {
      // Step 1: Borrow Flash Loan from Pool
      await new Promise(r => setTimeout(r, 600));
      setExecStep(2);

      // Step 2: Swap on DEX 1
      await new Promise(r => setTimeout(r, 600));
      setExecStep(3);

      // Step 3: Swap on DEX 2
      await new Promise(r => setTimeout(r, 600));
      setExecStep(4);

      // Step 4: Repay Flash Loan + Fee
      await new Promise(r => setTimeout(r, 600));
      setExecStep(5);

      // Step 5: Settle Net Profit to Wallet
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      setWallet(w => ({
        ...w,
        virtualBalance: parseFloat(((w.virtualBalance || 0) + netProfitUsd).toFixed(2)),
        totalEquity: parseFloat(((w.totalEquity || 0) + netProfitUsd).toFixed(2)),
        todayProfit: parseFloat(((w.todayProfit || 0) + netProfitUsd).toFixed(2))
      }));

      setTotalBotProfit(prev => parseFloat((prev + netProfitUsd).toFixed(2)));

      const newLog = {
        id: `FLASH-${Math.floor(1000 + Math.random() * 9000)}`,
        time: new Date().toLocaleTimeString(),
        pair: targetPair,
        loanUsd: loanAmount,
        provider: selectedProvider.name,
        buyDex,
        sellDex,
        spreadPct,
        grossProfitUsd,
        loanFeeUsd,
        netProfitUsd,
        txHash,
        status: 'SUCCESS'
      };

      setFlashLogs(prev => [newLog, ...prev.slice(0, 19)]);
      setFlashStats(prev => ({
        totalVolumeLoaned: prev.totalVolumeLoaned + loanAmount,
        totalFlashTrades: prev.totalFlashTrades + 1,
        totalFlashProfitUsd: parseFloat((prev.totalFlashProfitUsd + netProfitUsd).toFixed(2))
      }));

      // Record in Global Trade History
      if (typeof setTradeHistory === 'function') {
        setTradeHistory(prev => [{
          id: newLog.id,
          type: 'SELL',
          side: 'SELL',
          action: 'FLASH_ARBITRAGE',
          symbol: targetPair.replace('/', ''),
          exchange: `${buyDex} → ${sellDex}`,
          amount: parseFloat((loanAmount / ethPrice).toFixed(4)),
          price: ethPrice,
          total: loanAmount,
          profit: netProfitUsd,
          netProfit: netProfitUsd,
          time: newLog.time,
          txHash,
          category: 'FLASH_LOAN'
        }, ...prev]);
      }

      try { audioFx?.playTradeSuccess(); } catch (_) {}
      addNotification(`⚡ Flash Arbitrage Settled! Borrowed $${loanAmount.toLocaleString()} USDT ➔ Net Profit Locked: +$${netProfitUsd.toFixed(2)} USDT`, 'success');
    } catch (err) {
      addNotification(`Flash Arbitrage Aborted: ${err.message || 'Transaction reverted'}`, 'danger');
    } finally {
      setIsExecuting(false);
      setExecStep(0);
    }
  };

  /* ── Automated Flash Bot Scanner Loop ───────────────────────────── */
  useEffect(() => {
    if (!flashBotActive) return;

    const interval = setInterval(() => {
      const liveSpread = parseFloat((0.45 + Math.random() * 0.65).toFixed(2));
      const autoLoan = [100000, 250000, 500000][Math.floor(Math.random() * 3)];
      const autoGross = parseFloat((autoLoan * (liveSpread / 100)).toFixed(2));
      const autoFee = parseFloat((autoLoan * 0.0005).toFixed(2));
      const autoNet = parseFloat((autoGross - autoFee - 12.0).toFixed(2));

      if (autoNet > 0) {
        const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        setWallet(w => ({
          ...w,
          virtualBalance: parseFloat(((w.virtualBalance || 0) + autoNet).toFixed(2)),
          totalEquity: parseFloat(((w.totalEquity || 0) + autoNet).toFixed(2)),
          todayProfit: parseFloat(((w.todayProfit || 0) + autoNet).toFixed(2))
        }));

        setTotalBotProfit(prev => parseFloat((prev + autoNet).toFixed(2)));

        const newLog = {
          id: `AUTO-FLASH-${Math.floor(1000 + Math.random() * 9000)}`,
          time: new Date().toLocaleTimeString(),
          pair: 'ETH/USDT',
          loanUsd: autoLoan,
          provider: 'Aave V3 Flash Pool',
          buyDex: 'Uniswap V3',
          sellDex: 'SushiSwap',
          spreadPct: liveSpread,
          grossProfitUsd: autoGross,
          loanFeeUsd: autoFee,
          netProfitUsd: autoNet,
          txHash,
          status: 'SUCCESS'
        };

        setFlashLogs(prev => [newLog, ...prev.slice(0, 19)]);
        setFlashStats(prev => ({
          totalVolumeLoaned: prev.totalVolumeLoaned + autoLoan,
          totalFlashTrades: prev.totalFlashTrades + 1,
          totalFlashProfitUsd: parseFloat((prev.totalFlashProfitUsd + autoNet).toFixed(2))
        }));

        try { audioFx?.playTradeSuccess(); } catch (_) {}
        addNotification(`🤖 Flash Bot Executed: Borrowed $${autoLoan.toLocaleString()} USDT ➔ Net Profit: +$${autoNet.toFixed(2)} USDT`, 'success');
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [flashBotActive, setWallet, setTotalBotProfit, addNotification, audioFx]);

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-emerald-500/10 border border-amber-500/20 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Flash Loan Arbitrage Engine</h2>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                0-COLLATERAL LEVERAGE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Borrow up to <strong>$1,000,000 USDT</strong> instantly from Aave/Balancer pools in a single atomic block. Risk-free profit settlement!
            </p>
          </div>
        </div>

        <button
          onClick={() => setFlashBotActive(!flashBotActive)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
            flashBotActive
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
          }`}
        >
          {flashBotActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{flashBotActive ? 'Pause Flash Bot' : 'Start Auto Flash Bot'}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-4">
          <p className="text-xs text-slate-400 mb-1">Total Loan Volume</p>
          <p className="text-xl font-bold text-amber-400">${fmt(flashStats.totalVolumeLoaned)}</p>
        </div>
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-4">
          <p className="text-xs text-slate-400 mb-1">Atomic Executions</p>
          <p className="text-xl font-bold text-white">{flashStats.totalFlashTrades} Swaps</p>
        </div>
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-4">
          <p className="text-xs text-slate-400 mb-1">Cumulative Flash Profit</p>
          <p className="text-xl font-bold text-emerald-400">+${fmt(flashStats.totalFlashProfitUsd)}</p>
        </div>
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-4">
          <p className="text-xs text-slate-400 mb-1">Required Collateral</p>
          <p className="text-xl font-bold text-cyan-400">$0.00 USD (0%)</p>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Left 2 Cols: Form & Atomic Route Breakdown */}
        <div className="lg:col-span-2 space-y-5">

          {/* Configuration Box */}
          <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 space-y-5">

            {/* Provider Selector */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-medium">1. Select Flash Loan Liquidity Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FLASH_PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProviderId(p.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      providerId === p.id
                        ? 'bg-amber-500/15 border-amber-500/40 text-white'
                        : 'bg-[#060d18] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{p.icon}</span>
                      <span className="text-xs font-bold text-white truncate">{p.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Fee: {p.feePct}% · Max ${fmt(p.maxLiquidityUsd / 1e6, 1)}M</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Amount Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400 font-medium">2. Flash Loan Borrow Amount (0 Collateral)</label>
                <span className="text-xs font-bold text-amber-400">${fmt(loanAmount)} USDT</span>
              </div>

              <div className="relative mb-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  step="10000"
                  value={loanAmount}
                  onChange={e => setLoanAmount(Math.max(1000, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_LOANS.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLoanAmount(amt)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                      loanAmount === amt
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#060d18] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ${amt / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* Target DEX Arbitrage Pair Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Target Pair</label>
                <select
                  value={targetPair}
                  onChange={e => setTargetPair(e.target.value)}
                  className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                >
                  <option value="ETH/USDT">ETH/USDT</option>
                  <option value="BTC/USDT">BTC/USDT</option>
                  <option value="SOL/USDT">SOL/USDT</option>
                  <option value="AVAX/USDT">AVAX/USDT</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Leg 1: Buy DEX Pool</label>
                <select
                  value={dexBuy}
                  onChange={e => setDexBuy(e.target.value)}
                  className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-400 outline-none"
                >
                  <option value="Uniswap V3">Uniswap V3 ($3,540.20)</option>
                  <option value="PancakeSwap V2">PancakeSwap V2 ($3,541.00)</option>
                  <option value="QuickSwap">QuickSwap ($3,539.80)</option>
                  <option value="Trader Joe">Trader Joe ($3,540.50)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Leg 2: Sell DEX Pool</label>
                <select
                  value={dexSell}
                  onChange={e => setDexSell(e.target.value)}
                  className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-purple-400 outline-none"
                >
                  <option value="SushiSwap">SushiSwap ($3,585.00)</option>
                  <option value="OKX DEX">OKX DEX ($3,582.40)</option>
                  <option value="Curve Pool">Curve Pool ($3,584.10)</option>
                  <option value="Balancer Vault">Balancer Vault ($3,586.00)</option>
                </select>
              </div>
            </div>

            {/* Atomic 4-Leg Execution Pipeline Visualizer */}
            <div className="rounded-xl bg-[#060d18] border border-slate-800/80 p-4 space-y-3">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Atomic Transaction Route Execution</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[
                  { step: '1. Borrow', text: `+$${fmt(loanAmount)} USDT`, sub: selectedProvider.name, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                  { step: '2. Swap Buy', text: `${dexBuy}`, sub: `$${fmt(ethPrice)}/ETH`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                  { step: '3. Swap Sell', text: `${dexSell}`, sub: `+$${fmt(grossProfitUsd)} Profit`, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
                  { step: '4. Repay & Settle', text: `Repay + $${fmt(loanFeeUsd)} Fee`, sub: `Net: +$${fmt(netProfitUsd)}`, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
                ].map((s, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${s.color}`}>
                    <p className="text-[10px] font-bold opacity-80 uppercase">{s.step}</p>
                    <p className="text-xs font-extrabold mt-0.5 truncate">{s.text}</p>
                    <p className="text-[10px] opacity-70 mt-0.5 truncate">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Box & Execute Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div>
                <p className="text-xs text-slate-400">Net Estimated Risk-Free Profit</p>
                <p className="text-2xl font-extrabold text-emerald-400">+${fmt(netProfitUsd)} USDT</p>
              </div>

              <button
                onClick={handleExecuteFlashTrade}
                disabled={isExecuting}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
                  isExecuting
                    ? 'bg-amber-600 opacity-70 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                {isExecuting ? (
                  <>Running Step {execStep}/5…</>
                ) : (
                  <><Zap className="w-4 h-4 fill-current" /> Execute Atomic Flash Swap</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Flash Arbitrage Audit History */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Flash Audit Ledger</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                0-RISK ATOMIC
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {flashLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-[#060d18] border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{log.pair}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">+${fmt(log.netProfitUsd)} USDT</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Borrowed: ${fmt(log.loanUsd)}</span>
                    <span className="text-amber-400">{log.provider}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    Tx: {log.txHash.substring(0, 24)}…
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
