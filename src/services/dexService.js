/**
 * dexService.js — Real On-Chain DEX Trading via ethers.js v6
 * Supports: Uniswap V2 (Mainnet), PancakeSwap (BSC), QuickSwap (Polygon),
 *           SushiSwap (Arbitrum), BaseSwap (Base), TraderJoe (Avalanche), Uniswap V2 (Sepolia)
 */
import { ethers } from 'ethers';

// ─── DEX Router Config per Chain ──────────────────────────────────────────────
export const DEX_CONFIG = {
  1: {
    name: 'Uniswap V2',
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    weth:   '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    explorer: 'https://etherscan.io',
    nativeSymbol: 'ETH',
  },
  56: {
    name: 'PancakeSwap V2',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    weth:   '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    explorer: 'https://bscscan.com',
    nativeSymbol: 'BNB',
  },
  137: {
    name: 'QuickSwap',
    router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    weth:   '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
    explorer: 'https://polygonscan.com',
    nativeSymbol: 'MATIC',
  },
  42161: {
    name: 'SushiSwap (Arbitrum)',
    router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    weth:   '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum
    explorer: 'https://arbiscan.io',
    nativeSymbol: 'ETH',
  },
  8453: {
    name: 'BaseSwap',
    router: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86',
    weth:   '0x4200000000000000000000000000000000000006', // WETH on Base
    explorer: 'https://basescan.org',
    nativeSymbol: 'ETH',
  },
  43114: {
    name: 'Trader Joe (Avalanche)',
    router: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
    weth:   '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
    explorer: 'https://snowtrace.io',
    nativeSymbol: 'AVAX',
  },
  11155111: {
    name: 'Uniswap V2 (Sepolia)',
    router: '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008',
    weth:   '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', // WETH Sepolia
    explorer: 'https://sepolia.etherscan.io',
    nativeSymbol: 'ETH',
  },
};

// ─── Common Token Addresses per Chain ─────────────────────────────────────────
export const TOKENS = {
  1: {
    USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6  },
    USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6  },
    DAI:  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
    WBTC: { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8  },
  },
  56: {
    USDT: { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    USDC: { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
    ETH:  { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', decimals: 18 },
  },
  137: {
    USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6  },
    USDC: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6  },
    WBTC: { address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', decimals: 8  },
  },
  42161: {
    USDT: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6  },
    USDC: { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', decimals: 6  },
    WBTC: { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8  },
  },
  8453: {
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6  },
    USDbC:{ address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', decimals: 6  },
  },
  43114: {
    USDT: { address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6  },
    USDC: { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6  },
  },
  11155111: {
    // Sepolia test tokens (commonly used testnet deployments)
    USDC: { address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', decimals: 6  },
  },
};

// ─── ABIs ─────────────────────────────────────────────────────────────────────
const ROUTER_ABI = [
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable',
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getDexConfig = (chainId) =>
  DEX_CONFIG[chainId] || DEX_CONFIG[1];

export const getTokensForChain = (chainId) =>
  TOKENS[chainId] || TOKENS[1];

// ─── Get Price Quote ──────────────────────────────────────────────────────────
/**
 * Get DEX quote for a swap
 * @param {number} chainId
 * @param {bigint} amountIn - amount in wei / smallest unit
 * @param {string[]} path - token path [from, to]
 * @returns {bigint|null} amountOut
 */
export const getDexQuote = async (chainId, amountIn, path) => {
  try {
    const provider = getProvider();
    if (!provider) return null;
    const dex = getDexConfig(chainId);
    const router = new ethers.Contract(dex.router, ROUTER_ABI, provider);
    const amounts = await router.getAmountsOut(amountIn, path);
    return amounts[amounts.length - 1];
  } catch (err) {
    console.warn('[dexService] Quote failed:', err.message);
    return null;
  }
};

// ─── Execute BUY: Native → Token ─────────────────────────────────────────────
/**
 * Swap native ETH/BNB/MATIC for a token via DEX router
 * @param {number}  chainId
 * @param {string}  fromAddress     - user's wallet
 * @param {string}  nativeAmount    - amount of native token as string e.g. "0.01"
 * @param {string}  tokenSymbol     - e.g. "USDT", "USDC"
 * @param {number}  slippagePct     - e.g. 0.5 for 0.5%
 */
export const executeDexBuy = async (
  chainId, fromAddress, nativeAmount, tokenSymbol = 'USDT', slippagePct = 1.0
) => {
  const provider = getProvider();
  if (!provider) throw new Error('MetaMask not available. Please install MetaMask.');

  const dex     = getDexConfig(chainId);
  const tokens  = getTokensForChain(chainId);
  const token   = tokens[tokenSymbol];
  if (!token) throw new Error(`Token ${tokenSymbol} not supported on this network. Try USDT or USDC.`);

  const signer     = await provider.getSigner();
  const router     = new ethers.Contract(dex.router, ROUTER_ABI, signer);
  const amountIn   = ethers.parseEther(nativeAmount.toString());
  const path       = [dex.weth, token.address];

  // Get quote
  let amountOutMin = 0n;
  const quote = await getDexQuote(chainId, amountIn, path);
  if (quote) {
    const slippage = BigInt(Math.floor((100 - slippagePct) * 100)); // e.g. 9950 for 0.5%
    amountOutMin = (quote * slippage) / 10000n;
  }

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

  // Send swap transaction (MetaMask popup will appear)
  const tx = await router.swapExactETHForTokens(
    amountOutMin,
    path,
    fromAddress,
    deadline,
    { value: amountIn }
  );

  return {
    txHash: tx.hash,
    explorerUrl: `${dex.explorer}/tx/${tx.hash}`,
    dexName: dex.name,
    amountIn: nativeAmount,
    amountOutMin: amountOutMin.toString(),
    tokenSymbol,
    path,
    mode: 'REAL_DEX_BUY',
    waitForReceipt: async () => await tx.wait(1),
  };
};

// ─── Execute SELL: Token → Native ────────────────────────────────────────────
/**
 * Swap token for native ETH/BNB/MATIC via DEX router
 * @param {number}  chainId
 * @param {string}  fromAddress
 * @param {string}  tokenAmount    - token amount as string
 * @param {string}  tokenSymbol
 * @param {number}  slippagePct
 */
export const executeDexSell = async (
  chainId, fromAddress, tokenAmount, tokenSymbol = 'USDT', slippagePct = 1.0
) => {
  const provider = getProvider();
  if (!provider) throw new Error('MetaMask not available.');

  const dex    = getDexConfig(chainId);
  const tokens = getTokensForChain(chainId);
  const token  = tokens[tokenSymbol];
  if (!token) throw new Error(`Token ${tokenSymbol} not supported on this network.`);

  const signer        = await provider.getSigner();
  const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
  const amountIn      = ethers.parseUnits(tokenAmount.toString(), token.decimals);

  // Check & request ERC-20 approval if needed
  const allowance = await tokenContract.allowance(fromAddress, dex.router);
  if (allowance < amountIn) {
    const approveTx = await tokenContract.approve(dex.router, ethers.MaxUint256);
    await approveTx.wait(1); // Wait for approval to be mined
  }

  const router  = new ethers.Contract(dex.router, ROUTER_ABI, signer);
  const path    = [token.address, dex.weth];

  let amountOutMin = 0n;
  const quote = await getDexQuote(chainId, amountIn, path);
  if (quote) {
    const slippage = BigInt(Math.floor((100 - slippagePct) * 100));
    amountOutMin = (quote * slippage) / 10000n;
  }

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

  const tx = await router.swapExactTokensForETH(
    amountIn,
    amountOutMin,
    path,
    fromAddress,
    deadline
  );

  return {
    txHash: tx.hash,
    explorerUrl: `${dex.explorer}/tx/${tx.hash}`,
    dexName: dex.name,
    amountIn: tokenAmount,
    amountOutMin: amountOutMin.toString(),
    tokenSymbol,
    path,
    mode: 'REAL_DEX_SELL',
    waitForReceipt: async () => await tx.wait(1),
  };
};

// ─── Get Live Token Balance ───────────────────────────────────────────────────
export const getTokenBalance = async (chainId, walletAddress, tokenSymbol) => {
  try {
    const provider = getProvider();
    if (!provider) return '0';
    const tokens = getTokensForChain(chainId);
    const token  = tokens[tokenSymbol];
    if (!token) return '0';
    const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
    const raw = await contract.balanceOf(walletAddress);
    return ethers.formatUnits(raw, token.decimals);
  } catch {
    return '0';
  }
};

// ─── Get Native Balance ───────────────────────────────────────────────────────
export const getNativeBalance = async (walletAddress) => {
  try {
    const provider = getProvider();
    if (!provider) return '0';
    const raw = await provider.getBalance(walletAddress);
    return parseFloat(ethers.formatEther(raw)).toFixed(6);
  } catch {
    return '0';
  }
};

// ─── Friendly error parser ────────────────────────────────────────────────────
export const parseDexError = (err) => {
  const msg = err?.reason || err?.message || 'Unknown error';
  if (msg.includes('user rejected') || msg.includes('ACTION_REJECTED')) return 'Transaction rejected in MetaMask.';
  if (msg.includes('insufficient funds') || msg.includes('INSUFFICIENT_FUNDS')) return 'Insufficient native token balance for the trade + gas fees.';
  if (msg.includes('INSUFFICIENT_OUTPUT_AMOUNT') || msg.includes('K')) return 'Price moved beyond slippage tolerance. Try increasing slippage % or reducing amount.';
  if (msg.includes('EXPIRED')) return 'Transaction expired. Please try again.';
  if (msg.includes('INVALID_PATH')) return 'No liquidity pool found for this token pair on this network.';
  if (msg.includes('TRANSFER_FROM_FAILED')) return 'Token transfer failed — check your token balance and approval.';
  if (msg.includes('execution reverted')) return `Swap reverted on-chain: ${msg.slice(0, 120)}`;
  if (msg.includes('nonce')) return 'Nonce conflict. Please wait for pending transactions to clear.';
  return msg.slice(0, 200);
};
