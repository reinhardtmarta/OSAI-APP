
import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  logs: string[];
  title: string;
  waitingMessage: string;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, title, waitingMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (log: string) => {
    if (log.includes(' ! ')) return 'text-red-400';
    if (log.includes(' ✓ ')) return 'text-emerald-400';
    if (log.includes(' >> ')) return 'text-blue-400';
    return 'text-gray-300';
  };

  return (
    <div 
      className="h-48 glass rounded-xl mt-4 flex flex-col overflow-hidden shadow-2xl"
      role="region"
      aria-label={title}
    >
      <div className="px-4 py-2 bg-black/40 border-b border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
        {title}
      </div>
      <div 
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex-1 p-4 font-mono text-[10px] overflow-y-auto space-y-1 custom-scrollbar bg-black/20"
      >
        {logs.map((log, i) => (
          <div key={i} className={`flex items-start ${getLogColor(log)}`}>
            <span className="mr-2 opacity-30" aria-hidden="true">$</span>
            <span className="leading-relaxed">{log}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-gray-600 italic animate-pulse">{waitingMessage}</div>}
      </div>
    </div>
  );
};
