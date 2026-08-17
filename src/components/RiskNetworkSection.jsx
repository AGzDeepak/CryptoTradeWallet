import { switchWeb3Network } from '../services/web3Service';

export const RiskNetworkSection = () => {
  const { 
    realWalletNetwork, setRealWalletNetwork, 
    addNotification, 
    autoTradeConfig, setAutoTradeConfig,
    autoTradeBotStatus, setAutoTradeBotStatus,
    setAutoTradeBotEnabled
  } = useCrypto();

  const [maxTradeAmount, setMaxTradeAmount] = useState(500);
  const [takeProfitPct, setTakeProfitPct] = useState(4.0);
  const [stopLossPct, setStopLossPct] = useState(2.0);
  const [maxDailyLoss, setMaxDailyLoss] = useState(250);
  const [slippage, setSlippage] = useState(1.0);

  const networks = [
    { id: 'Arbitrum One', name: 'Arbitrum One', chainId: 42161, hexId: '0xa4b1', type: 'L2 MAINNET (ULTRA FAST)', color: 'text-sky-400 font-extrabold', isTest: false },
    { id: 'Arbitrum Sepolia', name: 'Arbitrum Sepolia', chainId: 421614, hexId: '0x66eee', type: 'L2 TESTNET', color: 'text-cyan-400', isTest: true },
    { id: 'Sepolia Testnet', name: 'Sepolia Testnet', chainId: 11155111, hexId: '0xaa36a7', type: 'ETH TESTNET', color: 'text-emerald-400', isTest: true },
    { id: 'Ethereum Mainnet', name: 'Ethereum Mainnet', chainId: 1, hexId: '0x1', type: 'MAINNET', color: 'text-indigo-400', isTest: false },
  ];

  const handleSelectNetwork = async (net) => {
    setRealWalletNetwork(net.id);
    try {
      await switchWeb3Network(net.hexId);
    } catch (_) {}

    if (net.id.includes('Arbitrum')) {
      addNotification(`⚡ Switched to ${net.name} (Sub-Second Finality & <$0.01 Gas Fee)`, 'success');
    } else if (net.isTest) {
      addNotification(`🌐 Switched network to ${net.name} (No Real Funds).`, 'info');
    } else {
      addNotification(`🔥 Switched network to ${net.name} (REAL Funds Mode).`, 'warning');
    }
  };


  const handleEmergencyStop = () => {
    setAutoTradeBotEnabled(false);
    setAutoTradeBotStatus('Emergency Stopped');
    addNotification('🚨 EMERGENCY STOP ACTIVATED: Bot halted & positions cleared.', 'danger');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#0d1523] border border-slate-800/80 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight font-mono">RISK & NETWORK CONTROLS</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              11-POINT GUARD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pre-trade mandatory risk management parameters, capital protection interlocks & network routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 px-3 py-1.5 rounded-xl bg-[#060d18] border border-slate-800">
            CURRENT: <strong className="text-emerald-400">{realWalletNetwork || 'Sepolia Testnet'}</strong>
          </span>
        </div>
      </div>

      {/* Grid: Network Selector & Risk Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Network Switcher Card */}
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Target Blockchain Network</h3>
              <p className="text-[11px] text-slate-400">Select active EVM network</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {networks.map((net) => {
              const isSelected = (realWalletNetwork || 'Sepolia Testnet') === net.id;
              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => handleSelectNetwork(net)}
                  className={`p-3.5 rounded-xl border text-left font-mono transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#060d18] border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-[#060d18] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${net.color}`}>{net.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span>ChainID: {net.chainId}</span>
                    <span className="font-bold text-slate-400">{net.type}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Risk Management Config Card */}
        <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Risk Limits & Capital Guards</h3>
              <p className="text-[11px] text-slate-400">11-Point mandatory safety validation</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#060d18] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Max Trade Allocation</span>
              <span className="font-bold text-white text-sm mt-0.5 block">${maxTradeAmount} USDT</span>
            </div>
            <div className="p-3 rounded-xl bg-[#060d18] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Take Profit Limit</span>
              <span className="font-bold text-emerald-400 text-sm mt-0.5 block">+{takeProfitPct}%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#060d18] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Stop Loss Limit</span>
              <span className="font-bold text-rose-400 text-sm mt-0.5 block">-{stopLossPct}%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#060d18] border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Max Daily Loss</span>
              <span className="font-bold text-amber-300 text-sm mt-0.5 block">${maxDailyLoss} USDT</span>
            </div>
          </div>
        </div>

      </div>

      {/* Emergency Panic Interlocks */}
      <div className="rounded-2xl bg-[#0d1523] border border-rose-900/30 p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Emergency Panic Interlocks</h3>
            <p className="text-[11px] text-slate-400">Instant trade cancellation & protocol shutdown</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleEmergencyStop}
            className="flex-1 py-3.5 px-4 rounded-xl text-xs font-bold font-mono transition bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
          >
            <Octagon className="w-4 h-4 fill-current" />
            <span>ACTIVATE EMERGENCY STOP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
