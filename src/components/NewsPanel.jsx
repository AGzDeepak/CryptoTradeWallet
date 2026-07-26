import React, { useState, memo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Newspaper, ExternalLink, Filter } from 'lucide-react';

export const NewsPanel = memo(() => {
  const { news, openModal } = useCrypto();
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filteredNews = filterCategory === 'ALL'
    ? news
    : news.filter(n => n.category.toUpperCase() === filterCategory);

  return (
    <div className="chainblock-card space-y-4 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-4 h-4 text-[#34d399] shrink-0" />
          <h3 className="text-sm font-extrabold text-white tracking-tight">MARKET INTELLIGENCE & NEWS</h3>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1 bg-[#11141b] p-1 rounded-xl border border-slate-800 font-mono text-[10px]">
          {['ALL', 'Bitcoin', 'Altcoin'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.5 rounded-lg transition font-semibold ${
                filterCategory === cat
                  ? 'bg-[#1b2a24] text-[#34d399] font-bold border border-[#34d399]/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stacked Vertical News List (Clean Fit in Sidebar Column) */}
      <div className="space-y-3">
        {filteredNews.map((article) => (
          <div
            key={article.id}
            className="p-3.5 rounded-xl bg-[#11141b] border border-slate-800/80 hover:border-slate-700 transition space-y-2"
          >
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">{article.source} • {article.time}</span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${
                article.sentiment === 'BULLISH'
                  ? 'bg-emerald-950 text-[#34d399] border border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {article.sentiment}
              </span>
            </div>

            <h4 className="font-bold text-xs text-white leading-snug hover:text-[#34d399] cursor-pointer transition">
              {article.title}
            </h4>

            <button
              onClick={() => openModal('NEWS_ARTICLE', article)}
              className="inline-flex items-center space-x-1 text-[11px] font-mono font-bold text-[#34d399] hover:underline pt-1"
            >
              <span>Read Intel Brief</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
