import React, { useState } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { restoreWalletFromPhrase, restoreWalletFromPrivateKey, saveWalletToVault } from '../../services/walletGeneratorService';
import { Key, ShieldCheck, X, ArrowRight, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export const ImportWalletModal = ({ isOpen, onClose, onWalletImported }) => {
  const { setRealWalletAddress, addNotification, audioFx } = useCrypto();

  const [importType, setImportType] = useState('PHRASE'); // 'PHRASE' | 'PRIVATE_KEY'
  const [accountName, setAccountName] = useState('Imported Account');
  const [inputVal, setInputVal] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!inputVal.trim()) {
      setErrorMsg(`Please enter your ${importType === 'PHRASE' ? '12-word recovery phrase' : 'private key'}.`);
      return;
    }

    setIsImporting(true);
    try {
      let walletObj = null;
      if (importType === 'PHRASE') {
        walletObj = restoreWalletFromPhrase(inputVal.trim());
      } else {
        walletObj = restoreWalletFromPrivateKey(inputVal.trim());
      }

      // Save to local vault
      saveWalletToVault({
        name: accountName,
        address: walletObj.address,
        mnemonic: walletObj.mnemonic,
      });

      // Set active wallet
      if (setRealWalletAddress) {
        setRealWalletAddress(walletObj.address);
      }

      if (addNotification) {
        addNotification(`✅ Wallet Successfully Imported: ${walletObj.address.substring(0, 8)}...`, 'success');
      }

      try { audioFx?.playTradeSuccess(); } catch (_) {}
      if (onWalletImported) onWalletImported(walletObj);
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to import wallet. Please verify input.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setInputVal('');
    setPassword('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-[#0b1320] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">Import Existing Web3 Wallet</h2>
              <p className="text-xs text-slate-400 font-mono">Restore via Recovery Phrase or Private Key</p>
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

        {/* Switch Type Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#060d18] p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setImportType('PHRASE'); setErrorMsg(''); }}
            className={`py-2 rounded-xl text-xs font-bold font-mono transition ${
              importType === 'PHRASE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Secret Recovery Phrase (12 Words)
          </button>

          <button
            type="button"
            onClick={() => { setImportType('PRIVATE_KEY'); setErrorMsg(''); }}
            className={`py-2 rounded-xl text-xs font-bold font-mono transition ${
              importType === 'PRIVATE_KEY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hex Private Key (0x...)
          </button>
        </div>

        <form onSubmit={handleImportSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#060d18] border border-slate-800/80 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Account Label</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Trading Alpha Vault"
                className="w-full bg-[#0d1523] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                {importType === 'PHRASE' ? 'Enter 12-Word Recovery Phrase (separated by spaces)' : 'Enter Private Key (64 hex characters)'}
              </label>
              {importType === 'PHRASE' ? (
                <textarea
                  rows={3}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. apple river galaxy hammer lemon orbit planet rocket silver timber universe zebra"
                  className="w-full bg-[#0d1523] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono resize-none"
                />
              ) : (
                <input
                  type="password"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f3608a8"
                  className="w-full bg-[#0d1523] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                />
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isImporting}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>{isImporting ? 'Importing...' : 'Restore & Activate'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
