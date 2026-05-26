'use client';

import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Clock, CheckSquare, Target, Settings, Plus, Minus } from 'lucide-react';

export default function StatsDashboard() {
  const { studyHours, completionRate, focusScore, incrementStudyHours } = useStudy();
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [weeklyTarget, setWeeklyTarget] = useState(40);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full w-full">
      {/* CARD 1: STUDY HOURS */}
      <div id="stats-hours-card" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Study Hours</span>
          <Clock size={14} className="text-indigo-400" />
        </div>
        
        <div className="my-2">
          {showGoalSettings ? (
            <div className="flex items-center gap-1.5 pt-1.5">
              <button
                type="button"
                onClick={() => setWeeklyTarget(tg => Math.max(5, tg - 5))}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-mono font-bold text-slate-700">{weeklyTarget}h Goal</span>
              <button
                type="button"
                onClick={() => setWeeklyTarget(tg => Math.min(100, tg + 5))}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600"
              >
                <Plus size={12} />
              </button>
              <button
                onClick={() => setShowGoalSettings(false)}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 rounded px-1.5 py-0.5 ml-auto text-slate-600 font-semibold"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-1 select-none">
              <div className="text-2xl font-bold text-slate-800 font-sans tracking-tight">
                {studyHours.toFixed(1)}
              </div>
              <span className="text-sm font-normal text-slate-400">
                /{weeklyTarget}h
              </span>
              <span 
                onClick={() => setShowGoalSettings(true)}
                className="text-[9px] text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer font-bold ml-auto uppercase tracking-wider"
              >
                Set Goal
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Micro Progress Bar */}
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
          <div 
            className="bg-indigo-500 h-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (studyHours / weeklyTarget) * 100)}%` }}
          />
        </div>
      </div>

      {/* CARD 2: COMPLETION RATE */}
      <div id="stats-completion-card" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Completion Rate</span>
          <CheckSquare size={14} className="text-emerald-500" />
        </div>
        
        <div className="my-2 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {completionRate}%
          </div>
          <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
            ↑ 12% <span className="text-[10px] text-slate-400 font-normal">this wk</span>
          </span>
        </div>

        {/* Dynamic Micro progress bar */}
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* CARD 3: FOCUS SCORE */}
      <div id="stats-focus-card" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Focus Score</span>
          <Target size={14} className="text-purple-500" />
        </div>
        
        <div className="my-2 flex items-baseline justify-between select-none">
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {focusScore.toFixed(1)}
          </div>
          <span className="text-xs font-normal text-slate-400">
            /10 overall
          </span>
        </div>

        {/* Dynamic Micro progress bar */}
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
          <div 
            className="bg-purple-500 h-full transition-all duration-500" 
            style={{ width: `${focusScore * 10}%` }}
          />
        </div>
      </div>
    </div>
  );
}
