// walletService.js — Real Web3 Wallet Service
// Fetches live on-chain data using public RPC endpoints (no API key needed)

// ─── RPC Endpoints (public, free) ────────────────────────────────────────────
// ─── RPC Endpoints (public, free) ────────────────────────────────────────────
const RPC_ENDPOINTS = {
  ethereum: 'https://cloudflare-eth.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  polygon:  'https://polygon-rpc.com',
  bsc:      'https://bsc-dataseed1.binance.org',
  sepolia:  'https://rpc.sepolia.org',
  arbitrumSepolia: 'https://sepolia-rollup.arbitrum.io/rpc',
  polygonAmoy: 'https://rpc-amoy.polygon.technology'
};

// ─── Token Contract Addresses (ERC-20 on Ethereum Mainnet) ───────────────────
const TOKEN_CONTRACTS = {
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  BNB:  '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
};

// ─── ERC-20 balanceOf selector: keccak256("balanceOf(address)") = 0x70a08231 ─
const BALANCE_OF_SELECTOR = '0x70a08231';

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const shortAddress = (address = '') =>
  address.length >= 10 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address;

export const isValidEthAddress = (addr) =>
  /^0x[0-9a-fA-F]{40}$/.test(addr?.trim() ?? '');

export const formatUsd = (amount = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

export const generateTxId = (prefix = 'TXN') =>
  `${prefix}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

export const generateVirtualAddress = (email = 'user@chainblock.io') => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}C7656EC7ab88b098defB751B7401B5f6d7B41`.substring(0, 42);
};

// ─── RPC Call helper ─────────────────────────────────────────────────────────
const rpcCall = async (rpcUrl, method, params = []) => {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
};

// ─── Fetch ETH balance (in ETH) ──────────────────────────────────────────────
export const fetchEthBalance = async (address, network = 'ethereum') => {
  try {
    if (typeof window !== 'undefined' && window.ethereum && address) {
      try {
        const hexBalance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        if (hexBalance) {
          const wei = BigInt(hexBalance);
          return Number(wei) / 1e18;
        }
      } catch (_) {}
    }

    const rpc = RPC_ENDPOINTS[network] || RPC_ENDPOINTS.sepolia || RPC_ENDPOINTS.ethereum;
    const hexBalance = await rpcCall(rpc, 'eth_getBalance', [address, 'latest']);
    const wei = BigInt(hexBalance);
    return Number(wei) / 1e18;
  } catch (err) {
    console.warn('fetchEthBalance failed:', err.message);
    return 0;
  }
};

// ─── Fetch ERC-20 token balance ───────────────────────────────────────────────
export const fetchTokenBalance = async (walletAddress, tokenAddress, decimals = 6, network = 'ethereum') => {
  try {
    const rpc = RPC_ENDPOINTS[network] || RPC_ENDPOINTS.sepolia || RPC_ENDPOINTS.ethereum;
    const paddedAddr = walletAddress.toLowerCase().replace('0x', '').padStart(64, '0');
    const data = BALANCE_OF_SELECTOR + paddedAddr;

    const hexBalance = await rpcCall(rpc, 'eth_call', [
      { to: tokenAddress, data },
      'latest'
    ]);
    if (!hexBalance || hexBalance === '0x') return 0;
    const raw = BigInt(hexBalance);
    return Number(raw) / Math.pow(10, decimals);
  } catch (err) {
    console.warn('fetchTokenBalance failed:', err.message);
    return 0;
  }
};

// ─── Fetch live crypto prices from CoinGecko (free, no API key) ──────────────
export const fetchCryptoPrices = async () => {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,tether,usd-coin,solana&vs_currencies=usd',
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await res.json();
    return {
      ETH:  data?.ethereum?.usd  ?? 3540.20,
      BTC:  data?.bitcoin?.usd   ?? 67840.50,
      USDT: data?.tether?.usd    ?? 1.00,
      USDC: data?.['usd-coin']?.usd ?? 1.00,
      SOL:  data?.solana?.usd    ?? 184.75,
    };
  } catch (err) {
    console.warn('fetchCryptoPrices failed:', err.message);
    return { ETH: 3540.20, BTC: 67840.50, USDT: 1.00, USDC: 1.00, SOL: 184.75 };
  }
};

// ─── Main: Fetch ALL wallet data for a given address ─────────────────────────
export const fetchWalletData = async (address, network = 'ethereum') => {
  const [ethBalance, usdtBalance, usdcBalance, prices] = await Promise.all([
    fetchEthBalance(address, network),
    fetchTokenBalance(address, TOKEN_CONTRACTS.USDT, 6, network),
    fetchTokenBalance(address, TOKEN_CONTRACTS.USDC, 6, network),
    fetchCryptoPrices(),
  ]);

  const ethUsd  = parseFloat((ethBalance  * prices.ETH).toFixed(2));
  const usdtUsd = parseFloat(usdtBalance.toFixed(2));
  const usdcUsd = parseFloat(usdcBalance.toFixed(2));
  const totalUsd = parseFloat((ethUsd + usdtUsd + usdcUsd).toFixed(2));

  return {
    address,
    shortAddr:   shortAddress(address),
    network,
    ethBalance:  parseFloat(ethBalance.toFixed(6)),
    ethUsd,
    usdtBalance: usdtUsd,
    usdcBalance: usdcUsd,
    totalUsd,
    prices,
    lastUpdated: new Date().toLocaleTimeString(),
  };
};

// ─── Network name helper ──────────────────────────────────────────────────────
export const getNetworkName = (chainId) => {
  const map = {
    1:        'Ethereum Mainnet',
    11155111: 'Sepolia ETH Testnet',
    42161:    'Arbitrum One',
    421614:   'Arbitrum Sepolia',
    137:      'Polygon',
    80002:    'Polygon Amoy',
    56:       'BNB Chain',
    97:       'BNB Testnet',
    10:       'Optimism',
    8453:     'Base',
  };
  return map[chainId] || `Chain #${chainId}`;
};

// ─── MetaMask (browser extension) connect ────────────────────────────────────
export const isMetaMaskAvailable = () =>
  typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

export const connectMetaMask = async () => {
  if (!isMetaMaskAvailable()) throw new Error('MetaMask not installed');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts?.length) throw new Error('No accounts found');
  const address = accounts[0];
  const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
  const chainId = parseInt(chainIdHex, 16);
  return { address, chainId, networkName: getNetworkName(chainId) };
};

export const switchMetaMaskAccount = async () => {
  if (!isMetaMaskAvailable()) throw new Error('MetaMask browser extension not detected.');
  
  try {
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    });
  } catch (err) {
    console.info('MetaMask permission switch prompt notice:', err?.message);
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts?.length) throw new Error('No accounts returned from MetaMask');
  const address = accounts[0];
  const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
  const chainId = parseInt(chainIdHex, 16);
  return { address, chainId, networkName: getNetworkName(chainId) };
};

// ─── Network Configurations (Mainnet & Testnet) ─────────────────────────────
export const NETWORKS = [
  {
    id: 'bitcoin-mainnet',
    name: 'Bitcoin Mainnet (BTC)',
    type: 'MAINNET',
    chainId: 0,
    chainIdHex: '0x0',
    rpcUrl: 'https://blockstream.info/api',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
    blockExplorer: 'https://mempool.space',
    icon: '₿'
  },
  {
    id: 'bitcoin-testnet',
    name: 'Bitcoin Testnet / Signet (tBTC)',
    type: 'TESTNET',
    chainId: 999999,
    chainIdHex: '0xf423f',
    rpcUrl: 'https://mempool.space/testnet/api',
    nativeCurrency: { name: 'Testnet Bitcoin', symbol: 'tBTC', decimals: 8 },
    blockExplorer: 'https://mempool.space/testnet',
    icon: '🧪'
  },
  {
    id: 'rootstock-mainnet',
    name: 'Rootstock (RSK) Smart Bitcoin Mainnet',
    type: 'MAINNET',
    chainId: 30,
    chainIdHex: '0x1e',
    rpcUrl: 'https://public-node.rsk.co',
    nativeCurrency: { name: 'Smart Bitcoin', symbol: 'RBTC', decimals: 18 },
    blockExplorer: 'https://explorer.rootstock.io',
    icon: '₿'
  },
  {
    id: 'rootstock-testnet',
    name: 'Rootstock (RSK) Smart Bitcoin Testnet',
    type: 'TESTNET',
    chainId: 31,
    chainIdHex: '0x1f',
    rpcUrl: 'https://public-node.testnet.rsk.co',
    nativeCurrency: { name: 'Testnet Smart Bitcoin', symbol: 'tRBTC', decimals: 18 },
    blockExplorer: 'https://explorer.testnet.rootstock.io',
    icon: '🧪'
  },
  {
    id: 'ethereum-mainnet',
    name: 'Ethereum Mainnet',
    type: 'MAINNET',
    chainId: 1,
    chainIdHex: '0x1',
    rpcUrl: 'https://cloudflare-eth.com',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://etherscan.io',
    icon: '🌐'
  },
  {
    id: 'sepolia-testnet',
    name: 'Sepolia ETH Testnet',
    type: 'TESTNET',
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    rpcUrl: 'https://rpc.sepolia.org',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
    blockExplorer: 'https://sepolia.etherscan.io',
    icon: '🧪'
  },
  {
    id: 'arbitrum-mainnet',
    name: 'Arbitrum One Mainnet',
    type: 'MAINNET',
    chainId: 42161,
    chainIdHex: '0xa4b1',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://arbiscan.io',
    icon: '⚡'
  },
  {
    id: 'arbitrum-sepolia',
    name: 'Arbitrum Sepolia Testnet',
    type: 'TESTNET',
    chainId: 421614,
    chainIdHex: '0x66eee',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    nativeCurrency: { name: 'Arbitrum Sepolia ETH', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://sepolia.arbiscan.io',
    icon: '🧪'
  },
  {
    id: 'polygon-mainnet',
    name: 'Polygon Mainnet',
    type: 'MAINNET',
    chainId: 137,
    chainIdHex: '0x89',
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://polygonscan.com',
    icon: '🟣'
  },
  {
    id: 'polygon-amoy',
    name: 'Polygon Amoy Testnet',
    type: 'TESTNET',
    chainId: 80002,
    chainIdHex: '0x13882',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://www.oklink.com/amoy',
    icon: '🧪'
  }
];

export const switchMetaMaskNetwork = async (targetNetwork) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask browser extension not detected.');
  }

  const net = typeof targetNetwork === 'string'
    ? NETWORKS.find(n => n.id === targetNetwork || n.chainIdHex === targetNetwork || n.name.toLowerCase().includes(targetNetwork.toLowerCase()))
    : targetNetwork;

  if (!net) throw new Error('Network configuration not found.');

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: net.chainIdHex }]
    });
    return { success: true, network: net };
  } catch (switchError) {
    if (switchError.code === 4902 || switchError?.message?.includes('Unrecognized chain')) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: net.chainIdHex,
            chainName: net.name,
            rpcUrls: [net.rpcUrl],
            nativeCurrency: net.nativeCurrency,
            blockExplorerUrls: [net.blockExplorer]
          }]
        });
        return { success: true, network: net };
      } catch (addError) {
        throw new Error(`Failed to add ${net.name} to MetaMask: ${addError.message}`);
      }
    }
    throw switchError;
  }
};

export const switchToEthereumMainnet = async () => switchMetaMaskNetwork('ethereum-mainnet');
export const switchToSepoliaTestnet = async () => switchMetaMaskNetwork('sepolia-testnet');
export const switchToArbitrumMainnet = async () => switchMetaMaskNetwork('arbitrum-mainnet');
export const switchToArbitrumSepolia = async () => switchMetaMaskNetwork('arbitrum-sepolia');

export const onAccountChanged  = (cb) => isMetaMaskAvailable() && window.ethereum.on('accountsChanged', cb);
export const onNetworkChanged  = (cb) => isMetaMaskAvailable() && window.ethereum.on('chainChanged', cb);
export const removeMetaMaskListeners = () => {
  if (!isMetaMaskAvailable()) return;
  window.ethereum.removeAllListeners('accountsChanged');
  window.ethereum.removeAllListeners('chainChanged');
};
