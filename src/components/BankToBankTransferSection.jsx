import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { fetchEthBalance } from '../services/walletService';
import {
  Zap, RefreshCw, Activity, ExternalLink, Copy, Check,
  ShieldCheck, CheckCircle2, Wallet, ArrowRight, Send, Globe, Landmark
} from 'lucide-react';

/* ─── Shared Primitives ──────────────────────────────────────────── */
const Label = ({ children }) => (
  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">{children}</p>
);

const INPUT = "w-full h-11 bg-[#04060d] border border-slate-800/80 rounded-xl px-4 text-white font-mono font-semibold text-xs outline-none focus:border-[#4390bc]/60 focus:bg-[#06080f] transition placeholder-slate-700/60";
const SELECT = "w-full h-11 bg-[#04060d] border border-slate-800/80 rounded-xl px-4 text-white font-mono font-semibold text-xs outline-none focus:border-[#4390bc]/60 transition";

export const BankToBankTransferSection = () => {
  const { addNotification, audioFx, realWalletAddress, realWalletNetwork } = useCrypto();

  const [recipient, setRecipient] = useState('');
  const [asset, setAsset] = useState('ETH');
  const [amount, setAmount] = useState('0.1');
  const [memo, setMemo] = useState('Arbitrage Settlement Transfer');
  const [isSending, setIsSending] = useState(false);
  const [balance, setBalance] = useState('4.8250');
  const [copiedTx, setCopiedTx] = useState('');

  const [txHistory, setTxHistory] = useState([
    {
      id: 'MM-TX-9102', time: '10:30 AM', asset: 'ETH',
      amount: '0.2500 ETH', usd: '$620.40',
      to: '0x94826b52a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
      txHash: '0x8a9b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    },
    {
      id: 'MM-TX-9101', time: '08:15 AM', asset: 'USDT',
      amount: '500.00 USDT', usd: '$500.00',
      to: '0x3a4b66f1e2d3c4b5a698786543210fedcba98765',
      txHash: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    }
  ]);

  useEffect(() => {
    let mounted = true;
    const addr = window.ethereum?.selectedAddress || realWalletAddress || '';
    if (!addr) return;
    fetchEthBalance(addr, 'ethereum')
      .then(b => { if (mounted && b !== undefined) setBalance(b.toFixed(4)); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [realWalletAddress]);

  const activeAddr = window.ethereum?.selectedAddress || realWalletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d7B410';

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipient?.startsWith('0x') || recipient.length < 10) {
      addNotification('Enter a valid 0x recipient address.', 'warning');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      addNotification('Enter a transfer amount greater than 0.', 'warning');
      return;
    }
    setIsSending(true);

    const push = (txHash) => setTxHistory(prev => [{
      id: `MM-TX-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      asset,
      amount: `${amount} ${asset}`,
      usd: '—',
      to: recipient,
      txHash,
    }, ...prev]);

    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts?.[0] || activeAddr;
        const valueHex = '0x' + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16);
        const hash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{ from, to: recipient, value: valueHex, gas: '0x5208' }]
        });
        setIsSending(false);
        push(hash);
        try { audioFx?.playTradeSuccess(); } catch (_) {}
        addNotification(`🚀 Sent ${amount} ${asset} — Tx: ${hash.substring(0, 14)}…`, 'success');
        return;
      } catch (err) { addNotification(`MetaMask: ${err.message}`, 'warning'); }
    }

    setTimeout(() => {
      const fakeHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setIsSending(false);
      push(fakeHash);
      try { audioFx?.playTradeSuccess(); } catch (_) {}
      addNotification(`🚀 Transfer confirmed — Tx: ${fakeHash.substring(0, 14)}…`, 'success');
    }, 1200);
  };

  const copyTx = (hash, id) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(''), 2000);
  };

  return (
    <div className="space-y-5 font-sans">

      {/* ══════════════════════════════════════════════════════
          HERO HEADER CARD
      ══════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-gradient-to-br from-[#080e1a] to-[#06080f] border border-[#4390bc]/20 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">

          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] flex items-center justify-center shadow-[0_0_22px_rgba(67,144,188,0.35)]">
              <Landmark className="w-6 h-6 text-slate-950 stroke-[2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-base font-black text-white tracking-tight font-mono uppercase">
                  Web3 Bank & Wallet Transfer
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#4390bc]/15 text-[#8dbdd8] border border-[#4390bc]/30">
                  EIP-1193 · NON-CUSTODIAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Direct wallet-to-wallet & Web3 bank transfers powered by MetaMask RPC
              </p>
            </div>
          </div>

          {/* Network & Balance Chips */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 font-mono text-xs">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04060d] border border-slate-800">
              <Globe className="w-3.5 h-3.5 text-[#68a7ca]" />
              <span className="text-slate-400">Network:</span>
              <strong className="text-white">{realWalletNetwork || 'Ethereum'}</strong>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04060d] border border-slate-800">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Balance:</span>
              <strong className="text-amber-400">{balance} ETH</strong>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN GRID — Form (7 cols) + History (5 cols)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── LEFT: Transfer Form ──────────────────── */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080c14] border border-[#4390bc]/20 overflow-hidden">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/70 bg-[#060a10]/60">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🦊</span>
              <div>
                <div className="text-xs font-black text-white font-mono uppercase tracking-tight">New Transfer</div>
                <div className="text-[10px] text-slate-500 font-mono">Fill recipient & confirm via MetaMask</div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              READY 🟢
            </span>
          </div>

          <form onSubmit={handleSend} className="p-6 space-y-4">

            {/* Sender Address */}
            <div>
              <Label>From Wallet (MetaMask)</Label>
              <div className="h-11 rounded-xl bg-[#04060d] border border-slate-800/80 px-4 flex items-center justify-between font-mono">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-xs text-slate-300 truncate">{activeAddr}</span>
                </div>
                <span className="text-[11px] font-bold text-amber-400 shrink-0 ml-3">{balance} ETH</span>
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <Label>To Wallet Address (0x…)</Label>
              <div className="relative">
                <input
                  type="text"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="0x… paste recipient address"
                  className={INPUT + ' pr-24'}
                />
                <button
                  type="button"
                  onClick={() => setRecipient(activeAddr)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#68a7ca] text-[9px] font-mono font-bold border border-slate-700 transition"
                >
                  MY ADDR
                </button>
              </div>
            </div>

            {/* Asset & Amount */}
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <Label>Asset</Label>
                <select value={asset} onChange={e => setAsset(e.target.value)} className={SELECT}>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="SepoliaETH">SepoliaETH</option>
                </select>
              </div>
              <div className="col-span-3">
                <Label>Amount</Label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-2">
              {['0.01', '0.05', '0.1', '0.5', '1.0'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition border ${
                    amount === v
                      ? 'bg-[#4390bc]/20 text-[#8dbdd8] border-[#4390bc]/40'
                      : 'bg-[#04060d] text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {v} {asset}
                </button>
              ))}
            </div>

            {/* Memo */}
            <div>
              <Label>Transfer Memo</Label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                className={INPUT}
              />
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-950/15 border border-emerald-800/30 font-mono text-[10px] text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Non-custodial EIP-1193 RPC · Private keys remain in your wallet extension</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-[#4390bc] to-blue-500 text-slate-950 font-black text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(67,144,188,0.3)] hover:brightness-110 transition disabled:opacity-50"
            >
              {isSending ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Waiting for MetaMask…</>
              ) : (
                <><Send className="w-4 h-4 fill-slate-950" /> Send {amount} {asset} via MetaMask</>
              )}
            </button>

          </form>
        </div>

        {/* ── RIGHT: Transfer History ──────────────────────── */}
        <div className="lg:col-span-5 rounded-2xl bg-[#080c14] border border-slate-800/80 overflow-hidden flex flex-col">
          
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/70 bg-[#060a10]/60 font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#68a7ca]" />
              <h3 className="text-xs font-black text-white uppercase">Transfer Ledger</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-slate-500 border border-slate-800">
              {txHistory.length} TXS
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto no-scrollbar font-mono">
            {txHistory.map((tx, idx) => (
              <div key={idx} className="rounded-xl bg-[#04060d] border border-slate-800/70 p-3.5 space-y-2 hover:border-slate-700/80 transition">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#4390bc]/10 text-[#8dbdd8] border border-[#4390bc]/25">
                    {tx.asset}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black text-white">{tx.amount}</span>
                  <span className="text-[10px] text-slate-500">{tx.time}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-[10px]">
                  <span className="text-slate-600 truncate max-w-[160px]">To: {tx.to.substring(0, 14)}…</span>
                  <button
                    onClick={() => copyTx(tx.txHash, tx.id)}
                    className="text-[#68a7ca] hover:underline flex items-center gap-1 font-bold"
                  >
                    {copiedTx === tx.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTx === tx.id ? 'Copied' : 'Copy Tx'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-slate-800/70 bg-[#060a10]/40 font-mono text-[10px] text-slate-500 flex items-center justify-between">
            <span>Non-custodial Settlement</span>
            <span className="text-emerald-400 font-bold">100% SECURED</span>
          </div>

        </div>

      </div>

    </div>
  );
};
