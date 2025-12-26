
import React from 'react';

interface AudioVisualizerProps {
  frequencies: number[];
  isMuted: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ frequencies, isMuted }) => {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {frequencies.map((f, i) => (
        <div 
          key={i} 
          className={`w-[3px] rounded-full transition-all duration-100 ${
            isMuted ? 'bg-slate-700 h-1' : 'bg-blue-400'
          }`} 
          style={{ height: isMuted ? '4px' : `${Math.max(15, f)}%` }}
        />
      ))}
    </div>
  );
};
