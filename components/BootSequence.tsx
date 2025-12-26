
import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { getTranslation } from '../locales';

interface BootSequenceProps {
  onComplete: () => void;
  lang: SupportedLanguage;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, lang }) => {
  const [lines, setLines] = useState<string[]>([]);
  const t = getTranslation(lang);
  const bootLogs = t.boot || [
    "> OSAI KERNEL v3.1.0-STABLE",
    "> INITIALIZING COGNITIVE_CORE...",
    "> LOADING NEURAL_NETWORKS: GEMINI-3-PRO",
    "> CHECKING SYSTEM_POLICY: SECURE_ENCLAVE",
    "> READY."
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootLogs.length) {
        setLines(prev => [...prev, bootLogs[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [bootLogs, onComplete]);

  return (
    <div className="fixed inset-0 z-[2000] bg-[#020617] flex flex-col items-start justify-center p-10 font-mono text-[10px] sm:text-xs text-blue-500 gap-1 overflow-hidden">
      <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-pulse">
        <h1 className="text-xl font-black tracking-widest text-white">OSAI</h1>
      </div>
      {lines.map((line, i) => (
        <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-200">
          {line}
        </div>
      ))}
      <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(lines.length / bootLogs.length) * 100}%` }} />
      </div>
    </div>
  );
};
