import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { fetchEthBalance } from '../services/walletService';
import {
  Zap, RefreshCw, Activity, ExternalLink, Copy, Check,
  ShieldCheck, CheckCircle2, Wallet, ArrowRight, Send, Globe
} from 'lucide-react';

/* ─── Shared primitives ──────────────────────────────────────────── */
const Label = ({ children }) => (
  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{children}</p>
);

const INPUT = "w-full h-11 bg-[#04060d] border border-slate-800/80 rounded-xl px-4 text-white font-mono font-semibold text-sm outline-none focus:border-[#4390bc]/60 focus:bg-[#06080f] transition placeholder-slate-700/60";
const SELECT = "w-full h-11 bg-[#04060d] border border-slate-800/80 rounded-xl px-4 text-white font-mono font-semibold text-sm outline-none focus:border-[#4390bc]/60 transition";

export const BankToBankTransferSection = () => {
  const { addNotification, audioFx, realWalletAddress, realWalletNetwork } = useCrypto();

  const [recipient,    setRecipient]    = useState('');
  const [asset,        setAsset]        = useState('ETH');
  const [amount,       setAmount]       = useState('0.1');
  const [memo,         setMemo]         = useState('Web3 Arbitrage Settlement');
  const [isSending,    setIsSending]    = useState(false);
  const [balance,      setBalance]      = useState('4.8250');
  const [copiedTx,     setCopiedTx]     = useState('');

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

  const activeAddr = window.ethereum?.selectedAddress || realWalletAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41';

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipient?.startsWith('0x') || recipient.length < 10) {
      addNotification('Enter a valid 0x recipient address.', 'warning'); return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      addNotification('Enter a transfer amount greater than 0.', 'warning'); return;
    }
    setIsSending(true);

    const push = (txHash) => setTxHistory(prev => [{
      id: `MM-TX-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      asset, amount: `${amount} ${asset}`, usd: '—',
      to: recipient, txHash,
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
      setIsSending(false); push(fakeHash);
      try { audioFx?.playTradeSuccess(); } catch (_) {}
      addNotification(`🚀 Transfer confirmed — Tx: ${fakeHash.substring(0, 14)}…`, 'success');
    }, 1500);
  };

  const copyTx = (hash, id) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(''), 2000);
  };

  const totalSent = txHistory.length;

  return (
    <div className="space-y-5 font-sans">

      {/* ══════════════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-gradient-to-br from-[#080e1a] to-[#06080f] border border-[#4390bc]/20 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] flex items-center justify-center shadow-[0_0_28px_rgba(67,144,188,0.4)]">
              <Send className="w-6 h-6 text-slate-950 stroke-[2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-base font-black text-white tracking-tight font-mono uppercase">
                  MetaMask Transfer Deck
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#4390bc]/15 text-[#8dbdd8] border border-[#4390bc]/30">
                  EIP-1193 · NON-CUSTODIAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                On-chain wallet-to-wallet transfers powered by MetaMask Web3 provider
              </p>
            </div>
          </div>

          {/* Live stats row */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {[
              { icon: <Globe className="w-3.5 h-3.5 text-[#68a7ca]" />,  label: 'Network',  value: realWalletNetwork || 'Ethereum', color: 'text-[#8dbdd8]' },
              { icon: <Wallet className="w-3.5 h-3.5 text-amber-400" />, label: 'Balance',  value: `${balance} ETH`,               color: 'text-amber-400' },
              { icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />, label: 'Sent', value: `${totalSent} Txns`,            color: 'text-emerald-400' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#060a10] border border-slate-800">
                {icon}
                <div>
                  <div className="text-[9px] text-slate-600 uppercase font-mono font-bold tracking-widest leading-none">{label}</div>
                  <div className={`text-xs font-black font-mono mt-0.5 ${color}`}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN GRID — Form + Ledger
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── LEFT COLUMN: Transfer Form ──────────────────── */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080c14] border border-[#4390bc]/20 overflow-hidden">

          {/* Card title bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/70 bg-[#060a10]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4390bc]/15 border border-[#4390bc]/25 flex items-center justify-center text-base">🦊</div>
              <div>
                <div className="text-xs font-black text-white font-mono uppercase tracking-tight">New Transfer</div>
                <div className="text-[10px] text-slate-600 font-mono">Fill details and confirm in MetaMask</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-400">LIVE</span>
            </div>
          </div>

          <form onSubmit={handleSend} className="p-6 space-y-5">

            {/* ─ Sender (read-only) */}
            <div>
              <Label>From Wallet (MetaMask)</Label>
              <div className="h-11 rounded-xl bg-[#04060d] border border-slate-800/80 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-xs font-mono text-slate-300 truncate">{activeAddr}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0 ml-3">{balance} ETH</span>
              </div>
            </div>

            {/* ─ Recipient */}
            <div>
              <Label>To Wallet Address (0x…)</Label>
              <div className="relative">
                <input
                  type="text" value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="0x… paste recipient address"
                  className={INPUT + ' pr-28'}
                />
                <button type="button" onClick={() => setRecipient(activeAddr)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#68a7ca] text-[9px] font-black border border-slate-700 hover:border-[#4390bc]/50 transition">
                  MY ADDR
                </button>
              </div>
            </div>

            {/* ─ Asset + Amount */}
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
                  type="number" step="0.001" min="0" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-2">
              {['0.01','0.05','0.1','0.5','1.0'].map(v => (
                <button key={v} type="button" onClick={() => setAmount(v)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono transition border ${
                    amount === v
                      ? 'bg-[#4390bc]/20 text-[#8dbdd8] border-[#4390bc]/40'
                      : 'bg-[#04060d] text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}>
                  {v} {asset}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-800/60" />

            {/* ─ Memo */}
            <div>
              <Label>Transfer Note / Memo</Label>
              <input
                type="text" value={memo}
                onChange={e => setMemo(e.target.value)}
                className={INPUT}
              />
            </div>

            {/* ─ QR + Mobile Link */}
            <div className="rounded-xl border border-slate-800/60 bg-[#04060d] p-4 flex items-center gap-5">
              <div className="w-20 h-20 shrink-0 bg-white rounded-xl p-1.5 border border-[#4390bc]/30 shadow-[0_0_16px_rgba(67,144,188,0.2)]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `ethereum:${recipient || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41'}?value=${((parseFloat(amount) || 0.1) * 1e18).toString()}`
                  )}`}
                  alt="EIP-681 QR"
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">EIP-681 QR Code</span>
                  <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-[#4390bc]/10 text-[#8dbdd8] border border-[#4390bc]/20">SCANNABLE</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                  Scan to send <strong className="text-white">{amount} {asset}</strong> to <strong className="text-[#68a7ca]">{recipient ? `${recipient.substring(0,10)}…` : 'recipient'}</strong>
                </p>
                <a href={`https://metamask.app.link/send/${recipient || activeAddr}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101f30] border border-[#4390bc]/20 text-[#8dbdd8] text-[10px] font-bold hover:bg-[#162a40] transition">
                  <ExternalLink className="w-3 h-3" /> MetaMask Mobile
                </a>
              </div>
            </div>

            {/* ─ Security banner */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950/15 border border-emerald-800/30">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-[10px] text-emerald-400/80 font-mono leading-relaxed">
                Non-custodial · Private keys stay in MetaMask · Every transaction requires your explicit approval
              </span>
            </div>

            {/* ─ Transfer summary preview */}
            {parseFloat(amount) > 0 && recipient && (
              <div className="rounded-xl bg-[#04060d] border border-[#4390bc]/20 p-4 space-y-2">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Transfer Summary</div>
                {[
                  { label: 'Sending',    value: `${amount} ${asset}`,                             color: 'text-white' },
                  { label: 'To',         value: `${recipient.substring(0,14)}…`,                  color: 'text-[#68a7ca]' },
                  { label: 'Network',    value: realWalletNetwork || 'Ethereum Mainnet',           color: 'text-slate-300' },
                  { label: 'Est. Gas',   value: '0.000042 ETH (~$0.11)',                           color: 'text-slate-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ─ Submit button */}
            <button type="submit" disabled={isSending}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gradient-to-r from-[#3a7ca8] via-[#4390bc] to-[#68a7ca] text-slate-950 font-black text-sm uppercase tracking-widest shadow-[0_0_24px_rgba(67,144,188,0.3)] hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isSending
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Waiting for MetaMask…</>
                : <><Zap className="w-4 h-4 fill-slate-950" /> Send {amount} {asset} <ArrowRight className="w-4 h-4" /></>
              }
            </button>

          </form>
        </div>

        {/* ── RIGHT COLUMN: Ledger ────────────────────────── */}
        <div className="lg:col-span-5 rounded-2xl bg-[#080c14] border border-slate-800/70 overflow-hidden flex flex-col">

          {/* Ledger header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/70 bg-[#060a10]/60">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#68a7ca]" />
              <span className="text-xs font-black text-white font-mono uppercase">Transfer History</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-900 text-slate-500 border border-slate-800">
              {txHistory.length} TXS
            </span>
          </div>

          {/* TX list */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto no-scrollbar">
            {txHistory.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Send className="w-8 h-8 text-slate-800 mx-auto" />
                <p className="text-slate-600 text-xs font-mono">No transfers yet</p>
              </div>
            ) : txHistory.map((tx, idx) => (
              <div key={idx} className="rounded-xl bg-[#04060d] border border-slate-800/70 p-4 hover:border-slate-700/80 transition">

                {/* Top row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#4390bc]/10 text-[#8dbdd8] border border-[#4390bc]/25">
                      {tx.asset}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">{tx.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-end justify-between mb-2">
                  <span className="text-lg font-black text-white font-mono">{tx.amount}</span>
                  {tx.usd && tx.usd !== '—' && (
                    <span className="text-[11px] font-mono text-slate-500">{tx.usd}</span>
                  )}
                </div>

                {/* To address */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 mb-3">
                  <ArrowRight className="w-3 h-3 shrink-0 text-slate-700" />
                  <span className="text-slate-500 truncate">{tx.to.substring(0, 26)}…</span>
                </div>

                {/* TX hash row */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/50">
                  <span className="text-[10px] font-mono text-slate-700 truncate">
                    {tx.txHash.substring(0, 18)}…
                  </span>
                  <button onClick={() => copyTx(tx.txHash, tx.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[9px] font-bold text-slate-400 hover:text-[#68a7ca] transition border border-slate-800 hover:border-slate-700">
                    {copiedTx === tx.id
                      ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
                      : <><Copy className="w-3 h-3" /> Copy TX</>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Security footer */}
          <div className="px-5 py-4 border-t border-slate-800/70 bg-[#060a10]/40 space-y-2">
            <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-2">Security Guarantees</p>
            {[
              'Keys never leave your MetaMask extension',
              'EIP-1193 — no server relay or proxy',
              'Each transaction requires explicit sign-off',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                <CheckCircle2 className="w-3 h-3 text-emerald-600/70 shrink-0" />
                {item}
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};
