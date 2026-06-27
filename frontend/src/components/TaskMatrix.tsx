import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle, ShieldAlert, Award, Radio } from 'lucide-react';
import { Task, PriorityLevel } from '../types';
import { audioManager } from '../lib/audioManager';

interface TaskMatrixProps {
  tasks: Task[];
  onAddTask: (title: string, priority: PriorityLevel, mastery: number) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdateMastery: (id: string, value: number) => void;
  stressLevel: number;
}

export const TaskMatrix: React.FC<TaskMatrixProps> = ({
  tasks,
  onAddTask,
  onDeleteTask,
  onToggleComplete,
  onUpdateMastery,
  stressLevel
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('medium');
  const [newMastery, setNewMastery] = useState(50);
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    audioManager.playInterfaceClick();
    onAddTask(newTitle.trim(), newPriority, newMastery);
    setNewTitle('');
    setNewPriority('medium');
    setNewMastery(50);
    setIsDeployOpen(false);
  };

  // SVG parameters for the circular mastery rings
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  const getPriorityStyle = (p: PriorityLevel, completed: boolean) => {
    if (completed) return 'border-emerald-500/20 bg-emerald-500/5 text-slate-400';
    switch (p) {
      case 'high':
        return 'border-rose-500/30 bg-rose-500/5 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
      case 'medium':
        return 'border-amber-500/30 bg-amber-500/95/5 shadow-[0_0_10px_rgba(245,158,11,0.08)]';
      case 'low':
      default:
        return 'border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_10px_rgba(6,182,212,0.08)]';
    }
  };

  const getPriorityLabel = (p: PriorityLevel) => {
    switch (p) {
      case 'high': return { text: 'OMEGA PRIORITY', color: 'text-rose-400' };
      case 'medium': return { text: 'BETA COGNITIVE', color: 'text-amber-400' };
      case 'low': default: return { text: 'GAMMA STANDBY', color: 'text-cyan-400' };
    }
  };

  return (
    <div className="flex flex-col h-full justify-between" id="task-matrix-bento-sub">
      {/* Header telemetry and button bar */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#00f2ff] animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-[#00f2ff] font-bold">TASK_MATRIX</span>
        </div>

        {/* Deploy Portal Toggle */}
        <button
          onClick={() => {
            audioManager.playInterfaceClick();
            setIsDeployOpen(!isDeployOpen);
          }}
          id="toggle-deploy-node-button"
          className="px-2.5 py-1 rounded-full border border-[#00f2ff]/30 bg-[#00f2ff]/10 text-[9px] font-mono tracking-widest text-[#00f2ff] uppercase hover:text-white hover:bg-[#00f2ff]/20 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
        >
          <Plus className="w-3 h-3" />
          <span>Deploy</span>
        </button>
      </div>

      {/* Deploy Portal Visor Inside Card */}
      <AnimatePresence>
        {isDeployOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3 shrink-0"
            id="deploy-form-portal-bento"
          >
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-slate-950/80 border border-white/10 rounded-2xl flex flex-col gap-3 text-left"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">Description</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Memory cleanups..."
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f2ff]"
                  maxLength={50}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">Severity</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="bg-slate-900/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-[#00f2ff] font-mono focus:outline-none"
                  >
                    <option value="low">LOW</option>
                    <option value="medium">MEDIUM</option>
                    <option value="high">HIGH</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <label className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">Mastery</label>
                    <span className="text-[9px] font-mono text-[#00f2ff]">{newMastery}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newMastery}
                    onChange={(e) => setNewMastery(parseInt(e.target.value))}
                    className="w-full accent-[#00f2ff] cursor-pointer h-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#00f2ff]/20 hover:bg-[#00f2ff]/30 text-[#00f2ff] border border-[#00f2ff]/40 py-1.5 rounded-xl font-mono text-[10px] tracking-widest uppercase transition-all mt-1 font-bold active:scale-95 cursor-pointer"
              >
                Launch Matrix
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List container, scrollable with crisp Bento style */}
      <div 
        className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[320px] lg:max-h-[380px] scrollbar-thin scrollbar-thumb-white/10" 
        id="task-cards-list-bento"
      >
        {tasks.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-white/5 border border-white/5">
            <Award className="w-8 h-8 text-white/20 mx-auto mb-2 animate-bounce" />
            <p className="text-white/40 text-[10px] font-mono">No actions inside matrix.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const pStyle = getPriorityStyle(task.priority, task.completed);
            const priorityInfo = getPriorityLabel(task.priority);

            return (
              <div
                key={task.id}
                className={`p-3.5 border rounded-2xl flex flex-col justify-between gap-2.5 transition-all relative overflow-hidden group ${pStyle}`}
              >
                <div className="flex justify-between items-start gap-1">
                  <div className="flex flex-col text-left">
                    <span className={`text-[8px] font-mono tracking-widest uppercase font-bold ${priorityInfo.color}`}>
                      {task.completed ? 'RESOLVED' : priorityInfo.text}
                    </span>
                    <h4 className={`text-xs font-sans tracking-tight text-white mt-1 leading-snug break-words ${
                      task.completed ? 'line-through opacity-40 font-light' : 'font-medium'
                    }`}>
                      {task.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => {
                      audioManager.playInterfaceClick();
                      onDeleteTask(task.id);
                    }}
                    className="text-white/20 hover:text-rose-400 cursor-pointer p-0.5 rounded transition-colors"
                    title="Terminate"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Sub row - sliders and toggler details */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="w-8 h-8 transform -rotate-90">
                        <circle
                          cx="16"
                          cy="16"
                          r={radius}
                          className="stroke-white/5 fill-none"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r={radius}
                          className="fill-none duration-500 transition-all stroke-current"
                          strokeWidth="2.5"
                          style={{
                            color: task.completed 
                              ? '#10b981' 
                              : task.priority === 'high' 
                              ? '#ef4444' 
                              : task.priority === 'medium' 
                              ? '#f59e0b' 
                              : '#00f2ff',
                            strokeDasharray: circumference,
                            strokeDashoffset: circumference - (task.mastery / 100) * circumference
                          }}
                        />
                      </svg>
                      <span className="absolute text-[8px] font-mono font-bold text-white leading-none">
                        {task.mastery}%
                      </span>
                    </div>

                    {!task.completed && (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.mastery}
                        id={`slider-mastery-${task.id}`}
                        onChange={(e) => onUpdateMastery(task.id, parseInt(e.target.value))}
                        className="w-16 accent-[#00f2ff] h-0.5 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                      />
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!task.completed) {
                        audioManager.playTaskCompletion();
                      } else {
                        audioManager.playInterfaceClick();
                      }
                      onToggleComplete(task.id);
                    }}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      task.completed 
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' 
                        : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-[#00f2ff]'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
