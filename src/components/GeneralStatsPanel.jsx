import React, { useState } from 'react';
import { BarChart2, ArrowUpRight } from 'lucide-react';

export const GeneralStatsPanel = () => {
  const [activeTab, setActiveTab] = useState('Meetings');

  const barData = [
    { date: '1.05', val: 28, highlight: false },
    { date: '2.05', val: 34, highlight: false },
    { date: '3.05', val: 22, highlight: false },
    { date: '4.05', val: 38, highlight: false },
    { date: '5.05', val: 18, highlight: false },
    { date: '6.05', val: 44, highlight: false },
    { date: '7.05', val: 26, highlight: false },
    { date: '8.05', val: 14, highlight: false },
    { date: '9.05', val: 25, highlight: true }, // Highlighted node in reference image
    { date: '10.05', val: 32, highlight: false },
    { date: '11.05', val: 19, highlight: false },
    { date: '12.05', val: 28, highlight: false },
    { date: '13.05', val: 36, highlight: false },
    { date: '14.05', val: 22, highlight: false },
    { date: '15.05', val: 30, highlight: false },
    { date: '16.05', val: 16, highlight: false },
    { date: '17.05', val: 24, highlight: false },
    { date: '18.05', val: 12, highlight: false },
    { date: '19.05', val: 35, highlight: false }
  ];

  return (
    <div className="purple-glass-card space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-extrabold text-white">General stats</h3>
        </div>

        {/* View Switcher Tabs (Meetings / Hours / Participants) */}
        <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-full border border-white/10 text-xs font-semibold font-mono">
          {['Meetings', 'Hours', 'Participants'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-full transition ${
                activeTab === t
                  ? 'bg-purple-900/80 text-white font-bold border border-purple-500/40 shadow-md'
                  : 'text-purple-300/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        
        {/* Left Stacked Metric Cards (Matching Reference Image) */}
        <div className="space-y-4 md:col-span-1">
          
          {/* Card 1: Total meetings */}
          <div className="purple-glass-subcard space-y-3">
            <span className="text-xs text-purple-300/70 block">Total meetings</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white font-mono">352</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-purple-200 border border-white/10 flex items-center gap-0.5">
                12% <ArrowUpRight className="w-3 h-3 text-purple-300" />
              </span>
            </div>
          </div>

          {/* Card 2: Avg. per member */}
          <div className="purple-glass-subcard space-y-3">
            <span className="text-xs text-purple-300/70 block">Avg. per member</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white font-mono">15</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-purple-200 border border-white/10 flex items-center gap-0.5">
                9% <ArrowUpRight className="w-3 h-3 text-purple-300" />
              </span>
            </div>
          </div>

        </div>

        {/* Right Vertical Bar Chart (Matching Reference Image) */}
        <div className="md:col-span-3 h-52 flex flex-col justify-end pt-6 relative font-mono text-[10px]">
          
          {/* Y-Axis Ticks */}
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-purple-300/50 pointer-events-none">
            <span>50</span>
            <span>40</span>
            <span>30</span>
            <span>20</span>
            <span>10</span>
            <span>0</span>
          </div>

          {/* Vertical Bars Container */}
          <div className="ml-8 h-full flex items-end justify-between gap-1 pb-6 border-b border-white/10">
            {barData.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative group">
                
                {/* Highlighted Badge Node for item 25 */}
                {bar.highlight && (
                  <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-purple-950 text-purple-200 text-[9px] font-bold border border-purple-500/50 shadow-lg animate-bounce z-20">
                    25
                  </div>
                )}

                {/* Vertical Bar */}
                <div
                  style={{ height: `${(bar.val / 50) * 100}%` }}
                  className={`w-full max-w-[12px] rounded-t-sm transition-all duration-300 ${
                    bar.highlight
                      ? 'bg-gradient-to-t from-purple-600 to-indigo-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]'
                      : 'bg-white/30 hover:bg-purple-400/80'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* X-Axis Date Ticks */}
          <div className="ml-8 flex justify-between text-purple-300/50 pt-2 font-mono">
            <span>1.05</span>
            <span>4.05</span>
            <span>7.05</span>
            <span>10.05</span>
            <span>13.05</span>
            <span>16.05</span>
            <span>19.05</span>
          </div>

        </div>

      </div>

    </div>
  );
};
