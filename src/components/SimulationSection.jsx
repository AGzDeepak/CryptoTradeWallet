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

  const [simActive, setSimActive] = useState(true);
  const [simMode, setSimMode] = useState('Monte Carlo Liquidity Injections');
  const [intensity, setIntensity] = useState('300ms High-Frequency');
  const [volatility, setVolatility] = useState('MEDIUM (1.5%)');

  // Simulation Trading Terminal Form State
  const [tradeSide, setTradeSide] = useState('BUY');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [exchange, setExchange] = useState('Binance Pro');
  const [amount, setAmount] = useState('0.5');
  const [orderType, setOrderType] = useState('Market Yield Order');

  // Simulated Account Balance State
  const [simBalance, setSimBalance] = useState(100000);
  const [simProfit, setSimProfit] = useState(4820.50);

  // Simulated Positions State
  const [simPositions, setSimPositions] = useState([
    { id: 'SIM-101', symbol: 'BTCUSDT', side: 'BUY', exchange: 'Binance Pro', qty: 0.50, entryPrice: 67420.00, currentPrice: 67840.50, pnlUsd: 210.25, pnlPct: 0.62, status: 'ACTIVE' },
    { id: 'SIM-102', symbol: 'ETHUSDT', side: 'SELL', exchange: 'Bybit Quant', qty: 4.00, entryPrice: 3580.00, currentPrice: 3540.20, pnlUsd: 159.20, pnlPct: 1.11, status: 'ACTIVE' }
  ]);

  const [simLogs, setSimLogs] = useState([
    { id: 1, text: '[LIVE SIMULATION STREAM] True live market price telemetry feed connected.', time: new Date().toLocaleTimeString() }
  ]);

  const [orderbookDepth, setOrderbookDepth] = useState([
    { exchange: 'Binance Pro', bidDepth: 88.5, askDepth: 74.1, spread: '0.42%' },
    { exchange: 'Bybit Quant', bidDepth: 92.2, askDepth: 85.0, spread: '0.38%' },
    { exchange: 'OKX Institutional', bidDepth: 71.9, askDepth: 81.4, spread: '0.55%' },
    { exchange: 'Coinbase Pro', bidDepth: 79.3, askDepth: 68.8, spread: '0.48%' }
  ]);

  // TRUE LIVE TICKER LOOP: Update positions PnL and orderbook depths live with market ticks
  useEffect(() => {
    if (!simActive) return;

    const interval = setInterval(() => {
      // 1. Update active position prices & PnL live
      setSimPositions(prevPositions => prevPositions.map(pos => {
        const coin = marketData.find(c => c.symbol === pos.symbol);
        const livePrice = coin ? coin.basePrice : pos.currentPrice;
        
        let pnlUsd = 0;
        if (pos.side === 'BUY') {
          pnlUsd = (livePrice - pos.entryPrice) * pos.qty;
        } else {
          pnlUsd = (pos.entryPrice - livePrice) * pos.qty;
        }
        
        const pnlPct = (pnlUsd / (pos.entryPrice * pos.qty)) * 100;

        return {
          ...pos,
          currentPrice: livePrice,
          pnlUsd: parseFloat(pnlUsd.toFixed(2)),
          pnlPct: parseFloat(pnlPct.toFixed(2))
        };
      }));

      // 2. Fluctuate orderbook depths in real-time
      setOrderbookDepth(prevDepths => prevDepths.map(ob => ({
        ...ob,
        bidDepth: Math.max(30, Math.min(99, parseFloat((ob.bidDepth + (Math.random() * 4 - 2)).toFixed(1)))),
        askDepth: Math.max(30, Math.min(99, parseFloat((ob.askDepth + (Math.random() * 4 - 2)).toFixed(1))))
      })));

      // 3. Streaming telemetry log entry
      if (Math.random() > 0.6) {
        const coin = marketData[Math.floor(Math.random() * marketData.length)];
        if (coin) {
          const logText = `[LIVE TICKER PULSE] ${coin.symbol} Live Price: $${coin.basePrice.toLocaleString()} (${coin.change24 >= 0 ? '+' : ''}${coin.change24}% 24h)`;
          setSimLogs(prev => [{ id: Date.now(), text: logText, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 15)]);
        }
      }

    }, 800);

    return () => clearInterval(interval);
  }, [simActive, marketData]);

  // Execute Simulated Order Handler
  const handleExecuteSimulatedTrade = (e) => {
    e.preventDefault();

    const numQty = parseFloat(amount);
    if (isNaN(numQty) || numQty <= 0) {
      addNotification('Please enter a valid simulation quantity.', 'warning');
      return;
    }

    const coin = marketData.find(c => c.symbol === symbol) || { basePrice: 67840.50 };
    const currentP = coin.basePrice;
    
    const newPos = {
      id: `SIM-${Math.floor(100 + Math.random() * 900)}`,
      symbol,
      side: tradeSide,
      exchange,
      qty: numQty,
      entryPrice: currentP,
      currentPrice: currentP,
      pnlUsd: 0.00,
      pnlPct: 0.00,
      status: 'ACTIVE'
    };

    setSimPositions(prev => [newPos, ...prev]);

    const newLog = {
      id: Date.now(),
      text: `[SIMULATED TRADE EXECUTED] ${tradeSide} ${numQty} ${symbol} @ $${currentP.toLocaleString()} (${exchange}).`,
      time: new Date().toLocaleTimeString()
    };
    setSimLogs(prev => [newLog, ...prev]);

    audioFx?.playTradeSuccess();
    addNotification(`Simulated ${tradeSide} order executed for ${symbol} on ${exchange}!`, 'success');
  };

  const handleCloseSimPosition = (posId) => {
    const targetPos = simPositions.find(p => p.id === posId);
    const realizedGain = targetPos ? targetPos.pnlUsd : 125.50;

    setSimPositions(prev => prev.filter(p => p.id !== posId));
    setSimProfit(prev => prev + realizedGain);

    const newLog = {
      id: Date.now(),
      text: `[SIMULATED POSITION SETTLED] Closed ${posId} (+ $${realizedGain.toFixed(2)} PnL credited).`,
      time: new Date().toLocaleTimeString()
    };
    setSimLogs(prev => [newLog, ...prev]);

    audioFx?.playTradeSuccess();
    addNotification(`Simulated position ${posId} closed! PnL: +$${realizedGain.toFixed(2)}`, 'success');
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
              setSimProfit(4820.50);
              addNotification('Simulation workspace reset.', 'info');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-slate-300 font-bold hover:text-[#facc15] hover:border-[#facc15] transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-[#facc15]" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* 2. Four Spacious Simulation Account Key Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        
        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Simulated Cash Balance</span>
          <span className="text-xl font-extrabold text-white block">
            ${simBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block font-semibold">USDT Virtual Cash</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#2dd4bf]/30 space-y-1">
          <span className="text-[10px] text-[#2dd4bf] uppercase tracking-wider block font-semibold">Simulated Net Profit</span>
          <span className="text-xl font-extrabold text-[#2dd4bf] block">
            +${simProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2dd4bf]/80 block font-semibold">+4.82% Return</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#facc15]/30 space-y-1">
          <span className="text-[10px] text-[#facc15] uppercase tracking-wider block font-semibold">Simulated Win Rate</span>
          <span className="text-xl font-extrabold text-[#facc15] block">
            98.6%
          </span>
          <span className="text-[10px] text-amber-400/80 block font-semibold">Live Feed Connected</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0c10] border border-rose-500/40 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider font-extrabold">PAPER WITHDRAWAL VAULT</span>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white block">
              ${(wallet?.virtualBalance ?? simBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold">Available Cash-Out Funds</span>
          </div>
          <button
            type="button"
            onClick={() => openModal('WITHDRAW')}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wide hover:brightness-110 transition shadow flex items-center justify-center space-x-1.5"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            <span>💸 WITHDRAW PAPER FUNDS</span>
          </button>
        </div>

      </div>

      {/* 3. SIMULATED TRADING TERMINAL FORM */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0c10] border border-slate-800 space-y-5 font-mono text-xs">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-extrabold text-white uppercase font-mono tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#facc15]" /> SIMULATED TRADING ORDER DECK
          </h3>

          <div className="flex space-x-1 bg-[#14161d] p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTradeSide('BUY')}
              className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-extrabold transition ${
                tradeSide === 'BUY' ? 'bg-[#2dd4bf] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SIMULATED BUY (LONG)
            </button>
            <button
              type="button"
              onClick={() => setTradeSide('SELL')}
              className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-extrabold transition ${
                tradeSide === 'SELL' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SIMULATED SELL (SHORT)
            </button>
          </div>
        </div>

        <form onSubmit={handleExecuteSimulatedTrade} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Target Crypto Pair</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                {marketData.map(c => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.name} (${c.basePrice.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Simulated Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              >
                <option value="Binance Pro">Binance Pro</option>
                <option value="Bybit Quant">Bybit Quant</option>
                <option value="OKX Institutional">OKX Institutional</option>
                <option value="Coinbase Pro">Coinbase Pro</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-[#2dd4bf] font-bold outline-none focus:border-[#facc15]"
              >
                <option value="Market Yield Order">Market Yield Order</option>
                <option value="Limit Shock Order">Limit Shock Order</option>
                <option value="Arbitrage Stop Order">Arbitrage Stop Order</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-bold">Execution Quantity</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 bg-[#14161d] border border-slate-800 rounded-xl px-3 text-white font-bold outline-none focus:border-[#facc15]"
              />
            </div>

          </div>

          {/* Quick Percentage Size Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#14161d] border border-slate-800">
            <span className="text-slate-400 font-bold text-[11px]">Quick Position Size:</span>
            <div className="grid grid-cols-4 gap-2 w-full sm:w-auto">
              {[
                { label: '25%', pct: 0.25 },
                { label: '50%', pct: 0.50 },
                { label: '75%', pct: 0.75 },
                { label: '100% (MAX)', pct: 1.0 }
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => handleQuickPercent(btn.pct)}
                  className="h-8 px-3 rounded-lg bg-[#0b0c10] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] transition text-center"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Execute Submit Button */}
          <button
            type="submit"
            className={`w-full h-12 rounded-xl font-extrabold font-sans text-xs sm:text-sm tracking-wider uppercase transition shadow-lg ${
              tradeSide === 'BUY'
                ? 'bg-[#2dd4bf] text-slate-950 hover:brightness-110'
                : 'bg-rose-500 text-white hover:brightness-110'
            }`}
          >
            EXECUTE SIMULATED {tradeSide} ORDER FOR {symbol}
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
            {simLogs.map((log) => (
              <div key={log.id} className="pb-2 border-b border-slate-800/60 last:border-none space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>{log.time}</span>
                  <span className="text-[#2dd4bf] font-bold">TRUE LIVE FEED</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] font-mono">{log.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
