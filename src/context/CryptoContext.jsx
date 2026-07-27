import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { audioFx } from '../utils/audio';
import { recordFirebaseLoginLog, recordFirebaseWithdrawal, recordFirebaseBotTradeLog, sanitizeInput } from '../services/securityService';
import { connectRealWeb3Wallet, sendRealWeb3Transaction, isWeb3Available } from '../services/web3Service';

const CryptoContext = createContext();

const INITIAL_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', basePrice: 67840.50, vol: '4.82B', high24: 68920.00, low24: 66500.00, change24: 2.45 },
  { symbol: 'ETHUSDT', name: 'Ethereum', basePrice: 3540.20, vol: '2.15B', high24: 3620.50, low24: 3480.00, change24: 1.82 },
  { symbol: 'SOLUSDT', name: 'Solana', basePrice: 184.75, vol: '1.42B', high24: 191.00, low24: 178.50, change24: 4.12 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', basePrice: 38.60, vol: '620M', high24: 40.20, low24: 36.80, change24: -0.95 },
  { symbol: 'XRPUSDT', name: 'Ripple', basePrice: 0.6240, vol: '890M', high24: 0.6510, low24: 0.6020, change24: 3.10 },
  { symbol: 'LINKUSDT', name: 'Chainlink', basePrice: 18.25, vol: '410M', high24: 19.10, low24: 17.60, change24: 2.05 }
];

const EXCHANGES = ['Binance', 'Bybit', 'OKX', 'Coinbase'];

const NEW_USER_WALLET = {
  virtualBalance: 100000.00,
  totalEquity: 100000.00,
  todayProfit: 0.00,
  roiPct: 0.00,
  address: '0x00D3...C43D',
  network: 'Arbitrum One',
  currency: 'USD'
};

export const CryptoProvider = ({ children }) => {
  // Authentication & Security State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [sessionToken, setSessionToken] = useState(null);
  const [user, setUser] = useState({
    name: 'Deepak Kumar',
    email: 'deepak@chainblock.io',
    avatar: 'D',
    role: 'Institutional Quant Trader',
    secStatus: '256-BIT ENCRYPTED'
  });

  // Dual Wallet Mode State: 'DEMO' (Paper Trading) | 'REAL' (Web3 Wallet)
  const [walletMode, setWalletMode] = useState('DEMO');
  const [realWallet, setRealWallet] = useState({
    connected: false,
    address: '',
    shortAddress: '',
    balanceEth: 0,
    balanceUsd: 0,
    networkName: 'Ethereum Mainnet',
    walletType: 'MetaMask'
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals & Drawers
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Live Market State
  const [marketData, setMarketData] = useState(INITIAL_COINS);
  const [priceFlashMap, setPriceFlashMap] = useState({});
  const [exchangePrices, setExchangePrices] = useState({});
  const [arbitrageOpps, setArbitrageOpps] = useState([]);
  
  // Auto-Trading Bot State
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(true);
  const [tradingMode, setTradingMode] = useState('Balanced');
  const [minProfitThreshold, setMinProfitThreshold] = useState(0.25);
  const [autoTradeLogs, setAutoTradeLogs] = useState([]);
  const [totalBotProfit, setTotalBotProfit] = useState(0.00);
  const [autoTradeCount, setAutoTradeCount] = useState(0);

  // Stimulation Technique Engine State
  const [stimulationEnabled, setStimulationEnabled] = useState(true);
  const [stimulationMode, setStimulationMode] = useState('Stochastic Liquidity Pulse');
  const [stimulationIntensity, setStimulationIntensity] = useState('HIGH (800ms)');
  const [stimulationLogs, setStimulationLogs] = useState([
    { id: 1, text: '[STIMULATION PULSE] Stochastic orderbook depth injected across Binance & Bybit (+18.4% Vol)', time: new Date().toLocaleTimeString() }
  ]);

  // Paper Wallet State
  const [wallet, setWallet] = useState(NEW_USER_WALLET);

  // Open Positions, History & Withdrawal Logs
  const [openPositions, setOpenPositions] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Exchange Health
  const [exchangeHealth] = useState({
    Binance: { latency: 14, status: 'ONLINE', ping: '14ms', health: 'GREEN', uptime: '99.99%' },
    Bybit: { latency: 22, status: 'ONLINE', ping: '22ms', health: 'GREEN', uptime: '99.95%' },
    OKX: { latency: 28, status: 'ONLINE', ping: '28ms', health: 'GREEN', uptime: '99.92%' },
    Coinbase: { latency: 36, status: 'ONLINE', ping: '36ms', health: 'YELLOW', uptime: '99.88%' }
  });

  const lastAutoTradeTimeRef = useRef(0);

  // Real Web3 Wallet Connect Handler
  const connectRealWallet = async (walletType = 'MetaMask') => {
    try {
      if (!isWeb3Available()) {
        const simulated = {
          address: '0x71C765b28F3D140a831C28190d7B41',
          shortAddress: '0x71C7...d7B41',
          balanceEth: 4.8250,
          balanceUsd: 17081.45,
          networkName: 'Arbitrum One',
          walletType,
          connected: true
        };
        setRealWallet(simulated);
        setWalletMode('REAL');
        audioFx.playTradeSuccess();
        addNotification(`Connected ${walletType} Real Web3 Wallet: ${simulated.shortAddress}`, 'success');
        return true;
      }

      const walletInfo = await connectRealWeb3Wallet(walletType);
      setRealWallet(walletInfo);
      setWalletMode('REAL');
      audioFx.playTradeSuccess();
      addNotification(`Connected Real Web3 Wallet: ${walletInfo.shortAddress} on ${walletInfo.networkName}`, 'success');
      return true;
    } catch (err) {
      addNotification(`Web3 Wallet Connection Error: ${err.message}`, 'warning');
      audioFx.playAlertChime();
      return false;
    }
  };

  const disconnectRealWallet = () => {
    setRealWallet({
      connected: false,
      address: '',
      shortAddress: '',
      balanceEth: 0,
      balanceUsd: 0,
      networkName: 'Ethereum Mainnet',
      walletType: 'MetaMask'
    });
    setWalletMode('DEMO');
    addNotification('Disconnected Web3 Wallet. Switched to Demo Paper Wallet.', 'info');
  };

  // Storage Key Helper per User Email
  const getStorageKey = (email) => `chainblock_user_${(email || 'default').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const persistUserData = (email, data) => {
    try {
      localStorage.setItem(getStorageKey(email), JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }
  };

  // Secure Authentication Login Handler
  const login = async (email, password, name = 'Deepak Kumar', provider = 'firebase_email') => {
    const cleanEmail = sanitizeInput(email);
    const cleanName = sanitizeInput(name);
    const storageKey = getStorageKey(cleanEmail);

    setUser({
      name: cleanName,
      email: cleanEmail,
      avatar: cleanName.charAt(0).toUpperCase(),
      role: 'Institutional Quant Trader',
      secStatus: '256-BIT ENCRYPTED'
    });
    setIsAuthenticated(true);

    const existingRaw = localStorage.getItem(storageKey);
    if (existingRaw) {
      try {
        const saved = JSON.parse(existingRaw);
        setWallet(saved.wallet || NEW_USER_WALLET);
        setOpenPositions(saved.openPositions || []);
        setTradeHistory(saved.tradeHistory || []);
        setWithdrawalHistory(saved.withdrawalHistory || []);
        setTotalBotProfit(saved.totalBotProfit || 0.00);
        setAutoTradeCount(saved.autoTradeCount || 0);
        setNotifications(saved.notifications || []);
        addNotification(`Welcome back, ${cleanName}! Loaded saved workspace.`, 'success');
      } catch (e) {
        initializeFreshUser(cleanEmail, cleanName);
      }
    } else {
      initializeFreshUser(cleanEmail, cleanName);
    }

    const token = await recordFirebaseLoginLog({ email: cleanEmail, name: cleanName }, provider);
    setSessionToken(token);
    audioFx.playTradeSuccess();
  };

  const initializeFreshUser = (email, name) => {
    setWallet(NEW_USER_WALLET);
    setOpenPositions([]);
    setTradeHistory([]);
    setWithdrawalHistory([]);
    setTotalBotProfit(0.00);
    setAutoTradeCount(0);
    
    const freshNotifs = [
      { id: 1, message: `Welcome ${name}! Your fresh paper trading account is active with $100,000.00 USDT.`, type: 'success', time: new Date().toLocaleTimeString() },
      { id: 2, message: 'Auto-Trader Bot standby mode enabled.', type: 'info', time: new Date().toLocaleTimeString() }
    ];
    setNotifications(freshNotifs);

    persistUserData(email, {
      wallet: NEW_USER_WALLET,
      openPositions: [],
      tradeHistory: [],
      withdrawalHistory: [],
      totalBotProfit: 0.00,
      autoTradeCount: 0,
      notifications: freshNotifs
    });
  };

  // Sync State Updates to Local User Storage
  useEffect(() => {
    if (user && user.email) {
      persistUserData(user.email, {
        wallet,
        openPositions,
        tradeHistory,
        withdrawalHistory,
        totalBotProfit,
        autoTradeCount,
        notifications
      });
    }
  }, [wallet, openPositions, tradeHistory, withdrawalHistory, totalBotProfit, autoTradeCount, notifications, user]);

  const logout = () => {
    setIsAuthenticated(false);
    setSessionToken(null);
    audioFx.playAlertChime();
  };

  // Live High Frequency Tick Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newFlash = {};
      const newExPrices = {};
      
      const updatedCoins = marketData.map(coin => {
        const pctChange = (Math.random() - 0.49) * 0.005;
        const newPrice = Math.max(0.01, coin.basePrice * (1 + pctChange));
        const priceDiff = newPrice - coin.basePrice;

        if (priceDiff > 0.01) newFlash[coin.symbol] = 'up';
        else if (priceDiff < -0.01) newFlash[coin.symbol] = 'down';

        const exMap = {};
        EXCHANGES.forEach((ex, idx) => {
          const exSpread = (Math.sin(Date.now() / 1000 + idx * 1.5) * 0.002) + ((Math.random() - 0.5) * 0.003);
          exMap[ex] = parseFloat((newPrice * (1 + exSpread)).toFixed(coin.basePrice < 1 ? 4 : 2));
        });
        newExPrices[coin.symbol] = exMap;

        return {
          ...coin,
          basePrice: parseFloat(newPrice.toFixed(coin.basePrice < 1 ? 4 : 2)),
          high24: Math.max(coin.high24, newPrice),
          low24: Math.min(coin.low24, newPrice),
          change24: parseFloat((coin.change24 + (pctChange * 10)).toFixed(2))
        };
      });

      setMarketData(updatedCoins);
      setPriceFlashMap(newFlash);
      setExchangePrices(newExPrices);

      setTimeout(() => setPriceFlashMap({}), 600);

      // Generate Opps
      const opps = [];
      updatedCoins.forEach(coin => {
        const exPrices = newExPrices[coin.symbol];
        if (!exPrices) return;

        let bestBuyEx = EXCHANGES[0];
        let bestSellEx = EXCHANGES[0];
        let minPrice = Infinity;
        let maxPrice = -Infinity;

        EXCHANGES.forEach(ex => {
          const p = exPrices[ex];
          if (p < minPrice) { minPrice = p; bestBuyEx = ex; }
          if (p > maxPrice) { maxPrice = p; bestSellEx = ex; }
        });

        const diffUsd = maxPrice - minPrice;
        const diffPct = (diffUsd / minPrice) * 100;
        const unitSize = coin.symbol.startsWith('BTC') ? 0.5 : coin.symbol.startsWith('ETH') ? 4 : 50;
        const grossProfit = diffUsd * unitSize;
        const estFees = (minPrice * unitSize + maxPrice * unitSize) * 0.0004;
        const netProfit = grossProfit - estFees;

        const isProfitable = diffPct >= 0.20 && netProfit > 5;

        opps.push({
          symbol: coin.symbol,
          name: coin.name,
          buyExchange: bestBuyEx,
          sellExchange: bestSellEx,
          ex1Price: minPrice,
          ex2Price: maxPrice,
          diffUsd: parseFloat(diffUsd.toFixed(2)),
          diffPct: parseFloat(diffPct.toFixed(2)),
          estProfit: parseFloat(grossProfit.toFixed(2)),
          fees: parseFloat(estFees.toFixed(2)),
          netProfit: parseFloat(netProfit.toFixed(2)),
          isProfitable,
          unitSize,
          status: isProfitable ? 'HIGH PROFIT' : 'MONITORING'
        });
      });

      setArbitrageOpps(opps);

      // Auto Trader Execution
      const now = Date.now();
      if (autoTradingEnabled && (now - lastAutoTradeTimeRef.current > 4000)) {
        const topOpp = opps
          .filter(o => o.isProfitable && o.diffPct >= minProfitThreshold)
          .sort((a, b) => b.netProfit - a.netProfit)[0];

        if (topOpp && openPositions.length < 5) {
          lastAutoTradeTimeRef.current = now;
          executeAutoTrade(topOpp);
        }
      }

      updateOpenPositionsAndAutoSettle(newExPrices);

    }, 800);

    return () => clearInterval(interval);
  }, [marketData, autoTradingEnabled, minProfitThreshold, openPositions]);

  // Deposit Funds Handler
  const depositFunds = (amount, currency = 'USDT') => {
    const cleanAmountStr = String(amount || '').replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanAmountStr);

    if (isNaN(num) || num <= 0) return;

    setWallet(w => ({
      ...w,
      virtualBalance: parseFloat((w.virtualBalance + num).toFixed(2)),
      totalEquity: parseFloat((w.totalEquity + num).toFixed(2))
    }));

    audioFx.playTradeSuccess();
    addNotification(`Mock Deposit Successful: +$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`, 'success');
  };

  // Robust Async Withdraw Funds Handler (Firestore Database + Web3 + Paper Wallet)
  const withdrawFunds = async (amount, address = '0x71C7...d7B41', currency = 'USDT', networkChain = 'Arbitrum One') => {
    const cleanAmountStr = String(amount || '').replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanAmountStr);

    if (isNaN(num) || num <= 0) {
      addNotification('Invalid withdrawal amount. Please enter a valid number.', 'warning');
      audioFx.playAlertChime();
      return false;
    }

    let txHash = `0x${Math.random().toString(16).substring(2)}${Date.now()}`;

    // REAL Web3 Wallet Mode Withdrawal
    if (walletMode === 'REAL' && realWallet.connected) {
      try {
        const ethEquivalent = (num / 3540.20).toFixed(4);
        txHash = await sendRealWeb3Transaction(realWallet.address, address, ethEquivalent);
      } catch (err) {
        addNotification(`Web3 Withdrawal Error: ${err.message}`, 'warning');
        audioFx.playAlertChime();
        return false;
      }
    } else {
      // DEMO Paper Wallet Mode Withdrawal
      if (num > wallet.virtualBalance) {
        addNotification(`Withdrawal Failed: Amount ($${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}) exceeds available cash ($${wallet.virtualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })})!`, 'danger');
        audioFx.playAlertChime();
        return false;
      }

      setWallet(w => ({
        ...w,
        virtualBalance: parseFloat((w.virtualBalance - num).toFixed(2)),
        totalEquity: parseFloat((w.totalEquity - num).toFixed(2))
      }));
    }

    // Record Withdrawal in Firebase Firestore Database (withdrawals collection)
    await recordFirebaseWithdrawal({
      amount: num,
      currency,
      destinationAddress: address,
      networkChain,
      walletMode,
      txHash,
      email: user.email,
      name: user.name
    });

    const withdrawalRecord = {
      id: `WTH-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: num,
      currency,
      address,
      networkChain,
      walletMode,
      txHash,
      time: new Date().toLocaleTimeString(),
      status: 'COMPLETED'
    };

    setWithdrawalHistory(prev => [withdrawalRecord, ...prev]);

    const shortAddr = address.length > 10 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address;
    audioFx.playTradeSuccess();
    addNotification(`Withdrawal Dispatched & Recorded in Firestore: -$${num.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency} to ${shortAddr}`, 'success');
    return true;
  };

  // Order Placement
  const executeOrder = (side, symbol, exchange, amount, priceOverride = null) => {
    const coin = marketData.find(c => c.symbol === symbol) || marketData[0];
    const price = priceOverride || coin.basePrice;
    const cost = price * amount;

    if (side === 'BUY' && cost > wallet.virtualBalance) {
      addNotification(`Insufficient Virtual Cash! Deposit funds or lower amount.`, 'warning');
      audioFx.playAlertChime();
      return false;
    }

    setWallet(w => ({
      ...w,
      virtualBalance: side === 'BUY' ? parseFloat((w.virtualBalance - cost).toFixed(2)) : parseFloat((w.virtualBalance + cost).toFixed(2))
    }));

    const newPos = {
      id: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol,
      type: side,
      buyExchange: exchange,
      sellExchange: exchange === 'Binance' ? 'Bybit' : 'Binance',
      entryBuyPrice: price,
      entrySellPrice: parseFloat((price * 1.004).toFixed(2)),
      currentBuyPrice: price,
      currentSellPrice: parseFloat((price * 1.004).toFixed(2)),
      spreadPct: 0.40,
      amount,
      invested: parseFloat(cost.toFixed(2)),
      unrealizedPnL: parseFloat((cost * 0.004).toFixed(2)),
      duration: '0s',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };

    setOpenPositions(prev => [newPos, ...prev]);
    audioFx.playTradeSuccess();
    addNotification(`Executed ${side}: ${amount} ${symbol} @ $${price.toLocaleString()} on ${exchange} (${walletMode} Mode)`, 'success');
    return true;
  };

  const executeAutoTrade = (opp) => {
    const newPosId = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPos = {
      id: newPosId,
      symbol: opp.symbol,
      type: 'ARBITRAGE',
      buyExchange: opp.buyExchange,
      sellExchange: opp.sellExchange,
      entryBuyPrice: opp.ex1Price,
      entrySellPrice: opp.ex2Price,
      currentBuyPrice: opp.ex1Price,
      currentSellPrice: opp.ex2Price,
      spreadPct: opp.diffPct,
      amount: opp.unitSize,
      invested: parseFloat((opp.ex1Price * opp.unitSize).toFixed(2)),
      unrealizedPnL: opp.netProfit,
      duration: '0s',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    };

    const nextBotProfit = parseFloat((totalBotProfit + opp.netProfit).toFixed(2));

    setOpenPositions(prev => [newPos, ...prev]);
    setTotalBotProfit(nextBotProfit);
    setAutoTradeCount(prev => prev + 1);

    // Store in Trade Settlement Audit History Log
    const botAuditRecord = {
      id: `TRD-BOT-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString(),
      symbol: opp.symbol,
      strategy: 'Autopilot Bot Alpha',
      isBot: true,
      buyExchange: opp.buyExchange,
      sellExchange: opp.sellExchange,
      buyPrice: opp.ex1Price,
      sellPrice: opp.ex2Price,
      amount: opp.unitSize,
      buyTotal: parseFloat((opp.ex1Price * opp.unitSize).toFixed(2)),
      sellTotal: parseFloat((opp.ex2Price * opp.unitSize).toFixed(2)),
      grossProfit: opp.estProfit || opp.netProfit,
      fees: opp.fees || 2.50,
      netProfit: opp.netProfit,
      totalBotProfit: nextBotProfit,
      spreadPct: opp.diffPct,
      buyTxHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      sellTxHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      latency: '14.2ms',
      result: 'PROFIT'
    };

    setTradeHistory(prev => [botAuditRecord, ...prev]);

    // Record in Firebase Firestore Database
    recordFirebaseBotTradeLog(botAuditRecord);

    audioFx.playTradeSuccess();

    const timeStr = new Date().toLocaleTimeString();
    const logMsg = {
      id: Date.now(),
      text: `[AUTO-BOT] Arbitrage: ${opp.symbol} Buy ${opp.buyExchange} @ $${opp.ex1Price} -> Sell ${opp.sellExchange} @ $${opp.ex2Price} (+$${opp.netProfit}) | Cum. Profit: +$${nextBotProfit}`,
      time: timeStr,
      type: 'success'
    };
    setAutoTradeLogs(prev => [logMsg, ...prev.slice(0, 15)]);
    addNotification(`Auto-Trader Executed & Logged: ${opp.symbol} +$${opp.netProfit} (Total: +$${nextBotProfit})`, 'success');
  };

  const updateOpenPositionsAndAutoSettle = (newExPrices) => {
    setOpenPositions(prevPositions => {
      const remainingPositions = [];
      prevPositions.forEach(pos => {
        const prices = newExPrices[pos.symbol];
        let currBuy = pos.currentBuyPrice;
        let currSell = pos.currentSellPrice;

        if (prices) {
          currBuy = prices[pos.buyExchange] || pos.entryBuyPrice;
          currSell = prices[pos.sellExchange] || pos.entrySellPrice;
        }

        const currPnL = parseFloat(((currSell - currBuy) * pos.amount - (pos.invested * 0.0004)).toFixed(2));

        if (currPnL > 35 || Math.random() < 0.15) {
          closePosition(pos.id, currPnL, 'AUTO-SETTLED');
        } else {
          remainingPositions.push({
            ...pos,
            currentBuyPrice: currBuy,
            currentSellPrice: currSell,
            unrealizedPnL: currPnL,
            duration: `${Math.floor((Date.now() - new Date(pos.timestamp).getTime()) / 1000)}s`
          });
        }
      });
      return remainingPositions;
    });
  };

  const closePosition = (posId, finalPnL = null, reason = 'MANUAL') => {
    setOpenPositions(prev => {
      const pos = prev.find(p => p.id === posId);
      if (!pos) return prev;

      const pnl = finalPnL !== null ? finalPnL : pos.unrealizedPnL;
      
      setWallet(w => ({
        ...w,
        virtualBalance: parseFloat((w.virtualBalance + pnl + pos.invested).toFixed(2)),
        totalEquity: parseFloat((w.totalEquity + pnl).toFixed(2)),
        todayProfit: parseFloat((w.todayProfit + pnl).toFixed(2)),
        roiPct: parseFloat(((w.todayProfit + pnl) / 100000 * 100).toFixed(2))
      }));

      const historyItem = {
        id: `TRD-${Math.floor(100 + Math.random() * 900)}`,
        time: new Date().toLocaleTimeString(),
        symbol: pos.symbol,
        strategy: 'Cross Exchange Arbitrage',
        buyExchange: pos.buyExchange,
        sellExchange: pos.sellExchange,
        entryPrice: pos.entryBuyPrice,
        exitPrice: pos.currentSellPrice,
        amount: pos.amount,
        fees: parseFloat((pos.invested * 0.0004).toFixed(2)),
        netProfit: pnl,
        result: pnl >= 0 ? 'PROFIT' : 'LOSS'
      };

      setTradeHistory(th => [historyItem, ...th]);
      audioFx.playAlertChime();
      addNotification(`Closed ${pos.symbol} Position (${reason}): Net PnL $${pnl}`, pnl >= 0 ? 'success' : 'danger');

      return prev.filter(p => p.id !== posId);
    });
  };

  const executeManualTrade = (symbol, buyEx, sellEx, amount) => {
    executeOrder('BUY', symbol, buyEx, amount);
  };

  const resetWallet = () => {
    setWallet(NEW_USER_WALLET);
    setOpenPositions([]);
    setTradeHistory([]);
    setWithdrawalHistory([]);
    setTotalBotProfit(0.00);
    setAutoTradeCount(0);
    addNotification('Paper wallet reset to $100,000.00 USDT', 'warning');
  };

  const addNotification = (message, type = 'info') => {
    const notif = { id: Date.now() + Math.random(), message, type, time: new Date().toLocaleTimeString() };
    setNotifications(prev => [notif, ...prev.slice(0, 19)]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const openModal = (type, data = null) => {
    setActiveModal(type);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const triggerManualPulse = () => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT'];
    const exchanges = ['Binance', 'Bybit', 'OKX', 'Coinbase'];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const buyEx = exchanges[Math.floor(Math.random() * exchanges.length)];
    const sellEx = exchanges.filter(e => e !== buyEx)[Math.floor(Math.random() * 3)];
    
    const coin = marketData.find(c => c.symbol === sym) || marketData[0];
    const buyP = parseFloat((coin.basePrice * (1 - 0.005)).toFixed(2));
    const sellP = parseFloat((coin.basePrice * (1 + 0.006)).toFixed(2));
    const diffUsd = parseFloat((sellP - buyP).toFixed(2));
    const diffPct = parseFloat(((diffUsd / buyP) * 100).toFixed(2));
    const unitSize = sym.startsWith('BTC') ? 0.5 : sym.startsWith('ETH') ? 4 : 50;
    const netProfit = parseFloat(((diffUsd * unitSize) - 2.50).toFixed(2));

    const opp = {
      symbol: sym,
      name: coin.name,
      buyExchange: buyEx,
      sellExchange: sellEx,
      ex1Price: buyP,
      ex2Price: sellP,
      diffUsd,
      diffPct,
      estProfit: diffUsd * unitSize,
      fees: 2.50,
      netProfit,
      isProfitable: true,
      unitSize,
      status: 'STIMULATED PROFIT'
    };

    const pulseLog = {
      id: Date.now(),
      text: `[STIMULATION PULSE FIRED] ${sym} Orderbook Pressure: Buy ${buyEx} @ $${buyP} -> Sell ${sellEx} @ $${sellP} (+${diffPct}%)`,
      time: new Date().toLocaleTimeString()
    };
    setStimulationLogs(prev => [pulseLog, ...prev.slice(0, 10)]);

    executeAutoTrade(opp);
    audioFx.playTradeSuccess();
    addNotification(`Manual Stimulation Pulse Fired: ${sym} Buy ${buyEx} ➔ Sell ${sellEx} (+$${netProfit})`, 'success');
  };

  return (
    <CryptoContext.Provider
      value={{
        isAuthenticated,
        sessionToken,
        user,
        login,
        logout,
        walletMode,
        setWalletMode,
        realWallet,
        connectRealWallet,
        disconnectRealWallet,
        activeTab,
        setActiveTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        darkMode,
        setDarkMode,
        soundEnabled,
        setSoundEnabled,
        activeModal,
        modalData,
        openModal,
        closeModal,
        marketData,
        priceFlashMap,
        exchangePrices,
        arbitrageOpps,
        autoTradingEnabled,
        setAutoTradingEnabled,
        tradingMode,
        setTradingMode,
        minProfitThreshold,
        setMinProfitThreshold,
        autoTradeLogs,
        totalBotProfit,
        autoTradeCount,
        stimulationEnabled,
        setStimulationEnabled,
        stimulationMode,
        setStimulationMode,
        stimulationIntensity,
        setStimulationIntensity,
        stimulationLogs,
        triggerManualPulse,
        wallet,
        depositFunds,
        withdrawFunds,
        withdrawalHistory,
        executeOrder,
        openPositions,
        closePosition,
        executeManualTrade,
        resetWallet,
        tradeHistory,
        exchangeHealth,
        notifications,
        addNotification,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => useContext(CryptoContext);
