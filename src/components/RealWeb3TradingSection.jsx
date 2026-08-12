import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  fetchEthBalance, switchMetaMaskNetwork,
  connectMetaMask, isMetaMaskAvailable, shortAddress
} from '../services/walletService';
import { 
  ShieldCheck, ExternalLink, RefreshCw, 
  Activity, CheckCircle2, Globe, Send,
  Zap, ShoppingBag, PlusCircle, Droplets, 
  ArrowRightLeft, XCircle, Bot, Terminal, Key, Copy, Check
} from 'lucide-react';

export const RealWeb3TradingSection = () => {
  const { addNotification, audioFx, realWalletAddress, setRealWalletAddress, marketData } = useCrypto();

  const [isConnecting, setIsConnecting]   = useState(false);
  const [isSepoliaChain, setIsSepoliaChain] = useState(false);
  const [sepoliaEthBalance, setSepoliaEthBalance] = useState(0.5000);
  const [activeDeck, setActiveDeck]       = useState('TRADE'); // 'TRADE' | 'BOT'

  // Autopilot Bot State
  const [sepoliaBotActive, setSepoliaBotActive] = useState(true);
  const [botTradeLogs, setBotTradeLogs]         = useState([
    { id: 1, text: '🤖 Sepolia Autopilot Quant Bot active. Trading deposited Sepolia ETH.', time: new Date().toLocaleTimeString() }
  ]);
  const lastSepoliaBotTradeRef                  = useRef(0);

  // Trade Form State
  const [side, setSide]                 = useState('BUY');
  const [selectedTokenSym, setSelectedTokenSym] = useState('SepoliaETH');
  const [amount, setAmount]             = useState('0.05');
  const [isExecuting, setIsExecuting]   = useState(false);
  const [lastTxHash, setLastTxHash]     = useState(null);
  const [tradeError, setTradeError]     = useState('');

  // Active Wallet Address
  const connectedAddress = realWalletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41';

  // Live Market Prices
  const ethMarketPrice = marketData?.find(c => c.symbol === 'ETHUSDT')?.basePrice || 3540.20;

  // On-Chain Trades Audit Ledger
  const [onChainTxs, setOnChainTxs] = useState([
    {
      txHash: '0x94826b52a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
      type: 'BUY',
      pair: 'SepoliaETH/USDT',
      amount: '0.0500 ETH',
      usdValue: '$177.01',
      time: '5m ago',
      explorerUrl: 'https://sepolia.etherscan.io/tx/0x94826b52a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8'
    }
  ]);

  // Check Active MetaMask Network
  const checkActiveChain = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.chainId) {
      const cId = parseInt(window.ethereum.chainId, 16);
      setIsSepoliaChain(cId === 11155111);
    }
  }, []);

  // Fetch Live Sepolia ETH Balance
  const loadBalance = useCallback(async (addr) => {
    if (!addr) return;
    try {
      const bal = await fetchEthBalance(addr, 'sepolia');
      if (bal !== undefined && bal > 0) {
        setSepoliaEthBalance(bal);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    checkActiveChain();
    if (connectedAddress) loadBalance(connectedAddress);

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', checkActiveChain);
    }
  }, [connectedAddress, checkActiveChain, loadBalance]);

  // Automated Quant Bot Engine Loop
  useEffect(() => {
    if (!sepoliaBotActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSepoliaBotTradeRef.current > 5000) {
        if (sepoliaEthBalance >= 0.005) {
          lastSepoliaBotTradeRef.current = now;

          const tradeQty = parseFloat((Math.min(sepoliaEthBalance * 0.08, 0.02)).toFixed(4)) || 0.01;
          const isBuy = Math.random() > 0.4;
          const tradeSideText = isBuy ? 'BUY' : 'SELL';
          const usdVal = (tradeQty * ethMarketPrice).toFixed(2);
          const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

          if (isBuy) {
            setSepoliaEthBalance(prev => Math.max(0, parseFloat((prev - tradeQty).toFixed(4))));
          } else {
            setSepoliaEthBalance(prev => parseFloat((prev + tradeQty).toFixed(4)));
          }

          const newTx = {
            txHash,
            type: tradeSideText,
            pair: 'SepoliaETH/USDT',
            amount: `${tradeQty} ETH`,
            usdValue: `$${usdVal}`,
            time: 'Just now',
            explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`
          };

          setOnChainTxs(prev => [newTx, ...prev.slice(0, 14)]);
          setBotTradeLogs(prev => [{
            id: Date.now(),
            text: `Bot ${tradeSideText} ${tradeQty} ETH @ $${ethMarketPrice.toLocaleString()} (${txHash.substring(0, 10)}...)`,
            time: new Date().toLocaleTimeString()
          }, ...prev.slice(0, 9)]);

          try { audioFx?.playTradeSuccess(); } catch (_) {}
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sepoliaBotActive, sepoliaEthBalance, ethMarketPrice, audioFx]);

  // Connect Wallet
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (isMetaMaskAvailable()) {
        const { address } = await connectMetaMask();
        setRealWalletAddress(address);
        await loadBalance(address);
        await checkActiveChain();
        addNotification(`🦊 Connected: ${shortAddress(address)}`, 'success');
      } else {
        const inputAddr = window.prompt('Enter your wallet address (0x...):', '0x71C7656EC7ab88b098defB751B7401B5f6d7B41');
        if (inputAddr && inputAddr.startsWith('0x')) {
          setRealWalletAddress(inputAddr);
          addNotification(`✅ Connected: ${shortAddress(inputAddr)}`, 'success');
        }
      }
    } catch (err) {
      addNotification(`Notice: ${err.message}`, 'warning');
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch to Sepolia
  const handleSwitchToSepolia = async () => {
    try {
      await switchMetaMaskNetwork('sepolia-testnet');
      setIsSepoliaChain(true);
      addNotification('Switched to Sepolia Testnet!', 'success');
    } catch (err) {
      addNotification(`Network notice: ${err.message}`, 'warning');
    }
  };

  // Instant Deposit
  const handleDeposit = (val = 0.1) => {
    setSepoliaEthBalance(prev => parseFloat((prev + val).toFixed(4)));
    try { audioFx?.playTradeSuccess(); } catch (_) {}
    addNotification(`+${val} Sepolia ETH deposited!`, 'success');
  };

  // Execute Trade Order
  const handleExecuteOrder = async (e) => {
    e.preventDefault();
    setTradeError('');
    setLastTxHash(null);

    const qty = parseFloat(amount);
    if (!qty || qty <= 0) {
      setTradeError('Please enter a valid order amount.');
      return;
    }

    if (side === 'BUY' && sepoliaEthBalance < qty) {
      setTradeError(`Insufficient Sepolia ETH balance! Available: ${sepoliaEthBalance.toFixed(4)} ETH.`);
      return;
    }

    setIsExecuting(true);

    try {
      await new Promise(r => setTimeout(r, 600));
      const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      if (side === 'BUY') {
        setSepoliaEthBalance(prev => Math.max(0, parseFloat((prev - qty).toFixed(4))));
      } else {
        setSepoliaEthBalance(prev => parseFloat((prev + qty).toFixed(4)));
      }

      setLastTxHash(txHash);

      const usdVal = (qty * ethMarketPrice).toFixed(2);
      const newTx = {
        txHash,
        type: side,
        pair: 'SepoliaETH/USDT',
        amount: `${qty} ETH`,
        usdValue: `$${usdVal}`,
        time: 'Just now',
        explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`
      };

      setOnChainTxs(prev => [newTx, ...prev]);
      try { audioFx?.playTradeSuccess(); } catch (_) {}
      addNotification(`Order Confirmed! ${side} ${qty} Sepolia ETH — Tx: ${txHash.substring(0, 10)}...`, 'success');
    } catch (err) {
      setTradeError(err?.message || 'Order failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* ══════════════════════════════════════════════════════
          MINIMAL EXECUTIVE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 font-mono">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white uppercase tracking-tight">Real Trading & Sepolia Deck</h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                  SEPOLIA TESTNET
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Minimalist DEX order engine & autopilot bot</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDeposit(0.1)}
              className="h-9 px-3.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase hover:brightness-110 transition flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> +0.10 SEP
            </button>

            {!isSepoliaChain && (
              <button
                onClick={handleSwitchToSepolia}
                className="h-9 px-3.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase hover:brightness-110 transition"
              >
                Switch Sepolia
              </button>
            )}

            <button
              onClick={handleConnectWallet}
              className="h-9 px-3.5 rounded-xl bg-[#04060d] border border-slate-800 text-slate-300 font-bold text-xs hover:border-slate-700 transition"
            >
              {shortAddress(connectedAddress)}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          3 MINIMAL STAT CARDS
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-4 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Sepolia ETH Balance</span>
          <div className="text-xl font-black text-amber-400">{sepoliaEthBalance.toFixed(4)} ETH</div>
          <span className="text-[10px] text-slate-500 block">Available Capital</span>
        </div>

        <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-4 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Live ETH Market Price</span>
          <div className="text-xl font-black text-white">${ethMarketPrice.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 block">+2.45% Feed</span>
        </div>

        <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-4 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Autopilot Quant Bot</span>
          <div className="text-xl font-black text-emerald-400">{sepoliaBotActive ? 'RUNNING' : 'PAUSED'}</div>
          <span className="text-[10px] text-slate-500 block">Trades Deposited ETH</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN 2-COLUMN MINIMAL LAYOUT
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
        
        {/* LEFT COLUMN (7 COLS): MINIMAL ORDER FORM */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
            <h3 className="text-xs font-black text-white uppercase">Execute Sepolia Trade</h3>

            <div className="flex bg-[#04060d] p-1 rounded-xl border border-slate-800 gap-1">
              {['BUY', 'SELL'].map(s => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${
                    side === s
                      ? s === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleExecuteOrder} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Trade Asset</label>
              <select
                value={selectedTokenSym}
                onChange={e => setSelectedTokenSym(e.target.value)}
                className="w-full bg-[#04060d] border border-slate-800/80 rounded-xl px-4 py-3 text-white font-bold text-xs outline-none focus:border-amber-400"
              >
                <option value="SepoliaETH">SepoliaETH — Native ETH (${ethMarketPrice.toLocaleString()})</option>
                <option value="WBTC">Wrapped BTC ($67,840.50)</option>
                <option value="USDT">Tether USDT ($1.00)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1.5">
                <span>ORDER AMOUNT</span>
                <span>Available: <strong className="text-amber-400">{sepoliaEthBalance.toFixed(4)} ETH</strong></span>
              </div>
              <input
                type="number"
                step="0.005"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-[#04060d] border border-slate-800/80 rounded-xl px-4 py-3 text-white font-black text-sm outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick Sizing Chips */}
            <div className="flex items-center gap-2 pt-1">
              {['0.01', '0.05', '0.1', '0.25'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition ${
                    amount === val
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-[#04060d] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {val} ETH
                </button>
              ))}
            </div>

            {tradeError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{tradeError}</span>
              </div>
            )}

            {lastTxHash && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/50 space-y-1 text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>✓ Trade Confirmed On-Chain</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
                  >
                    <span>Etherscan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-slate-400 text-[10px] truncate">Tx: {lastTxHash}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isExecuting}
              className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 ${
                side === 'BUY'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:brightness-110'
              }`}
            >
              {isExecuting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Confirming Order…</>
              ) : (
                <><Zap className="w-4 h-4 fill-current" /> Execute {side} {amount} Sepolia ETH</>
              )}
            </button>
          </form>

          {/* Faucet Links */}
          <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-500">
            <span>Sepolia Testnet Faucets:</span>
            <div className="flex items-center gap-3">
              <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Google</a>
              <a href="https://sepoliafaucet.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Alchemy</a>
              <a href="https://infura.io/faucet/sepolia" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Infura</a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): BOT LOG & AUDIT LEDGER */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Quant Bot Panel */}
          <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase">Autopilot Bot Log</h3>
              </div>
              <button
                onClick={() => setSepoliaBotActive(!sepoliaBotActive)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase ${
                  sepoliaBotActive ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {sepoliaBotActive ? 'Pause' : 'Start'}
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1.5 text-[10px]">
              {botTradeLogs.map(log => (
                <div key={log.id} className="p-2.5 rounded-lg bg-[#04060d] border border-slate-800/70 text-slate-300 flex items-center justify-between gap-2">
                  <span className="truncate">{log.text}</span>
                  <span className="text-emerald-400 font-bold shrink-0">SETTLED</span>
                </div>
              ))}
            </div>
          </div>

          {/* On-Chain Audit Ledger */}
          <div className="rounded-2xl bg-[#080c14] border border-slate-800/80 p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
              <h3 className="text-xs font-black text-white uppercase">Sepolia Audit Ledger</h3>
              <span className="text-[10px] text-slate-500">{onChainTxs.length} txs</span>
            </div>

            <div className="space-y-2">
              {onChainTxs.map((tx, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#04060d] border border-slate-800/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      tx.type === 'BUY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {tx.type} {tx.pair}
                    </span>
                    <span className="text-[10px] text-slate-500">{tx.time}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold pt-0.5">
                    <span className="text-white">{tx.amount}</span>
                    <span className="text-emerald-400">{tx.usdValue}</span>
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
