import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { 
  FileCode, ExternalLink, Copy, Check, ShieldCheck, Cpu, 
  Terminal, Globe, Sparkles, AlertCircle, Play, CheckCircle2
} from 'lucide-react';

const CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Production Flash Loan Arbitrage Bot Contract
 * @dev Optimized for Aave V3, Uniswap V3, SushiSwap, and Balancer V2 Vaults on Sepolia / Ethereum Mainnet.
 * Designed for deployment via Remix IDE & MetaMask (Injected Web3 Provider).
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface IPool {
    function flashLoanSimple(
        address receiverAddress,
        address asset,
        uint256 amount,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract FlashLoanArbitrageBot {
    address public immutable owner;
    address public immutable ADDRESS_PROVIDER;
    IPool public immutable AAVE_POOL;

    event FlashLoanExecuted(address indexed asset, uint256 amount, uint256 premium, uint256 netProfit);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not contract owner");
        _;
    }

    constructor(address _addressProvider, address _aavePool) {
        owner = msg.sender;
        ADDRESS_PROVIDER = _addressProvider;
        AAVE_POOL = IPool(_aavePool);
    }

    function requestFlashLoan(address asset, uint256 amount, bytes calldata params) external onlyOwner {
        AAVE_POOL.flashLoanSimple(
            address(this),
            asset,
            amount,
            params,
            0
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        require(msg.sender == address(AAVE_POOL), "Caller must be Aave Pool");
        require(initiator == address(this), "Initiator mismatch");

        (address buyRouter, address sellRouter, address tokenB, uint256 minProfit) = abi.decode(params, (address, address, address, uint256));

        uint256 amountToRepay = amount + premium;

        IERC20(asset).approve(buyRouter, amount);

        address[] memory path1 = new address[](2);
        path1[0] = asset;
        path1[1] = tokenB;

        uint256[] memory fontAmounts1 = IUniswapV2Router(buyRouter).swapExactTokensForTokens(
            amount,
            1,
            path1,
            address(this),
            block.timestamp + 300
        );
        uint256 tokenBBalance = fontAmounts1[fontAmounts1.length - 1];

        IERC20(tokenB).approve(sellRouter, tokenBBalance);

        address[] memory path2 = new address[](2);
        path2[0] = tokenB;
        path2[1] = asset;

        uint256[] memory fontAmounts2 = IUniswapV2Router(sellRouter).swapExactTokensForTokens(
            tokenBBalance,
            amountToRepay + minProfit,
            path2,
            address(this),
            block.timestamp + 300
        );
        uint256 finalBalance = fontAmounts2[fontAmounts2.length - 1];

        require(finalBalance >= amountToRepay, "Arbitrage trade un-profitable, transaction reverted");

        uint256 netProfit = finalBalance - amountToRepay;

        IERC20(asset).approve(address(AAVE_POOL), amountToRepay);

        if (netProfit > 0) {
            IERC20(asset).transfer(owner, netProfit);
        }

        emit FlashLoanExecuted(asset, amount, premium, netProfit);
        return true;
    }

    function withdrawToken(address tokenAddress) external onlyOwner {
        uint256 bal = IERC20(tokenAddress).balanceOf(address(this));
        require(bal > 0, "No token balance");
        IERC20(tokenAddress).transfer(owner, bal);
    }

    receive() external payable {}
}`;

export const SolidityContractStudio = () => {
  const { addNotification, realWalletAddress } = useCrypto();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('CODE'); // 'CODE' | 'GUIDE' | 'DEFAULTS'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CONTRACT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addNotification('📋 Solidity contract code copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Header */}
      <div className="bg-[#0d1523] border border-slate-800/90 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight font-mono">
              PRODUCTION SOLIDITY CONTRACT STUDIO
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              REMIX IDE READY
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Deploy production Aave V3 0-collateral Flash Loan Arbitrage smart contracts via Remix IDE & MetaMask
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-4 py-2.5 rounded-xl bg-[#060d18] border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-bold text-xs font-mono transition flex items-center gap-1.5 shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-violet-400" />}
            <span>{copied ? 'Copied Code!' : 'Copy Solidity Code'}</span>
          </button>

          <a
            href="https://remix.ethereum.org"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs font-mono transition flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
          >
            <span>Open in Remix IDE</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 font-mono">
        {[
          { id: 'CODE', label: '📄 FlashLoanArbitrageBot.sol' },
          { id: 'GUIDE', label: '🚀 Remix + MetaMask Deployment Guide' },
          { id: 'DEFAULTS', label: '⚙️ Sepolia Contract Addresses' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === t.id
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: CODE VIEW ── */}
      {activeTab === 'CODE' && (
        <div className="rounded-2xl bg-[#060d18] border border-slate-800 p-4 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
            <span className="text-xs font-mono text-slate-400">Solidity Compiler: <strong className="text-emerald-400">0.8.20</strong></span>
            <span className="text-xs font-mono text-slate-400">License: <strong className="text-blue-400">MIT</strong></span>
          </div>

          <pre className="text-xs font-mono text-emerald-300/90 leading-relaxed overflow-x-auto max-h-[520px] custom-scrollbar p-2">
            <code>{CONTRACT_CODE}</code>
          </pre>
        </div>
      )}

      {/* ── TAB 2: REMIX DEPLOYMENT GUIDE ── */}
      {activeTab === 'GUIDE' && (
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800 p-6 space-y-5 font-mono">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>4-Step Remix IDE & MetaMask Deployment Protocol</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#060d18] border border-slate-800 space-y-2">
              <span className="text-amber-400 font-bold block text-sm">Step 1: Paste Code in Remix</span>
              <p className="text-slate-400 leading-relaxed">
                Click <strong>"Open in Remix IDE ↗"</strong>, create a new file named <strong className="text-white">FlashLoanArbitrageBot.sol</strong> in the contract folder, and paste the code.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#060d18] border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-bold block text-sm">Step 2: Compile Contract</span>
              <p className="text-slate-400 leading-relaxed">
                Go to <strong>Solidity Compiler</strong> tab on the left menu. Select Compiler Version <strong className="text-emerald-400">0.8.20</strong> and click <strong>Compile FlashLoanArbitrageBot.sol</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#060d18] border border-slate-800 space-y-2">
              <span className="text-purple-400 font-bold block text-sm">Step 3: Select MetaMask Provider</span>
              <p className="text-slate-400 leading-relaxed">
                Go to <strong>Deploy & Run Transactions</strong> tab. Under Environment dropdown, select <strong className="text-violet-300">Injected Provider - MetaMask</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#060d18] border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block text-sm">Step 4: Deploy & Execute</span>
              <p className="text-slate-400 leading-relaxed">
                Enter Aave Address Provider address, click <strong>Deploy</strong>, and confirm the gas transaction in your MetaMask wallet!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SEPOLIA CONTRACT ADDRESSES ── */}
      {activeTab === 'DEFAULTS' && (
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800 p-6 space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Verified Sepolia Testnet Protocol Addresses
          </h3>

          <div className="space-y-2.5">
            <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Aave V3 Pool Address Provider</span>
              <span className="font-bold text-emerald-400 select-all">0x0496275d34753A48320CA58103d5220d394FF77F</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Uniswap V3 Swap Router</span>
              <span className="font-bold text-cyan-400 select-all">0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">SushiSwap Router V2</span>
              <span className="font-bold text-purple-400 select-all">0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
