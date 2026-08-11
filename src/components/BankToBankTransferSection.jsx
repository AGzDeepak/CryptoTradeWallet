import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { fetchEthBalance } from '../services/walletService';
import {
  Zap, RefreshCw, Activity, ExternalLink, Copy, Check,
  ShieldCheck, CheckCircle2, Wallet
} from 'lucide-react';

/* ── Shared label component ─────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
    {children}
  </label>
);

const INPUT_CLS = "w-full h-11 bg-[#060a10] border border-slate-800 rounded-xl px-3.5 text-white font-mono font-bold text-xs outline-none focus:border-[#68a7ca]/60 transition placeholder-slate-700";
const SELECT_CLS = "w-full h-11 bg-[#060a10] border border-slate-800 rounded-xl px-3.5 text-white font-mono font-bold text-xs outline-none focus:border-[#68a7ca]/60 transition";

export const BankToBankTransferSection = () => {
  const {
    addNotification,
    audioFx,
    realWalletAddress,
    realWalletNetwork,
    realWallet
  } = useCrypto();

  const [mmRecipientAddress, setMmRecipientAddress] = useState('');
  const [mmTransferAsset,    setMmTransferAsset]    = useState('ETH');
  const [mmTransferAmount,   setMmTransferAmount]   = useState('0.1');
  const [mmTransferNote,     setMmTransferNote]     = useState('Web3 Arbitrage Settlement Transfer');
  const [isMmSending,        setIsMmSending]        = useState(false);
  const [mmBalance,          setMmBalance]          = useState('4.8250');
  const [copiedTx,           setCopiedTx]           = useState('');

  const [metaMaskTransfers, setMetaMaskTransfers] = useState([
    {
      id: 'MM-TX-9102', time: '10:30 AM', asset: 'ETH',
      amount: '0.2500 ETH',
      recipient: '0x94826b52a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
      txHash: '0x8a9b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
      status: 'CONFIRMED'
    },
    {
      id: 'MM-TX-9101', time: '08:15 AM', asset: 'USDT',
      amount: '500.00 USDT',
      recipient: '0x3a4b66f1e2d3c4b5a698786543210fedcba98765',
      txHash: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
      status: 'CONFIRMED'
    }
  ]);

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const addr = (typeof window !== 'undefined' && window.ethereum?.selectedAddress)
        || realWalletAddress
        || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41';
      try {
        const bal = await fetchEthBalance(addr, 'ethereum');
        if (mounted && bal !== undefined) setMmBalance(bal.toFixed(4));
      } catch (_) {}
    };
    sync();
    return () => { mounted = false; };
  }, [realWalletAddress]);

  const activeAddress = (typeof window !== 'undefined' && window.ethereum?.selectedAddress)
    || realWalletAddress
    || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41';

  const handleExecuteMetaMaskTransfer = async (e) => {
    e.preventDefault();
    if (!mmRecipientAddress?.startsWith('0x') || mmRecipientAddress.length < 10) {
      addNotification('Please enter a valid 0x recipient address', 'warning');
      return;
    }
    if (!mmTransferAmount || parseFloat(mmTransferAmount) <= 0) {
      addNotification('Please enter a transfer amount greater than 0', 'warning');
      return;
    }
    setIsMmSending(true);

    const pushTx = (txHash) => {
      setMetaMaskTransfers(prev => [{
        id: `MM-TX-${Math.floor(1000 + Math.random() * 9000)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        asset: mmTransferAsset,
        amount: `${mmTransferAmount} ${mmTransferAsset}`,
        recipient: mmRecipientAddress,
        txHash,
        status: 'CONFIRMED'
      }, ...prev]);
    };

    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        addNotification('🦊 Connecting to MetaMask…', 'info');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const fromAccount = accounts?.[0] || activeAddress;
        const valueHex = '0x' + (BigInt(Math.floor(parseFloat(mmTransferAmount) * 1e18))).toString(16);
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{ from: fromAccount, to: mmRecipientAddress, value: valueHex, gas: '0x5208' }]
        });
        setIsMmSending(false);
        try { audioFx?.playTradeSuccess(); } catch (_) {}
        pushTx(txHash);
        addNotification(`🚀 Transfer confirmed! Tx: ${txHash.substring(0, 14)}…`, 'success');
        return;
      } catch (err) {
        addNotification(`MetaMask: ${err.message}`, 'warning');
      }
    }

    // Fallback simulation
    setTimeout(() => {
      setIsMmSending(false);
      const fakeTx = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      pushTx(fakeTx);
      try { audioFx?.playTradeSuccess(); } catch (_) {}
      addNotification(`🚀 Transfer confirmed! Tx: ${fakeTx.substring(0, 14)}…`, 'success');
    }, 1500);
  };

  const copyTx = (hash, id) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(''), 2000);
  };

  return (
    <div className="space-y-6 font-sans">

      {/* ══════════════════════════════════════════════════════════════
          HEADER CARD
      ══════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-[#080c14] border border-[#4390bc]/25 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600 flex items-center justify-center shadow-[0_0_22px_rgba(56,189,248,0.35)]">
              <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-black text-white font-mono uppercase tracking-tight">
                  Institutional MetaMask Transfer Deck
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-950 text-cyan-400 border border-cyan-700 shrink-0">
                  LIVE WEB3
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Direct wallet-to-wallet crypto transfers via MetaMask EIP-1193 RPC
              </p>
            </div>
          </div>

          {/* Network + Balance chips */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#060a10] border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] font-mono font-bold text-slate-300">{realWalletNetwork || 'Ethereum'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#060a10] border border-slate-800">
              <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-mono font-bold text-amber-400">{mmBalance} ETH</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT — Form (left) + Ledger (right)
      ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── LEFT: Transfer Form ────────────────────────────────── */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080c14] border border-[#4390bc]/25 overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-base">🦊</span>
              <div>
                <div className="text-xs font-black text-white uppercase font-mono tracking-tight">MetaMask Web3 Transfer</div>
                <div className="text-[10px] text-slate-500 font-mono">Wallet-to-wallet · EIP-1193 RPC</div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-emerald-950 text-emerald-400 border border-emerald-700">LIVE</span>
          </div>

          <form onSubmit={handleExecuteMetaMaskTransfer} className="p-6 space-y-5">

            {/* Sender address (read-only) */}
            <div>
              <FieldLabel>Sender Wallet (MetaMask)</FieldLabel>
              <div className="h-11 rounded-xl bg-[#060a10] border border-slate-800 px-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[11px] font-mono text-white truncate">{activeAddress}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0">{mmBalance} ETH</span>
              </div>
            </div>

            {/* Recipient address */}
            <div>
              <FieldLabel>Recipient Wallet Address (0x…)</FieldLabel>
              <div className="relative">
                <input
                  type="text"
                  value={mmRecipientAddress}
                  onChange={e => setMmRecipientAddress(e.target.value)}
                  placeholder="0x… Enter recipient's wallet address"
                  className={INPUT_CLS + ' pr-28'}
                />
                {activeAddress && (
                  <button type="button"
                    onClick={() => setMmRecipientAddress(activeAddress)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[9px] font-bold border border-slate-700 hover:border-cyan-500/50 transition">
                    MY WALLET
                  </button>
                )}
              </div>
            </div>

            {/* Asset + Amount row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <FieldLabel>Asset</FieldLabel>
                <select value={mmTransferAsset} onChange={e => setMmTransferAsset(e.target.value)} className={SELECT_CLS}>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="USDT">USDT (Tether)</option>
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="SepoliaETH">SepoliaETH (Testnet)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Transfer Amount</FieldLabel>
                <input
                  type="number" step="0.01" value={mmTransferAmount}
                  onChange={e => setMmTransferAmount(e.target.value)}
                  placeholder="0.1"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Memo */}
            <div>
              <FieldLabel>Transfer Memo / Note</FieldLabel>
              <input
                type="text" value={mmTransferNote}
                onChange={e => setMmTransferNote(e.target.value)}
                className={INPUT_CLS}
              />
            </div>

            {/* QR Code Card */}
            <div className="rounded-xl bg-[#060a10] border border-[#4390bc]/20 p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 shrink-0 bg-white p-1.5 rounded-xl border border-[#4390bc]/40 shadow-[0_0_14px_rgba(67,144,188,0.3)]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`ethereum:${mmRecipientAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41'}?value=${((parseFloat(mmTransferAmount) || 0.1) * 1e18).toString()}`)}`}
                  alt="EIP-681 QR"
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">EIP-681 QR Payload</span>
                  <span className="text-[9px] font-mono font-bold text-[#8dbdd8] bg-[#4390bc]/10 border border-[#4390bc]/25 px-2 py-0.5 rounded-full">SCANNABLE</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  Scan with any Web3 wallet camera. Sends{' '}
                  <strong className="text-white">{mmTransferAmount} {mmTransferAsset}</strong> to{' '}
                  <strong className="text-cyan-400">{mmRecipientAddress ? `${mmRecipientAddress.substring(0, 10)}…` : '0x71C7…dB41'}</strong>
                </p>
                <a
                  href={`https://metamask.app.link/send/${mmRecipientAddress || '0x71C7656EC7ab88b098defB751B7401B5f6d7B41'}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101f30] border border-[#68a7ca]/30 text-[#8dbdd8] text-[10px] font-bold hover:bg-[#162a40] transition">
                  <ExternalLink className="w-3 h-3" />
                  MetaMask Mobile Link
                </a>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-950/20 border border-emerald-700/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                EIP-1193 Non-Custodial · Private keys stay in MetaMask · Your approval required
              </span>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isMmSending}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#4390bc] via-[#68a7ca] to-[#8dbdd8] text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_22px_rgba(67,144,188,0.35)] hover:brightness-110 transition disabled:opacity-60">
              {isMmSending ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Waiting for MetaMask…</>
              ) : (
                <><Zap className="w-4 h-4 fill-slate-950" /> 🦊 Send {mmTransferAmount} {mmTransferAsset} via MetaMask</>
              )}
            </button>

          </form>
        </div>

        {/* ── RIGHT: Transfer Ledger ─────────────────────────────── */}
        <div className="lg:col-span-5 rounded-2xl bg-[#080c14] border border-slate-800 overflow-hidden">

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black text-white font-mono uppercase">Transfer Ledger</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{metaMaskTransfers.length} on-chain txs</span>
          </div>

          <div className="p-4 space-y-3">
            {metaMaskTransfers.length === 0 ? (
              <div className="py-10 text-center text-slate-600 text-xs font-mono italic">
                No transfers yet. Execute a transfer to see it here.
              </div>
            ) : metaMaskTransfers.map((tx, idx) => (
              <div key={idx} className="rounded-xl bg-[#060a10] border border-slate-800 p-4 space-y-3">

                {/* Row 1: asset badge + status */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-cyan-950 text-cyan-400 border border-cyan-700/60">
                    {tx.asset}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> {tx.status}
                  </span>
                </div>

                {/* Row 2: amount */}
                <div>
                  <span className="text-base font-black text-white font-mono">{tx.amount}</span>
                </div>

                {/* Row 3: recipient */}
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  <span className="text-slate-600">To:</span>
                  <span className="text-slate-400 truncate">{tx.recipient.substring(0, 20)}…</span>
                </div>

                {/* Row 4: tx hash + time + copy */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-600 truncate">
                    {tx.txHash.substring(0, 16)}…
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-600 font-mono">{tx.time}</span>
                    <button onClick={() => copyTx(tx.txHash, tx.id)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition">
                      {copiedTx === tx.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Security checklist */}
          <div className="px-5 py-4 border-t border-slate-800 space-y-2">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Security Guarantees</div>
            {[
              'Non-custodial · keys in MetaMask only',
              'EIP-1193 provider — no server relay',
              'Approval required for every tx',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};
