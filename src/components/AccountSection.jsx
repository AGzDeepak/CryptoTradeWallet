import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  Wallet, Copy, Check, Globe, RefreshCw, LogIn, Shield, TrendingUp,
  Activity, ArrowUpRight, CheckCircle2, CircleDollarSign
} from 'lucide-react';
import { shortAddress, isMetaMaskAvailable } from '../services/walletService';
import {
  getNativeBalance, getTokenBalance, getTokensForChain, getDexConfig, DEX_CONFIG
} from '../services/dexService';
import { SUPPORTED_NETWORKS } from '../services/web3Service';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const AccountSection = () => {
  const {
    user, addNotification,
    realWalletAddress, setRealWalletAddress,
    realWalletNetwork, setRealWalletNetwork,
    marketData
  } = useCrypto();

  const [activeChainId, setActiveChainId] = useState(null);
  const [copiedAddr, setCopiedAddr]       = useState(false);
  const [isConnecting, setIsConnecting]   = useState(false);
  const [isFetching, setIsFetching]       = useState(false);
  const [lastSync, setLastSync]           = useState('');

  // Live on-chain balance state
  const [nativeBal, setNativeBal]         = useState('0');
  const [tokenBalances, setTokenBalances] = useState({});

  const isConnected = !!realWalletAddress && /^0x[0-9a-fA-F]{40}$/.test(realWalletAddress);

  // Price map lookup
  const getPrice = useCallback((sym) => {
    if (['USDT', 'USDC', 'DAI', 'BUSD', 'USDbC'].includes(sym)) return 1.0;
    if (sym === 'WBTC' || sym === 'BTC') {
      return marketData?.find(c => c.symbol === 'BTCUSDT')?.basePrice || 63500;
    }
    if (sym === 'ETH' || sym === 'WETH' || sym === 'SepoliaETH') {
      return marketData?.find(c => c.symbol === 'ETHUSDT')?.basePrice || 3150;
    }
    if (sym === 'BNB' || sym === 'WBNB') {
      return marketData?.find(c => c.symbol === 'BNBUSDT')?.basePrice || 580;
    }
    if (sym === 'MATIC' || sym === 'WMATIC') {
      return marketData?.find(c => c.symbol === 'MATICUSDT')?.basePrice || 0.55;
    }
    if (sym === 'AVAX' || sym === 'WAVAX') {
      return marketData?.find(c => c.symbol === 'AVAXUSDT')?.basePrice || 28.50;
    }
    return 1.0;
  }, [marketData]);

  // Fetch live on-chain balances for connected wallet
  const syncLiveData = useCallback(async () => {
    if (!isConnected) return;
    setIsFetching(true);
    try {
      let chainId = activeChainId;
      if (!chainId && typeof window !== 'undefined' && window.ethereum) {
        const hex = await window.ethereum.request({ method: 'eth_chainId' });
        chainId = parseInt(hex, 16);
        setActiveChainId(chainId);
      }
      const activeChain = chainId || 1;

      // 1. Fetch Native Balance (ETH/BNB/MATIC/AVAX)
      const nb = await getNativeBalance(realWalletAddress);
      setNativeBal(nb);

      // 2. Fetch ERC-20 Token Balances configured for this network
      const tokens = getTokensForChain(activeChain);
      const tokenSyms = Object.keys(tokens);
      const balances = {};

      await Promise.all(
        tokenSyms.map(async (sym) => {
          try {
            const b = await getTokenBalance(activeChain, realWalletAddress, sym);
            balances[sym] = b;
          } catch (_) {
            balances[sym] = '0';
          }
        })
      );

      setTokenBalances(balances);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('[AccountSection] Sync error:', err.message);
    } finally {
      setIsFetching(false);
    }
  }, [isConnected, activeChainId, realWalletAddress]);

  // Initial sync & listeners
  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accs = await window.ethereum.request({ method: 'eth_accounts' });
          if (accs?.[0]) {
            setRealWalletAddress(accs[0]);
            const hex = await window.ethereum.request({ method: 'eth_chainId' });
            const cid = parseInt(hex, 16);
            setActiveChainId(cid);
            const net = SUPPORTED_NETWORKS[cid];
            if (net) setRealWalletNetwork(net.name);
          }
        } catch (_) {}
      }
    };
    init();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChain = (hex) => {
        const cid = parseInt(hex, 16);
        setActiveChainId(cid);
        const net = SUPPORTED_NETWORKS[cid];
        if (net) setRealWalletNetwork(net.name);
      };
      const handleAccs = (accs) => {
        if (accs?.[0]) setRealWalletAddress(accs[0]);
        else setRealWalletAddress('');
      };
      window.ethereum.on('chainChanged', handleChain);
      window.ethereum.on('accountsChanged', handleAccs);
      return () => {
        window.ethereum.removeListener?.('chainChanged', handleChain);
        window.ethereum.removeListener?.('accountsChanged', handleAccs);
      };
    }
  }, [setRealWalletAddress, setRealWalletNetwork]);

  useEffect(() => {
    syncLiveData();
    const interval = setInterval(syncLiveData, 15000);
    return () => clearInterval(interval);
  }, [syncLiveData]);

  // Connect MetaMask button
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts?.[0]) {
          const addr = accounts[0];
          setRealWalletAddress(addr);
          const hex = await window.ethereum.request({ method: 'eth_chainId' });
          const cid = parseInt(hex, 16);
          setActiveChainId(cid);
          const net = SUPPORTED_NETWORKS[cid];
          if (net) setRealWalletNetwork(net.name);
          addNotification(`🦊 Connected: ${shortAddress(addr)} on ${net?.name || `Chain ${cid}`}`, 'success');
        }
      } else {
        const inputAddr = window.prompt('MetaMask not detected. Paste your 0x address:');
        if (inputAddr && /^0x[0-9a-fA-F]{40}$/.test(inputAddr.trim())) {
          setRealWalletAddress(inputAddr.trim());
          addNotification(`✅ Connected: ${shortAddress(inputAddr.trim())}`, 'success');
        }
      }
    } catch (err) {
      addNotification(`Connection error: ${err.message}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddr = () => {
    if (realWalletAddress) {
      navigator.clipboard.writeText(realWalletAddress);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  // Build live holdings list from connected chain
  const liveHoldings = useMemo(() => {
    if (!isConnected) return [];

    const currentChain = activeChainId || 1;
    const dex = DEX_CONFIG[currentChain] || DEX_CONFIG[1];
    const nativeSym = dex?.nativeSymbol || 'ETH';
    const nativeAmount = parseFloat(nativeBal || 0);
    const nativeUsdPrice = getPrice(nativeSym);
    const nativeUsdVal = nativeAmount * nativeUsdPrice;

    const list = [
      {
        sym: nativeSym,
        name: `${nativeSym} (Native)`,
        amount: nativeAmount,
        price: nativeUsdPrice,
        usdValue: nativeUsdVal,
        isNative: true,
        bg: 'bg-violet-500/15',
        color: 'text-violet-400'
      }
    ];

    const tokens = getTokensForChain(currentChain);
    Object.keys(tokens).forEach(sym => {
      const amt = parseFloat(tokenBalances[sym] || 0);
      const p = getPrice(sym);
      const val = amt * p;
      list.push({
        sym,
        name: `${sym} Token`,
        amount: amt,
        price: p,
        usdValue: val,
        isNative: false,
        bg: 'bg-emerald-500/15',
        color: 'text-emerald-400'
      });
    });

    return list;
  }, [isConnected, activeChainId, nativeBal, tokenBalances, getPrice]);

  const totalLivePortfolioUsd = useMemo(() => {
    return liveHoldings.reduce((sum, h) => sum + h.usdValue, 0);
  }, [liveHoldings]);

  return (
    <div className="space-y-6">

      {/* Page title + sync button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Portfolio</h1>
          <p className="text-sm text-slate-400 mt-0.5">Live on-chain holdings & connected MetaMask overview</p>
        </div>
        {isConnected && (
          <button
            onClick={syncLiveData}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0d1523] border border-slate-800/70 hover:border-slate-700 text-xs text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Syncing…' : lastSync ? `Synced ${lastSync}` : 'Sync Wallet'}
          </button>
        )}
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'On-Chain Value',
            value: `$${fmt(totalLivePortfolioUsd)}`,
            color: 'text-white',
            sub: isConnected ? 'Live MetaMask balance' : 'Connect wallet to view',
            icon: <CircleDollarSign className="w-5 h-5 text-emerald-400" />,
            bg: 'bg-emerald-500/15'
          },
          {
            label: 'Native Gas Token',
            value: `${parseFloat(nativeBal).toFixed(4)} ${DEX_CONFIG[activeChainId]?.nativeSymbol || 'ETH'}`,
            color: 'text-violet-400',
            sub: `$${fmt(parseFloat(nativeBal) * getPrice(DEX_CONFIG[activeChainId]?.nativeSymbol || 'ETH'))}`,
            icon: <Wallet className="w-5 h-5 text-violet-400" />,
            bg: 'bg-violet-500/15'
          },
          {
            label: 'Active Network',
            value: isConnected ? (SUPPORTED_NETWORKS[activeChainId]?.name || `Chain ${activeChainId}`) : 'Not Connected',
            color: isConnected ? 'text-cyan-400' : 'text-slate-500',
            sub: isConnected ? `Chain ID: ${activeChainId}` : 'MetaMask disconnected',
            icon: <Globe className="w-5 h-5 text-cyan-400" />,
            bg: 'bg-cyan-500/15'
          },
          {
            label: 'Assets Tracked',
            value: isConnected ? liveHoldings.length : '0',
            color: 'text-amber-400',
            sub: 'Native + ERC-20 Tokens',
            icon: <Activity className="w-5 h-5 text-amber-400" />,
            bg: 'bg-amber-500/15'
          },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-1">{s.sub}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Holdings Table (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0d1523] border border-slate-800/70 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/70">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Live On-Chain Holdings</h2>
              {isConnected && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">
                  {DEX_CONFIG[activeChainId]?.name || 'Web3'}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">
              {isConnected ? `${liveHoldings.length} assets found` : 'Disconnected'}
            </span>
          </div>

          {!isConnected ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center mx-auto">
                <Wallet className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">No Wallet Connected</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Connect your MetaMask wallet to view real live balances for ETH, USDT, USDC, and tokens across networks.
                </p>
              </div>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition"
              >
                {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {isConnecting ? 'Connecting…' : 'Connect MetaMask'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-slate-500 font-medium border-b border-slate-800/50">
                    <th className="px-5 py-3 text-left">Asset</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-5 py-3 text-right">USD Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {liveHoldings.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-800/20 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl ${h.bg} flex items-center justify-center text-xs font-bold ${h.color}`}>
                            {h.sym.slice(0, 3)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                              {h.sym}
                              {h.isNative && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-medium">NATIVE</span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500">{h.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs font-mono text-slate-200">
                        {h.amount.toFixed(h.amount < 0.001 && h.amount > 0 ? 6 : 4)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs text-slate-400">
                        ${fmt(h.price)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="text-xs font-bold text-white">
                          ${fmt(h.usdValue)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Account & Connection Sidebar (1 Col) */}
        <div className="space-y-4">
          {/* User Profile */}
          <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Account Profile</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xl font-bold text-violet-400">
                {user?.avatar || 'D'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name || 'Deepak Kumar'}</p>
                <p className="text-xs text-slate-400">{user?.email || 'deepak@chainblock.io'}</p>
                <p className="text-[10px] text-violet-400 mt-0.5">{user?.role || 'Web3 Institutional Trader'}</p>
              </div>
            </div>
          </div>

          {/* Connected MetaMask Wallet Card */}
          <div className="rounded-2xl bg-[#0d1523] border border-slate-800/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">MetaMask Wallet</h2>
              {isConnected && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                </span>
              )}
            </div>

            {isConnected ? (
              <div className="space-y-3">
                <div className="bg-[#060d18] rounded-xl p-3 space-y-1.5">
                  <p className="text-[10px] text-slate-500 uppercase font-medium">Wallet Address</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-200 font-mono">{shortAddress(realWalletAddress)}</span>
                    <button onClick={copyAddr} className="text-slate-400 hover:text-white transition">
                      {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{realWalletAddress}</p>
                </div>

                <div className="bg-[#060d18] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Network</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <Globe className="w-3 h-3 text-violet-400" />
                      {SUPPORTED_NETWORKS[activeChainId]?.name || realWalletNetwork || 'Ethereum'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Native Balance</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {parseFloat(nativeBal).toFixed(4)} {DEX_CONFIG[activeChainId]?.nativeSymbol || 'ETH'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={syncLiveData}
                  disabled={isFetching}
                  className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${isFetching ? 'animate-spin' : ''}`} />
                  {isFetching ? 'Refreshing On-Chain Data…' : 'Refresh Balances'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Connect your Web3 wallet to sync true on-chain balances automatically.
                </p>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
                >
                  {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {isConnecting ? 'Connecting…' : 'Connect MetaMask'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

