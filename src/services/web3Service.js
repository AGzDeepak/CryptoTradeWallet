/**
 * Web3 Provider & Real Wallet Connection Service (EIP-1193 / MetaMask)
 */

export const isWeb3Available = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export const connectRealWeb3Wallet = async (walletType = 'MetaMask') => {
  if (!isWeb3Available()) {
    throw new Error('No Web3 wallet provider detected. Please install MetaMask, Coinbase Wallet, or Trust Wallet.');
  }

  try {
    // Request account access from Web3 provider
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex, 16);

    const address = accounts[0];

    // Fetch native balance
    const balanceHex = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    const balanceWei = parseInt(balanceHex, 16);
    const balanceEth = parseFloat((balanceWei / 1e18).toFixed(4));

    // Resolve network name
    let networkName = 'Ethereum Mainnet';
    if (chainId === 42161) networkName = 'Arbitrum One';
    else if (chainId === 137) networkName = 'Polygon Mainnet';
    else if (chainId === 56) networkName = 'BNB Smart Chain';
    else if (chainId === 10) networkName = 'Optimism';
    else if (chainId === 11155111) networkName = 'Sepolia Testnet';

    return {
      address,
      shortAddress: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      balanceEth,
      balanceUsd: parseFloat((balanceEth * 3540.20).toFixed(2)),
      chainId,
      networkName,
      walletType,
      connected: true
    };
  } catch (error) {
    console.error('Web3 connection error:', error);
    throw error;
  }
};

export const sendRealWeb3Transaction = async (fromAddress, toAddress, amountEth = '0.01') => {
  if (!isWeb3Available()) {
    // Simulated Transaction Hash for Demo Web3 Mode
    return `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
  }

  try {
    const valueWeiHex = '0x' + (Math.floor(parseFloat(amountEth) * 1e18)).toString(16);
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: fromAddress,
          to: toAddress,
          value: valueWeiHex
        }
      ]
    });
    return txHash;
  } catch (err) {
    console.error('Web3 Transaction Error:', err);
    throw err;
  }
};
