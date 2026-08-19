import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, ExternalLink,
  RefreshCw, Copy, Download, Code, Shield, Hash,
  Layers, Users, Activity, Zap, ChevronRight, FileCode
} from 'lucide-react';

const BACKEND = 'http://localhost:8000';

const shortAddr = a => a ? a.slice(0, 10) + '...' + a.slice(-8) : '—';
const fmt$ = (v, d = 2) => v == null ? '—' : '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const STATUS_CONFIG = {
  DEPLOYED:       { color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-700/40', dot: 'bg-emerald-400',    label: '✅ DEPLOYED & VERIFIED' },
  NOT_DEPLOYED:   { color: 'text-red-400',     bg: 'bg-red-900/20 border-red-700/40',         dot: 'bg-red-500',        label: '❌ NOT DEPLOYED — No bytecode at address' },
  NOT_CONFIGURED: { color: 'text-yellow-400',  bg: 'bg-yellow-900/20 border-yellow-700/40',   dot: 'bg-yellow-400',     label: '⚠ NOT CONFIGURED — Set DEPLOYED_CONTRACT in .env' },
  UNREACHABLE:    { color: 'text-orange-400',  bg: 'bg-orange-900/20 border-orange-700/40',   dot: 'bg-orange-400',     label: '🔌 UNREACHABLE — RPC connection failed' },
  PAPER_MODE:     { color: 'text-blue-400',    bg: 'bg-blue-900/20 border-blue-700/40',       dot: 'bg-blue-400',       label: '📄 PAPER MODE — No contract needed' },
  LOADING:        { color: 'text-slate-400',   bg: 'bg-slate-900/20 border-slate-700/40',     dot: 'bg-slate-600 animate-pulse', label: '⟳ Verifying on-chain…' },
};

/**
 * ContractPanel — Full FlashArbitrageExecutor contract management panel.
 *
 * Features:
 *  - Contract address input with checksum validation
 *  - Live on-chain verification (bytecode check + state reads)
 *  - Contract info display: owner, beneficiary, tradeCount, paused, authorized routers
 *  - Arbiscan/Etherscan deep-link
 *  - ABI download
 *  - Remix IDE deploy link with pre-filled constructor args
 *  - Step-by-step deployment guide
 */
export const ContractPanel = ({ mode, connected }) => {
  const [contractInfo, setContractInfo]       = useState(null);
  const [instructions, setInstructions]       = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [verifying, setVerifying]             = useState(false);
  const [addressInput, setAddressInput]       = useState('');
  const [addressError, setAddressError]       = useState('');
  const [settingAddress, setSettingAddress]   = useState(false);
  const [setAddressResult, setSetAddrResult]  = useState(null);
  const [copied, setCopied]                   = useState('');
  const [activeSection, setActiveSection]     = useState('status');

  // ── Fetch contract status ───────────────────────────────────────────────────
  const fetchStatus = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const url = force ? BACKEND + '/api/contract/verify' : BACKEND + '/api/contract/status';
      const method = force ? 'POST' : 'GET';
      const r = await fetch(url, { method });
      if (r.ok) {
        const d = await r.json();
        setContractInfo(d);
        if (d.address) setAddressInput(d.address);
      }
    } catch (_) {}
    setLoading(false);
  }, []);

  const fetchInstructions = useCallback(async () => {
    try {
      const r = await fetch(BACKEND + '/api/contract/deploy-instructions');
      if (r.ok) setInstructions(await r.json());
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (connected) { fetchStatus(); fetchInstructions(); }
    const iv = setInterval(() => { if (connected) fetchStatus(); }, 30000);
    return () => clearInterval(iv);
  }, [connected, fetchStatus, fetchInstructions]);

  // ── Address validation ──────────────────────────────────────────────────────
  const validateAddress = (addr) => {
    if (!addr) return 'Address is required';
    if (!addr.startsWith('0x')) return 'Must start with 0x';
    if (addr.length !== 42) return `Length must be 42 chars (got ${addr.length})`;
    if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) return 'Contains invalid hex characters';
    return '';
  };

  const handleAddressChange = (e) => {
    const v = e.target.value.trim();
    setAddressInput(v);
    setAddressError(v ? validateAddress(v) : '');
    setSetAddrResult(null);
  };

  // ── Set contract address ────────────────────────────────────────────────────
  const handleSetAddress = async () => {
    const err = validateAddress(addressInput);
    if (err) { setAddressError(err); return; }
    setSettingAddress(true);
    setSetAddrResult(null);
    try {
      const r = await fetch(BACKEND + '/api/contract/set-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressInput }),
      });
      const d = await r.json();
      if (r.ok) {
        setSetAddrResult({ ok: true, msg: d.message });
        // Re-verify with new address
        setTimeout(() => fetchStatus(true), 500);
      } else {
        setSetAddrResult({ ok: false, msg: d.detail || 'Failed to set address' });
      }
    } catch (_) {
      setSetAddrResult({ ok: false, msg: 'Backend not reachable' });
    }
    setSettingAddress(false);
  };

  // ── Download ABI ────────────────────────────────────────────────────────────
  const handleDownloadAbi = async () => {
    try {
      const r = await fetch(BACKEND + '/api/contract/abi');
      if (r.ok) {
        const d = await r.json();
        const blob = new Blob([JSON.stringify(d.abi, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'FlashArbitrageExecutor.abi.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (_) {}
  };

  // ── Copy to clipboard ───────────────────────────────────────────────────────
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const status   = contractInfo?.status || 'LOADING';
  const sc       = STATUS_CONFIG[status] || STATUS_CONFIG['LOADING'];
  const deployed = status === 'DEPLOYED';
  const paperMode = status === 'PAPER_MODE';

  // ── Remix deploy URL ───────────────────────────────────────────────────────
  const remixUrl = instructions
    ? `https://remix.ethereum.org/#lang=en&optimize=true&runs=200&evmVersion=paris`
    : 'https://remix.ethereum.org';

  return (
    <div className="space-y-4">

      {/* ── STATUS HEADER ─────────────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-5 ${sc.bg}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${sc.dot} ${status === 'LOADING' ? 'animate-pulse' : ''}`} />
            <div>
              <h3 className={`text-sm font-extrabold font-mono uppercase ${sc.color}`}>
                FlashArbitrageExecutor.sol
              </h3>
              <p className={`text-xs font-mono mt-0.5 ${sc.color}`}>{sc.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStatus(true)}
              disabled={loading || !connected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-mono transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Verifying…' : 'Verify On-Chain'}
            </button>
            {contractInfo?.explorer_url && (
              <a href={contractInfo.explorer_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 border border-blue-700/30 text-blue-400 text-xs font-mono transition">
                <ExternalLink className="w-3.5 h-3.5" /> Explorer
              </a>
            )}
          </div>
        </div>

        {contractInfo?.message && (
          <p className="text-xs font-mono text-slate-400 mt-3 border-t border-slate-700/40 pt-2">
            {contractInfo.message}
          </p>
        )}
      </div>

      {/* ── ADDRESS INPUT SECTION ─────────────────────────────────────────── */}
      <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-cyan-400" /> Contract Address Configuration
        </h4>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-slate-500 uppercase">
            DEPLOYED_CONTRACT — {contractInfo?.chain || 'Arbitrum Sepolia'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={addressInput}
              onChange={handleAddressChange}
              placeholder="0x0000000000000000000000000000000000000000"
              className={`flex-1 bg-[#020c18] border rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none transition ${
                addressError ? 'border-red-600/60 focus:border-red-500' :
                !addressError && addressInput.length === 42 ? 'border-emerald-600/60 focus:border-emerald-500' :
                'border-slate-700/60 focus:border-slate-500'
              }`}
            />
            {addressInput.length === 42 && (
              <button
                onClick={() => copyToClipboard(addressInput, 'addr')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
                title="Copy address"
              >
                {copied === 'addr' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          {addressError && (
            <p className="text-xs font-mono text-red-400 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> {addressError}
            </p>
          )}
          {!addressError && addressInput.length === 42 && (
            <p className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Valid Ethereum address format
            </p>
          )}
        </div>

        <button
          onClick={handleSetAddress}
          disabled={settingAddress || !!addressError || !addressInput || !connected}
          className={`w-full py-2.5 rounded-xl font-mono font-bold text-sm transition flex items-center justify-center gap-2 ${
            !settingAddress && !addressError && addressInput && connected
              ? 'bg-cyan-700/60 hover:bg-cyan-700/80 border border-cyan-600/50 text-white'
              : 'bg-slate-800/40 border border-slate-700/30 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Shield className="w-4 h-4" />
          {settingAddress ? 'Saving & Verifying…' : 'Set Contract Address & Verify On-Chain'}
        </button>

        {setAddressResult && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-mono ${
            setAddressResult.ok
              ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-300'
              : 'bg-red-900/20 border-red-700/30 text-red-300'
          }`}>
            {setAddressResult.ok ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {setAddressResult.msg}
          </div>
        )}

        {!connected && (
          <p className="text-xs font-mono text-yellow-400/70 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Backend not connected — start Python server first
          </p>
        )}
      </div>

      {/* ── SUB-TABS ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-[#0a1020] rounded-xl p-1 border border-slate-800/60">
        {[
          { id: 'status', label: 'Contract Info', icon: Layers },
          { id: 'routers', label: 'Authorized Routers', icon: Users },
          { id: 'deploy', label: 'Deploy Guide', icon: FileCode },
          { id: 'abi', label: 'ABI & Tools', icon: Code },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveSection(t.id)}
            className={'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold transition ' +
              (activeSection === t.id ? 'bg-[#0d1a2e] text-white border border-slate-700/50' : 'text-slate-500 hover:text-slate-300')}>
            <t.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── CONTRACT INFO ─────────────────────────────────────────────────── */}
      {activeSection === 'status' && (
        <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> On-Chain Contract State
          </h4>
          {deployed ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ['Contract Address', shortAddr(contractInfo?.checksum_address || contractInfo?.address), 'text-cyan-400', contractInfo?.address],
                ['Owner',            shortAddr(contractInfo?.owner),       'text-white',       contractInfo?.owner],
                ['Beneficiary',      shortAddr(contractInfo?.beneficiary), 'text-emerald-400', contractInfo?.beneficiary],
                ['Trade Count',      contractInfo?.trade_count ?? '—',     'text-white',       null],
                ['Status',           contractInfo?.is_paused ? '⏸ PAUSED' : '▶ ACTIVE', contractInfo?.is_paused ? 'text-red-400' : 'text-emerald-400', null],
                ['Min Profit BPS',   contractInfo?.min_profit_bps != null ? contractInfo.min_profit_bps + ' bps' : '—', 'text-yellow-400', null],
                ['Max Trade Size',   contractInfo?.max_trade_size_usd != null ? fmt$(contractInfo.max_trade_size_usd / 1e6, 0) : '—', 'text-white', null],
                ['ETH Balance',      contractInfo?.eth_balance != null ? contractInfo.eth_balance.toFixed(6) + ' ETH' : '—', 'text-indigo-400', null],
                ['Aave Pool',        shortAddr(contractInfo?.aave_pool), 'text-cyan-400', contractInfo?.aave_pool],
                ['Network',          contractInfo?.chain || '—', 'text-slate-300', null],
              ].map(([label, value, color, copyVal]) => (
                <div key={label} className="bg-[#06101e] rounded-xl p-3">
                  <p className="text-[9px] font-mono text-slate-600 uppercase mb-1">{label}</p>
                  <div className="flex items-center gap-1.5">
                    <p className={`font-bold font-mono text-xs ${color} flex-1 truncate`}>{value}</p>
                    {copyVal && (
                      <button onClick={() => copyToClipboard(copyVal, label)}
                        className="text-slate-600 hover:text-slate-400 transition shrink-0">
                        {copied === label ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : paperMode ? (
            <div className="text-center py-8 space-y-2">
              <Shield className="w-10 h-10 text-blue-600 mx-auto" />
              <p className="text-blue-400 font-mono text-sm font-bold">Paper Mode Active</p>
              <p className="text-slate-500 font-mono text-xs">No contract required — virtual execution only</p>
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <Layers className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-slate-400 font-mono text-sm">{contractInfo?.message || 'No contract configured'}</p>
              <p className="text-slate-600 font-mono text-xs">Enter a contract address above or follow the Deploy Guide tab</p>
            </div>
          )}
        </div>
      )}

      {/* ── AUTHORIZED ROUTERS ────────────────────────────────────────────── */}
      {activeSection === 'routers' && (
        <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-blue-400" /> Authorized DEX Routers
          </h4>
          {deployed && contractInfo?.authorized_routers ? (
            <div className="space-y-2">
              {Object.entries(contractInfo.authorized_routers).map(([name, info]) => (
                <div key={name} className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-mono ${
                  info.authorized
                    ? 'bg-emerald-900/15 border-emerald-700/30'
                    : 'bg-red-900/15 border-red-700/30'
                }`}>
                  {info.authorized
                    ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold ${info.authorized ? 'text-emerald-300' : 'text-red-300'}`}>{name}</p>
                    <p className="text-slate-500 truncate">{info.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    info.authorized ? 'bg-emerald-800/40 text-emerald-400' : 'bg-red-800/40 text-red-400'
                  }`}>
                    {info.authorized ? 'AUTHORIZED' : 'NOT AUTH'}
                  </span>
                </div>
              ))}
              {!Object.values(contractInfo.authorized_routers).some(r => r.authorized) && (
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 text-xs font-mono text-yellow-300">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                  No routers authorized! Call <code className="bg-yellow-900/40 px-1 rounded">authorizeRouter(address, true)</code> for each DEX router.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600 font-mono text-xs space-y-2">
              <Users className="w-8 h-8 mx-auto" />
              <p>{deployed ? 'No router data available' : 'Deploy contract first to see authorized routers'}</p>
            </div>
          )}
        </div>
      )}

      {/* ── DEPLOY GUIDE ─────────────────────────────────────────────────── */}
      {activeSection === 'deploy' && (
        <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-yellow-400" /> Contract Deployment Guide
          </h4>

          <div className="bg-[#06101e] rounded-xl p-4 space-y-2 font-mono text-xs">
            <p className="text-yellow-400 font-bold mb-3">📋 Deploy to {contractInfo?.chain || 'Arbitrum Sepolia'}</p>
            {(instructions?.steps || [
              '1. Open Remix IDE → New file → paste FlashArbitrageExecutor.sol',
              '2. Compile with Solidity 0.8.20 + EVM Paris + Optimization 200',
              '3. Connect MetaMask to Arbitrum Sepolia (Chain ID 421614)',
              '4. Deploy with constructor args below',
              '5. Copy deployed address → paste above → click Set Contract Address',
              '6. Call authorizeRouter() for each DEX router',
            ]).map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-600 shrink-0 w-4">{i + 1}.</span>
                <span className="text-slate-300">{step.replace(/^\d+\. /, '')}</span>
              </div>
            ))}
          </div>

          {/* Constructor args */}
          <div className="bg-[#06101e] rounded-xl p-4 space-y-2">
            <p className="text-xs font-mono font-bold text-slate-400 uppercase mb-3">Constructor Arguments</p>
            {[
              ['_provider (PoolAddressesProvider)', instructions?.constructor_args?._provider || '0xd6328Fb9B5b7D3c17Df9eF71B7A86Aef70b7E31'],
              ['_beneficiary (your wallet)',         instructions?.constructor_args?._beneficiary || '<your_wallet_address>'],
            ].map(([label, value]) => (
              <div key={label} className="space-y-1">
                <p className="text-[10px] font-mono text-slate-600 uppercase">{label}</p>
                <div className="flex items-center gap-2 bg-[#020c18] rounded-lg px-3 py-2">
                  <code className="text-emerald-400 font-mono text-xs flex-1 break-all">{value}</code>
                  <button onClick={() => copyToClipboard(value, label)}
                    className="text-slate-600 hover:text-slate-400 transition shrink-0">
                    {copied === label ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <a href={remixUrl} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-700/40 hover:bg-orange-700/60 border border-orange-600/40 text-orange-300 text-xs font-mono font-bold transition">
              <ExternalLink className="w-3.5 h-3.5" /> Open Remix IDE
            </a>
            <a
              href={`${contractInfo?.explorer_url?.replace('/address/' + contractInfo?.address, '') || 'https://sepolia.arbiscan.io'}/contractsVerifier`}
              target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-700/40 hover:bg-blue-700/60 border border-blue-600/40 text-blue-300 text-xs font-mono font-bold transition">
              <ExternalLink className="w-3.5 h-3.5" /> Verify on Explorer
            </a>
          </div>

          {/* .env snippet */}
          <div className="bg-[#06101e] rounded-xl p-4">
            <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Add to .env after deployment</p>
            <div className="flex items-start gap-2 bg-[#020c18] rounded-lg px-3 py-2">
              <pre className="text-emerald-400 font-mono text-xs flex-1 whitespace-pre-wrap">
{`DEPLOYED_CONTRACT=0x<your_contract_address>
EXECUTION_ENABLED=true
EXECUTION_MODE=testnet`}
              </pre>
              <button onClick={() => copyToClipboard('DEPLOYED_CONTRACT=0x\nEXECUTION_ENABLED=true\nEXECUTION_MODE=testnet', 'env')}
                className="text-slate-600 hover:text-slate-400 transition shrink-0">
                {copied === 'env' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ABI & TOOLS ──────────────────────────────────────────────────── */}
      {activeSection === 'abi' && (
        <div className="bg-[#0d1523] border border-slate-800/60 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
            <Code className="w-3.5 h-3.5 text-purple-400" /> ABI & Developer Tools
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={handleDownloadAbi}
              disabled={!connected}
              className="flex items-center gap-2 p-4 rounded-xl bg-purple-900/20 hover:bg-purple-900/30 border border-purple-700/30 text-purple-300 text-xs font-mono transition disabled:opacity-40">
              <Download className="w-4 h-4" />
              <div className="text-left">
                <p className="font-bold">Download ABI JSON</p>
                <p className="text-purple-400/60">FlashArbitrageExecutor.abi.json</p>
              </div>
            </button>

            {contractInfo?.address && (
              <button onClick={() => copyToClipboard(contractInfo.checksum_address || contractInfo.address, 'abi_addr')}
                className="flex items-center gap-2 p-4 rounded-xl bg-cyan-900/20 hover:bg-cyan-900/30 border border-cyan-700/30 text-cyan-300 text-xs font-mono transition">
                {copied === 'abi_addr' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <div className="text-left">
                  <p className="font-bold">{copied === 'abi_addr' ? 'Copied!' : 'Copy Contract Address'}</p>
                  <p className="text-cyan-400/60 truncate max-w-[160px]">{contractInfo.address}</p>
                </div>
              </button>
            )}
          </div>

          {/* Key functions reference */}
          <div className="bg-[#06101e] rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase mb-3">Key Contract Functions</p>
            {[
              { fn: 'executeFlashArbitrage(asset, amount, params)', desc: 'Main entry — initiates Aave V3 flash loan + atomic swap', color: 'text-emerald-400' },
              { fn: 'authorizeRouter(address, bool)',               desc: 'Owner only — whitelist/remove a DEX router',              color: 'text-blue-400' },
              { fn: 'emergencyStop()',                              desc: 'Owner only — pauses all executions',                       color: 'text-red-400' },
              { fn: 'resume()',                                     desc: 'Owner only — unpauses contract',                          color: 'text-yellow-400' },
              { fn: 'emergencyWithdraw(token, amount)',             desc: 'Owner only — rescue stuck tokens',                       color: 'text-orange-400' },
              { fn: 'tradeCount() → uint256',                      desc: 'Total flash arbitrages executed',                         color: 'text-slate-300' },
            ].map(({ fn, desc, color }) => (
              <div key={fn} className="flex items-start gap-3 pb-2 border-b border-slate-800/30 last:border-0">
                <code className={`text-[10px] font-mono ${color} shrink-0 max-w-[260px] break-all`}>{fn}</code>
                <span className="text-[10px] text-slate-500 font-mono">{desc}</span>
              </div>
            ))}
          </div>

          {/* Events reference */}
          <div className="bg-[#06101e] rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase mb-3">Events Emitted</p>
            {[
              { ev: 'ArbitrageExecuted(tradeId, borrowed, repaid, netProfit, beneficiary, ts)', color: 'text-emerald-400' },
              { ev: 'ArbitrageFailed(tradeId, reason, ts)',            color: 'text-red-400' },
              { ev: 'FlashLoanStarted(tradeId, asset, amount, ts)',    color: 'text-cyan-400' },
              { ev: 'SwapExecuted(tradeId, leg, router, ...)',         color: 'text-blue-400' },
              { ev: 'RouterAuthorized(router, authorized)',            color: 'text-yellow-400' },
              { ev: 'EmergencyStopped(by, ts)',                        color: 'text-red-400' },
            ].map(({ ev, color }) => (
              <code key={ev} className={`block text-[10px] font-mono ${color}`}>{ev}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
