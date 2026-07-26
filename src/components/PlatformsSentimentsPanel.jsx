import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Video, Smile } from 'lucide-react';

export const PlatformsSentimentsPanel = () => {
  const platformData = [
    { name: 'Google Meet', value: 46, color: '#38bdf8' },
    { name: 'Zoom', value: 42, color: '#8b5cf6' },
    { name: 'MS Teams', value: 12, color: '#c4b5fd' }
  ];

  const sentimentData = [
    { name: 'Positive', value: 34, color: '#34d399' },
    { name: 'Negative', value: 5, color: '#fb7185' },
    { name: 'Neutral', value: 61, color: '#6b21a8' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Card 1: Platforms Donut Chart */}
      <div className="purple-glass-card space-y-4">
        <div className="flex items-center space-x-2 pb-1">
          <Video className="w-4 h-4 text-purple-300" />
          <h3 className="text-sm font-extrabold text-white">Platforms</h3>
        </div>

        <div className="flex items-center justify-between">
          
          {/* Legend Items */}
          <div className="space-y-2.5 font-mono text-xs">
            {platformData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-purple-200/80 font-sans text-[11px] w-24">{item.name}</span>
                <span className="text-white font-bold">{item.value}%</span>
              </div>
            ))}
          </div>

          {/* Donut Chart */}
          <div className="w-24 h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={38}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

      {/* Card 2: Sentiments Donut Chart */}
      <div className="purple-glass-card space-y-4">
        <div className="flex items-center space-x-2 pb-1">
          <Smile className="w-4 h-4 text-purple-300" />
          <h3 className="text-sm font-extrabold text-white">Sentiments</h3>
        </div>

        <div className="flex items-center justify-between">
          
          {/* Legend Items */}
          <div className="space-y-2.5 font-mono text-xs">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-purple-200/80 font-sans text-[11px] w-24">{item.name}</span>
                <span className="text-white font-bold">{item.value}%</span>
              </div>
            ))}
          </div>

          {/* Donut Chart */}
          <div className="w-24 h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={38}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

    </div>
  );
};
