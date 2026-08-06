// Solidity Exchange Smart Contract Service & Multi-Chain Mainnet/Testnet Configuration

export const NETWORKS = {
  // MAINNETS
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    type: 'MAINNET',
    chainIdHex: '0x1',
    chainIdNum: 1,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    contractAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d7B41',
    color: 'indigo'
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum One',
    type: 'MAINNET',
    chainIdHex: '0xa4b1',
    chainIdNum: 42161,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    contractAddress: '0x438A0b3459c0714bE8e27c196F4e803B26685f0B',
    color: 'blue'
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon Mainnet',
    type: 'MAINNET',
    chainIdHex: '0x89',
    chainIdNum: 137,
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    contractAddress: '0x892a0B3459c0714bE8e27c196F4e803B26685f0C',
    color: 'purple'
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Smart Chain',
    type: 'MAINNET',
    chainIdHex: '0x38',
    chainIdNum: 56,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    contractAddress: '0x562a0B3459c0714bE8e27c196F4e803B26685f0D',
    color: 'yellow'
  },

  // TESTNETS
  sepolia: {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    type: 'TESTNET',
    chainIdHex: '0xaa36a7',
    chainIdNum: 11155111,
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    contractAddress: '0x1115511100000000000000000000000000000001',
    color: 'cyan'
  },
  arbitrumSepolia: {
    id: 'arbitrumSepolia',
    name: 'Arbitrum Sepolia',
    type: 'TESTNET',
    chainIdHex: '0x66eee',
    chainIdNum: 421614,
    nativeCurrency: { name: 'Arbitrum Sepolia ETH', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia.arbiscan.io',
    contractAddress: '0x4216140000000000000000000000000000000002',
    color: 'sky'
  },
  polygonAmoy: {
    id: 'polygonAmoy',
    name: 'Polygon Amoy Testnet',
    type: 'TESTNET',
    chainIdHex: '0x13882',
    chainIdNum: 80002,
    nativeCurrency: { name: 'Amoy MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://www.oklink.com/amoy',
    contractAddress: '0x8000200000000000000000000000000000000003',
    color: 'pink'
  },
  bscTestnet: {
    id: 'bscTestnet',
    name: 'BNB Smart Chain Testnet',
    type: 'TESTNET',
    chainIdHex: '0x61',
    chainIdNum: 97,
    nativeCurrency: { name: 'Testnet BNB', symbol: 'tBNB', decimals: 18 },
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorer: 'https://testnet.bscscan.com',
    contractAddress: '0x0097000000000000000000000000000000000004',
    color: 'amber'
  }
};

// Solidity Exchange Contract ABI
export const CHAINBLOCK_ROUTER_ABI = [
  'function depositETH() external payable',
  'function depositToken(address token, uint256 amount) external',
  'function executeSpatialArbitrage(address token, uint256 amount, uint256 minExpectedProfit, string sourceDex, string targetDex) external returns (uint256)',
  'function withdrawETH(uint256 amount) external',
  'function withdrawToken(address token, uint256 amount) external',
  'function getBalance(address user, address token) external view returns (uint256)',
  'function owner() external view returns (address)',
  'function isPaused() external view returns (bool)',
  'event Deposit(address indexed user, address indexed token, uint256 amount, uint256 timestamp)',
  'event Withdrawal(address indexed user, address indexed token, uint256 amount, uint256 timestamp)',
  'event SpatialArbitrageExecuted(address indexed trader, address indexed token, uint256 amountIn, uint256 profitAmount, string sourceDex, string targetDex, uint256 timestamp)'
];

/**
 * @dev Switch MetaMask active network to selected Mainnet / Testnet
 */
export const switchNetwork = async (networkKey) => {
  const target = NETWORKS[networkKey];
  if (!target) throw new Error(`Unknown network: ${networkKey}`);

  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: target.chainIdHex }]
      });
      return target;
    } catch (switchError) {
      // Error 4902 indicates chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: target.chainIdHex,
            chainName: target.name,
            nativeCurrency: target.nativeCurrency,
            rpcUrls: [target.rpcUrl],
            blockExplorerUrls: [target.blockExplorer]
          }]
        });
        return target;
      }
      throw switchError;
    }
  }
  return target;
};
