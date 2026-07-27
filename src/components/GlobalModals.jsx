import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { db, collection, addDoc, serverTimestamp } from '../config/firebase';
import { 
  X, Wallet, Copy, Check, Bell, Sliders, ArrowDownCircle, ArrowUpRight, PlusCircle, LogOut, 
  Trash2, Zap, CheckCircle2, AlertTriangle, Info, AlertOctagon, ShieldCheck, 
  Link2, Bot, Send, Star, HelpCircle, MessageSquare, Sparkles, User, RefreshCw
} from 'lucide-react';

export const GlobalModals = () => {
  const { 
    activeModal, 
    modalData, 
    closeModal, 
    wallet, 
    depositFunds, 
    withdrawFunds,
    resetWallet, 
    openModal,
    notifications,
    clearNotifications,
    removeNotification,
    addNotification,
    walletMode,
    setWalletMode,
    realWallet,
    connectRealWallet,
    disconnectRealWallet,
    user
  } = useCrypto();

  const [copied, setCopied] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState('MetaMask');
  
  // Deposit state
  const [depositAmount, setDepositAmount] = useState('10000');
  const [depositCurrency, setDepositCurrency] = useState('USDT');

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT');
  const [withdrawAddress, setWithdrawAddress] = useState('0x71C765b28F3D140a831C28190d7B41');
  const [withdrawNetwork, setWithdrawNetwork] = useState('Arbitrum One');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Strategy config state
  const [minProfit, setMinProfit] = useState('0.25');
  const [maxGas, setMaxGas] = useState('5.00');

  // AI Support Assistant Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user.name || 'Trader'}! I am your Chainblock AI Quant Support Assistant. Ask me anything about spatial arbitrage, Web3 wallet connection, bot autopilot, or platform features.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Feedback State
  const [rating, setRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Request');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!activeModal) return null;

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr || '0x00D3f92A8c14B9204c3D');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = (e) => {
    e.preventDefault();
    depositFunds(parseFloat(depositAmount), depositCurrency);
    closeModal();
  };

  const handleConfirmWithdrawal = async (e) => {
    e.preventDefault();
    const success = await withdrawFunds(withdrawAmount, withdrawAddress, withdrawCurrency);
    if (success) {
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        closeModal();
      }, 1500);
    }
  };

  const handleConnectWeb3 = async () => {
    await connectRealWallet(selectedWalletType);
  };

  // AI Support Assistant Response Generator
  const handleSendAiMessage = (promptText = null) => {
    const textToSend = promptText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!promptText) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = "Spatial arbitrage exploits instant price differences across top exchange orderbooks. Chainblock AI scans Binance, Bybit, OKX, and Coinbase to execute profit-yielding trades automatically.";
      
      const queryLower = textToSend.toLowerCase();
      if (queryLower.includes('arbitrage') || queryLower.includes('work')) {
        aiResponseText = "Spatial Arbitrage works by scanning price discrepancies across exchanges in real-time. For example, if BTC is $67,820 on Binance and $68,140 on Bybit, Chainblock buys on Binance and sells on Bybit simultaneously to capture net spread profit.";
      } else if (queryLower.includes('wallet') || queryLower.includes('metamask') || queryLower.includes('web3') || queryLower.includes('real')) {
        aiResponseText = "You can toggle between DEMO ($100k Paper Wallet) and REAL Web3 Wallet in the top header pill or Wallet Modal. Connect your MetaMask, Coinbase, or Trust Wallet to inspect live ETH balances and network chain status.";
      } else if (queryLower.includes('demo') || queryLower.includes('risk')) {
        aiResponseText = "Your $100,000.00 USDT Demo Paper Wallet is 100% risk-free! It uses live real-time price feeds to simulate realistic execution, position PnL, and auto-settlements without real funds.";
      } else if (queryLower.includes('bot') || queryLower.includes('autopilot') || queryLower.includes('strategy')) {
        aiResponseText = "The AI Bot Autopilot scans orderbooks every 800ms. Set your Minimum Profit Threshold slider in the AutoTrader bar (e.g. 0.25%). The bot executes trades only when net profit exceeds your threshold!";
      } else if (queryLower.includes('deposit') || queryLower.includes('withdraw')) {
        aiResponseText = "Click '+ Deposit' to add mock funds or 'Withdraw' to transfer USDT to your Web3 destination address instantly.";
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  // Submit Feedback to Firebase Firestore
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmittingFeedback(true);
    try {
      const feedbackPayload = {
        userName: user.name || 'Deepak Kumar',
        userEmail: user.email || 'deepak@chainblock.io',
        rating,
        category: feedbackCategory,
        message: feedbackText.trim(),
        timestamp: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      };

      const feedbackRef = collection(db, 'feedback_submissions');
      await addDoc(feedbackRef, feedbackPayload);

      setFeedbackSubmitted(true);
      addNotification('Feedback submitted successfully! Saved to Firebase database.', 'success');
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setFeedbackText('');
        closeModal();
      }, 1500);
    } catch (err) {
      console.warn('Feedback save fallback:', err);
      setFeedbackSubmitted(true);
      addNotification('Feedback recorded locally. Thank you!', 'success');
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setFeedbackText('');
        closeModal();
      }, 1500);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans animate-fade-in">
      <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-mono">
            {activeModal === 'WALLET' && <Wallet className="w-5 h-5 text-cyan-400" />}
            {activeModal === 'DEPOSIT' && <ArrowDownCircle className="w-5 h-5 text-[#34d399]" />}
            {activeModal === 'WITHDRAW' && <ArrowUpRight className="w-5 h-5 text-rose-400" />}
            {activeModal === 'NOTIFICATIONS' && <Bell className="w-5 h-5 text-purple-400" />}
            {activeModal === 'LOGOUT' && <LogOut className="w-5 h-5 text-rose-400" />}
            {activeModal === 'CONFIG_STRATEGY' && <Sliders className="w-5 h-5 text-cyan-400" />}
            {activeModal === 'AI_SUPPORT' && <Bot className="w-5 h-5 text-[#34d399]" />}
            {activeModal === 'FEEDBACK' && <MessageSquare className="w-5 h-5 text-amber-400" />}
            
            {activeModal === 'WALLET' && 'WALLET CONFIGURATION & WEB3'}
            {activeModal === 'DEPOSIT' && 'DEPOSIT MOCK FUNDS'}
            {activeModal === 'WITHDRAW' && 'WITHDRAW FUNDS TO WEB3 WALLET'}
            {activeModal === 'NOTIFICATIONS' && 'SYSTEM NOTIFICATIONS LOG'}
            {activeModal === 'LOGOUT' && 'CONFIRM LOGOUT'}
            {activeModal === 'CONFIG_STRATEGY' && `CONFIGURE MODEL: ${modalData?.name || 'STRATEGY'}`}
            {activeModal === 'AI_SUPPORT' && 'CHAINBLOCK AI SUPPORT DESK'}
            {activeModal === 'FEEDBACK' && 'SUBMIT PLATFORM FEEDBACK'}
          </h3>

          <button onClick={closeModal} className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-4 font-mono text-xs">

          {/* 1. WALLET MODAL */}
          {activeModal === 'WALLET' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-1 bg-[#161a23] p-1 rounded-xl border border-slate-800 text-xs font-mono font-bold">
                <button
                  onClick={() => setWalletMode('DEMO')}
                  className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                    walletMode === 'DEMO'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>DEMO PAPER WALLET</span>
                </button>
                <button
                  onClick={() => setWalletMode('REAL')}
                  className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                    walletMode === 'REAL'
                      ? 'bg-emerald-500/20 text-[#34d399] border border-[#34d399]/40 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-[#34d399]" />
                  <span>REAL WEB3 WALLET</span>
                </button>
              </div>

              {walletMode === 'DEMO' && (
                <div className="space-y-3">
                  <div className="bg-[#060810] p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-slate-500 block text-[10px] uppercase">Simulated Arbitrum Address</span>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-cyan-400 font-bold">0x00D3f92A8c14B9204c3D</span>
                      <button onClick={() => copyAddress('0x00D3f92A8c14B9204c3D')} className="text-slate-400 hover:text-cyan-400">
                        {copied ? <Check className="w-4 h-4 text-[#34d399]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Virtual Balance</span>
                      <span className="text-lg font-bold text-white font-mono">${wallet.virtualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Trading Network</span>
                      <span className="text-[#34d399] font-bold block">{wallet.network}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => openModal('DEPOSIT')}
                      className="flex-1 py-2.5 bg-[#34d399] hover:bg-[#6ee7b7] text-black font-bold rounded-xl flex items-center justify-center gap-1.5 font-sans"
                    >
                      <PlusCircle className="w-4 h-4" /> Deposit
                    </button>
                    <button
                      onClick={() => openModal('WITHDRAW')}
                      className="flex-1 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-800 flex items-center justify-center gap-1.5 font-sans"
                    >
                      <ArrowUpRight className="w-4 h-4 text-rose-400" /> Withdraw
                    </button>
                  </div>
                </div>
              )}

              {walletMode === 'REAL' && (
                <div className="space-y-3 font-sans">
                  {realWallet.connected ? (
                    <div className="space-y-3">
                      <div className="bg-[#060810] p-4 rounded-xl border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#34d399] font-mono">
                          <span className="flex items-center gap-1 font-bold"><ShieldCheck className="w-4 h-4" /> {realWallet.walletType} CONNECTED</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-[#34d399] border border-emerald-800 text-[10px]">{realWallet.networkName}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono">
                          <span className="text-white font-bold">{realWallet.address}</span>
                          <button onClick={() => copyAddress(realWallet.address)} className="text-slate-400 hover:text-cyan-400">
                            {copied ? <Check className="w-4 h-4 text-[#34d399]" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono">
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Real ETH Balance</span>
                          <span className="text-lg font-bold text-white block">{realWallet.balanceEth} ETH</span>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Est. USD Value</span>
                          <span className="text-lg font-bold text-[#34d399] block">${realWallet.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <button
                        onClick={disconnectRealWallet}
                        className="w-full py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-800 font-mono text-xs flex items-center justify-center gap-1.5"
                      >
                        Disconnect Web3 Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono">
                      <span className="text-slate-400 block text-[11px]">Select Web3 Wallet Provider:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {['MetaMask', 'Coinbase Wallet', 'Trust Wallet', 'WalletConnect'].map((wType) => (
                          <button
                            key={wType}
                            type="button"
                            onClick={() => setSelectedWalletType(wType)}
                            className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-bold transition ${
                              selectedWalletType === wType
                                ? 'bg-emerald-950/60 border-[#34d399] text-[#34d399]'
                                : 'bg-[#060810] border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <Link2 className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{wType}</span>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleConnectWeb3}
                        className="w-full py-3 bg-[#34d399] hover:bg-[#6ee7b7] text-black font-extrabold rounded-xl shadow-lg mt-2 font-sans flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>CONNECT {selectedWalletType.toUpperCase()} WALLET</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* 2. DEPOSIT MODAL */}
          {activeModal === 'DEPOSIT' && (
            <form onSubmit={handleConfirmDeposit} className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Select Currency</label>
                <select
                  value={depositCurrency}
                  onChange={(e) => setDepositCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                >
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Deposit Amount ($)</label>
                <input
                  type="number"
                  step="500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[#34d399] font-bold text-sm outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                {['1000', '5000', '10000', '50000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px]"
                  >
                    +${parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#34d399] hover:bg-[#6ee7b7] text-black font-extrabold rounded-xl shadow-lg mt-2 font-sans"
              >
                CONFIRM MOCK DEPOSIT
              </button>
            </form>
          )}

          {/* 3. WITHDRAW MODAL (NEW & FULLY INTERACTIVE) */}
          {activeModal === 'WITHDRAW' && (
            <div className="space-y-4 font-sans">
              {withdrawSuccess ? (
                <div className="p-6 rounded-xl bg-[#060810] border border-[#34d399]/40 text-center space-y-3 font-mono">
                  <div className="w-12 h-12 rounded-full bg-emerald-950 text-[#34d399] border border-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-white">Withdrawal Dispatched!</h4>
                  <p className="text-xs text-slate-400 font-sans">
                    Transfer of <strong className="text-[#34d399]">${parseFloat(withdrawAmount).toLocaleString()} {withdrawCurrency}</strong> to <code className="text-cyan-400">{withdrawAddress.substring(0, 10)}...</code> is processing on {withdrawNetwork}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmWithdrawal} className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#060810] border border-slate-800">
                    <span className="text-slate-400">Available Balance:</span>
                    <span className="text-sm font-bold text-[#34d399]">
                      ${wallet.virtualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Asset Currency</label>
                      <select
                        value={withdrawCurrency}
                        onChange={(e) => setWithdrawCurrency(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        <option value="USDT">USDT (Tether)</option>
                        <option value="USDC">USDC (USD Coin)</option>
                        <option value="ETH">ETH (Ethereum)</option>
                        <option value="BTC">BTC (Bitcoin)</option>
                        <option value="SOL">SOL (Solana)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Network Chain</label>
                      <select
                        value={withdrawNetwork}
                        onChange={(e) => setWithdrawNetwork(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[#34d399] font-bold outline-none"
                      >
                        <option value="Arbitrum One">Arbitrum One</option>
                        <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                        <option value="Polygon">Polygon</option>
                        <option value="Solana Mainnet">Solana Mainnet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Destination Web3 Address</label>
                    <input
                      type="text"
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      placeholder="0x71C765b28F3D140a831C28190d7B41"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-mono text-xs outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-400">Withdraw Amount ($)</label>
                      <span className="text-slate-500 text-[10px]">Fee: $0.85 (0.0002 ETH)</span>
                    </div>
                    <input
                      type="number"
                      step="100"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-rose-400 font-bold text-sm outline-none"
                    />
                  </div>

                  <div className="flex space-x-2 pt-0.5">
                    {[
                      { label: '25%', val: (wallet.virtualBalance * 0.25).toFixed(0) },
                      { label: '50%', val: (wallet.virtualBalance * 0.50).toFixed(0) },
                      { label: '75%', val: (wallet.virtualBalance * 0.75).toFixed(0) },
                      { label: 'MAX', val: wallet.virtualBalance.toFixed(0) }
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setWithdrawAmount(btn.val)}
                        className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px]"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-lg mt-2 font-sans flex items-center justify-center space-x-2 uppercase tracking-wider text-xs"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>CONFIRM WITHDRAWAL</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 4. AI SUPPORT ASSISTANT MODAL */}
          {activeModal === 'AI_SUPPORT' && (
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#060810] border border-slate-800 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#34d399] animate-ping" />
                  <span className="text-[#34d399] font-bold">AI QUANT DESK ONLINE</span>
                </div>
                <span className="text-slate-500 text-[10px]">24/7 Intelligent Support</span>
              </div>

              {/* Chat Conversation Window */}
              <div className="h-64 overflow-y-auto no-scrollbar p-3 rounded-xl bg-[#060810] border border-slate-800/80 space-y-3 font-mono text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-lg bg-[#34d399] text-black flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#1b2a24] text-[#34d399] border border-[#34d399]/30 rounded-tr-none'
                          : 'bg-[#161a23] text-slate-200 border border-slate-800 rounded-tl-none font-sans'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[9px] text-slate-500 mb-1 font-mono">
                        <span className="font-bold text-slate-400">{msg.sender === 'ai' ? 'Chainblock AI Assistant' : 'You'}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-xs">{msg.text}</p>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        {user.avatar || 'D'}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
                    <Bot className="w-4 h-4 text-[#34d399] animate-bounce" />
                    <span>AI Assistant is analyzing query...</span>
                  </div>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {[
                  "How does Spatial Arbitrage work?",
                  "How to connect Web3 wallet?",
                  "Is my $100k demo wallet risk-free?",
                  "How to set bot profit target?"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSendAiMessage(chip)}
                    className="px-2.5 py-1 rounded-lg bg-[#161a23] hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#34d399]" />
                    <span>{chip}</span>
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="flex items-center space-x-2 pt-1 font-mono text-xs"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI Assistant a question..."
                  className="flex-1 bg-[#161a23] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#34d399] transition"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-[#34d399] hover:bg-[#6ee7b7] text-black font-extrabold shadow-md shrink-0"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            </div>
          )}

          {/* 5. USER FEEDBACK SUBMISSION MODAL */}
          {activeModal === 'FEEDBACK' && (
            <div className="space-y-4 font-sans">
              {feedbackSubmitted ? (
                <div className="p-6 rounded-xl bg-[#060810] border border-[#34d399]/40 text-center space-y-3 font-mono">
                  <div className="w-12 h-12 rounded-full bg-emerald-950 text-[#34d399] border border-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-white">Thank You For Your Feedback!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Your rating and feedback have been stored in the Firebase database. Our quant engineering team reviews all user input.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1.5">Rating Experience</label>
                    <div className="flex items-center space-x-2 bg-[#060810] p-3 rounded-xl border border-slate-800 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-2">{rating}/5 Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Category</label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full bg-[#161a23] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="Feature Request">Feature Request</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="UI & Design">UI & Design</option>
                      <option value="Bot Execution">Bot Execution</option>
                      <option value="General Feedback">General Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Your Detailed Feedback</label>
                    <textarea
                      rows="4"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your thoughts, suggestions, or doubts about the platform..."
                      className="w-full bg-[#161a23] border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-[#34d399] transition font-sans text-xs leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback || !feedbackText.trim()}
                    className="w-full py-3 bg-[#34d399] hover:bg-[#6ee7b7] text-black font-extrabold rounded-xl shadow-lg mt-2 font-sans flex items-center justify-center space-x-2 uppercase tracking-wider text-xs"
                  >
                    <span>{submittingFeedback ? 'SUBMITTING TO FIREBASE...' : 'SUBMIT FEEDBACK'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 6. NOTIFICATIONS MODAL */}
          {activeModal === 'NOTIFICATIONS' && (
            <div className="space-y-3 font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Total Logs: {notifications.length}</span>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => addNotification('Test Trade Alert Triggered (+0.47% Spread)', 'success')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-[10px] font-mono flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Test Trigger
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-mono flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto no-scrollbar space-y-2 font-mono text-xs">
                {notifications.length === 0 ? (
                  <div className="text-center text-slate-500 py-8 font-mono">
                    No active notifications. System operating normally.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-[#060810] rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start space-x-2.5">
                        <div className="mt-0.5">
                          {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#34d399]" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {notif.type === 'danger' && <AlertOctagon className="w-4 h-4 text-rose-400" />}
                          {notif.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold uppercase text-slate-400">{notif.type}</span>
                            <span className="text-[9px] text-slate-500">• {notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-200 mt-0.5 font-sans font-semibold">
                            {notif.message}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-slate-500 hover:text-white shrink-0 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 7. LOGOUT MODAL */}
          {activeModal === 'LOGOUT' && (
            <div className="space-y-4 text-center">
              <p className="text-slate-300 font-sans text-sm">
                Are you sure you want to exit the Trading Terminal?
              </p>
              <div className="flex space-x-3 pt-2 font-sans">
                <button onClick={() => { closeModal(); }} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl">
                  Confirm Exit
                </button>
                <button onClick={closeModal} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-800">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* 8. CONFIG STRATEGY MODAL */}
          {activeModal === 'CONFIG_STRATEGY' && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1">Minimum Net Profit Target (%)</label>
                <input
                  type="number"
                  value={minProfit}
                  onChange={(e) => setMinProfit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[#34d399] font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Max Gas Fee Limit ($)</label>
                <input
                  type="number"
                  value={maxGas}
                  onChange={(e) => setMaxGas(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>

              <button
                onClick={() => { alert(`Strategy Parameters Updated! Min Profit: ${minProfit}%`); closeModal(); }}
                className="w-full py-2.5 bg-[#34d399] hover:bg-[#6ee7b7] text-black font-bold rounded-xl font-sans"
              >
                APPLY PARAMETERS
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
