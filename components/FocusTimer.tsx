'use client';

import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Play, Pause, Square, Hourglass, Settings, Sparkles, Check } from 'lucide-react';

export default function FocusTimer() {
  const {
    timerIsRunning,
    setTimerIsRunning,
    timeLeft,
    setTimeLeft,
    sessionTask,
    setSessionTask,
    tasks,
    setInitialTime,
  } = useStudy();

  const [showSettings, setShowSettings] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('25');

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleToggle = () => {
    setTimerIsRunning(!timerIsRunning);
  };

  const handleStop = () => {
    setTimerIsRunning(false);
    setTimeLeft(25 * 60); // Reset to 25 mins
  };

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0 && mins <= 180) {
      setInitialTime(mins * 60);
      setTimeLeft(mins * 60);
      setShowSettings(false);
    }
  };

  return (
    <div id="focus-timer-card" className="h-full bg-indigo-900 rounded-xl p-6 text-white flex flex-col items-center justify-between relative overflow-hidden shadow-md">
      {/* Visual background circle decorative */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-800 rounded-full opacity-40 pointer-events-none"></div>
      
      {/* Header with quick setting toggle */}
      <div className="w-full flex justify-between items-center z-10">
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${timerIsRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          {timerIsRunning ? 'Active Session' : 'Timer Idle'}
        </span>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 hover:bg-white/10 rounded-full transition-colors text-indigo-200 hover:text-white"
          title="Session settings"
        >
          <Settings size={15} />
        </button>
      </div>

      {showSettings ? (
        <form onSubmit={handleApplySettings} className="w-full h-full flex flex-col justify-center items-center z-10 p-2 space-y-3">
          <p className="text-xs font-medium text-indigo-200">Session Settings</p>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              min="1"
              max="180"
              className="w-16 bg-indigo-950 text-white rounded px-2 py-1 text-center font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <span className="text-xs text-indigo-200">minutes</span>
          </div>
          
          <div className="w-full">
            <label className="block text-[10px] text-indigo-300 font-bold uppercase mb-1">Target Subject</label>
            <select
              value={sessionTask}
              onChange={(e) => setSessionTask(e.target.value)}
              className="w-full bg-indigo-950 text-white text-xs rounded px-2 py-1 focus:outline-none"
            >
              <option value="Macroeconomics Reading">Macroeconomics Reading</option>
              <option value="Calculus II Review">Calculus II Review</option>
              <option value="Biology Cell Assembly">Biology Cell Assembly</option>
              {tasks.map(t => (
                <option key={t.id} value={t.title}>{t.title} ({t.subject})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full pt-1">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="flex-1 py-1.5 rounded bg-indigo-800 text-xs text-indigo-200 font-medium hover:bg-indigo-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 rounded bg-white text-indigo-950 text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1"
            >
              <Check size={12} /> Apply
            </button>
          </div>
        </form>
      ) : (
        <React.Fragment>
          {/* Main Time Counter */}
          <div className="flex flex-col items-center justify-center my-4 z-10">
            <div className="text-6xl font-mono font-bold tracking-tighter transition-all hover:scale-105 duration-300 select-none cursor-pointer" onClick={handleToggle}>
              {timerStr}
            </div>
            <p className="text-xs text-indigo-200 italic font-medium tracking-wide mt-2 max-w-[200px] truncate text-center" title={sessionTask}>
              {sessionTask}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex gap-3 w-full z-10">
            <button
              onClick={handleToggle}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                timerIsRunning 
                  ? 'bg-amber-500 text-indigo-950 hover:bg-amber-400' 
                  : 'bg-white text-indigo-900 hover:bg-slate-100'
              }`}
            >
              {timerIsRunning ? (
                <>
                  <Pause size={14} fill="currentColor" /> PAUSE
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" /> START
                </>
              )}
            </button>
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-700 text-white hover:bg-indigo-600 font-bold py-2.5 rounded-lg text-xs transition"
            >
              <Square size={13} fill="currentColor" /> STOP
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
