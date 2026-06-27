import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Shield, RefreshCw, Zap, Timer, Play, Pause, Compass, Activity } from 'lucide-react';
import { Task } from '../types';

interface AICommandCenterProps {
  stressLevel: number;
  tasks: Task[];
}

export const AICommandCenter: React.FC<AICommandCenterProps> = ({ stressLevel, tasks }) => {
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncCount, setSyncCount] = useState(0);

  // Pomodoro state (Calm)
  const [pomoTimeLeft, setPomoTimeLeft] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);

  // Breathing state (Stressed 4-7-8 sequence)
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breatheSeconds, setBreatheSeconds] = useState(4);

  // Fetch AI plan from Express /api/generate-plan
  const fetchAIPlan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stressLevel, tasks }),
      });
      const data = await res.json();
      setPlan(data.plan || 'Telemetry signal lost.');
    } catch (e) {
      console.error(e);
      setPlan('System connection timeout. Check local workspace endpoints.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run AI plan whenever tasks structure, stress, or manually sync changes
  useEffect(() => {
    fetchAIPlan();
  }, [stressLevel, syncCount]);

  // Pomodoro countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pomoActive && pomoTimeLeft > 0) {
      interval = setInterval(() => {
        setPomoTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (pomoTimeLeft === 0) {
      setPomoActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomoActive, pomoTimeLeft]);

  // Guided Breathing internal looping state logic (4s inhale -> 7s hold -> 8s exhale)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (stressLevel > 0.7) {
      interval = setInterval(() => {
        setBreatheSeconds((prev) => {
          if (prev <= 1) {
            // Shift phase
            if (breathePhase === 'inhale') {
              setBreathePhase('hold');
              return 7;
            } else if (breathePhase === 'hold') {
              setBreathePhase('exhale');
              return 8;
            } else {
              setBreathePhase('inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stressLevel, breathePhase]);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render text with futuristic formatting
  const renderPlanText = (text: string) => {
    if (!text) return <p className="animate-pulse">Accessing virtual assistant plans...</p>;
    
    // Split lines and format headers, bullet points recursively
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('###')) {
        return <h4 key={i} className="text-[#06b6d4] text-xs font-mono font-bold tracking-widest uppercase mt-4 mb-1.5">{line.replace('###', '').trim()}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="text-white text-xs font-sans tracking-wide font-semibold mt-2">{line.replace(/\*\*/g, '').trim()}</p>;
      }
      if (line.startsWith('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="text-slate-300 text-xs mt-1 leading-relaxed">
            <span className="text-[#ff9d00] font-bold">{parts[1]}</span> {parts.slice(2).join('')}
          </p>
        );
      }
      if (line.startsWith('-') || line.startsWith('*')) {
        return <li key={i} className="text-slate-300 text-xs ml-4 list-disc marker:text-cyan-400 leading-relaxed mt-1">{line.substring(2)}</li>;
      }
      return <p key={i} className="text-slate-400 text-xs leading-relaxed mt-1">{line}</p>;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch" id="ai-command-center-bento-sub">
      
      {/* Left Column: Strategy Terminal Window */}
      <div 
        className="flex flex-col p-6 rounded-[32px] bg-slate-950/60 backdrop-blur-2xl border border-white/10 relative overflow-hidden group shadow-2xl justify-between min-h-[300px]"
        id="system-strategy-terminal"
      >
        {/* Cyberpunk Scanner line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-[#00f2ff]/20 animate-pulse pointer-events-none" />
        
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00f2ff] animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-[#00f2ff] font-bold">AI_COMMAND_CENTER // STATUS: ANALYSIS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-mono tracking-widest text-emerald-400 font-bold">ONLINE</span>
            </div>
          </div>

          <div className="text-left font-mono max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {isLoading ? (
              <div className="flex flex-col gap-2 justify-center items-center py-10 text-cyan-400 font-mono text-[10px] tracking-widest">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>SYNCING BIOMETRIC FEEDBACK...</span>
              </div>
            ) : (
              <div className="space-y-1 select-text text-white/80">
                {renderPlanText(plan)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <span className="text-[9px] font-mono text-white/35 tracking-wider uppercase">
            Model: gemini-3.5-flash // py_assist
          </span>
          <button
            onClick={() => {
              setSyncCount((c) => c + 1);
            }}
            disabled={isLoading}
            id="re-ignite-readout-button"
            className="px-3 py-1.5 bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 border border-[#00f2ff]/25 rounded-xl text-[9px] font-mono tracking-widest text-[#00f2ff] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            RE-IGNITE SYSTEM READOUT
          </button>
        </div>
      </div>

      {/* Right Column: Bio-Hacking Wellness Suite */}
      <div 
        className={`p-6 rounded-[32px] bg-slate-950/60 border backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[300px] transition-all duration-500 ${
          stressLevel > 0.7 
            ? 'border-orange-500/30' 
            : 'border-white/10'
        }`}
        id="bio-hacking-wellness-suite"
      >
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center gap-2">
              <Compass className={`w-4 h-4 ${stressLevel > 0.7 ? 'text-orange-400' : 'text-[#00f2ff] animate-pulse'}`} />
              <span className={`text-[10px] font-mono tracking-widest font-bold ${stressLevel > 0.7 ? 'text-orange-400' : 'text-[#00f2ff]'}`}>
                {stressLevel > 0.7 ? 'CRITICAL AMBIENCE MODULE' : 'FLOW STATE RECRUITMENT'}
              </span>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
              stressLevel > 0.7 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold' : 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20 font-bold'
            }`}>
              {stressLevel > 0.7 ? 'ANOMALY' : 'FLOW_OK'}
            </span>
          </div>

          {/* Condition 1: Stress > 0.7 - Prescribe 4-7-8 Breathing Technique */}
          {stressLevel > 0.7 ? (
            <div className="flex items-center gap-5 py-1 text-left" id="breathing-prescriptor">
              {/* Animated Breathing Circle */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                {/* Glowing background aura */}
                <div className={`absolute inset-0 rounded-full bg-orange-600/10 blur-xl transition-transform duration-1000 ${
                  breathePhase === 'inhale' ? 'scale-130' : breathePhase === 'hold' ? 'scale-110' : 'scale-80'
                }`} />

                {/* Pulsing visual core */}
                <div 
                  className={`rounded-full flex flex-col items-center justify-center text-white border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-1000 bg-slate-950/80 ${
                    breathePhase === 'inhale' 
                      ? 'w-24 h-24 border-orange-400' 
                      : breathePhase === 'hold' 
                      ? 'w-24 h-24 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]' 
                      : 'w-18 h-18 border-rose-500'
                  }`}
                >
                  <span className="text-xl font-mono font-bold">{breatheSeconds}s</span>
                  <span className="text-[8px] font-mono tracking-widest uppercase opacity-80 mt-0.5">
                    {breathePhase}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-grow gap-2">
                <div className="mb-1">
                  <h3 className="text-xs font-sans font-bold text-white tracking-tight uppercase">4-7-8 Lung-Loop Sequencer</h3>
                  <p className="text-white/40 text-[10px] mt-0.5 leading-snug">
                    Decreasing cerebral tachycardia immediately. Flow with the visual dial.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className={`py-1 px-1.5 rounded-lg border text-[8px] font-mono tracking-widest uppercase ${breathePhase === 'inhale' ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' : 'bg-slate-950/40 border-slate-900 text-slate-500'}`}>
                    Inhale 4s
                  </div>
                  <div className={`py-1 px-1.5 rounded-lg border text-[8px] font-mono tracking-widest uppercase ${breathePhase === 'hold' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-slate-950/40 border-slate-900 text-slate-500'}`}>
                    Hold 7s
                  </div>
                  <div className={`py-1 px-1.5 rounded-lg border text-[8px] font-mono tracking-widest uppercase ${breathePhase === 'exhale' ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' : 'bg-slate-950/40 border-slate-900 text-slate-500'}`}>
                    Exhale 8s
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Condition 2: Stress <= 0.7 - Prescribe Pomodoro Tech Clock */
            <div className="flex items-center gap-5 py-1 text-left" id="pomodoro-prescriptor">
              {/* Clock Digital Display */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border border-cyan-500/10 border-t-cyan-400/40 animate-spin pointer-events-none" style={{ animationDuration: '6s' }} />

                <div className="w-24 h-24 rounded-full bg-slate-950/90 border border-cyan-500/30 flex flex-col items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <Timer className="w-3.5 h-3.5 text-[#00f2ff] mb-0.5 opacity-70" />
                  <span className="text-xl font-mono font-bold text-[#00f2ff] tracking-tight">
                    {formatTime(pomoTimeLeft)}
                  </span>
                  <span className="text-[7px] font-mono tracking-widest uppercase opacity-50">
                    {pomoActive ? 'FOCUS_ON' : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Focus Controls */}
              <div className="flex flex-col flex-grow gap-2">
                <div>
                  <h3 className="text-xs font-sans font-bold text-white tracking-tight uppercase">Co-Active Pomodoro Focus</h3>
                  <p className="text-white/40 text-[10px] mt-0.5 leading-snug">
                    Uninterrupted high-intensity focus sessions. Tackle key primary nodes.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    onClick={() => setPomoActive(!pomoActive)}
                    id="pomo-play-pause"
                    className={`flex-1 py-1 px-2.5 rounded-xl border font-mono text-[9px] tracking-widest uppercase flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                      pomoActive 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                        : 'bg-[#00f2ff]/10 border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/20'
                    }`}
                  >
                    {pomoActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{pomoActive ? 'PAUSE' : 'IGNITE'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setPomoActive(false);
                      setPomoTimeLeft(25 * 60);
                    }}
                    id="pomo-reset-button"
                    className="px-2.5 py-1 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-[9px] font-mono tracking-widest text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
                  >
                    RESET
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] text-white/35 font-mono uppercase shrink-0">
          <span>Wellness Protocol V3</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#00f2ff] animate-pulse" />
            <span>BIO_LINK_OK</span>
          </span>
        </div>
      </div>

    </div>
  );
};
