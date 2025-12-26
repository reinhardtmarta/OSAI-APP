
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

  return (
    <div className="h-48 glass rounded-xl mt-4 flex flex-col overflow-hidden shadow-2xl">
      <div className="px-4 py-2 bg-black/40 border-b border-white/10 text-xs font-mono text-gray-400">
        {title}
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1"
      >
        {logs.map((log, i) => (
          <div key={i} className={`flex items-start ${log.startsWith('[ERROR]') ? 'text-red-400' : log.startsWith('[EXECUTED]') ? 'text-green-400' : 'text-gray-300'}`}>
            <span className="mr-2 opacity-50">$</span>
            <span>{log}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-gray-600">{waitingMessage}</div>}
      </div>
    </div>
  );
};
