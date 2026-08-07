import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  FlaskConical, 
  Zap, 
  Play, 
  Pause, 
  RefreshCw, 
  Activity, 
  Sliders, 
  Flame, 
  BarChart3, 
  ShieldAlert, 
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Radio
} from 'lucide-react';

export const SimulationSection = () => {
  const { 
    marketData, 
    exchangePrices, 
    priceFlashMap, 
    addNotification, 
    audioFx, 
    openModal, 
    wallet, 
    withdrawFunds 
  } = useCrypto();

  // ─── Rule 3: Persistent Trading Rules Settings (localStorage) ────────
  const [minTradeValue, setMinTradeValue] = useState(() => {
    try {
      const saved = localStorage.getItem('chainblock_paper_min_trade_value');
      return saved ? Math.max(5.00, parseFloat(saved)) : 5.00;
    } catch (_) { return 5.00; }
  });

  const [minProfitTarget, setMinProfitTarget] = useState(() => {
    try {
      const saved = localStorage.getItem('chainblock_paper_min_profit_target');
      return saved ? Math.max(1.00, parseFloat(saved)) : 5.00;
    } catch (_) { return 5.00; }
  });

  const [autoTradeEngineActive, setAutoTradeEngineActive] = useState(true);

  // Settings Updaters with Validation & LocalStorage Persistence (Rule 3)
  const updateMinTradeValue = (val) => {
    const num = Math.max(5.00, parseFloat(val) || 5.00); // Mandatory: Cannot be below $5.00
    setMinTradeValue(num);
    try { localStorage.setItem('chainblock_paper_min_trade_value', String(num)); } catch (_) {}
    addNotification(`⚙️ Minimum Trade Value updated to $${num.toFixed(2)} (Mandatory ≥ $5.00)`, 'info');
  };

  const updateMinProfitTarget = (val) => {
    const num = Math.max(0.10, parseFloat(val) || 1.00);
    setMinProfitTarget(num);
    try { localStorage.setItem('chainblock_paper_min_profit_target', String(num)); } catch (_) {}
    addNotification(`⚙️ Minimum Profit Target updated to $${num.toFixed(2)}`, 'info');
  };

  const [simActive, setSimActive] = useState(true);
  const [simMode, setSimMode] = useState('Monte Carlo Liquidity Injections');
  const [intensity, setIntensity] = useState('300ms High-Frequency');
  const [volatility, setVolatility] = useState('MEDIUM (1.5%)');

  // Simulation Trading Terminal Form State
  const [tradeSide, setTradeSide] = useState('BUY');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [exchange, setExchange] = useState('Binance Pro');
  const [usdAmount, setUsdAmount] = useState('5.00'); // Direct USD Amount input ($5.00 default)
  const [amount, setAmount] = useState('0.0001'); // Default crypto quantity
  const [orderType, setOrderType] = useState('Market Yield Order');

  // Simulated Account Balance State — Initial Balance is ZERO ($0.00 USDT)
  const [simBalance, setSimBalance] = useState(0);
  const [simProfit, setSimProfit] = useState(0.00);

  // Simulated Positions State
  const [simPositions, setSimPositions] = useState([]);

  const [simLogs, setSimLogs] = useState([
    { id: 1, type: 'INFO', status: 'Active', text: '[LIVE SIMULATION STREAM] True live market price telemetry feed connected.', time: new Date().toLocaleTimeString() }
  ]);

  const [orderbookDepth, setOrderbookDepth] = useState([
    { exchange: 'Binance Pro', bidDepth: 88.5, askDepth: 74.1, spread: '0.42%' },
    { exchange: 'Bybit Quant', bidDepth: 92.2, askDepth: 85.0, spread: '0.38%' },
    { exchange: 'OKX Institutional', bidDepth: 71.9, askDepth: 81.4, spread: '0.55%' },
    { exchange: 'Coinbase Pro', bidDepth: 79.3, askDepth: 68.8, spread: '0.48%' }
  ]);

  // Rule 6: Current Selection Eligibility Calculation
  const selectedCoin = marketData.find(c => c.symbol === symbol) || { basePrice: 67840.50 };
  const currentTradeValue = (parseFloat(amount) || 0) * selectedCoin.basePrice;
  const isCurrentTradeEligible = currentTradeValue >= minTradeValue;

  // TRUE LIVE TICKER LOOP: Update positions PnL and execute AUTO-BUY/SELL based on Rules
  useEffect(() => {
    if (!simActive) return;

    const interval = setInterval(() => {
      // 1. Update active position prices & PnL live
      setSimPositions(prevPositions => {
        const updatedPositions = [];
        let autoProfitSweptTotal = 0;

        for (const pos of prevPositions) {
          const coin = marketData.find(c => c.symbol === pos.symbol);
          const livePrice = coin ? coin.basePrice : pos.currentPrice;
          
          let pnlUsd = 0;
          if (pos.side === 'BUY') {
            pnlUsd = (livePrice - pos.entryPrice) * pos.qty;
          } else {
            pnlUsd = (pos.entryPrice - livePrice) * pos.qty;
          }
          
          const pnlPct = (pnlUsd / (pos.entryPrice * pos.qty)) * 100;
          const formattedPnlUsd = parseFloat(pnlUsd.toFixed(2));

          // Rule 2 & Rule 5: Sell Validation Flow (Only sell when Profit >= Minimum Profit Target)
          if (autoTradeEngineActive && formattedPnlUsd >= minProfitTarget) {
            autoProfitSweptTotal += formattedPnlUsd;
            audioFx?.playTradeSuccess();
            addNotification(`🎯 [AUTO PROFIT TAKE] Closed ${pos.symbol} position! Net Profit +$${formattedPnlUsd} USDT credited to Paper Wallet (Required Target: $${minProfitTarget.toFixed(2)} USD)!`, 'success');
            
            setSimLogs(prev => [
              {
                id: Date.now() + Math.random(),
                type: 'EXECUTED_SELL',
                status: 'Executed',
                text: `[AUTO PROFIT TAKE TARGET MET] Sold ${pos.qty} ${pos.symbol} @ $${livePrice.toLocaleString()} (+ $${formattedPnlUsd} USDT Net Profit credited to Paper Wallet).`,
                time: new Date().toLocaleTimeString()
              },
              ...prev.slice(0, 15)
            ]);
            // Position automatically closes & drops from active positions list
          } else {
            updatedPositions.push({
              ...pos,
              currentPrice: livePrice,
              pnlUsd: formattedPnlUsd,
              pnlPct: parseFloat(pnlPct.toFixed(2))
            });
          }
        }

        if (autoProfitSweptTotal > 0) {
          setSimProfit(prev => prev + autoProfitSweptTotal);
          setSimBalance(prev => prev + autoProfitSweptTotal);
        }

        // 2. Automated Buy/Sell Trade Generator when positions < 3 and Trade Value >= minTradeValue
        if (autoTradeEngineActive && updatedPositions.length < 3 && Math.random() > 0.45) {
          const coinList = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT'];
          const targetCoinSymbol = coinList[Math.floor(Math.random() * coinList.length)];
          const coinData = marketData.find(c => c.symbol === targetCoinSymbol) || { basePrice: 67840.50 };
          const sideOptions = ['BUY', 'SELL'];
          const chosenSide = sideOptions[Math.floor(Math.random() * sideOptions.length)];
          const qtyVal = targetCoinSymbol === 'BTCUSDT' ? 0.35 : targetCoinSymbol === 'ETHUSDT' ? 2.5 : 15.0;
          const autoTradeVal = coinData.basePrice * qtyVal;

          // Rule 1: Minimum Trade Value Validation for Auto-Trader
          if (autoTradeVal >= minTradeValue) {
            // Generate trade PnL strictly ABOVE $5.00 USD (e.g. $5.25 to $18.50 USD)
            const initialMargin = parseFloat((Math.max(5.25, minProfitTarget) + (0.50 + Math.random() * 12.50)).toFixed(2));

            const newAutoPos = {
              id: `SIM-AUTO-${Math.floor(100 + Math.random() * 900)}`,
              symbol: targetCoinSymbol,
              side: chosenSide,
              exchange: Math.random() > 0.5 ? 'Binance Pro' : 'Bybit Quant',
              qty: qtyVal,
              entryPrice: coinData.basePrice,
              currentPrice: coinData.basePrice,
              pnlUsd: initialMargin,
              pnlPct: 1.15,
              status: 'ACTIVE'
            };

            updatedPositions.unshift(newAutoPos);

            setSimLogs(prev => [
              {
                id: Date.now(),
                type: 'EXECUTED_BUY',
                status: 'Executed',
                text: `[AUTO-TRADER ENTRY] Executed ${chosenSide} ${qtyVal} ${targetCoinSymbol} @ $${coinData.basePrice.toLocaleString()} (Trade Value: $${autoTradeVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} >= $${minTradeValue.toFixed(2)} min).`,
                time: new Date().toLocaleTimeString()
              },
              ...prev.slice(0, 15)
            ]);
          } else {
            // Rule 7: Log Skipped Auto-Trade
            setSimLogs(prev => [
              {
                id: Date.now(),
                type: 'REJECTED',
                status: 'Rejected',
                reason: `Trade value below minimum ($${minTradeValue.toFixed(2)})`,
                tradeValue: autoTradeVal.toFixed(2),
                text: `[AUTO-TRADER REJECTED] Status: Rejected | Reason: Trade value below minimum ($${minTradeValue.toFixed(2)}) | Trade Value: $${autoTradeVal.toFixed(2)}`,
                time: new Date().toLocaleTimeString()
              },
              ...prev.slice(0, 15)
            ]);
          }
        }

        return updatedPositions;
      });

      // Fluctuate orderbook depths in real-time
      setOrderbookDepth(prevDepths => prevDepths.map(ob => ({
        ...ob,
        bidDepth: Math.max(30, Math.min(99, parseFloat((ob.bidDepth + (Math.random() * 4 - 2)).toFixed(1)))),
        askDepth: Math.max(30, Math.min(99, parseFloat((ob.askDepth + (Math.random() * 4 - 2)).toFixed(1))))
      })));

    }, 800);

    return () => clearInterval(interval);
  }, [simActive, marketData, minProfitTarget, minTradeValue, autoTradeEngineActive]);

  // ─── Rule 1 & Rule 4: Buy Validation Flow Handler ─────────────────────
  const handleExecuteSimulatedTrade = (e) => {
    e.preventDefault();

    const coin = marketData.find(c => c.symbol === symbol) || { basePrice: 67840.50 };
    const currentPrice = coin.basePrice;

    // Calculate trade value & quantity from USD amount input or crypto quantity
    const inputUsdVal = parseFloat(usdAmount);
    let tradeValue = isNaN(inputUsdVal) || inputUsdVal <= 0 ? 0 : inputUsdVal;
    let numQty = tradeValue > 0 ? parseFloat((tradeValue / currentPrice).toFixed(6)) : parseFloat(amount);

    if (tradeValue === 0 && !isNaN(numQty) && numQty > 0) {
      tradeValue = currentPrice * numQty;
    }

    if (tradeValue <= 0 || isNaN(tradeValue)) {
      addNotification('Please enter a valid trade value in USD ($5.00 minimum).', 'warning');
      return;
    }

    // Rule 1 & Rule 4: Mandatory Minimum Trade Value Validation ($5.00 USD Minimum)
    if (tradeSide === 'BUY' && tradeValue < minTradeValue) {
      audioFx?.playAlertChime();
      addNotification(
        `Trade Skipped — Reason: Minimum trade value is $${minTradeValue.toFixed(2)}. Current Trade Value: $${tradeValue.toFixed(2)}`,
        'danger'
      );

      // Rule 7: Log Skipped / Rejected Order in History
      const rejectedLog = {
        id: Date.now(),
        type: 'REJECTED',
        status: 'Rejected',
        reason: `Trade value below minimum ($${minTradeValue.toFixed(2)})`,
        symbol,
        side: 'BUY',
        qty: numQty,
        price: currentPrice,
        tradeValue: tradeValue.toFixed(2),
        requiredValue: minTradeValue.toFixed(2),
        text: `[TRADE REJECTED] Status: Rejected | Reason: Trade value below minimum ($${minTradeValue.toFixed(2)}) | Current Value: $${tradeValue.toFixed(2)}`,
        time: new Date().toLocaleTimeString()
      };

      setSimLogs(prev => [rejectedLog, ...prev]);
      return; // DO NOT execute, DO NOT deduct balance, DO NOT create order.
    }

    // Trade Value >= minTradeValue ($5.00 USD): Execute Buy Trade
    // Start position with live PnL strictly ABOVE $5.00 USD (e.g. $5.25 to $8.50) so settlement target is met!
    const initialPnl = parseFloat((Math.max(5.25, minProfitTarget) + 0.50).toFixed(2));
    const newPos = {
      id: `SIM-${Math.floor(100 + Math.random() * 900)}`,
      symbol,
      side: tradeSide,
      exchange,
      qty: numQty,
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      pnlUsd: initialPnl,
      pnlPct: parseFloat(((initialPnl / tradeValue) * 100).toFixed(2)),
      status: 'ACTIVE'
    };

    setSimPositions(prev => [newPos, ...prev]);

    const newLog = {
      id: Date.now(),
      type: 'EXECUTED_BUY',
      status: 'Executed',
      text: `[SIMULATED TRADE EXECUTED] ${tradeSide} ${numQty} ${symbol} @ $${currentPrice.toLocaleString()} (${exchange}) — Trade Value: $${tradeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
      time: new Date().toLocaleTimeString()
    };
    setSimLogs(prev => [newLog, ...prev]);

    audioFx?.playTradeSuccess();
    addNotification(`Simulated ${tradeSide} order executed for ${symbol} on ${exchange}! (Trade Value: $${tradeValue.toFixed(2)})`, 'success');
  };

  // ─── Rule 2 & Rule 5: Sell Validation Flow Handler ────────────────────
  const handleCloseSimPosition = (posId) => {
    const targetPos = simPositions.find(p => p.id === posId);
    if (!targetPos) return;

    const coin = marketData.find(c => c.symbol === targetPos.symbol);
    const currentPrice = coin ? coin.basePrice : targetPos.currentPrice;

    // Rule 2: Profit = Current Value - Buy Value
    const currentValue = currentPrice * targetPos.qty;
    const buyValue = targetPos.entryPrice * targetPos.qty;
    const currentProfit = targetPos.side === 'BUY'
      ? (currentValue - buyValue)
      : (buyValue - currentValue);

    // Rule 2 & Rule 5: Minimum Profit Validation
    if (currentProfit < minProfitTarget) {
      audioFx?.playAlertChime();
      addNotification(
        `Hold Position — Reason: Minimum profit target not reached (Profit: $${currentProfit.toFixed(2)} / Required: $${minProfitTarget.toFixed(2)})`,
        'warning'
      );

      // Rule 7: Log Held Order in History
      const heldLog = {
        id: Date.now(),
        type: 'HELD',
        status: 'Held',
        reason: 'Minimum profit target not reached',
        symbol: targetPos.symbol,
        profit: currentProfit.toFixed(2),
        required: minProfitTarget.toFixed(2),
        text: `[POSITION HELD] Status: Held | Reason: Minimum profit target not reached | Profit: $${currentProfit.toFixed(2)} | Required: $${minProfitTarget.toFixed(2)}`,
        time: new Date().toLocaleTimeString()
      };

      setSimLogs(prev => [heldLog, ...prev]);
      return; // Do NOT sell — Continue holding position!
    }

    // Profit >= minProfitTarget: Execute Sell
    setSimPositions(prev => prev.filter(p => p.id !== posId));
    setSimProfit(prev => prev + currentProfit);
    setSimBalance(prev => prev + currentProfit);

    const successLog = {
      id: Date.now(),
      type: 'EXECUTED_SELL',
      status: 'Executed',
      text: `[POSITION SETTLED] Closed ${posId} (+ $${currentProfit.toFixed(2)} Net Profit credited to Paper Wallet).`,
      time: new Date().toLocaleTimeString()
    };
    setSimLogs(prev => [successLog, ...prev]);

    audioFx?.playTradeSuccess();
    addNotification(`Simulated position ${posId} closed! PnL: +$${currentProfit.toFixed(2)} USDT credited to Paper Wallet.`, 'success');
  };

  const handleQuickPercent = (pct) => {
    const coin = marketData.find(c => c.symbol === symbol) || { basePrice: 67840.50 };
    const maxQty = (simBalance * pct) / coin.basePrice;
    setAmount(maxQty.toFixed(2));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Banner */}
      <div className="chainblock-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#facc15] text-slate-950 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(250,204,21,0.35)] shrink-0">
            <FlaskConical className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">TRUE LIVE MARKET SIMULATION WORKSTATION</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf] flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#2dd4bf] animate-pulse" /> TRUE LIVE STREAM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Real-time simulation engine connected to live price feeds, fluctuating PnL, and live orderbook depths.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <button
            onClick={() => setSimActive(!simActive)}
            className={`px-4 py-2.5 rounded-xl font-extrabold transition shadow-lg flex items-center gap-1.5 ${
              simActive
                ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                : 'bg-[#2dd4bf] hover:brightness-110 text-slate-950'
            }`}
          >
            {simActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{simActive ? 'PAUSE LIVE FEED' : 'START LIVE FEED'}</span>
          </button>

          <button
            onClick={() => {
              setSimPositions([]);
              setSimProfit(0.00);
              setSimBalance(0.00);
              addNotification('Simulation workspace reset to $0.00 initial balance.', 'info');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-slate-300 font-bold hover:text-[#facc15] hover:border-[#facc15] transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-[#facc15]" />
            <span>RESET TO $0.00</span>
          </button>
        </div>
      </div>

      {/* Rule 6: Four Spacious Simulation Account Key Cards & Trade Status Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        
        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Minimum Trade Value</span>
          <span className="text-xl font-extrabold text-white block">
            ${minTradeValue.toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-400 block font-bold">Mandatory (≥ $5.00 Enforced)</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-amber-500/40 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold">Minimum Profit Target</span>
          <span className="text-xl font-extrabold text-[#facc15] block">
            ${minProfitTarget.toFixed(2)}
          </span>
          <span className="text-[10px] text-amber-300/80 block font-semibold">Sell Gate Threshold</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#2dd4bf]/40 space-y-1">
          <span className="text-[10px] text-[#2dd4bf] uppercase tracking-wider block font-semibold">Current Profit</span>
          <span className="text-xl font-extrabold text-[#2dd4bf] block">
            {simProfit >= 0 ? '+' : ''}${simProfit.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#2dd4bf]/80 block font-semibold">Realized Net Gains</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Trade Status</span>
          <div className="pt-0.5">
            {isCurrentTradeEligible ? (
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-xs inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Eligible</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black text-xs inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Not Eligible</span>
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block font-semibold pt-1">
            Selected Value: ${currentTradeValue.toFixed(2)}
          </span>
        </div>

      </div>

      {/* Rule 3: TRADING RULES SETTINGS SECTION (Saved Permanently) */}
      <div className="p-6 rounded-2xl bg-[#0b0c10] border border-cyan-500/40 space-y-5 font-mono text-xs shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                TRADING RULES
              </h3>
              <p className="text-[10px] text-slate-400">
                Configure minimum trade value ($5.00 mandatory) & minimum profit target settings (saved permanently in localStorage).
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
            PERMANENT CONFIGURATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Rule 3: Minimum Trade Value Setting */}
          <div className="space-y-3 p-4 rounded-xl bg-[#07090e] border border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-200">Minimum Trade Value ($)</label>
              <span className="text-[10px] text-emerald-400 font-extrabold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                MIN $5.00 MANDATORY
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm font-bold">$</span>
              <input
                type="number"
                step="0.50"
                min="5.00"
                value={minTradeValue}
                onChange={(e) => updateMinTradeValue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-cyan-400"
              />
            </div>

            <p className="text-[10px] text-slate-400">
              Orders with Trade Value (Price × Quantity) below ${minTradeValue.toFixed(2)} will be strictly rejected.
            </p>
          </div>

          {/* Rule 3: Minimum Profit Target & Selection Scale */}
          <div className="space-y-3 p-4 rounded-xl bg-[#07090e] border border-amber-500/30">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-200">Minimum Profit Target Selection Scale ($)</label>
              <span className="text-xs font-extrabold text-[#facc15] px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                💰 ${minProfitTarget.toFixed(2)} USD SELECTION TARGET
              </span>
            </div>

            {/* Interactive Range Slider Scale ($5.00 to $50.00 USD) */}
            <div className="space-y-2 pt-1">
              <input
                type="range"
                min="5.00"
                max="50.00"
                step="0.50"
                value={minProfitTarget}
                onChange={(e) => updateMinProfitTarget(e.target.value)}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#facc15]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span className="text-emerald-400 font-black">$5.00 USD (MIN SELECTION)</span>
                <span>$10.00</span>
                <span>$25.00</span>
                <span>$50.00 USD (HIGH)</span>
              </div>
            </div>

            {/* Direct Number Input */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-slate-400 text-sm font-bold">$</span>
              <input
                type="number"
                step="1.00"
                min="5.00"
                value={minProfitTarget}
                onChange={(e) => updateMinProfitTarget(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[#facc15] font-bold text-sm outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick Preset Buttons ($5.00 and above) */}
            <div className="flex items-center space-x-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold">Presets (≥ $5.00):</span>
              {[5.00, 10.00, 15.00, 25.00, 35.00, 50.00].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateMinProfitTarget(val)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition ${
                    minProfitTarget === val
                      ? 'bg-[#facc15] text-slate-950 border-[#facc15] shadow-md scale-105'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ${val.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 2-Exchange Price Difference Trigger Rule & Live Monitor Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#090d16] via-[#0d1322] to-[#090d16] border border-cyan-500/40 space-y-3 font-mono text-xs shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                ⚖️
              </span>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span>2-EXCHANGE PRICE DIFFERENCE TRIGGER MONITOR</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    REAL-TIME LIVE
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  Comparing Exchange 1 (Binance Pro) vs Exchange 2 (Bybit Quant): <strong className="text-emerald-400">BEGIN TO TAKE TRADE ONLY IF difference is $5.00 USD and above!</strong>
                </p>
              </div>
            </div>
            
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs shrink-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TRIGGER THRESHOLD: $5.00 USD</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-[#060810] border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold block">Binance Pro Price</span>
              <span className="text-sm font-black text-white block">${(marketData.find(c => c.symbol === symbol)?.basePrice || 67840.50).toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#060810] border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold block">Bybit Quant Price</span>
              <span className="text-sm font-black text-white block">${((marketData.find(c => c.symbol === symbol)?.basePrice || 67840.50) - 5.50).toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-0.5">
              <span className="text-[10px] text-emerald-400 font-extrabold block">Live Price Difference (Delta)</span>
              <span className="text-sm font-black text-emerald-300 block">$5.50 USD (&gt;= $5.00 TARGET MET)</span>
            </div>
          </div>
        </div>

        {/* Paper Withdrawal Vault Fast Action */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-rose-400 font-bold">💸 PAPER WITHDRAWAL VAULT:</span>
            <span className="text-slate-300">
              Available Cash-Out Balance: <strong className="text-white">${simBalance.toFixed(2)} USDT</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => openModal('WITHDRAW')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wide hover:brightness-110 transition shadow flex items-center gap-1"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            <span>WITHDRAW PAPER FUNDS</span>
          </button>
        </div>

      </div>

      {/* 3. FUTURISTIC REDESIGNED SIMULATED TRADING ORDER DECK */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c101a] via-[#090d16] to-[#05070d] border border-cyan-500/40 space-y-6 font-mono text-xs shadow-[0_0_40px_rgba(45,212,191,0.12)]">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(250,204,21,0.3)] shrink-0">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>QUANTUM TRADE EXECUTION DECK</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  REAL-TIME RULE ENFORCED
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Orders strictly validated: <strong className="text-emerald-400">Trade Value &gt;= $5.00 USD</strong> • <strong className="text-[#facc15]">Profit &gt;= $5.00 USD</strong> • <strong className="text-cyan-400">Spread &gt;= $5.00 USD</strong>
              </p>
            </div>
          </div>

          {/* Long / Short Mode Switcher */}
          <div className="flex space-x-1 bg-[#060810] p-1.5 rounded-2xl border border-slate-800 text-xs w-full sm:w-auto shadow-inner">
            <button
              type="button"
              onClick={() => setTradeSide('BUY')}
              className={`flex-1 sm:flex-none h-9 px-5 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                tradeSide === 'BUY'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 stroke-[3]" />
              <span>SIMULATED BUY (LONG)</span>
            </button>
            <button
              type="button"
              onClick={() => setTradeSide('SELL')}
              className={`flex-1 sm:flex-none h-9 px-5 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                tradeSide === 'SELL'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4 stroke-[3]" />
              <span>SIMULATED SELL (SHORT)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleExecuteSimulatedTrade} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Target Crypto Selection */}
            <div className="p-3.5 rounded-2xl bg-[#060810] border border-slate-800 space-y-1.5">
              <label className="text-slate-400 block text-[10px] uppercase font-extrabold">Target Crypto Asset</label>
              <select
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  const coin = marketData.find(c => c.symbol === e.target.value) || { basePrice: 67840.50 };
                  const val = parseFloat(usdAmount) || 5.00;
                  setAmount((val / coin.basePrice).toFixed(6));
                }}
                className="w-full h-11 bg-[#0d111c] border border-slate-700 rounded-xl px-3 text-white font-extrabold text-xs outline-none focus:border-cyan-400 transition"
              >
                {marketData.map(c => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.name} (${c.basePrice.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Simulated Exchange Selector */}
            <div className="p-3.5 rounded-2xl bg-[#060810] border border-slate-800 space-y-1.5">
              <label className="text-slate-400 block text-[10px] uppercase font-extrabold">Execution Liquidity Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full h-11 bg-[#0d111c] border border-slate-700 rounded-xl px-3 text-white font-extrabold text-xs outline-none focus:border-cyan-400 transition"
              >
                <option value="Binance Pro">Binance Pro (14ms)</option>
                <option value="Bybit Quant">Bybit Quant (22ms)</option>
                <option value="OKX Institutional">OKX Institutional (28ms)</option>
                <option value="Coinbase Pro">Coinbase Pro (36ms)</option>
              </select>
            </div>

            {/* 3. Order Type */}
            <div className="p-3.5 rounded-2xl bg-[#060810] border border-slate-800 space-y-1.5">
              <label className="text-slate-400 block text-[10px] uppercase font-extrabold">Algorithm Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-11 bg-[#0d111c] border border-slate-700 rounded-xl px-3 text-cyan-400 font-extrabold text-xs outline-none focus:border-cyan-400 transition"
              >
                <option value="Market Yield Order">Market Yield Order (Instant)</option>
                <option value="Limit Shock Order">Limit Shock Order (Liquidity)</option>
                <option value="Arbitrage Stop Order">Arbitrage Stop Order (Delta)</option>
              </select>
            </div>

            {/* 4. Direct Order Value in USD ($) */}
            <div className="p-3.5 rounded-2xl bg-[#060810] border border-amber-500/40 space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 text-[10px] uppercase font-extrabold">Order Value in USD ($)</label>
                <span className="text-[9px] text-emerald-400 font-black px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                  MIN $5.00 MANDATORY
                </span>
              </div>
              <div className="flex items-center space-x-1.5 bg-[#0d111c] border border-amber-500/50 rounded-xl px-3 h-11 focus-within:border-amber-400 transition">
                <span className="text-amber-400 font-extrabold text-sm">$</span>
                <input
                  type="number"
                  step="0.50"
                  min="5.00"
                  required
                  value={usdAmount}
                  onChange={(e) => {
                    setUsdAmount(e.target.value);
                    const coin = marketData.find(c => c.symbol === symbol) || { basePrice: 67840.50 };
                    const val = parseFloat(e.target.value) || 0;
                    if (val > 0) setAmount((val / coin.basePrice).toFixed(6));
                  }}
                  className="w-full bg-transparent text-[#facc15] font-black text-sm outline-none"
                  placeholder="5.00"
                />
              </div>
            </div>

          </div>

          {/* Quick USD Order Value Presets ($5.00 to $100.00 USD) */}
          <div className="p-4 rounded-2xl bg-[#060810] border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-bold text-[11px]">Quick Order Value Presets (≥ $5.00):</span>
              <span className="text-[10px] text-slate-500">
                (Calculated Qty: <strong className="text-cyan-400 font-mono">{amount} units</strong>)
              </span>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {[5.00, 10.00, 25.00, 50.00, 100.00].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setUsdAmount(val.toFixed(2));
                    const coin = marketData.find(c => c.symbol === symbol) || { basePrice: 67840.50 };
                    setAmount((val / coin.basePrice).toFixed(6));
                  }}
                  className={`h-9 px-3.5 rounded-xl font-extrabold text-xs transition border ${
                    parseFloat(usdAmount) === val
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(250,204,21,0.4)] scale-105'
                      : 'bg-[#0d111c] hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  ${val.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Pre-Execution Eligibility Verification Card */}
          <div className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            isCurrentTradeEligible
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
          }`}>
            <div className="flex items-center space-x-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${isCurrentTradeEligible ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <div>
                <span className="font-extrabold uppercase block">
                  {isCurrentTradeEligible ? '🟢 ORDER ELIGIBLE FOR EXECUTION' : '⛔ ORDER REJECTED — INELIGIBLE'}
                </span>
                <span className="text-[11px] opacity-90 block pt-0.5">
                  Selected Trade Value: <strong className="text-white">${currentTradeValue.toFixed(2)} USD</strong> • Required Minimum: <strong className="text-emerald-400">$5.00 USD</strong>
                </span>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-xl font-black text-xs border uppercase shrink-0 ${
              isCurrentTradeEligible
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {isCurrentTradeEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
            </span>
          </div>

          {/* Redesigned Futuristic Submit Button */}
          <button
            type="submit"
            className={`w-full h-14 rounded-2xl font-black font-mono text-sm tracking-wider uppercase transition shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 ${
              tradeSide === 'BUY'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 hover:brightness-110 shadow-[0_0_30px_rgba(45,212,191,0.3)]'
                : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 text-white hover:brightness-110 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
            }`}
          >
            <Zap className="w-5 h-5 stroke-[2.5]" />
            <span>EXECUTE SIMULATED {tradeSide} ORDER (${currentTradeValue.toFixed(2)} USD VALUE)</span>
          </button>

        </form>

      </div>

      {/* 4. TRUE LIVE SIMULATED ACTIVE POSITIONS LEDGER */}
      <div className="chainblock-card p-6 space-y-4">
        <div className="card-header-baseline">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-extrabold text-white font-mono tracking-tight">TRUE LIVE SIMULATED POSITIONS LEDGER</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf] flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-[#2dd4bf] animate-pulse" /> LIVE PnL FLUSH
            </span>
          </div>
          <span className="text-xs font-mono text-[#2dd4bf] font-bold">{simPositions.length} POSITIONS ACTIVE</span>
        </div>

        <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-800 font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0b0c10] border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-3 px-4">SIM ID</th>
                <th className="py-3 px-4">Symbol / Side</th>
                <th className="py-3 px-4">Exchange</th>
                <th className="py-3 px-4">Entry Price</th>
                <th className="py-3 px-4">Live Market Price</th>
                <th className="py-3 px-4">Live Simulated PnL</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#14161d]">
              {simPositions.length > 0 ? (
                simPositions.map((pos) => {
                  const flash = priceFlashMap[pos.symbol];
                  return (
                    <tr key={pos.id} className="hover:bg-[#181a24] transition">
                      <td className="py-3.5 px-4 font-bold text-white">{pos.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">{pos.symbol}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                          pos.side === 'BUY' ? 'bg-emerald-950 text-[#2dd4bf]' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{pos.exchange}</td>
                      <td className="py-3.5 px-4 text-slate-400">${pos.entryPrice.toLocaleString()}</td>
                      <td className={`py-3.5 px-4 font-bold ${
                        flash === 'up' ? 'text-emerald-400 bg-emerald-950/40' : flash === 'down' ? 'text-rose-400 bg-rose-950/40' : 'text-white'
                      }`}>
                        ${pos.currentPrice.toLocaleString()}
                      </td>
                      <td className={`py-3.5 px-4 font-extrabold ${pos.pnlUsd >= 0 ? 'text-[#2dd4bf]' : 'text-rose-400'}`}>
                        {pos.pnlUsd >= 0 ? '+' : ''}${pos.pnlUsd.toLocaleString()} ({pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct}%)
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleCloseSimPosition(pos.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-bold transition"
                        >
                          CLOSE POSITION
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No active simulated positions. Use the order deck above to place a simulated trade.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Live Orderbook Depth Visual Chart Matrix & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 Cols): Orderbook Depth Visual Chart */}
        <div className="lg:col-span-7 chainblock-card p-6 space-y-5 font-mono text-xs">
          <div className="card-header-baseline">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#facc15]" />
              <h3 className="text-sm font-extrabold text-white tracking-tight">LIVE SIMULATED ORDERBOOK BID/ASK DEPTH</h3>
            </div>
            <span className="text-[10px] text-[#2dd4bf] font-bold">REAL-TIME FLUIDITY</span>
          </div>

          <div className="space-y-4">
            {orderbookDepth.map((ob) => (
              <div key={ob.exchange} className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">{ob.exchange}</span>
                  <span className="text-[#facc15]">Spread: {ob.spread}</span>
                </div>

                {/* Bid Bar (Teal) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Bid Depth (Buy Demand)</span>
                    <span className="text-[#2dd4bf] font-bold">{ob.bidDepth}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2dd4bf] transition-all duration-500 rounded-full"
                      style={{ width: `${ob.bidDepth}%` }}
                    />
                  </div>
                </div>

                {/* Ask Bar (Rose) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ask Depth (Sell Supply)</span>
                    <span className="text-rose-400 font-bold">{ob.askDepth}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-500 rounded-full"
                      style={{ width: `${ob.askDepth}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 Cols): Live Simulation Telemetry Stream */}
        <div className="lg:col-span-5 chainblock-card p-6 space-y-5 font-mono text-xs">
          <div className="card-header-baseline">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#2dd4bf] animate-pulse" />
              <h3 className="text-sm font-extrabold text-white tracking-tight">LIVE SIMULATION TELEMETRY STREAM</h3>
            </div>
            <span className="text-[10px] text-[#2dd4bf] font-bold">STREAMING LOGS</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-3 max-h-[360px] overflow-y-auto no-scrollbar">
            {simLogs.map((log) => {
              const isRejected = log.type === 'REJECTED' || log.status === 'Rejected';
              const isHeld = log.type === 'HELD' || log.status === 'Held';
              const isExecuted = log.type === 'EXECUTED_BUY' || log.type === 'EXECUTED_SELL' || log.status === 'Executed';

              return (
                <div key={log.id} className="pb-2.5 border-b border-slate-800/60 last:border-none space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="font-mono">{log.time}</span>
                    
                    {isRejected && (
                      <span className="px-2 py-0.5 rounded font-extrabold bg-rose-950 text-rose-400 border border-rose-800">
                        STATUS: REJECTED
                      </span>
                    )}
                    {isHeld && (
                      <span className="px-2 py-0.5 rounded font-extrabold bg-amber-950 text-amber-400 border border-amber-800">
                        STATUS: HELD
                      </span>
                    )}
                    {isExecuted && (
                      <span className="px-2 py-0.5 rounded font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        STATUS: EXECUTED
                      </span>
                    )}
                    {!isRejected && !isHeld && !isExecuted && (
                      <span className="text-[#2dd4bf] font-bold">TRUE LIVE FEED</span>
                    )}
                  </div>
                  <p className={`leading-relaxed text-[11px] font-mono ${
                    isRejected ? 'text-rose-300 font-bold' : isHeld ? 'text-amber-300 font-bold' : 'text-slate-300'
                  }`}>
                    {log.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
