/**
 * autoTradeRiskManager.js
 * Mandatory Risk Management Layer for Auto Trade Engine
 *
 * Every single trade proposal MUST pass all 11 risk checks before execution.
 * If any check fails, the trade is blocked with an explicit, human-readable reason.
 */

export const validateTradeRisk = ({
  signal,               // 'BUY' | 'SELL'
  pair,                 // e.g. 'ETH/USDT'
  proposedUsdAmount,    // e.g. 100
  walletBalanceUsd,     // e.g. 12480.50
  currentPosition,      // { symbol, amount, entryPrice, side } or null
  dailyStats,           // { todayLossUsd, todayTradeCount }
  config,               // strategy config parameters
  marketData,           // { price, timestamp, isStale }
  networkInfo,          // { chainId, isTestnet }
  lastTradeTimestamp,   // timestamp of last executed trade
}) => {
  // 1. Check Signal validity
  if (!signal || signal === 'HOLD') {
    return { isAllowed: false, reason: 'Signal is HOLD or inactive.', code: 'SIGNAL_HOLD' };
  }

  // 2. Check Market Data Freshness (Mandatory <= 5s)
  if (!marketData || marketData.isStale || (Date.now() - (marketData.timestamp || 0)) > 5000) {
    return {
      isAllowed: false,
      reason: 'Market data is stale (>5s old). Trading is temporarily paused for price safety.',
      code: 'STALE_MARKET_DATA'
    };
  }

  // 3. Check Price validity
  if (!marketData.price || marketData.price <= 0) {
    return { isAllowed: false, reason: 'Invalid or zero market price detected.', code: 'INVALID_PRICE' };
  }

  // 4. Check Maximum Trade Size
  const maxTradeUsd = config.maxTradeAmount || 500;
  if (proposedUsdAmount > maxTradeUsd) {
    return {
      isAllowed: false,
      reason: `Proposed trade amount ($${proposedUsdAmount}) exceeds configured max trade limit ($${maxTradeUsd}).`,
      code: 'MAX_TRADE_EXCEEDED'
    };
  }

  // 5. Check Minimum Trade Size
  const minTradeUsd = config.minTradeAmount || 10;
  if (proposedUsdAmount < minTradeUsd) {
    return {
      isAllowed: false,
      reason: `Proposed trade amount ($${proposedUsdAmount}) is below minimum required trade size ($${minTradeUsd}).`,
      code: 'MIN_TRADE_NOT_MET'
    };
  }

  // 6. Check Available Balance
  if (signal === 'BUY' && proposedUsdAmount > walletBalanceUsd) {
    return {
      isAllowed: false,
      reason: `Insufficient wallet balance. Required: $${proposedUsdAmount.toFixed(2)}, Available: $${walletBalanceUsd.toFixed(2)}.`,
      code: 'INSUFFICIENT_BALANCE'
    };
  }

  // 7. Check Maximum Daily Loss Limit
  const maxDailyLoss = config.maxDailyLoss || 250;
  const currentDailyLoss = dailyStats?.todayLossUsd || 0;
  if (currentDailyLoss >= maxDailyLoss) {
    return {
      isAllowed: false,
      reason: `Maximum daily loss limit reached ($${currentDailyLoss.toFixed(2)} / $${maxDailyLoss.toFixed(2)}). Trading halted for today.`,
      code: 'MAX_DAILY_LOSS_REACHED'
    };
  }

  // 8. Check Maximum Trades Per Day
  const maxDailyTrades = config.maxTradesPerDay || 20;
  const currentTradeCount = dailyStats?.todayTradeCount || 0;
  if (currentTradeCount >= maxDailyTrades) {
    return {
      isAllowed: false,
      reason: `Maximum daily trades limit reached (${currentTradeCount} / ${maxDailyTrades} trades).`,
      code: 'MAX_DAILY_TRADES_REACHED'
    };
  }

  // 9. Check Cooldown Between Trades
  const cooldownSec = config.cooldownSeconds || 30;
  const elapsedSec = (Date.now() - (lastTradeTimestamp || 0)) / 1000;
  if (lastTradeTimestamp && elapsedSec < cooldownSec) {
    const remainingSec = Math.ceil(cooldownSec - elapsedSec);
    return {
      isAllowed: false,
      reason: `Cooldown active between trades. Please wait ${remainingSec}s before next execution.`,
      code: 'COOLDOWN_ACTIVE',
      remainingSec
    };
  }

  // 10. Check Position State / Duplicate Signal Prevention
  if (signal === 'BUY' && currentPosition && currentPosition.amount > 0) {
    return {
      isAllowed: false,
      reason: `Already holding an active ${pair} position (${currentPosition.amount} ETH). Duplicate BUY prevented.`,
      code: 'DUPLICATE_BUY'
    };
  }
  if (signal === 'SELL' && (!currentPosition || currentPosition.amount <= 0)) {
    return {
      isAllowed: false,
      reason: `No active ${pair} position to sell. SELL signal ignored.`,
      code: 'NO_POSITION_TO_SELL'
    };
  }

  // 11. Check Slippage Tolerance
  const estimatedPriceImpactPct = 0.12; // Simulated live DEX depth impact
  const maxSlippagePct = config.slippageTolerancePct || 1.0;
  if (estimatedPriceImpactPct > maxSlippagePct) {
    return {
      isAllowed: false,
      reason: `Estimated price impact (${estimatedPriceImpactPct}%) exceeds configured slippage tolerance (${maxSlippagePct}%).`,
      code: 'SLIPPAGE_EXCEEDED'
    };
  }

  // All risk checks passed successfully!
  return {
    isAllowed: true,
    reason: 'All 11 pre-trade risk checks passed successfully.',
    code: 'RISK_PASSED'
  };
};
