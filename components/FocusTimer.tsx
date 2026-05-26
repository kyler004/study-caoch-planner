'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudy } from '@/context/StudyContext';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, BellRing, Settings } from 'lucide-react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export default function FocusTimer() {
  const { exams, addStudyLog } = useStudy();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [durations, setDurations] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15
  });

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  // Keep a reference to the active timer interval
  const timerId = useRef<NodeJS.Timeout | null>(null);

  // Sound triggering helper
  const triggerAudioBeep = () => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // angenehmes A
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1.0);
      } catch (err) {
        console.warn("Audio chime suppressed by browser security policies:", err);
      }
    }
  };

  // Timer complete handler
  const handleTimerCompleted = () => {
    setIsRunning(false);
    if (timerId.current) clearInterval(timerId.current);

    triggerAudioBeep();

    alert(`🎉 ${mode === 'focus' ? 'Focus study chunk completed!' : 'Break session finished!'} Great job staying organized.`);

    // Log progress if it was a focus interval
    if (mode === 'focus') {
      const activeSubject = selectedSubject || (exams[0] ? exams[0].subject : 'General Revision');
      addStudyLog({
        subject: activeSubject,
        duration: durations.focus,
        notes: `Focus Pomodoro session (${durations.focus}m) completed successfully.`
      });
      
      // Auto-switch to break
      setMode('shortBreak');
      setTimeLeft(durations.shortBreak * 60);
    } else {
      // Auto-switch back to focus
      setMode('focus');
      setTimeLeft(durations.focus * 60);
    }
  };

  // Main Timer loop
  useEffect(() => {
    if (isRunning) {
      timerId.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerId.current) {
      clearInterval(timerId.current);
    }

    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [isRunning, mode, durations, selectedSubject]);

  // Mode changer actions
  const selectMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode] * 60);
  };

  // Human clock styling
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Options
  const subjectList = useMemo(() => {
    const set = new Set<string>();
    set.add('General Revision');
    exams.forEach(ex => set.add(ex.subject));
    return Array.from(set);
  }, [exams]);

  return (
    <div className="bg-white border border-[#e9e6e0] rounded-xl p-6" id="focus-timer-root">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Circle Graphics & buttons */}
        <div className="md:col-span-6 flex flex-col items-center justify-center space-y-5" id="timer-clock-container">
          
          <div className="flex gap-1 bg-[#fbfaf7] border border-[#e9e6e0] rounded-full p-1" id="timer-modes-selectors">
            {(['focus', 'shortBreak', 'longBreak'] as const).map((m) => (
              <button
                key={m}
                onClick={() => selectMode(m)}
                className={`text-xs font-mono px-3.5 py-1.5 rounded-full transition-all leading-none capitalize ${
                  mode === m
                    ? 'bg-[#3d5245] text-white font-semibold' 
                    : 'text-[#8a857c] hover:text-[#1c1b1a]'
                }`}
              >
                {m === 'focus' ? 'Focus (Pomodoro)' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </button>
            ))}
          </div>

          <div className="relative w-48 h-48 rounded-full border-4 border-[#e9e6e0] flex flex-col items-center justify-center bg-[#fbfaf7]" id="analog-stopwatch">
            <div className="absolute inset-0 rounded-full border-4 border-[#3d5245] opacity-10 animate-pulse pointer-events-none" />
            
            <span className="text-4xl font-mono font-bold tracking-tight text-[#1c1b1a]">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#8a857c] mt-1.5 font-semibold">
              {mode === 'focus' ? 'Studying' : 'Breathing'} Mode
            </span>
          </div>

          <div className="flex items-center gap-4 animate-fade-in" id="stopwatch-control-buttons">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg text-[#8a857c] hover:text-[#1c1b1a] transition-colors"
              title={soundEnabled ? "Disable Session Sound Alerts" : "Enable Sound Alerts"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-4 rounded-full text-white transition-all shadow-md hover:scale-105 active:scale-95 ${
                isRunning 
                  ? 'bg-[#b8542c]' 
                  : 'bg-[#3d5245]'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg text-[#8a857c] hover:text-[#b8542c] transition-colors"
              title="Reset timer progress"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Info pane */}
        <div className="md:col-span-6 space-y-4" id="stopwatch-details-container">
          
          <div className="flex justify-between items-center border-b border-[#f1eeeb] pb-2">
            <div>
              <h5 className="text-xs font-mono font-bold text-[#1c1b1a] uppercase tracking-wider">Session Settings</h5>
              <p className="text-[11px] text-[#8a857c]">Choose target module and adjust duration variables</p>
            </div>
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="text-[#8a857c] hover:text-[#1c1b1a] p-1.5 rounded-lg border border-[#e9e6e0] bg-[#fbfaf7] transition-all"
              title="Configure Pomodoro Minutes"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {mode === 'focus' ? (
            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Target Study Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full text-xs bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              >
                {subjectList.map((subj, idx) => (
                  <option key={idx} value={subj}>{subj}</option>
                ))}
              </select>
              <p className="text-[10px] text-[#8a857c] mt-1.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#b8542c]" />
                Completing focus will auto-log studying hours to this module.
              </p>
            </div>
          ) : (
            <div className="bg-[#fbfaf7] border border-dashed border-[#e9e6e0] rounded-lg p-3 text-center text-xs text-[#8a857c]">
              <p className="font-semibold text-[#3d5245] flex items-center justify-center gap-1 mb-1">
                <BellRing className="w-3.5 h-3.5 animate-bounce" />
                Downtime/Resting Mode Active
              </p>
              Take a walk, stretch your posture, or drink some clean water!
            </div>
          )}

          {showConfig && (
            <div className="bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg p-3 space-y-3" id="pomodoro-manual-adjuster">
              <h6 className="text-[10px] font-mono font-bold text-[#1c1b1a] uppercase text-stone-700">Minutes Adjustment</h6>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-[#8a857c] uppercase mb-0.5">Study</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={durations.focus}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDurations(prev => ({ ...prev, focus: val }));
                      if (mode === 'focus') setTimeLeft(val * 60);
                    }}
                    className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-2 py-1 focus:outline-none focus:border-[#3d5245]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-[#8a857c] uppercase mb-0.5">Short</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={durations.shortBreak}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDurations(prev => ({ ...prev, shortBreak: val }));
                      if (mode === 'shortBreak') setTimeLeft(val * 60);
                    }}
                    className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-2 py-1 focus:outline-none focus:border-[#3d5245]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-[#8a857c] uppercase mb-0.5">Long</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={durations.longBreak}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDurations(prev => ({ ...prev, longBreak: val }));
                      if (mode === 'longBreak') setTimeLeft(val * 60);
                    }}
                    className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-2 py-1 focus:outline-none focus:border-[#3d5245]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-stone-50 border border-[#e9e6e0] rounded-lg text-[11px] text-[#8a857c] italic font-serif">
            &ldquo;Your capacity is defined by your consistency. Deep, structured learning for 25 minutes eclipses 3 hours of unfocused reading. Keep studying!&rdquo;
          </div>

        </div>

      </div>

    </div>
  );
}
