import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { audioFx } from '../utils/audio';

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

export const CryptoProvider = ({ children }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({
    name: 'Deepak Kumar',
    email: 'deepak@chainblock.io',
    avatar: 'D',
    role: 'Institutional Quant Trader'
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
  const [autoTradeLogs, setAutoTradeLogs] = useState([
    { id: 1, text: 'Auto-Trading AI initialized. Scanning 4 major exchanges...', time: new Date().toLocaleTimeString(), type: 'info' }
  ]);
  const [totalBotProfit, setTotalBotProfit] = useState(1482.50);
  const [autoTradeCount, setAutoTradeCount] = useState(34);

  // Paper Wallet State
  const [wallet, setWallet] = useState({
    virtualBalance: 98520.00,
    totalEquity: 104820.50,
    todayProfit: 1482.50,
    roiPct: 4.82,
    address: '0x00D3...C43D',
    network: 'Arbitrum One',
    currency: 'USD'
  });

  // Open Positions & History
  const [openPositions, setOpenPositions] = useState([
    {
      id: 'POS-8921',
      symbol: 'BTCUSDT',
      type: 'BUY',
      buyExchange: 'Binance',
      sellExchange: 'Bybit',
      entryBuyPrice: 67820.00,
      entrySellPrice: 68140.00,
      currentBuyPrice: 67830.00,
      currentSellPrice: 68190.00,
      spreadPct: 0.47,
      amount: 0.5,
      invested: 33910.00,
      unrealizedPnL: 185.00,
      duration: '42s',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    }
  ]);

  const [tradeHistory, setTradeHistory] = useState([
    {
      id: 'TRD-701',
      time: '18:42:15',
      symbol: 'SOLUSDT',
      strategy: 'Cross Exchange Arbitrage',
      buyExchange: 'Bybit',
      sellExchange: 'Binance',
      entryPrice: 183.50,
      exitPrice: 185.10,
      amount: 50,
      fees: 7.34,
      netProfit: 72.66,
      result: 'PROFIT'
    }
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Auto-Trader Bot launched successfully', type: 'success', time: new Date().toLocaleTimeString() },
    { id: 2, message: 'WebSocket Feeders online (Binance, Bybit, OKX, Coinbase)', type: 'info', time: new Date().toLocaleTimeString() }
  ]);

  // Exchange Health
  const [exchangeHealth] = useState({
    Binance: { latency: 14, status: 'ONLINE', ping: '14ms', health: 'GREEN', uptime: '99.99%' },
    Bybit: { latency: 22, status: 'ONLINE', ping: '22ms', health: 'GREEN', uptime: '99.95%' },
    OKX: { latency: 28, status: 'ONLINE', ping: '28ms', health: 'GREEN', uptime: '99.92%' },
    Coinbase: { latency: 36, status: 'ONLINE', ping: '36ms', health: 'YELLOW', uptime: '99.88%' }
  });

  const lastAutoTradeTimeRef = useRef(0);

  // Authentication Handlers
  const login = (email, password, name = 'Deepak Kumar') => {
    setUser({
      name,
      email,
      avatar: name.charAt(0).toUpperCase(),
      role: 'Institutional Quant Trader'
    });
    setIsAuthenticated(true);
    audioFx.playTradeSuccess();
    addNotification(`Welcome back, ${name}! Signed in successfully.`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
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
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setWallet(w => ({
      ...w,
      virtualBalance: parseFloat((w.virtualBalance + num).toFixed(2)),
      totalEquity: parseFloat((w.totalEquity + num).toFixed(2))
    }));

    audioFx.playTradeSuccess();
    addNotification(`Mock Deposit Successful: +$${num.toLocaleString()} ${currency}`, 'success');
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
    addNotification(`Mock ${side} Executed: ${amount} ${symbol} @ $${price.toLocaleString()} on ${exchange}`, 'success');
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

    setOpenPositions(prev => [newPos, ...prev]);
    setTotalBotProfit(prev => parseFloat((prev + opp.netProfit).toFixed(2)));
    setAutoTradeCount(prev => prev + 1);

    audioFx.playTradeSuccess();

    const timeStr = new Date().toLocaleTimeString();
    const logMsg = {
      id: Date.now(),
      text: `[AUTO-BOT] Arbitrage: ${opp.symbol} Buy ${opp.buyExchange} @ $${opp.ex1Price} -> Sell ${opp.sellExchange} @ $${opp.ex2Price} (+$${opp.netProfit})`,
      time: timeStr,
      type: 'success'
    };
    setAutoTradeLogs(prev => [logMsg, ...prev.slice(0, 15)]);
    addNotification(`Auto-Trader Executed: ${opp.symbol} +$${opp.netProfit}`, 'success');
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
    setWallet(w => ({
      ...w,
      virtualBalance: 100000.00,
      totalEquity: 100000.00,
      todayProfit: 0.00,
      roiPct: 0.00
    }));
    setOpenPositions([]);
    setTotalBotProfit(0);
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

  return (
    <CryptoContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
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
        wallet,
        depositFunds,
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
