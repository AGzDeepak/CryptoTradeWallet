import React, { useState, useEffect } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { generateNewWallet, saveWalletToVault, exportEncryptedKeystoreJson } from '../../services/walletGeneratorService';
import confetti from 'canvas-confetti';
import {
  Wallet, ShieldCheck, Key, Lock, Eye, EyeOff, Copy, Check,
  Download, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle,
  Sparkles, RefreshCw, X, FileText, QrCode
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Password', desc: 'Secure local vault' },
  { id: 2, title: 'Seed Phrase', desc: 'Backup 12 words' },
  { id: 3, title: 'Verify', desc: 'Confirm backup' },
  { id: 4, title: 'Complete', desc: 'Wallet ready' },
];

export const CreateWalletModal = ({ isOpen, onClose, onWalletCreated }) => {
  const { setRealWalletAddress, addNotification, audioFx } = useCrypto();

  // Wizard Step State (1: Password, 2: Seed Phrase, 3: Verify Quiz, 4: Ready)
  const [currentStep, setCurrentStep] = useState(1);

  // Form & Wallet Data
  const [accountName, setAccountName] = useState('Trading Account 1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState(null);

  // Seed Phrase Reveal & Copy State
  const [isPhraseRevealed, setIsPhraseRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPrivateKeyRevealed, setIsPrivateKeyRevealed] = useState(false);

  // Verification Quiz State
  const [quizIndices, setQuizIndices] = useState([2, 5, 8]); // 0-indexed (word #3, #6, #9)
  const [selectedQuizWords, setSelectedQuizWords] = useState({ 0: '', 1: '', 2: '' });
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [quizError, setQuizError] = useState('');

  // Password Strength
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;
    return Math.min(100, score);
  };

  const passStrength = getPasswordStrength(password);

  // Initialize new wallet entropy when modal opens or step 1 proceeds
  const handleStartGeneration = () => {
    if (!password || password.length < 8) {
      if (addNotification) addNotification('Password must be at least 8 characters.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      if (addNotification) addNotification('Passwords do not match.', 'warning');
      return;
    }
    if (!agreedToTerms) {
      if (addNotification) addNotification('Please agree to the non-custodial terms.', 'warning');
      return;
    }

    try {
      const newWallet = generateNewWallet();
      setGeneratedWallet(newWallet);

      // Pick 3 random word indices for quiz verification (e.g. 2, 6, 10)
      const indices = [1, 5, 9]; // Word #2, #6, #10
      setQuizIndices(indices);

      // Create shuffled word pool for the quiz
      const correctWords = indices.map(i => newWallet.words[i]);
      const otherWords = newWallet.words.filter((_, idx) => !indices.includes(idx)).slice(0, 5);
      const pool = [...correctWords, ...otherWords].sort(() => Math.random() - 0.5);
      setShuffledOptions(pool);

      setCurrentStep(2);
    } catch (err) {
      if (addNotification) addNotification('Failed to generate wallet: ' + err.message, 'danger');
    }
  };

  // Copy Seed Phrase to Clipboard
  const handleCopyPhrase = () => {
    if (!generatedWallet) return;
    navigator.clipboard.writeText(generatedWallet.mnemonic);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    if (addNotification) addNotification('📋 12-Word Recovery Phrase copied to clipboard.', 'success');
  };

  // Download Seed Phrase as text file
  const handleDownloadBackup = () => {
    if (!generatedWallet) return;
    const content = `=====================================================
CHAINBLOCK WEB3 WALLET BACKUP
=====================================================
Account Name: ${accountName}
Address: ${generatedWallet.address}
Created: ${generatedWallet.createdAt}
Derivation Path: ${generatedWallet.path}

12-WORD SECRET RECOVERY PHRASE (BIP-39):
${generatedWallet.mnemonic}

PRIVATE KEY:
${generatedWallet.privateKey}

SECURITY WARNING:
Never share your secret recovery phrase or private key with anyone.
Anyone with this phrase has full access to all your funds.
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chainblock_wallet_${generatedWallet.address.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    if (addNotification) addNotification('💾 Recovery phrase backup downloaded.', 'success');
  };

  // Verify Seed Quiz Step
  const handleVerifyQuiz = () => {
    if (!generatedWallet) return;
    setQuizError('');

    const isWord1Correct = selectedQuizWords[0] === generatedWallet.words[quizIndices[0]];
    const isWord2Correct = selectedQuizWords[1] === generatedWallet.words[quizIndices[1]];
    const isWord3Correct = selectedQuizWords[2] === generatedWallet.words[quizIndices[2]];

    if (isWord1Correct && isWord2Correct && isWord3Correct) {
      // Save wallet to local vault
      saveWalletToVault({
        name: accountName,
        address: generatedWallet.address,
        mnemonic: generatedWallet.mnemonic,
      });

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        audioFx?.playTradeSuccess();
      } catch (_) {}

      setCurrentStep(4);
    } else {
      setQuizError('Incorrect word selections. Please double-check your recovery phrase backup.');
    }
  };

  // Activate & Set Active Wallet
  const handleActivateWallet = () => {
    if (generatedWallet && setRealWalletAddress) {
      setRealWalletAddress(generatedWallet.address);
      if (addNotification) addNotification(`🎉 New Wallet Activated: ${generatedWallet.address.substring(0, 8)}...`, 'success');
      if (onWalletCreated) onWalletCreated(generatedWallet);
      handleClose();
    }
  };

  // Download Encrypted Keystore JSON
  const handleDownloadKeystore = async () => {
    if (!generatedWallet || !password) return;
    try {
      const jsonStr = await exportEncryptedKeystoreJson(generatedWallet.privateKey, password);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UTC--${new Date().toISOString().replace(/[:.]/g, '-')}--${generatedWallet.address}.json`;
      a.click();
      URL.revokeObjectURL(url);
      if (addNotification) addNotification('📁 Encrypted Keystore JSON downloaded.', 'success');
    } catch (err) {
      if (addNotification) addNotification('Keystore export error: ' + err.message, 'danger');
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setPassword('');
    setConfirmPassword('');
    setAgreedToTerms(false);
    setGeneratedWallet(null);
    setIsPhraseRevealed(false);
    setSelectedQuizWords({ 0: '', 1: '', 2: '' });
    setQuizError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-[#0b1320] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">Create Web3 Non-Custodial Wallet</h2>
              <p className="text-xs text-slate-400 font-mono">Real-time BIP-39 Cryptographic Engine</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((s) => (
            <div key={s.id} className="space-y-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep >= s.id ? 'bg-emerald-400' : 'bg-slate-800'
              }`} />
              <span className={`text-[10px] font-mono font-bold block truncate ${
                currentStep === s.id ? 'text-emerald-400' : currentStep > s.id ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {s.id}. {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* ── STEP 1: PASSWORD SETUP & SECURITY ── */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-[#060d18] border border-slate-800/80 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Account / Wallet Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. My Alpha Trading Vault"
                  className="w-full bg-[#0d1523] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Vault Password (minimum 8 characters)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password"
                  className="w-full bg-[#0d1523] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500 font-mono"
                />
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passStrength < 50 ? 'bg-rose-500 w-1/3' : passStrength < 80 ? 'bg-amber-400 w-2/3' : 'bg-emerald-400 w-full'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Strength: {passStrength < 50 ? 'Weak' : passStrength < 80 ? 'Good' : 'Strong & Secure 🔒'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-[#0d1523] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 pt-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-0 cursor-pointer"
              />
              <span className="leading-snug text-slate-400">
                I understand that ChainBlock never stores my private keys on a server and cannot recover my wallet if I lose my secret recovery phrase.
              </span>
            </label>

            <button
              type="button"
              onClick={handleStartGeneration}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
            >
              <span>Generate Seed Phrase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: 12-WORD MNEMONIC SEED PHRASE REVEAL ── */}
        {currentStep === 2 && generatedWallet && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Secret Recovery Phrase:</strong> Write down these 12 words in order and store them in a secure offline location.
              </span>
            </div>

            {/* 12-Word Grid with Blur / Reveal Feature */}
            <div className="relative p-4 rounded-2xl bg-[#060d18] border border-slate-800/80">
              <div className={`grid grid-cols-3 gap-2.5 transition-all duration-300 ${!isPhraseRevealed ? 'filter blur-md select-none' : ''}`}>
                {generatedWallet.words.map((word, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#0d1523] border border-slate-800 flex items-center gap-2 text-xs font-mono">
                    <span className="text-[10px] text-slate-500 font-bold w-4 text-right">{idx + 1}.</span>
                    <span className="text-white font-extrabold">{word}</span>
                  </div>
                ))}
              </div>

              {!isPhraseRevealed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 rounded-2xl backdrop-blur-xs p-4 text-center">
                  <EyeOff className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-white mb-3">Make sure no one is looking at your screen</p>
                  <button
                    type="button"
                    onClick={() => setIsPhraseRevealed(true)}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition shadow-md"
                  >
                    Click to Reveal Recovery Phrase
                  </button>
                </div>
              )}
            </div>

            {/* Copy & Download Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPhrase}
                className="flex-1 py-2.5 rounded-xl bg-[#060d18] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 font-mono"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-violet-400" />}
                <span>{isCopied ? 'Copied!' : 'Copy Phrase'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex-1 py-2.5 rounded-xl bg-[#060d18] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 font-mono"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save .txt Backup</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!isPhraseRevealed}
                onClick={() => setCurrentStep(3)}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                  isPhraseRevealed
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <span>I've Saved It — Proceed to Verify</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: SEED PHRASE VERIFICATION CHALLENGE (QUIZ) ── */}
        {currentStep === 3 && generatedWallet && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Confirm Your Secret Recovery Phrase</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select the correct words below to verify you have written them down safely.
              </p>
            </div>

            {/* Quiz Slots */}
            <div className="grid grid-cols-3 gap-2.5">
              {quizIndices.map((wordIdx, slotIdx) => (
                <div key={slotIdx} className="p-3 rounded-2xl bg-[#060d18] border border-slate-800 text-center space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">Word #{wordIdx + 1}</span>
                  <div className={`py-2 px-1 rounded-xl font-mono text-xs font-extrabold border ${
                    selectedQuizWords[slotIdx]
                      ? 'bg-violet-600/20 text-violet-300 border-violet-500/40'
                      : 'bg-[#0d1523] text-slate-600 border-dashed border-slate-700'
                  }`}>
                    {selectedQuizWords[slotIdx] || '— Empty —'}
                  </div>
                </div>
              ))}
            </div>

            {quizError && (
              <p className="text-xs text-rose-400 font-bold text-center bg-rose-500/10 py-1.5 rounded-xl border border-rose-500/20">
                {quizError}
              </p>
            )}

            {/* Shuffled Word Selection Pool */}
            <div className="p-3.5 rounded-2xl bg-[#060d18] border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">Tap words to fill slots in order:</span>
              <div className="flex flex-wrap gap-2">
                {shuffledOptions.map((w, idx) => {
                  const isSelected = Object.values(selectedQuizWords).includes(w);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSelected}
                      onClick={() => {
                        // Find first empty slot
                        const emptySlot = [0, 1, 2].find(s => !selectedQuizWords[s]);
                        if (emptySlot !== undefined) {
                          setSelectedQuizWords(prev => ({ ...prev, [emptySlot]: w }));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition ${
                        isSelected
                          ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-[#0d1523] border-slate-700 text-slate-200 hover:border-violet-500 hover:text-white'
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedQuizWords({ 0: '', 1: '', 2: '' })}
                className="text-xs text-slate-400 hover:text-white font-mono underline"
              >
                Clear Selections
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyQuiz}
                  disabled={!selectedQuizWords[0] || !selectedQuizWords[1] || !selectedQuizWords[2]}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm & Create Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: WALLET READY & COMPLETED ── */}
        {currentStep === 4 && generatedWallet && (
          <div className="space-y-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Wallet Successfully Created!</h3>
              <p className="text-xs text-slate-400 mt-0.5">Your non-custodial Web3 account is active and ready to trade.</p>
            </div>

            {/* Account Card */}
            <div className="p-4 rounded-2xl bg-[#060d18] border border-slate-800 text-left space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Account Name:</span>
                <span className="text-xs font-bold text-white">{accountName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Public Address:</span>
                <span className="text-xs font-extrabold text-emerald-400">{generatedWallet.address.substring(0, 10)}...{generatedWallet.address.substring(34)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Derivation Path:</span>
                <span className="text-xs text-slate-300">{generatedWallet.path}</span>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handleDownloadKeystore}
                className="py-2.5 px-3 rounded-xl bg-[#060d18] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-violet-400" />
                <span>Export Keystore JSON</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="py-2.5 px-3 rounded-xl bg-[#060d18] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Paper Keys</span>
              </button>
            </div>

            {/* Primary Activation Button */}
            <button
              type="button"
              onClick={handleActivateWallet}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Activate & Start Trading With This Wallet</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
