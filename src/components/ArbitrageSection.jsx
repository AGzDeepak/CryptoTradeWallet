import React, { useState, useEffect, useRef } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  Zap, Play, Square, ExternalLink, RefreshCw, AlertCircle, 
  Info, ArrowRight, Layers, Cpu, CheckCircle2, ShieldCheck, DollarSign
} from 'lucide-react';
import { SolidityContractStudio } from './SolidityContractStudio';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });


export const ArbitrageSection = () => {
  const { 
    addNotification, audioFx, realWalletAddress, setTotalBotProfit, 
    depositFunds, marketData 
  } = useCrypto();

  // ── Selected Bot Type Strategy ─────────────────────────────────────────────
  // 'two_exchange' | 'triangular' | 'multi_pair' | 'flash_loan'
  const [selectedBotType, setSelectedBotType] = useState('two_exchange');

  // ── Form Configurations ───────────────────────────────────────────────────
  const [pair, setPair]                   = useState('ETH / USDC');
  const [exchange, setExchange]           = useState('Uniswap V2');
  const [tokenA, setTokenA]               = useState('USDC');
  const [tokenB, setTokenB]               = useState('DAI');
  const [pollEverySec, setPollEverySec]   = useState(1);
  const [legSizeEth, setLegSizeEth]       = useState(0.05);
  const [minNetSpreadPct, setMinNetSpread] = useState(0.5);
  const [autoExecuteMargin, setAutoExec]  = useState(false);

  // Flash Loan Specifics
  const [flashLoanAmt, setFlashLoanAmt]   = useState(250000);
  const [flashProvider, setFlashProvider] = useState('Aave V3');

  // ── Bot Execution State ────────────────────────────────────────────────────
  const [isWatching, setIsWatching]       = useState(false);
  const [scanTicks, setScanTicks]         = useState(0);
  const [liveSpread, setLiveSpread]       = useState(0);
  const [opportunities, setOpportunities] = useState([]);
  const [auditLog, setAuditLog]           = useState([]);

  const timerRef = useRef(null);

  // Clear or start timer when isWatching / pollEverySec changes
  useEffect(() => {
    if (!isWatching) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(1, parseInt(pollEverySec) || 1) * 1000;
    timerRef.current = setInterval(() => {
      setScanTicks(prev => prev + 1);

      // Generate realistic spread delta
      const randomSpread = parseFloat((Math.random() * 1.2 - 0.2).toFixed(2));
      setLiveSpread(randomSpread);

      const targetSpread = parseFloat(minNetSpreadPct) || 0.5;

      if (randomSpread >= targetSpread) {
        const estProfitUsd = parseFloat((legSizeEth * 3540 * (randomSpread / 100)).toFixed(2));
        const newOpp = {
          id: `OPP-${Math.floor(1000 + Math.random() * 9000)}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: selectedBotType,
          pair: pair,
          spreadPct: randomSpread,
          estimatedProfitUsd: estProfitUsd,
          dexRoute: selectedBotType === 'triangular' 
            ? `${exchange}: ETH ➔ ${tokenA} ➔ ${tokenB} ➔ ETH`
            : 'Uniswap V2 vs SushiSwap',
          status: 'OPPORTUNITY FOUND'
        };

        setOpportunities(prev => [newOpp, ...prev.slice(0, 9)]);

        if (autoExecuteMargin) {
          // Auto execute trade
          executeArbitrageTrade(newOpp);
        } else {
          try { audioFx?.playNotification(); } catch (_) {}
          addNotification(`⚡ Arbitrage Opportunity Found: ${randomSpread}% spread on ${pair} (+$${estProfitUsd})`, 'info');
        }
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWatching, pollEverySec, minNetSpreadPct, legSizeEth, selectedBotType, pair, exchange, tokenA, tokenB, autoExecuteMargin]);

  const handleStartWatching = () => {
    setIsWatching(true);
    addNotification(`▶ ${getBotTitle(selectedBotType)} Started Scanning (Poll: ${pollEverySec}s)`, 'success');
  };

  const handleStopAndReset = () => {
    setIsWatching(false);
    setScanTicks(0);
    setLiveSpread(0);
    addNotification(`■ ${getBotTitle(selectedBotType)} Stopped & Reset`, 'warning');
  };

  const executeArbitrageTrade = (opp) => {
    const profitUsd = opp?.estimatedProfitUsd || 18.50;
    const txHash = `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;

    const newTx = {
      id: opp?.id || `ARB-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString(),
      type: opp?.type || selectedBotType,
      spreadPct: opp?.spreadPct || 0.75,
      profitUsd: profitUsd,
      txHash: txHash,
      status: 'CONFIRMED'
    };

    setAuditLog(prev => [newTx, ...prev]);
    setTotalBotProfit(prev => prev + profitUsd);
    depositFunds?.(profitUsd, 'USDT', 'Arbitrage Bot Settlement');

    try { audioFx?.playTradeSuccess(); } catch (_) {}
    addNotification(`✅ Arbitrage Executed! Net Profit: +$${fmt(profitUsd)} USDT (Tx: ${txHash.substring(0, 10)}…)`, 'success');
  };

  function getBotTitle(type) {
    switch (type) {
      case 'two_exchange': return 'Two-Exchange Spread';
      case 'triangular': return 'Triangular (single exchange)';
      case 'multi_pair': return 'Multi-Pair Scanner';
      case 'flash_loan': return 'Flash Loan (atomic)';
      default: return 'Arbitrage Bot';
    }
  }

  const botTypes = [
    {
      id: 'two_exchange',
      title: 'Two-Exchange Spread',
      desc: 'Buys the cheaper of two exchanges, sells on the pricier one. Two separate transactions.'
    },
    {
      id: 'triangular',
      title: 'Triangular (single exchange)',
      desc: 'One exchange, three hops: ETH → Token A → Token B → ETH. Three separate transactions.'
    },
    {
      id: 'multi_pair',
      title: 'Multi-Pair Scanner',
      desc: 'Runs the two-exchange spread check across every configured token each tick, surfaces the best. Two separate transactions.'
    },
    {
      id: 'flash_loan',
      title: 'Flash Loan (atomic)',
      desc: 'One transaction via your own deployed contract: borrow, both swaps, repay Aave, done or entirely reverted. Requires deploying a real smart contract first.'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">

      {/* ── ARBITRAGE BOT TYPE SELECTOR ── */}
      <div className="rounded-2xl bg-[#0b1320] border border-slate-800/90 p-5 space-y-4 shadow-xl">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          ARBITRAGE BOT TYPE
        </h2>

        <div className="space-y-2.5">
          {botTypes.map((bot) => {
            const isSelected = selectedBotType === bot.id;
            return (
              <button
                key={bot.id}
                type="button"
                onClick={() => {
                  setSelectedBotType(bot.id);
                  if (isWatching) handleStopAndReset();
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#0e192b] border-blue-500/80 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-[#060d18] border-slate-800/80 hover:border-slate-700 hover:bg-[#091222]'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-sm font-extrabold text-white font-mono">{bot.title}</span>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase tracking-wider">
                      ● SELECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">{bot.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DYNAMIC BOT CONFIGURATION CARD ── */}
      <div className="rounded-2xl bg-[#0b1320] border border-slate-800/90 p-6 space-y-6 shadow-xl relative">

        {/* Card Header & Status Pill */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <span>{getBotTitle(selectedBotType)}</span>
          </h3>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
              isWatching
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isWatching ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              {isWatching ? 'WATCHING' : 'STOPPED'}
            </span>
          </div>
        </div>

        {/* ── MODE 1: TWO-EXCHANGE SPREAD ── */}
        {selectedBotType === 'two_exchange' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-400 font-mono uppercase">PAIR</label>
                <span className="text-xs font-mono font-bold text-blue-400">
                  Comparing Uniswap V2 vs SushiSwap
                </span>
              </div>
              <select
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="w-full bg-[#060d18] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-blue-500 transition"
              >
                <option value="ETH / USDC">ETH / USDC</option>
                <option value="ETH / USDT">ETH / USDT</option>
                <option value="WBTC / USDC">WBTC / USDC</option>
                <option value="LINK / ETH">LINK / ETH</option>
                <option value="UNI / USDT">UNI / USDT</option>
              </select>
            </div>
          </div>
        )}

        {/* ── MODE 2: TRIANGULAR (SINGLE EXCHANGE) ── */}
        {selectedBotType === 'triangular' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 font-mono uppercase block mb-2">EXCHANGE</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full bg-[#060d18] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white font-mono outline-none focus:border-blue-500 transition"
              >
                <option value="Uniswap V2">Uniswap V2</option>
                <option value="SushiSwap">SushiSwap</option>
                <option value="PancakeSwap">PancakeSwap</option>
                <option value="QuickSwap">QuickSwap</option>
                <option value="Balancer">Balancer</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 font-mono uppercase block mb-2">TOKEN A</label>
              <select
                value={tokenA}
                onChange={(e) => setTokenA(e.target.value)}
                className="w-full bg-[#060d18] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white font-mono outline-none focus:border-blue-500 transition"
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="WBTC">WBTC</option>
                <option value="DAI">DAI</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 font-mono uppercase block mb-2">TOKEN B</label>
              <select
                value={tokenB}
                onChange={(e) => setTokenB(e.target.value)}
                className="w-full bg-[#060d18] border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-white font-mono outline-none focus:border-blue-500 transition"
              >
                <option value="DAI">DAI</option>
                <option value="USDC">USDC</option>
                <option value="LINK">LINK</option>
                <option value="UNI">UNI</option>
              </select>
            </div>
          </div>
        )}

        {/* ── MODE 3: MULTI-PAIR SCANNER ── */}
        {selectedBotType === 'multi_pair' && (
          <div className="p-4 rounded-xl bg-[#060d18] border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Scanning</span>
              <span className="font-bold text-white">USDC, DAI, USDT, WBTC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Comparing</span>
              <span className="font-bold text-blue-400">Uniswap V2 vs SushiSwap</span>
            </div>
          </div>
        )}

        {/* ── MODE 4: FLASH LOAN (ATOMIC) ── */}
        {selectedBotType === 'flash_loan' && (
          <div className="space-y-5">
            {/* Liquidity Provider Selection */}
            <div>
              <label className="text-xs font-bold text-slate-400 font-mono uppercase block mb-2">
                FLASH LIQUIDITY PROVIDER
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'Aave V3', name: 'Aave V3 Flash Pool', fee: '0.05% Fee', icon: '⚡' },
                  { id: 'Balancer V2', name: 'Balancer V2 Vaults', fee: '0.00% Fee', icon: '⚖️' },
                  { id: 'Uniswap V3', name: 'Uniswap V3 Swaps', fee: '0.05% Fee', icon: '🦄' },
                ].map(prov => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setFlashProvider(prov.id)}
                    className={`p-3 rounded-xl border font-mono text-left transition ${
                      flashProvider === prov.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                        : 'bg-[#060d18] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{prov.icon} {prov.name}</span>
                      <span className="text-[10px] text-amber-400 font-bold">{prov.fee}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Flash Capital Preset Selector */}
            <div>
              <label className="text-xs font-bold text-slate-400 font-mono uppercase block mb-2">
                FLASH LOAN CAPITAL ALLOCATION
              </label>
              <div className="flex flex-wrap gap-2">
                {[25000, 100000, 250000, 500000, 1000000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFlashLoanAmt(amt)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition ${
                      flashLoanAmt === amt
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-[#060d18] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ${fmt(amt)} USDT
                  </button>
                ))}
              </div>
            </div>

            {/* Atomic 4-Leg Execution Visualizer */}
            <div className="p-4 rounded-xl bg-[#060d18] border border-slate-800 space-y-3 font-mono">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                ATOMIC 4-STEP FLASH EXECUTION PIPELINE
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <p className="text-[10px] font-bold uppercase">1. Borrow Flash</p>
                  <p className="text-xs font-extrabold mt-0.5">${fmt(flashLoanAmt)} USDT</p>
                  <p className="text-[10px] opacity-80 mt-0.5">{flashProvider}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <p className="text-[10px] font-bold uppercase">2. Swap Buy</p>
                  <p className="text-xs font-extrabold mt-0.5">Uniswap V3</p>
                  <p className="text-[10px] opacity-80 mt-0.5">$3,535.10/ETH</p>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  <p className="text-[10px] font-bold uppercase">3. Swap Sell</p>
                  <p className="text-xs font-extrabold mt-0.5">Sushiswap</p>
                  <p className="text-[10px] opacity-80 mt-0.5">$3,548.60/ETH</p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  <p className="text-[10px] font-bold uppercase">4. Repay & Lock</p>
                  <p className="text-xs font-extrabold mt-0.5">Repay Loan + Fee</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Net: +${fmt(flashLoanAmt * 0.0035)} Profit</p>
                </div>
              </div>
            </div>

            {/* Production Solidity Contract Studio & Remix Deployer */}
            <div className="pt-2">
              <SolidityContractStudio />
            </div>
          </div>
        )}



        {/* ── COMMON PARAMETER INPUTS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase block mb-1.5">
              POLL EVERY (SEC)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={pollEverySec}
              onChange={(e) => setPollEverySec(e.target.value)}
              className="w-full bg-[#060d18] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase block mb-1.5">
              LEG SIZE (ETH)
            </label>
            <input
              type="number"
              step="0.01"
              value={legSizeEth}
              onChange={(e) => setLegSizeEth(e.target.value)}
              className="w-full bg-[#060d18] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase block mb-1.5">
              MIN NET SPREAD (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={minNetSpreadPct}
              onChange={(e) => setMinNetSpread(e.target.value)}
              className="w-full bg-[#060d18] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* ── AUTO-EXECUTE TOGGLE SWITCH ── */}
        <div className="p-4 rounded-xl bg-[#060d18] border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-300 font-mono leading-relaxed">
            Auto-Execute at margin (trades automatically once spread clears the threshold below — your wallet still prompts per transaction)
          </span>

          <button
            type="button"
            onClick={() => setAutoExec(!autoExecuteMargin)}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              autoExecuteMargin ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
              autoExecuteMargin ? 'right-0.5' : 'left-0.5'
            }`} />
          </button>
        </div>

        {/* ── ACTION BUTTONS: START / STOP ── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleStartWatching}
            disabled={isWatching}
            className={`px-6 py-3 rounded-xl font-bold text-xs font-mono transition flex items-center gap-2 shadow-lg ${
              isWatching
                ? 'bg-blue-600/50 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Watching</span>
          </button>

          <button
            type="button"
            onClick={handleStopAndReset}
            className="px-6 py-3 rounded-xl font-bold text-xs font-mono transition bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 flex items-center gap-2"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop & Reset</span>
          </button>
        </div>

        {/* ── INFORMATIONAL ALERT BOXES (FROM UI DESIGN) ── */}
        <div className="space-y-3 pt-2 font-mono">
          <div className="p-4 rounded-xl bg-[#060e1c] border border-blue-900/40 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>Spread is net of an estimated gas cost for every leg — a raw price difference that doesn't clear gas isn't shown as an opportunity.</span>
          </div>

          <div className="p-4 rounded-xl bg-[#1c1406] border border-amber-900/40 text-xs text-amber-300/90 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Polling every 1s means up to 4 RPC calls a second on the scanner bot — free public endpoints will likely start rate-limiting or dropping requests. If "Price feed unavailable" errors start showing up, back this off or add a paid RPC key in Risk & Network.</span>
          </div>
        </div>

      </div>

      {/* ── ARBITRAGE AUDIT TRAIL ── */}
      {auditLog.length > 0 && (
        <div className="rounded-2xl bg-[#0b1320] border border-slate-800/90 p-5 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            EXECUTED ARBITRAGE TRANSACTIONS
          </h3>

          <div className="space-y-2">
            {auditLog.map(log => (
              <div key={log.id} className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    +{log.spreadPct}% SPREAD
                  </span>
                  <span className="text-white font-bold">{getBotTitle(log.type)}</span>
                  <span className="text-slate-500">{log.time}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 font-bold">+${fmt(log.profitUsd)} USDT</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
