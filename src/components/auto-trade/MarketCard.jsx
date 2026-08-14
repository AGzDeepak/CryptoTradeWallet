import React from 'react';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Clock, Wifi } from 'lucide-react';

const fmt = (n, dec = 2) =>
  (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const MarketCard = ({
  pair = 'ETH/USDT',
  currentPrice = 3542.80,
  change24h = 2.41,
  indicators = { ema12: 3540.50, ema26: 3528.10, rsi: 48, trend: 'BULLISH' },
  connectionStatus = 'LIVE', // 'LIVE' | 'REST_FALLBACK' | 'STALE' | 'DISCONNECTED'
  isStale = false,
  lastUpdatedSecondsAgo = 1.2
}) => {
  const isUp = change24h >= 0;

  return (
    <div className="rounded-2xl bg-[#0d1523] border border-slate-800/80 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Market Ticker</h3>
            <p className="text-[11px] text-slate-400">Real-time WebSocket & REST Feed</p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {!isStale && connectionStatus === 'LIVE' && (
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live ●
            </span>
          )}
          {!isStale && connectionStatus === 'REST_FALLBACK' && (
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Wifi className="w-3 h-3" /> REST Feed
            </span>
          )}
          {(isStale || connectionStatus === 'STALE') && (
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              STALE FEED
            </span>
          )}
        </div>
      </div>

      {/* Stale Market Warning Banner Requirement */}
      {(isStale || connectionStatus === 'STALE') && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold">MARKET DATA UNAVAILABLE</p>
            <p className="text-[11px] font-normal text-rose-200">Auto Trading temporarily paused for price safety.</p>
          </div>
        </div>
      )}

      {/* Ticker Display */}
      <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/60">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{pair}</span>
          <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
            ${fmt(currentPrice, 2)}
          </div>
        </div>

        <div className="text-right">
          <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isUp ? '+' : ''}{change24h.toFixed(2)}%</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 justify-end">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Updated: {lastUpdatedSecondsAgo.toFixed(1)}s ago</span>
          </div>
        </div>
      </div>

      {/* Technical Indicators Pill Row */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
        <div className="p-2 rounded-xl bg-[#060d18] border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">Trend</span>
          <span className={`text-xs font-bold ${indicators.trend === 'BULLISH' ? 'text-emerald-400' : indicators.trend === 'BEARISH' ? 'text-rose-400' : 'text-slate-300'}`}>
            {indicators.trend}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-[#060d18] border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">RSI (14)</span>
          <span className="text-xs font-bold text-slate-200">{indicators.rsi}</span>
        </div>
        <div className="p-2 rounded-xl bg-[#060d18] border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">EMA 12/26</span>
          <span className="text-xs font-bold text-violet-300">
            {indicators.ema12 > indicators.ema26 ? 'Bullish Cross' : 'Bearish Cross'}
          </span>
        </div>
      </div>
    </div>
  );
};
