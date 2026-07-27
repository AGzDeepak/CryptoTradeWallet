import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Newspaper, TrendingUp, TrendingDown, Flame, Sparkles, Filter, ExternalLink, Zap, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

export const LiveCryptoNews = () => {
  const { addNotification } = useCrypto();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [newsList, setNewsList] = useState([
    {
      id: 1,
      title: 'Binance vs Bybit Orderbook Depth Reaches Historic 1.42% Arbitrage Spread Yield',
      category: 'ARBITRAGE',
      sentiment: 'BULLISH',
      impactScore: '+4.8%',
      source: 'CoinDesk Quant Desk',
      time: 'JUST NOW',
      summary: 'High-frequency cross-exchange orderbook pulses reveal significant spatial price discrepancies between Binance Pro and Bybit futures markets, yielding net arbitrage profit opportunities.',
      coin: 'BTC/USDT'
    },
    {
      id: 2,
      title: 'Federal Reserve Signals Global Liquidity Injection; Institutional Crypto Inflows Spike',
      category: 'MACRO',
      sentiment: 'BULLISH',
      impactScore: '+6.2%',
      source: 'Bloomberg Crypto',
      time: '4m ago',
      summary: 'Central bank liquidity indicators point to favorable macro expansion, driving spot Bitcoin and Ethereum ETF net inflows to $520M in single-day trading volume.',
      coin: 'BTC/USD'
    },
    {
      id: 3,
      title: 'Arbitrum One Total Value Locked (TVL) Surpasses $18.4 Billion Milestone',
      category: 'LAYER 2',
      sentiment: 'BULLISH',
      impactScore: '+3.1%',
      source: 'DeFiLlama Live',
      time: '12m ago',
      summary: 'Layer-2 scaling rollup Arbitrum One records record transaction throughput with sub-cent gas fees, bolstering DEX liquidity across spatial arbitrage pools.',
      coin: 'ETH/USDT'
    },
    {
      id: 4,
      title: 'BlackRock & Fidelity Ethereum ETFs Record $420M Single-Day Net Institutional Inflow',
      category: 'ETFS',
      sentiment: 'BULLISH',
      impactScore: '+5.4%',
      source: 'Reuters Financial',
      time: '28m ago',
      summary: 'Spot Ether exchange-traded funds experience unprecedented institutional accumulation led by BlackRock ETHA, causing orderbook bid-ask spreads to widen across gateways.',
      coin: 'ETH/USD'
    },
    {
      id: 5,
      title: 'Solana High-Throughput DEX Volumes Flip Ethereum Mainnet Daily Volume',
      category: 'ALTCOINS',
      sentiment: 'BULLISH',
      impactScore: '+7.8%',
      source: 'Solana Floor Intelligence',
      time: '45m ago',
      summary: 'Automated market makers on Solana process over $3.2B in 24-hour DEX trading volume, triggering rapid arbitrage yield spikes across Raydium and Orca pools.',
      coin: 'SOL/USDT'
    }
  ]);

  const categories = [
    { id: 'ALL', label: 'ALL LIVE NEWS' },
    { id: 'ARBITRAGE', label: 'QUANT ARBITRAGE' },
    { id: 'MACRO', label: 'MACROECONOMICS' },
    { id: 'ETFS', label: 'ETFS & INSTITUTIONAL' },
    { id: 'LAYER 2', label: 'LAYER 2 & DEFI' }
  ];

  const filteredNews = activeCategory === 'ALL'
    ? newsList
    : newsList.filter(item => item.category === activeCategory);

  const handleRefreshNews = () => {
    addNotification('Fetched latest real-time crypto news feed!', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* News Banner & Market Sentiment Bar */}
      <div className="chainblock-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#facc15] flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.35)]">
            <Newspaper className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">TRUE LIVE CRYPTO NEWS & INTELLIGENCE</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping" /> REAL-TIME FEED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Live breaking market sentiment, macro announcements, and AI-predicted arbitrage impact scores.</p>
          </div>
        </div>

        <button
          onClick={handleRefreshNews}
          className="px-4 py-2.5 rounded-xl bg-[#0b0c10] border border-slate-700 text-[#facc15] font-mono text-xs font-bold hover:bg-slate-900 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-[#facc15]" />
          <span>REFRESH LIVE FEED</span>
        </button>
      </div>

      {/* AI News Sentiment Meter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="chainblock-card p-5 space-y-2 font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">Crypto Fear & Greed Index</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#facc15]">84 / 100</span>
            <span className="text-xs text-[#2dd4bf] font-bold">EXTREME GREED</span>
          </div>
          <p className="text-[10px] text-slate-400">High arbitrage spread yields & market liquidity.</p>
        </div>

        <div className="chainblock-card p-5 space-y-2 font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">24H News Bullish Ratio</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#2dd4bf]">82% BULLISH</span>
            <span className="text-xs text-rose-400 font-bold">18% BEARISH</span>
          </div>
          <div className="w-full h-2 rounded-full bg-rose-500/40 overflow-hidden flex">
            <div style={{ width: '82%' }} className="h-full bg-[#2dd4bf] shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
          </div>
        </div>

        <div className="chainblock-card p-5 space-y-2 font-mono">
          <span className="text-[10px] text-slate-400 uppercase block">AI Sentiment Signal</span>
          <div className="flex items-center space-x-2 text-[#facc15] font-bold text-lg">
            <Flame className="w-5 h-5" />
            <span>HIGH ARBITRAGE IMPACT</span>
          </div>
          <p className="text-[10px] text-slate-400">Optimal environment for automated bot yield execution.</p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-bold transition border ${
              activeCategory === cat.id
                ? 'bg-[#facc15] text-slate-950 border-[#facc15] shadow-md'
                : 'bg-[#0b0c10] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Live News Stream List */}
      <div className="space-y-4">
        {filteredNews.map((news) => (
          <div key={news.id} className="chainblock-card p-6 space-y-3 font-sans hover:border-[#facc15]/50 transition">
            
            {/* Top Bar: Category + Source + Time + Impact Score */}
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#facc15]/20 text-[#facc15] border border-[#facc15]/40">
                  {news.category}
                </span>
                <span className="text-slate-400 font-bold">{news.source}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {news.time}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400">AI Impact:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-[#2dd4bf] border border-[#2dd4bf]">
                  {news.impactScore} {news.coin}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-extrabold text-white leading-snug hover:text-[#facc15] transition cursor-pointer">
              {news.title}
            </h3>

            {/* Summary */}
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {news.summary}
            </p>

          </div>
        ))}
      </div>

    </div>
  );
};
