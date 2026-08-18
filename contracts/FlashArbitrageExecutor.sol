// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

interface IPool {
    function flashLoanSimple(address receiverAddress, address asset, uint256 amount, bytes calldata params, uint16 referralCode) external;
}

interface IUniswapV2Router {
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts);
}

interface IUniswapV3Router {
    struct ExactInputSingleParams { address tokenIn; address tokenOut; uint24 fee; address recipient; uint256 deadline; uint256 amountIn; uint256 amountOutMinimum; uint160 sqrtPriceLimitX96; }
    function exactInputSingle(ExactInputSingleParams calldata params) external returns (uint256 amountOut);
}

/**
 * @title FlashArbitrageExecutor
 * @notice Production Aave V3 flash loan arbitrage. Atomic borrow-swap-swap-repay.
 *         On-chain profit invariant: finalBalance >= repayment + minimumProfit.
 *         Reverts atomically if any safety condition fails.
 */
contract FlashArbitrageExecutor is ReentrancyGuard, Pausable, Ownable2Step {
    using SafeERC20 for IERC20;

    IPool public immutable AAVE_POOL;
    mapping(address => bool) public authorizedRouters;
    address public beneficiary;
    uint256 public minProfitBps = 10;
    uint256 public maxTradeSizeUsd = 250_000e6;
    uint256 public tradeCount;

    enum DexType { UniswapV2, UniswapV3 }

    struct ArbParams {
        uint256 tradeId;
        address asset;
        address dexARouter;
        DexType dexAType;
        address tokenMid;
        uint24  dexAFee;
        uint256 minOutA;
        address dexBRouter;
        DexType dexBType;
        uint24  dexBFee;
        uint256 minOutB;
        uint256 minNetProfit;
        uint256 deadline;
    }

    event FlashLoanStarted(uint256 indexed tradeId, address asset, uint256 amount, uint256 ts);
    event SwapExecuted(uint256 indexed tradeId, uint8 leg, address router, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event ArbitrageExecuted(uint256 indexed tradeId, uint256 borrowed, uint256 repaid, uint256 netProfit, address beneficiary, uint256 ts);
    event ArbitrageFailed(uint256 indexed tradeId, string reason, uint256 ts);
    event EmergencyStopped(address by, uint256 ts);
    event RouterAuthorized(address router, bool authorized);

    error Unauthorized(); error InvalidCaller(); error InvalidInitiator();
    error InvalidAsset(); error InvalidRouter(); error DeadlineExpired();
    error InsufficientProfit(uint256 actual, uint256 required);
    error ZeroAddress(); error TradeSizeExceeded();

    modifier onlyAavePool() { if (msg.sender != address(AAVE_POOL)) revert InvalidCaller(); _; }

    constructor(address _provider, address _beneficiary) Ownable2Step() {
        if (_provider == address(0) || _beneficiary == address(0)) revert ZeroAddress();
        AAVE_POOL = IPool(IPoolAddressesProvider(_provider).getPool());
        beneficiary = _beneficiary;
    }

    function executeFlashArbitrage(address asset, uint256 amount, bytes calldata params)
        external onlyOwner nonReentrant whenNotPaused {
        if (amount == 0 || amount > maxTradeSizeUsd) revert TradeSizeExceeded();
        tradeCount++;
        emit FlashLoanStarted(tradeCount, asset, amount, block.timestamp);
        AAVE_POOL.flashLoanSimple(address(this), asset, amount, params, 0);
    }

    function executeOperation(address asset, uint256 amount, uint256 premium, address initiator, bytes calldata params)
        external onlyAavePool nonReentrant returns (bool) {
        if (initiator != address(this)) revert InvalidInitiator();
        ArbParams memory arb = abi.decode(params, (ArbParams));
        if (arb.asset != asset) revert InvalidAsset();
        if (block.timestamp > arb.deadline) { emit ArbitrageFailed(arb.tradeId, "Deadline", block.timestamp); revert DeadlineExpired(); }
        if (!authorizedRouters[arb.dexARouter]) revert InvalidRouter();
        if (!authorizedRouters[arb.dexBRouter]) revert InvalidRouter();

        // Leg 1: asset -> mid on DEX A
        uint256 midAmount = _swap(arb.tradeId, 1, arb.dexARouter, arb.dexAType, asset, arb.tokenMid, amount, arb.minOutA, arb.dexAFee, arb.deadline);
        // Leg 2: mid -> asset on DEX B
        _swap(arb.tradeId, 2, arb.dexBRouter, arb.dexBType, arb.tokenMid, asset, midAmount, arb.minOutB, arb.dexBFee, arb.deadline);

        uint256 repay = amount + premium;
        uint256 bal = IERC20(asset).balanceOf(address(this));
        if (bal < repay + arb.minNetProfit) {
            emit ArbitrageFailed(arb.tradeId, "Insufficient profit", block.timestamp);
            revert InsufficientProfit(bal > repay ? bal - repay : 0, arb.minNetProfit);
        }

        IERC20(asset).safeApprove(address(AAVE_POOL), repay);
        uint256 profit = bal - repay;
        if (profit > 0) IERC20(asset).safeTransfer(beneficiary, profit);

        emit ArbitrageExecuted(arb.tradeId, amount, repay, profit, beneficiary, block.timestamp);
        return true;
    }

    function _swap(uint256 tid, uint8 leg, address router, DexType dt, address tIn, address tOut, uint256 aIn, uint256 minOut, uint24 fee, uint256 dl) internal returns (uint256 out) {
        IERC20(tIn).safeApprove(router, aIn);
        if (dt == DexType.UniswapV3) {
            out = IUniswapV3Router(router).exactInputSingle(IUniswapV3Router.ExactInputSingleParams(tIn, tOut, fee, address(this), dl, aIn, minOut, 0));
        } else {
            address[] memory path = new address[](2); path[0] = tIn; path[1] = tOut;
            uint256[] memory amts = IUniswapV2Router(router).swapExactTokensForTokens(aIn, minOut, path, address(this), dl);
            out = amts[amts.length - 1];
        }
        IERC20(tIn).safeApprove(router, 0);
        emit SwapExecuted(tid, leg, router, tIn, tOut, aIn, out);
    }

    function authorizeRouter(address r, bool auth) external onlyOwner { if (r == address(0)) revert ZeroAddress(); authorizedRouters[r] = auth; emit RouterAuthorized(r, auth); }
    function setBeneficiary(address b) external onlyOwner { if (b == address(0)) revert ZeroAddress(); beneficiary = b; }
    function setMinProfitBps(uint256 bps) external onlyOwner { minProfitBps = bps; }
    function emergencyStop() external onlyOwner { _pause(); emit EmergencyStopped(msg.sender, block.timestamp); }
    function resume() external onlyOwner { _unpause(); }
    function emergencyWithdraw(address token, uint256 amt) external onlyOwner {
        if (token == address(0)) payable(owner()).transfer(amt);
        else IERC20(token).safeTransfer(owner(), amt);
    }
    receive() external payable {}
}
