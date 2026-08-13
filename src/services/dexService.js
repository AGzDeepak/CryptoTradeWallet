/**
 * dexService.js — Real On-Chain DEX Trading via ethers.js v6
 *
 * Supported networks & DEXes:
 *   Ethereum  (1)      → Uniswap V2
 *   BNB Chain (56)     → PancakeSwap V2
 *   Polygon   (137)    → QuickSwap
 *   Arbitrum  (42161)  → SushiSwap V2
 *   Base      (8453)   → Uniswap V2 on Base
 *   Avalanche (43114)  → Trader Joe V1
 *   Sepolia   (11155111) → Simulation mode (no real DEX pools on testnet)
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
    isMainnet: true,
    gasLimit: 250000n,
  },
  56: {
    name: 'PancakeSwap V2',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    weth:   '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    explorer: 'https://bscscan.com',
    nativeSymbol: 'BNB',
    isMainnet: true,
    gasLimit: 300000n,
  },
  137: {
    name: 'QuickSwap',
    router: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    weth:   '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
    explorer: 'https://polygonscan.com',
    nativeSymbol: 'MATIC',
    isMainnet: true,
    gasLimit: 300000n,
  },
  42161: {
    name: 'SushiSwap (Arbitrum)',
    router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    weth:   '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    explorer: 'https://arbiscan.io',
    nativeSymbol: 'ETH',
    isMainnet: true,
    gasLimit: 350000n,
  },
  8453: {
    name: 'Uniswap V2 (Base)',
    router: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    weth:   '0x4200000000000000000000000000000000000006',
    explorer: 'https://basescan.org',
    nativeSymbol: 'ETH',
    isMainnet: true,
    gasLimit: 300000n,
  },
  43114: {
    name: 'Trader Joe V1',
    router: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
    weth:   '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
    explorer: 'https://snowtrace.io',
    nativeSymbol: 'AVAX',
    isMainnet: true,
    gasLimit: 350000n,
  },
  11155111: {
    name: 'Sepolia Testnet',
    router: null, // No real DEX liquidity on Sepolia — always simulate
    weth:   '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    explorer: 'https://sepolia.etherscan.io',
    nativeSymbol: 'SepoliaETH',
    isMainnet: false,
    isTestnet: true,
    gasLimit: 200000n,
  },
};

// ─── Token Addresses per Chain ─────────────────────────────────────────────────
export const TOKENS = {
  1: { // Ethereum Mainnet — Uniswap V2 pools with deep liquidity
    USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6  },
    USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6  },
    DAI:  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
    WBTC: { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8  },
  },
  56: { // BNB Smart Chain — PancakeSwap V2
    USDT: { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    USDC: { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
    BUSD: { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18 },
    ETH:  { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', decimals: 18 },
  },
  137: { // Polygon — QuickSwap
    USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6  },
    USDC: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6  },
    DAI:  { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18 },
    WBTC: { address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', decimals: 8  },
  },
  42161: { // Arbitrum One — SushiSwap
    USDT: { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6  },
    USDC: { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6  },
    DAI:  { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18 },
    WBTC: { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8  },
  },
  8453: { // Base — Uniswap V2
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6  },
    DAI:  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18 },
  },
  43114: { // Avalanche C-Chain — Trader Joe
    USDT: { address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6  },
    USDC: { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6  },
    DAI:  { address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', decimals: 18 },
  },
  // Sepolia → no real tokens, always simulation
};

// ─── Minimal ABIs ─────────────────────────────────────────────────────────────
const ROUTER_ABI = [
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

// ─── Core Helpers ─────────────────────────────────────────────────────────────
export const getProvider = () =>
  typeof window !== 'undefined' && window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : null;

export const getDexConfig     = (chainId) => DEX_CONFIG[chainId] || null;
export const getTokensForChain = (chainId) => TOKENS[chainId] || {};

// ─── Live Quote (used for UI display only) ────────────────────────────────────
/**
 * Returns a human-readable quote string, or null if pool doesn't exist.
 * Uses the ACTUAL amountIn so rounding is never an issue.
 */
export const getDexQuote = async (chainId, amountIn, path) => {
  try {
    const provider = getProvider();
    if (!provider) return null;
    const dex = getDexConfig(chainId);
    if (!dex?.router) return null;
    const router  = new ethers.Contract(dex.router, ROUTER_ABI, provider);
    const amounts = await router.getAmountsOut(amountIn, path);
    return amounts[amounts.length - 1]; // returns BigInt
  } catch {
    return null; // pool doesn't exist or reverted
  }
};

// ─── Execute BUY: Native → Token ─────────────────────────────────────────────
/**
 * Swaps native gas token (ETH/BNB/MATIC/AVAX) for an ERC-20 token via DEX router.
 *
 * Strategy:
 *  1. Testnet (Sepolia) → simulate immediately.
 *  2. Validate token & router config.
 *  3. Call getAmountsOut(REAL_AMOUNT) to validate pool exists + get quote.
 *     → If this throws, the pool genuinely doesn't exist — show clear error.
 *  4. Submit swapExactETHForTokens with manual gasLimit (bypasses estimateGas).
 */
export const executeDexBuy = async (
  chainId, fromAddress, nativeAmount, tokenSymbol = 'USDT', slippagePct = 1.0
) => {
  const provider = getProvider();
  if (!provider) throw new Error('MetaMask not available. Install MetaMask to continue.');

  const dex = getDexConfig(chainId);
  if (!dex) throw new Error(`Network (chain ${chainId}) not supported yet.`);

  // Testnet: simulate immediately — no real DEX pools
  if (dex.isTestnet || !dex.router) {
    return simulateDexTx(chainId, 'BUY', nativeAmount, tokenSymbol);
  }

  const tokens = getTokensForChain(chainId);
  const token  = tokens[tokenSymbol];
  if (!token) {
    const available = Object.keys(tokens).join(', ');
    throw new Error(`${tokenSymbol} is not available on ${dex.name}.\nAvailable tokens: ${available}`);
  }

  const signer   = await provider.getSigner();
  const amountIn = ethers.parseEther(nativeAmount.toString());
  const path     = [dex.weth, token.address];
  const router   = new ethers.Contract(dex.router, ROUTER_ABI, signer);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

  // ── Step 1: Validate pool + get quote (use real amount to avoid rounding to 0) ──
  let amountOutMin = 0n;
  try {
    const amounts = await router.getAmountsOut(amountIn, path);
    const raw = amounts[amounts.length - 1];
    if (raw > 0n) {
      const slippageBps = BigInt(Math.round((100 - slippagePct) * 100)); // e.g. 9900 for 1%
      amountOutMin = (raw * slippageBps) / 10000n;
    }
    // raw === 0n means pool exists but tiny/dry — proceed with amountOutMin = 0n
  } catch (quoteErr) {
    // getAmountsOut reverted → no pool for this pair
    const available = Object.keys(tokens).join(', ');
    throw new Error(
      `No liquidity pool found for ${dex.nativeSymbol} → ${tokenSymbol} on ${dex.name}.\n` +
      `Available tokens with pools: ${available}\n` +
      `Recommended: Switch to Ethereum Mainnet and trade USDT or USDC.`
    );
  }

  // ── Step 2: Submit swap (MetaMask popup) with manual gasLimit ──────────────
  let tx;
  try {
    tx = await router.swapExactETHForTokens(
      amountOutMin, path, fromAddress, deadline,
      { value: amountIn, gasLimit: dex.gasLimit ?? 300000n }
    );
  } catch (swapErr) {
    throw new Error(parseDexError(swapErr));
  }

  return {
    txHash: tx.hash,
    explorerUrl: `${dex.explorer}/tx/${tx.hash}`,
    dexName: dex.name,
    amountIn: nativeAmount,
    tokenSymbol,
    mode: 'REAL_DEX_BUY',
    isSimulated: false,
  };
};

// ─── Execute SELL: Token → Native ────────────────────────────────────────────
export const executeDexSell = async (
  chainId, fromAddress, tokenAmount, tokenSymbol = 'USDT', slippagePct = 1.0
) => {
  const provider = getProvider();
  if (!provider) throw new Error('MetaMask not available.');

  const dex = getDexConfig(chainId);
  if (!dex) throw new Error(`Network (chain ${chainId}) not supported.`);

  if (dex.isTestnet || !dex.router) {
    return simulateDexTx(chainId, 'SELL', tokenAmount, tokenSymbol);
  }

  const tokens = getTokensForChain(chainId);
  const token  = tokens[tokenSymbol];
  if (!token) {
    const available = Object.keys(tokens).join(', ');
    throw new Error(`${tokenSymbol} is not available on ${dex.name}.\nAvailable: ${available}`);
  }

  const signer   = await provider.getSigner();
  const amountIn = ethers.parseUnits(tokenAmount.toString(), token.decimals);
  const path     = [token.address, dex.weth];
  const router   = new ethers.Contract(dex.router, ROUTER_ABI, signer);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

  // ── Step 1: Validate pool + quote ─────────────────────────────────────────
  let amountOutMin = 0n;
  try {
    const amounts = await router.getAmountsOut(amountIn, path);
    const raw = amounts[amounts.length - 1];
    if (raw > 0n) {
      const slippageBps = BigInt(Math.round((100 - slippagePct) * 100));
      amountOutMin = (raw * slippageBps) / 10000n;
    }
  } catch {
    const available = Object.keys(tokens).join(', ');
    throw new Error(
      `No liquidity pool found for ${tokenSymbol} → ${dex.nativeSymbol} on ${dex.name}.\n` +
      `Available tokens: ${available}\n` +
      `Recommended: Ethereum Mainnet with USDT or USDC.`
    );
  }

  // ── Step 2: ERC-20 Approval ────────────────────────────────────────────────
  const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
  try {
    const allowance = await tokenContract.allowance(fromAddress, dex.router);
    if (allowance < amountIn) {
      const approveTx = await tokenContract.approve(dex.router, ethers.MaxUint256);
      await approveTx.wait(1);
    }
  } catch (approveErr) {
    const msg = approveErr?.message || '';
    if (msg.includes('user rejected') || approveErr?.code === 4001) {
      throw new Error('Token approval rejected in MetaMask. Approval is required before selling.');
    }
    throw approveErr;
  }

  // ── Step 3: Submit swap ────────────────────────────────────────────────────
  let tx;
  try {
    tx = await router.swapExactTokensForETH(
      amountIn, amountOutMin, path, fromAddress, deadline,
      { gasLimit: dex.gasLimit ?? 300000n }
    );
  } catch (swapErr) {
    throw new Error(parseDexError(swapErr));
  }

  return {
    txHash: tx.hash,
    explorerUrl: `${dex.explorer}/tx/${tx.hash}`,
    dexName: dex.name,
    amountIn: tokenAmount,
    tokenSymbol,
    mode: 'REAL_DEX_SELL',
    isSimulated: false,
  };
};

// ─── Testnet / No-Router Simulation ───────────────────────────────────────────
const simulateDexTx = (chainId, side, amount, tokenSymbol) => {
  const dex  = getDexConfig(chainId) || {};
  const hash = `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)).join('')}`;
  return {
    txHash: hash,
    explorerUrl: `${dex.explorer ?? 'https://sepolia.etherscan.io'}/tx/${hash}`,
    dexName: `${dex.name ?? 'Testnet'} (Simulated)`,
    amountIn: amount,
    tokenSymbol,
    mode: 'DEMO_SIMULATION',
    isSimulated: true,
  };
};

// ─── Live Balances ─────────────────────────────────────────────────────────────
export const getNativeBalance = async (walletAddress) => {
  try {
    const provider = getProvider();
    if (!provider || !walletAddress) return '0';
    const raw = await provider.getBalance(walletAddress);
    return parseFloat(ethers.formatEther(raw)).toFixed(6);
  } catch { return '0'; }
};

export const getTokenBalance = async (chainId, walletAddress, tokenSymbol) => {
  try {
    const provider = getProvider();
    if (!provider || !walletAddress) return '0';
    const tokens = getTokensForChain(chainId);
    const token  = tokens[tokenSymbol];
    if (!token) return '0';
    const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
    const raw = await contract.balanceOf(walletAddress);
    return ethers.formatUnits(raw, token.decimals);
  } catch { return '0'; }
};

// ─── User-Facing Error Parser ─────────────────────────────────────────────────
export const parseDexError = (err) => {
  const code = err?.code;
  const msg  = err?.reason || err?.shortMessage || err?.message || String(err);

  if (code === 4001 || msg.includes('user rejected') || msg.includes('ACTION_REJECTED'))
    return 'Transaction rejected in MetaMask.';
  if (msg.includes('missing revert data') || msg.includes('estimateGas') || msg.includes('CALL_EXCEPTION'))
    return 'Swap reverted on-chain. The pool may have insufficient reserves. Try increasing slippage to 3% or reducing the amount.';
  if (msg.includes('insufficient funds') || msg.includes('INSUFFICIENT_FUNDS'))
    return 'Insufficient balance for trade amount + gas fees.';
  if (msg.includes('INSUFFICIENT_OUTPUT_AMOUNT'))
    return 'Slippage too tight — price moved beyond tolerance. Try 3% slippage.';
  if (msg.includes('EXPIRED'))
    return 'Transaction deadline expired. Please try again.';
  if (msg.includes('TRANSFER_FROM_FAILED'))
    return 'Token transfer failed — check your token balance.';
  if (msg.includes('nonce'))
    return 'Nonce conflict — wait for pending transactions to clear, then retry.';

  return msg.slice(0, 300);
};
