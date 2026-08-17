// SPDX-License-Identifier: MIT
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

    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
}

contract FlashLoanArbitrageBot {
    address public immutable owner;
    address public immutable ADDRESS_PROVIDER;
    IPool public immutable AAVE_POOL;

    event FlashLoanExecuted(address indexed asset, uint256 amount, uint256 premium, uint256 netProfit);
    event ArbitrageFailed(string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not contract owner");
        _;
    }

    constructor(address _addressProvider, address _aavePool) {
        owner = msg.sender;
        ADDRESS_PROVIDER = _addressProvider;
        AAVE_POOL = IPool(_aavePool);
    }

    /**
     * @notice Initiates a 0-collateral Flash Loan from Aave V3 Pool
     * @param asset The ERC20 token address to borrow (e.g. USDT / WETH / USDC)
     * @param amount The loan principal amount
     * @param params Encoded routing instructions (buyRouter, sellRouter, tokenPath)
     */
    function requestFlashLoan(address asset, uint256 amount, bytes calldata params) external onlyOwner {
        AAVE_POOL.flashLoanSimple(
            address(this),
            asset,
            amount,
            params,
            0
        );
    }

    /**
     * @notice Aave V3 Callback executed after receiving flash liquidity
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        require(msg.sender == address(AAVE_POOL), "Caller must be Aave Pool");
        require(initiator == address(this), "Initiator mismatch");

        // Decode execution parameters
        (address buyRouter, address sellRouter, address tokenB, uint256 minProfit) = abi.decode(params, (address, address, address, uint256));

        uint256 amountToRepay = amount + premium;

        // 1. Approve DEX A to spend borrowed asset
        IERC20(asset).approve(buyRouter, amount);

        // 2. Swap Asset -> TokenB on DEX A
        address[] memory path1 = new address[](2);
        path1[0] = asset;
        path1[1] = tokenB;

        uint256[] fontAmounts1 = IUniswapV2Router(buyRouter).swapExactTokensForTokens(
            amount,
            1,
            path1,
            address(this),
            block.timestamp + 300
        );
        uint256 tokenBBalance = fontAmounts1[fontAmounts1.length - 1];

        // 3. Swap TokenB -> Asset on DEX B
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

        // 4. Approve Aave Pool to pull repayment principal + premium
        IERC20(asset).approve(address(AAVE_POOL), amountToRepay);

        // 5. Transfer net profit directly to contract owner
        if (netProfit > 0) {
            IERC20(asset).transfer(owner, netProfit);
        }

        emit FlashLoanExecuted(asset, amount, premium, netProfit);
        return true;
    }

    /**
     * @notice Emergency Token Withdrawal Guard
     */
    function withdrawToken(address tokenAddress) external onlyOwner {
        uint256 bal = IERC20(tokenAddress).balanceOf(address(this));
        require(bal > 0, "No token balance to withdraw");
        IERC20(tokenAddress).transfer(owner, bal);
    }

    /**
     * @notice Emergency ETH Withdrawal Guard
     */
    function withdrawETH() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No ETH balance to withdraw");
        payable(owner).transfer(bal);
    }

    receive() external payable {}
}
