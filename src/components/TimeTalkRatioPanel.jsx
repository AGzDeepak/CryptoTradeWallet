import React from 'react';
import { Clock, Mic } from 'lucide-react';

export const TimeTalkRatioPanel = () => {
  const timeUsers = [
    {
      name: 'Evan Brightwood',
      role: 'Product Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      time: '42h 14m',
      pct: 85
    },
    {
      name: 'Lila Casterly',
      role: 'Senior Software Developer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
      time: '35h 47m',
      pct: 70
    }
  ];

  const ratioUsers = [
    {
      name: 'Luna Fairchild',
      role: 'VP of Marketing',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
      talkPct: 74,
      listenPct: 26
    },
    {
      name: 'Ava Starfall',
      role: 'Technical Lead',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=120',
      talkPct: 70,
      listenPct: 30
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      
      {/* Card 1: Time spent in meetings */}
      <div className="purple-glass-card space-y-4">
        
        {/* Header Bar */}
        <div className="flex items-center space-x-2 pb-1 border-b border-white/10">
          <Clock className="w-4 h-4 text-purple-300" />
          <h3 className="text-sm font-extrabold text-white">Time spent in meetings</h3>
        </div>

        {/* Sub Header Metadata */}
        <div className="flex items-center justify-between text-[11px] font-mono text-purple-300/60 pb-2">
          <div className="flex items-center space-x-2">
            <span>Participants</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">23</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>Average <strong className="text-white font-mono">9h 12m</strong></span>
            <span>Time spent</span>
          </div>
        </div>

        {/* User Rows with Avatars and Progress Bars */}
        <div className="space-y-4">
          {timeUsers.map((u) => (
            <div key={u.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 w-48 shrink-0">
                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-purple-400/40" />
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">{u.name}</h4>
                  <span className="text-[10px] text-purple-300/60 block mt-0.5">{u.role}</span>
                </div>
              </div>

              {/* Progress Bar & Time */}
              <div className="flex-1 flex items-center space-x-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div style={{ width: `${u.pct}%` }} className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-400" />
                </div>
                <span className="text-xs font-mono font-bold text-purple-200 shrink-0 w-16 text-right">{u.time}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Card 2: Talk to listen ratio */}
      <div className="purple-glass-card space-y-4">
        
        {/* Header Bar */}
        <div className="flex items-center space-x-2 pb-1 border-b border-white/10">
          <Mic className="w-4 h-4 text-purple-300" />
          <h3 className="text-sm font-extrabold text-white">Talk to listen ratio</h3>
        </div>

        {/* Sub Header Metadata */}
        <div className="flex items-center justify-between text-[11px] font-mono text-purple-300/60 pb-2">
          <div className="flex items-center space-x-2">
            <span>Participants</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">23</span>
          </div>

          <div className="flex items-center space-x-8">
            <span>Talk %</span>
            <span>Listen %</span>
          </div>
        </div>

        {/* User Rows with Avatars and Dual Progress Bars */}
        <div className="space-y-4">
          {ratioUsers.map((u) => (
            <div key={u.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 w-48 shrink-0">
                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-purple-400/40" />
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">{u.name}</h4>
                  <span className="text-[10px] text-purple-300/60 block mt-0.5">{u.role}</span>
                </div>
              </div>

              {/* Dual Progress Bar & Ratios */}
              <div className="flex-1 flex items-center space-x-4">
                <span className="text-xs font-mono font-bold text-white shrink-0">{u.talkPct}%</span>
                
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden flex">
                  <div style={{ width: `${u.talkPct}%` }} className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" />
                  <div style={{ width: `${u.listenPct}%` }} className="h-full bg-white/20" />
                </div>

                <span className="text-xs font-mono font-bold text-purple-300/80 shrink-0">{u.listenPct}%</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
