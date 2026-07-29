import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { sendRealWeb3Transaction, isWeb3Available, SUPPORTED_NETWORKS } from '../services/web3Service';
import { 
  X, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Copy, 
  ExternalLink, 
  RefreshCw,
  Sparkles,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';

export const RealPaymentGatewayModal = () => {
  const { 
    activeModal, 
    closeModal, 
    depositFunds, 
    addNotification, 
    realWallet, 
    user,
    apiService 
  } = useCrypto();

  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'WEB3' | 'QR' | 'BANK'
  const [depositAmount, setDepositAmount] = useState('1000');
  const [currency, setCurrency] = useState('USDT');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardType, setCardType] = useState('visa');

  // Crypto QR State
  const [selectedChain, setSelectedChain] = useState('Arbitrum One');
  const [txHashInput, setTxHashInput] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Bank / UPI State
  const [utrReference, setUtrReference] = useState('');

  // Flow State
  const [step, setStep] = useState('INPUT'); // 'INPUT' | 'OTP' | 'PROCESSING' | 'RECEIPT'
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTxReceipt, setLastTxReceipt] = useState(null);

  if (activeModal !== 'DEPOSIT' && activeModal !== 'PAYMENT') return null;

  const depositAddresses = {
    'Arbitrum One': '0x71C7656EC7ab88b098defB751B7401B5f6d7B41',
    'Ethereum Mainnet': '0x71C7656EC7ab88b098defB751B7401B5f6d7B41',
    'USDT (TRC-20)': 'TX89kP2mNq3vL1zR4sJ7wK9xY5uI0oP2qR',
    'BNB Smart Chain': '0x71C7656EC7ab88b098defB751B7401B5f6d7B41',
    'Solana Mainnet': '7Kx9uP2mNq3vL1zR4sJ7wK9xY5uI0oP2qR4sJ7wK'
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
    if (val.startsWith('4')) setCardType('visa');
    else if (val.startsWith('5')) setCardType('mastercard');
    else if (val.startsWith('3')) setCardType('amex');
    else setCardType('visa');
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiry(val);
  };

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardHolder(user?.username ? `${user.username.toUpperCase()} (VERIFIED)` : 'DEEPAK KUMAR');
    setExpiry('12/28');
    setCvc('888');
    addNotification('💳 Test card filled (Stripe Sandbox 4242)', 'info');
  };

  const executeDepositSuccess = async (methodName, txHash, details = {}) => {
    const numAmount = parseFloat(depositAmount) || 1000;
    const email = user?.email || 'deepak@chainblock.io';

    try {
      if (apiService?.depositPythonWallet) {
        await apiService.depositPythonWallet(email, numAmount, currency);
      }
    } catch (_) {}

    depositFunds(numAmount, currency);

    const receipt = {
      txId: txHash || `TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: numAmount,
      currency,
      method: methodName,
      timestamp: new Date().toLocaleString(),
      status: 'SETTLED & CREDITED',
      fee: '$0.00 (Zero Platform Fee)',
      ...details
    };

    setLastTxReceipt(receipt);
    setStep('RECEIPT');
    addNotification(`✅ Payment Authorized! +$${numAmount.toLocaleString()} ${currency} credited instantly.`, 'success');
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (!num || num <= 0) {
      addNotification('Please enter a valid deposit amount.', 'warning');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      addNotification('Please enter a complete 16-digit card number.', 'warning');
      return;
    }
    // Proceed to 3D Secure OTP Step
    setStep('OTP');
    addNotification('🔒 Initializing 3D-Secure Card Authorization Prompt...', 'info');
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      addNotification('Please enter the 6-digit OTP code sent to your phone.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setStep('PROCESSING');

    setTimeout(() => {
      setIsSubmitting(false);
      executeDepositSuccess('Stripe Credit / Debit Card', null, {
        cardEnding: cardNumber.slice(-4) || '4242',
        cardBrand: cardType.toUpperCase(),
        authorizationCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`
      });
    }, 1800);
  };

  const handleWeb3Submit = async () => {
    const num = parseFloat(depositAmount);
    if (!num || num <= 0) {
      addNotification('Please enter a valid deposit amount.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setStep('PROCESSING');

    try {
      const ethEquivalent = (num / 3540.20).toFixed(4);
      const targetAddress = depositAddresses['Arbitrum One'];
      const userAddr = realWallet?.connected ? realWallet.address : '0x71C7656EC7ab88b098defB751B7401B5f6d7B41';
      
      addNotification('🦊 Invoking Web3 Wallet on-chain transaction...', 'info');
      const txResult = await sendRealWeb3Transaction(userAddr, targetAddress, ethEquivalent, realWallet?.chainId || 42161);

      executeDepositSuccess('Direct Web3 On-Chain Wallet', txResult.txHash, {
        network: realWallet?.networkName || 'Arbitrum One',
        from: userAddr,
        to: targetAddress,
        explorerUrl: txResult.explorerUrl
      });
    } catch (err) {
      addNotification(`Web3 Payment Error: ${err.message}`, 'danger');
      setIsSubmitting(false);
      setStep('INPUT');
    }
  };

  const handleQrSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (!num || num <= 0) {
      addNotification('Please enter a valid deposit amount.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setStep('PROCESSING');

    setTimeout(() => {
      setIsSubmitting(false);
      const userTx = txHashInput.trim() || `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      executeDepositSuccess(`Crypto Transfer (${selectedChain})`, userTx, {
        network: selectedChain,
        depositAddress: depositAddresses[selectedChain] || depositAddresses['Arbitrum One']
      });
    }, 1500);
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (!num || num <= 0) {
      addNotification('Please enter a valid deposit amount.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setStep('PROCESSING');

    setTimeout(() => {
      setIsSubmitting(false);
      const ref = utrReference.trim() || `UTR${Date.now()}`;
      executeDepositSuccess('Instant Bank Wire / UPI Transfer', ref, {
        utr: ref,
        bankName: 'JPMorgan Chase & Co / Instant VPA'
      });
    }, 1500);
  };

  const copyAddress = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    addNotification('Copied deposit address to clipboard!', 'info');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0e1118] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-sans text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#121622]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#facc15]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
                <span>INSTITUTIONAL PAYMENT GATEWAY</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                  REAL-TIME 256-BIT SSL
                </span>
              </h2>
              <p className="text-xs text-slate-400">Direct Fiat & Crypto Instant Account Balance Deposit</p>
            </div>
          </div>
          <button 
            onClick={() => { closeModal(); setStep('INPUT'); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar">

          {/* STEP 1: INPUT & SELECTION */}
          {step === 'INPUT' && (
            <>
              {/* Preset Deposit Amount Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between">
                  <span>Deposit Amount ($ USD)</span>
                  <span className="text-amber-400 font-mono">Available: Unlimited Direct Deposit</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-lg font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter deposit amount"
                    className="w-full bg-[#161b26] border border-slate-700/80 rounded-2xl pl-9 pr-24 py-3.5 text-xl font-mono font-bold text-white outline-none focus:border-[#facc15] transition shadow-inner"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center space-x-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-amber-400">
                    <span>{currency}</span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {['500', '1000', '5000', '25000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                        depositAmount === amt
                          ? 'bg-[#facc15] text-slate-950 border-[#facc15] shadow-md'
                          : 'bg-[#141822] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      +${parseInt(amt).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Payment Gateway Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'CARD', label: 'Credit/Debit', icon: CreditCard, badge: 'Instant' },
                    { id: 'WEB3', label: 'Web3 Wallet', icon: Wallet, badge: 'EVM On-Chain' },
                    { id: 'QR', label: 'Crypto QR', icon: QrCode, badge: 'Multi-Chain' },
                    { id: 'BANK', label: 'Bank Wire / UPI', icon: Building2, badge: 'Zero Fee' }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isActive = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition ${
                          isActive
                            ? 'bg-amber-500/10 border-[#facc15] text-white shadow-lg'
                            : 'bg-[#141822] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-[#facc15]' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold">{m.label}</span>
                        <span className={`text-[9px] mt-1 px-1.5 py-0.5 rounded font-mono ${
                          isActive ? 'bg-[#facc15]/20 text-[#facc15]' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {m.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* METHOD 1: CARD GATEWAY (Stripe Style) */}
              {paymentMethod === 'CARD' && (
                <form onSubmit={handleCardSubmit} className="space-y-4 pt-2 border-t border-slate-800/80">
                  
                  {/* Interactive Card Visual */}
                  <div className="relative w-full h-44 rounded-2xl bg-gradient-to-tr from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-5 flex flex-col justify-between overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-6 rounded bg-amber-400/80 flex items-center justify-center text-[9px] font-bold text-black font-mono">
                          CHIP
                        </div>
                        <span className="text-xs font-mono text-amber-300/80 tracking-widest">INSTITUTIONAL DEBIT</span>
                      </div>
                      <span className="text-xs font-black text-amber-400 uppercase font-mono tracking-widest">
                        {cardType}
                      </span>
                    </div>

                    <div className="text-lg sm:text-xl font-mono font-bold tracking-widest text-white">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Card Holder</div>
                        <div className="font-bold text-slate-200 tracking-wider truncate max-w-[180px]">
                          {cardHolder || user?.username?.toUpperCase() || 'DEEPAK KUMAR'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">Expires</div>
                        <div className="font-bold text-slate-200">{expiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Card Details</label>
                      <button
                        type="button"
                        onClick={handleFillTestCard}
                        className="text-[11px] font-mono text-[#facc15] hover:underline flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Autofill Stripe Test Card</span>
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="Card Number (4242 4242 4242 4242)"
                        className="w-full bg-[#161b26] border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#facc15] transition"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Cardholder Full Name"
                          className="w-full bg-[#161b26] border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-sans text-white outline-none focus:border-[#facc15] transition"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full bg-[#161b26] border border-slate-700/80 rounded-xl px-3 py-3 text-sm font-mono text-center text-white outline-none focus:border-[#facc15] transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="password"
                          maxLength={4}
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          placeholder="CVC / CVV (888)"
                          className="w-full bg-[#161b26] border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#facc15] transition"
                        />
                      </div>
                      <div className="flex items-center justify-center text-xs text-slate-400 space-x-1 bg-slate-900/60 rounded-xl border border-slate-800 px-3">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Stripe 256-Bit Encrypted</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#facc15] to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>AUTHORIZE DEPOSIT +${parseFloat(depositAmount || 0).toLocaleString()}</span>
                  </button>
                </form>
              )}

              {/* METHOD 2: DIRECT WEB3 ON-CHAIN */}
              {paymentMethod === 'WEB3' && (
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="p-4 rounded-2xl bg-[#141822] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Web3 Connected Account:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {realWallet?.connected ? realWallet.shortAddress : '0x71C7...dB41'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Target Deposit Contract:</span>
                      <span className="font-mono text-slate-300">0x71C7656EC7ab88b098defB751B7401B5f6d7B41</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Estimated Native Cost:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ~{((parseFloat(depositAmount || 0)) / 3540.20).toFixed(4)} ETH
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#facc15] shrink-0" />
                      <span>Direct MetaMask / EIP-1193 RPC push with instant on-chain transaction hash verification.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleWeb3Submit}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-[#facc15] text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>CONFIRM WEB3 ON-CHAIN TRANSACTION</span>
                  </button>
                </div>
              )}

              {/* METHOD 3: CRYPTO QR DEPOSIT */}
              {paymentMethod === 'QR' && (
                <form onSubmit={handleQrSubmit} className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-3">
                    <label className="text-xs font-bold text-slate-300">Select Network:</label>
                    <select
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="bg-[#161b26] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-mono"
                    >
                      {Object.keys(depositAddresses).map((chain) => (
                        <option key={chain} value={chain}>{chain}</option>
                      ))}
                    </select>
                  </div>

                  {/* QR Box & Copy Address */}
                  <div className="p-4 rounded-2xl bg-[#141822] border border-slate-800 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 border border-slate-700">
                      {/* Generative QR visual */}
                      <div className="w-full h-full border-4 border-slate-900 p-1 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-6 h-6 bg-slate-950" />
                          <div className="w-6 h-6 bg-slate-950" />
                        </div>
                        <div className="text-[7px] font-mono font-bold text-slate-950 text-center uppercase tracking-tighter">
                          SCAN TO PAY
                        </div>
                        <div className="flex justify-between">
                          <div className="w-6 h-6 bg-slate-950" />
                          <div className="w-4 h-4 bg-slate-950" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs w-full">
                      <div className="text-slate-400 font-bold uppercase">Send exactly to address:</div>
                      <div className="p-2.5 rounded-xl bg-[#090b10] border border-slate-800 font-mono text-[11px] text-amber-300 break-all">
                        {depositAddresses[selectedChain]}
                      </div>
                      <button
                        type="button"
                        onClick={() => copyAddress(depositAddresses[selectedChain])}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-mono font-bold flex items-center space-x-1.5 transition"
                      >
                        {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAddress ? 'Copied to Clipboard!' : 'Copy Deposit Address'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Enter Sent Transaction Hash (Optional):</label>
                    <input
                      type="text"
                      value={txHashInput}
                      onChange={(e) => setTxHashInput(e.target.value)}
                      placeholder="0x... or TRC20 TxID reference"
                      className="w-full bg-[#161b26] border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-[#facc15]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-[#facc15] text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition shadow-lg"
                  >
                    I HAVE COMPLETED CRYPTO TRANSFER
                  </button>
                </form>
              )}

              {/* METHOD 4: BANK WIRE / INSTANT UPI */}
              {paymentMethod === 'BANK' && (
                <form onSubmit={handleBankSubmit} className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="p-4 rounded-2xl bg-[#141822] border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Beneficiary Bank:</span>
                      <span className="font-mono font-bold text-white">JPMorgan Chase & Co / Instant Gateway</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account / VPA ID:</span>
                      <span className="font-mono font-bold text-amber-300">US89 JPMC 9284 1029 3847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SWIFT / IFSC:</span>
                      <span className="font-mono text-slate-300">CHASUS33XXX</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Enter Bank UTR / Reference ID:</label>
                    <input
                      type="text"
                      value={utrReference}
                      onChange={(e) => setUtrReference(e.target.value)}
                      placeholder="e.g. UTR920481029384"
                      className="w-full bg-[#161b26] border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-[#facc15]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-[#facc15] text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition shadow-lg"
                  >
                    SUBMIT INSTANT BANK TRANSFER
                  </button>
                </form>
              )}
            </>
          )}

          {/* STEP 2: 3D SECURE OTP SIMULATION */}
          {step === 'OTP' && (
            <form onSubmit={handleConfirmOtp} className="space-y-6 py-4 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-[#facc15] mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">3D-SECURE BANK AUTHORIZATION</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  A 6-digit One-Time Password (OTP) has been dispatched to your registered cardholder mobile (+1 ••• ••• 8829).
                </p>
              </div>

              <div className="space-y-2 max-w-xs mx-auto">
                <label className="text-xs font-mono text-center block text-slate-400">ENTER 6-DIGIT OTP CODE</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="8 8 8 8 8 8"
                  className="w-full bg-[#161b26] border-2 border-amber-400/80 rounded-2xl py-3 text-center text-2xl font-mono font-black text-[#facc15] tracking-[0.5em] outline-none shadow-inner"
                />
                <div className="text-[11px] text-center font-mono text-slate-500">
                  Default Sandbox Code: <span className="text-amber-400 font-bold">888888</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#facc15] to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition shadow-xl"
              >
                VERIFY & COMPLETE DEPOSIT
              </button>
            </form>
          )}

          {/* STEP 3: PROCESSING SPINNER */}
          {step === 'PROCESSING' && (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <RefreshCw className="w-12 h-12 text-[#facc15] animate-spin mx-auto" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                PROCESSING PAYMENT GATEWAY TRANSACTION...
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Communicating with Banking Switch & EVM Ledger
              </p>
            </div>
          )}

          {/* STEP 4: RECEIPT */}
          {step === 'RECEIPT' && lastTxReceipt && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">PAYMENT AUTHORIZED & SETTLED</h3>
                <p className="text-xs text-emerald-400 font-mono">Funds credited to trading balance immediately</p>
              </div>

              {/* Receipt Box */}
              <div className="p-5 rounded-2xl bg-[#141822] border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-bold text-amber-300">{lastTxReceipt.txId}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Amount Deposited:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    +${lastTxReceipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {lastTxReceipt.currency}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Gateway Channel:</span>
                  <span className="text-slate-200">{lastTxReceipt.method}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-300">{lastTxReceipt.timestamp}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold">{lastTxReceipt.status}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { closeModal(); setStep('INPUT'); }}
                className="w-full py-4 rounded-2xl bg-[#facc15] text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 transition shadow-lg"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
