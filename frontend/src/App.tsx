import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NebulaSpaceCanvas } from './components/NebulaSpaceCanvas';
import { StudyBuddy3D } from './components/StudyBuddy3D';
import { MoodCore3D } from './components/MoodCore3D';
import { TaskMatrix } from './components/TaskMatrix';
import { AICommandCenter } from './components/AICommandCenter';
import { Task, PriorityLevel } from './types';
import { audioManager } from './lib/audioManager';
import { 
  Activity, 
  Heart, 
  Cpu, 
  Sliders, 
  Brain, 
  ChevronDown, 
  EyeOff, 
  Eye, 
  Info, 
  HelpCircle,
  Radio,
  Volume2,
  VolumeX,
  Music
} from 'lucide-react';

export default function App() {
  // 1. Core Reactive States
  const [stressLevel, setStressLevel] = useState<number>(0.35);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Verify quantum telemetry calibration grids', priority: 'high', mastery: 85, completed: false }
  ]);

  const [useCustomCursor, setUseCustomCursor] = useState(true);
  const [isMusicActive, setIsMusicActive] = useState(false);
  const [isSfxActive, setIsSfxActive] = useState(false);

  // --- 🚨 THE PYTHON DATA BRIDGE 🚨 ---
  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch('http://localhost:8000/tasks.json');
        const data = await response.json();

        // 1. Sync the AI Stress Level
        if (data.system_state && data.system_state.current_stress !== undefined) {
          setStressLevel(data.system_state.current_stress);
        }
        
        // 2. Translate Python tasks into Nebula UI cards
        if (data.study_tasks) {
          const mappedTasks = data.study_tasks.map((task: any, index: number) => ({
            id: `backend-task-${index}`,
            title: task.topic,
            priority: task.urgency > 0.7 ? 'high' : task.urgency > 0.4 ? 'medium' : 'low',
            mastery: task.mastery * 100, 
            completed: task.status === 'completed' || task.status === 'done'
          }));
          setTasks(mappedTasks);
        }
      } catch (error) {
        // Silently wait if the Python server hasn't booted yet
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);
  // ------------------------------------

  // Dynamic sound management based on Stress Level threshold shifts
  const updateStressLevel = (val: number) => {
    const oldLevel = stressLevel;
    setStressLevel(val);
    audioManager.handleStressChange(val);

    if (val > 0.7 && oldLevel <= 0.7) {
      audioManager.playSystemAlert();
    } else if (val <= 0.7 && oldLevel > 0.7) {
      audioManager.playSystemRecovered();
    }
  };

  const toggleMusic = () => {
    const nextState = !isMusicActive;
    setIsMusicActive(nextState);
    audioManager.setMusicState(nextState);
  };

  const toggleSfx = () => {
    const nextState = !isSfxActive;
    setIsSfxActive(nextState);
    audioManager.setSfxState(nextState);
    if (nextState) {
      audioManager.playInterfaceClick();
    }
  };

  // 2. Biometric telemetry maps derived dynamically from stress coefficient
  const heartRate = Math.round(65 + stressLevel * 50);
  const focusIntensity = Math.round(Math.max(10, Math.min(100, 95 - (stressLevel - 0.3) * 60)));
  const alphaRatio = parseFloat((Math.max(0.1, 1.4 - stressLevel * 1.2)).toFixed(2));

  // 3. Task Matrix state callbacks
  const handleAddTask = (title: string, priority: PriorityLevel, mastery: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      priority,
      mastery,
      completed: false
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleUpdateMastery = (id: string, value: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, mastery: value } : t))
    );
  };

  const avgMastery = tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.mastery, 0) / tasks.length) : 0;

  return (
    <div 
      className={`min-h-screen text-white relative transition-all duration-700 font-sans p-4 sm:p-6 lg:p-8 flex flex-col justify-between gap-6 overflow-x-hidden ${
        useCustomCursor ? 'cursor-none select-none' : 'cursor-default'
      }`}
      style={{
        backgroundColor: '#02040a',
      }}
      id="nebula-interface-root"
    >
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0 bg-[#02040a]" />
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0" style={{ background: 'radial-gradient(circle at 20% 30%, #0d1e3d 0%, transparent 40%), radial-gradient(circle at 80% 70%, #030814 0%, transparent 50%)' }} />
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <NebulaSpaceCanvas stressLevel={stressLevel} />

      <header className="flex flex-col sm:flex-row justify-between items-center z-10 gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#00f2ff] flex items-center justify-center bg-[#00f2ff]/10 shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            <div className={`w-4 h-4 rounded-full ${stressLevel > 0.7 ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]'} animate-pulse`} />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-xl font-bold tracking-tight uppercase">Neural Workspace</h1>
            <span className="text-[10px] text-[#00f2ff] font-mono uppercase tracking-[0.2em] font-bold">
              System Active // Sync: {(99.2 + stressLevel * 0.6).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-6 items-center flex-wrap justify-center">
          <button
            onClick={() => setUseCustomCursor(!useCustomCursor)}
            id="cursor-mode-toggle"
            title="Toggle OS System Cursor"
            className="bg-white/5 border border-white/15 px-3 py-1.5 rounded-full hover:bg-white/10 hover:border-white/30 text-[10px] font-mono font-bold tracking-wider text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {useCustomCursor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="uppercase font-bold">LASER_CS</span>
          </button>
          
          <div className="text-right">
            <div className="text-[10px] text-white/40 uppercase font-mono font-bold">CONNECTION STATUS</div>
            <div className={`text-xs font-semibold font-mono tracking-widest ${stressLevel > 0.7 ? 'text-orange-400' : 'text-[#00f2ff]'}`}>
              {stressLevel > 0.7 ? 'STRESS_DISTORTION' : 'STABLE_LINK'}
            </div>
          </div>
          <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
          <div className="text-[10px] uppercase font-mono bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] px-3 py-1 rounded-full font-bold">
            24.03.2077
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-grow z-10 items-stretch">
        <section className="xl:col-span-4 flex flex-col justify-between p-4 sm:p-6 text-left relative z-10 pointer-events-auto h-full space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#00f2ff]/10 border border-[#00f2ff]/20 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest text-[#00f2ff] uppercase font-bold">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Telemetry Linked
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight leading-none text-white/95">
                NEBULA <span className="font-extrabold text-[#00f2ff] block">WORKSPACE</span>
              </h2>
              <p className="text-xs text-white/60 tracking-relaxed leading-relaxed font-sans max-w-sm">
                An advanced biochemical docking bay where human stress strain indices coordinate with hyper-tech execution boards. Calibrate your vitals using the biometric hub console, click your robotic companion to perform sync tests, and complete your checklist objectives.
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 max-w-sm">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-[#00f2ff] uppercase flex items-center gap-1.5">
              <Radio className="w-4 h-4 animate-pulse" /> Space Auditory Uplink
            </h3>
            <p className="text-[10px] text-white/40 leading-normal font-mono">
              Initialize real-time synthetic feedback. Space-chimes and ambient waves are synthesized procedurally.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={toggleMusic}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase transition-all duration-150 cursor-pointer ${
                  isMusicActive
                    ? 'bg-[#00f2ff]/20 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_12px_rgba(0,242,255,0.2)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
                title="Toggle Evolving Polyphonic Cosmic Pad Chords"
              >
                <Music className="w-3.5 h-3.5" />
                <span>{isMusicActive ? 'Mute Pad' : 'Play Music'}</span>
              </button>
              
              <button
                onClick={toggleSfx}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase transition-all duration-150 cursor-pointer ${
                  isSfxActive
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
                title="Toggle Tactile Interface Tick Sound Feedback On Interactivity"
              >
                {isSfxActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{isSfxActive ? 'SFX ON' : 'SFX OFF'}</span>
              </button>
            </div>
          </div>

          <div className="hidden xl:flex flex-col gap-1 text-[9px] font-mono text-white/30 uppercase">
            <span>SYS_VERSION: 3.1.2_NEBULA</span>
            <span>UPLINK INTEGRATED // 100% OK</span>
          </div>
        </section>

        <section className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5 z-10 items-stretch">
          
          <div className="bento-card p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-[#00f2ff] uppercase font-bold tracking-widest font-mono">BUDDY_UNIT_01</span>
              <span className="text-[8px] text-white/30 font-mono">3D QUANTUM CORE</span>
            </div>
            
            <div className="relative w-full h-44 my-2 flex items-center justify-center">
              <div className={`absolute w-36 h-36 rounded-full filter blur-2xl opacity-15 animate-pulse bg-gradient-to-tr from-[#00f2ff] to-[#0d1e3d]`} />
              <StudyBuddy3D stressLevel={stressLevel} />
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[9px] font-mono text-white/30 uppercase mt-auto">
              <span>SYNC LINKED</span>
              <span className="text-[#00f2ff] group-hover:animate-pulse">CLICK ROBOT TO SPIN</span>
            </div>
          </div>

          <div className="bento-card p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-[#00f2ff] uppercase font-bold tracking-widest font-mono">BIOMETRIC_CALIBRATION</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            
            <div className="relative w-full h-32 flex flex-col justify-center items-center my-1 z-0">
              <div className="absolute inset-0 rounded-full border border-dashed border-white/5 animate-spin pointer-events-none" style={{ animationDuration: '30s' }} />
              <MoodCore3D stressLevel={stressLevel} />
            </div>

            <div className="space-y-1.5 text-left bg-white/5 border border-white/5 p-3 rounded-xl my-2 shrink-0">
              <div className="flex justify-between items-center text-[9px] font-mono">
                <span className="text-white/45 uppercase tracking-wide flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-[#00f2ff]" /> STRESS STRAIN MODULE
                </span>
                <span className={`font-bold uppercase ${stressLevel > 0.7 ? 'text-orange-400' : 'text-[#00f2ff]'}`}>
                  {(stressLevel * 100).toFixed(0)}% CO-EFF
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={stressLevel * 100}
                onChange={(e) => updateStressLevel(parseFloat(e.target.value) / 100)}
                id="biometric-stress-slider"
                className={`w-full h-1 bg-white/10 appearance-none rounded-lg cursor-crosshair focus:outline-none transition-all ${
                  stressLevel > 0.7 ? 'accent-orange-500' : 'accent-[#00f2ff]'
                }`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 shrink-0">
              <div className="bg-white/5 border border-white/5 p-1.5 rounded-lg text-center">
                <Heart className="w-3 h-3 text-rose-500 mx-auto mb-0.5 animate-pulse" />
                <div className="text-[6.5px] font-mono text-white/30 uppercase font-bold">HEART_RATE</div>
                <div className="text-[11px] font-mono font-bold text-white whitespace-nowrap">{heartRate} bpm</div>
              </div>

              <div className="bg-white/5 border border-white/5 p-1.5 rounded-lg text-center">
                <Cpu className="w-3 h-3 text-[#00f2ff] mx-auto mb-0.5" />
                <div className="text-[6.5px] font-mono text-white/30 uppercase font-bold">FOCUS_RATIO</div>
                <div className="text-[11px] font-mono font-bold text-white">{focusIntensity}%</div>
              </div>

              <div className="bg-white/5 border border-white/5 p-1.5 rounded-lg text-center">
                <Radio className="w-3 h-3 text-purple-400 mx-auto mb-0.5" />
                <div className="text-[6.5px] font-mono text-white/30 uppercase font-bold">ALPHA_OSC</div>
                <div className="text-[11px] font-mono font-bold text-white">{alphaRatio} Hz</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bento-card p-5 flex flex-col justify-between relative overflow-hidden min-h-[380px]">
            <div className="flex-grow w-full flex flex-col justify-between">
              <TaskMatrix
                tasks={tasks}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onUpdateMastery={handleUpdateMastery}
                stressLevel={stressLevel}
              />
            </div>

            <div className="bg-[#00f2ff] hover:bg-[#00e1ec] transition-colors rounded-xl p-3 flex items-center justify-between text-[#02040a] relative overflow-hidden mt-4 shrink-0 shadow-lg font-bold">
              <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-white/20 rounded-full blur-xl pointer-events-none" />
              <div className="z-10 text-left">
                <div className="text-[7px] font-bold uppercase tracking-widest leading-none mb-0.5 font-mono">COGNITIVE_MASTERY_RATIO</div>
                <div className="text-xl font-black italic tracking-wide font-sans leading-none">{avgMastery}% STATUS</div>
              </div>
              <div className="w-6 h-6 rounded-full border border-black/15 flex items-center justify-center font-bold text-xs select-none">
                +
              </div>
            </div>
          </div>

        </section>

        <section className="lg:col-span-12 z-10">
          <AICommandCenter stressLevel={stressLevel} tasks={tasks} />
        </section>

      </main>

      <footer className="footer-panel py-4 border-t border-white/5 bg-slate-950/20 backdrop-blur-md relative z-10 text-center text-white/30 text-[10px] font-mono shrink-0 rounded-xl mt-2 flex flex-col sm:flex-row justify-between items-center px-6 gap-2">
        <span>© 2026 NEBULA INTERFACE SYSTEMS INC. ALL TELEMETRY LOGGED.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#00f2ff] transition-colors uppercase font-bold">ACCELERATE SYSTEM</a>
          <span>•</span>
          <span className="text-emerald-400 font-bold">ONLINE DOCK STATE</span>
        </div>
      </footer>
    </div>
  );
}