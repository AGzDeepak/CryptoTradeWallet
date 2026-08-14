import React, { useState } from 'react';
import { ArrowDownLeft, ShieldCheck, Zap, Wallet, ExternalLink, CheckCircle2, Clock, DollarSign } from 'lucide-react';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const PRESET_THRESHOLDS = [10, 25, 50, 100, 250];

export const InbuiltWithdrawalCard = ({
  autoWithdrawEnabled,
  setAutoWithdrawEnabled,
  autoWithdrawAddress,
  setAutoWithdrawAddress,
  autoWithdrawThreshold,
  setAutoWithdrawThreshold,
  autoWithdrawLogs = [],
  realWalletAddress,
  availableBalanceUsd = 12480.50,
  onExecuteManualWithdraw,
  addNotification
}) => {
  const [manualAmount, setManualAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleUseConnectedWallet = () => {
    if (realWalletAddress) {
      setAutoWithdrawAddress(realWalletAddress);
      if (addNotification) addNotification(`✅ Target Address set to MetaMask: ${realWalletAddress.substring(0, 10)}...`, 'success');
    }
  };

  const handleManualWithdrawSubmit = async (e) => {
    e?.preventDefault();
    const amt = parseFloat(manualAmount);
    if (!amt || amt <= 0) {
      if (addNotification) addNotification('Enter a valid withdrawal amount.', 'warning');
      return;
    }
    if (amt > availableBalanceUsd) {
      if (addNotification) addNotification(`Amount exceeds available balance ($${fmt(availableBalanceUsd)}).`, 'warning');
      return;
    }

    setIsWithdrawing(true);
    try {
      if (onExecuteManualWithdraw) {
        await onExecuteManualWithdraw(amt, autoWithdrawAddress);
      }
      setManualAmount('');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Inbuilt Automated Profit Withdrawal Gateway</h3>
            <p className="text-[11px] text-slate-400">Automate profit transfers directly to your EVM wallet when trade settles</p>
          </div>
        </div>

        {/* Auto Withdrawal Toggle */}
        <div className="flex items-center gap-2 bg-[#060d18] px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-300">AUTO-WITHDRAW</span>
          <button
            type="button"
            onClick={() => setAutoWithdrawEnabled(!autoWithdrawEnabled)}
            className={`w-12 h-6 rounded-full transition-colors duration-300 relative p-0.5 flex items-center shadow-inner ${
              autoWithdrawEnabled ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-300 ${
                autoWithdrawEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Left: Settings Form */}
        <div className="space-y-4">
          {/* Target EVM Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">Target EVM Withdrawal Address</label>
              {realWalletAddress && (
                <button
                  type="button"
                  onClick={handleUseConnectedWallet}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-bold transition flex items-center gap-1"
                >
                  Use Connected MetaMask ↗
                </button>
              )}
            </div>
            <input
              type="text"
              value={autoWithdrawAddress}
              onChange={(e) => setAutoWithdrawAddress(e.target.value)}
              placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d7B41"
              className="w-full bg-[#060d18] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Profit Trigger Threshold */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">Automated Withdrawal Profit Threshold</label>
              <span className="text-xs font-bold text-emerald-400 font-mono">${fmt(autoWithdrawThreshold)} USDT</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_THRESHOLDS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAutoWithdrawThreshold(amt)}
                  className={`py-1.5 rounded-lg text-xs font-bold border font-mono transition ${
                    autoWithdrawThreshold === amt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-[#060d18] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              * Whenever a trade closes with profit {'>='} ${autoWithdrawThreshold}, the profits will automatically transfer to your wallet.
            </p>
          </div>

          {/* Instant Manual Withdrawal Section */}
          <form onSubmit={handleManualWithdrawSubmit} className="p-3.5 rounded-xl bg-[#060d18] border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Instant Manual Withdrawal</span>
              <span className="text-[11px] text-slate-400">Available: ${fmt(availableBalanceUsd)}</span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-full bg-[#0d1523] border border-slate-700/60 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isWithdrawing}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shrink-0 flex items-center gap-1 shadow-md shadow-emerald-500/20"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw Now'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Automated Withdrawal Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Automated Withdrawal Receipts</h4>
            <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
              LIVE BROADCAST
            </span>
          </div>

          <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
            {autoWithdrawLogs.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#060d18] border border-slate-800/80 text-center text-slate-500 text-xs font-mono">
                No automated withdrawals executed yet. Settled trade profits will be broadcast here.
              </div>
            ) : (
              autoWithdrawLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-[#060d18] border border-slate-800/80 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> +${fmt(log.amount)} {log.currency}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[180px]">To: {log.address}</span>
                    <span className="text-violet-400">{log.network}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Tx: <a href={`https://sepolia.etherscan.io/tx/${log.txHash}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white underline">{log.txHash}</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
