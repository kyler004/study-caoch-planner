'use client';

import React, { useState } from 'react';
import { useStudy, GanttItem } from '../context/StudyContext';
import { Plus, X, ListCollapse, ChevronRight, Sliders, CheckSquare } from 'lucide-react';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export default function SchedulesGantt() {
  const { ganttItems, addGanttItem, updateGanttItemProgress, deleteGanttItem } = useStudy();

  const [isAdding, setIsAdding] = useState(false);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [percent, setPercent] = useState(50);
  const [startDay, setStartDay] = useState<typeof DAYS[number]>('MON');
  const [endDay, setEndDay] = useState<typeof DAYS[number]>('FRI');

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPercent, setEditPercent] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() && topic.trim()) {
      addGanttItem({
        subject: subject.trim(),
        topic: topic.trim(),
        percent,
        startDay,
        endDay,
      });
      // Reset
      setSubject('');
      setTopic('');
      setPercent(50);
      setIsAdding(false);
    }
  };

  const startEdit = (item: GanttItem) => {
    setEditingItemId(item.id);
    setEditPercent(item.percent);
  };

  const saveEdit = (id: string) => {
    updateGanttItemProgress(id, editPercent);
    setEditingItemId(null);
  };

  // Helper to determine CSS position based on days
  const getPositionStyles = (start: string, end: string) => {
    const startIndex = DAYS.indexOf(start as any);
    const endIndex = DAYS.indexOf(end as any);
    
    const validStart = startIndex !== -1 ? startIndex : 0;
    const validEnd = endIndex !== -1 ? endIndex : 6;
    
    const span = Math.max(1, validEnd - validStart + 1);
    
    // Express as percentages of grid
    const leftPercent = (validStart / DAYS.length) * 100;
    const widthPercent = (span / DAYS.length) * 100;
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const getGanttColor = (index: number) => {
    const colors = [
      'bg-indigo-500 text-white',
      'bg-sky-400 text-white',
      'bg-amber-400 text-amber-950',
      'bg-emerald-500 text-white',
      'bg-purple-500 text-white',
    ];
    return colors[index % colors.length];
  };

  const getLegendColor = (index: number) => {
    const bgColors = [
      'bg-indigo-500',
      'bg-sky-400',
      'bg-amber-400',
      'bg-emerald-500',
      'bg-purple-500',
    ];
    return bgColors[index % bgColors.length];
  };

  return (
    <div id="study-plan-gantt-card" className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full hover:shadow-sm transition duration-200">
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
          <ListCollapse size={15} className="text-indigo-500" /> Study Plan Gantt
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Theme custom indicator squares */}
          <div className="flex gap-1">
            {ganttItems.map((_, idx) => (
              <div key={idx} className={`w-2.5 h-2.5 rounded-sm ${getLegendColor(idx)}`} />
            ))}
          </div>
          
          <button 
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
          >
            {isAdding ? <X size={12} /> : <Plus size={12} />} {isAdding ? 'CANCEL' : 'ADD BAR'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col relative overflow-y-auto">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3 mb-3 shrink-0">
            <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">New Schedule Block</p>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Calculus II"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Integrals review"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Start Day</label>
                <select
                  value={startDay}
                  onChange={(e) => setStartDay(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none text-[10px]"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">End Day</label>
                <select
                  value={endDay}
                  onChange={(e) => setEndDay(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none text-[10px]"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Done: {percent}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percent}
                  onChange={(e) => setPercent(parseInt(e.target.value))}
                  className="w-full mt-2 cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded text-[10px] tracking-wide"
            >
              CREATE BLOCK
            </button>
          </form>
        ) : null}

        {/* TIMELINE VISUAL */}
        <div className="flex-1 flex flex-col gap-3 font-mono text-[10px] min-h-[160px]">
          {ganttItems.map((item, index) => {
            const isEditing = editingItemId === item.id;
            const pos = getPositionStyles(item.startDay, item.endDay);
            const blockColor = getGanttColor(index);

            return (
              <div key={item.id} className="flex items-center group relative py-1 hover:bg-slate-50/50 rounded transition duration-150">
                {/* Subject Header */}
                <div 
                  onClick={() => startEdit(item)}
                  className="w-24 text-slate-500 font-bold text-[10px] truncate pr-2 hover:text-indigo-600 hover:underline cursor-pointer select-none"
                  title="Click to edit completion rate"
                >
                  {item.subject}
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 h-7 bg-slate-100 rounded-sm relative overflow-hidden">
                  {item.startDay ? (
                    <div 
                      className={`absolute h-full rounded-sm flex items-center justify-between px-2 text-[9px] font-sans font-medium transition-all duration-300 ${blockColor}`}
                      style={{ 
                        left: pos.left, 
                        width: pos.width,
                      }}
                    >
                      <span className="truncate pr-1">{item.topic || 'No Topic'}</span>
                      
                      {/* Sub Progress indicator bar within the block (for professional polish) */}
                      <span className="shrink-0 bg-black/25 font-mono px-1 rounded text-[8px] font-bold">
                        {item.percent}%
                      </span>

                      {/* Accent highlight strip */}
                      <div 
                        className="absolute bottom-0 left-0 bg-black/30 h-1 transition-all" 
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400 flex items-center h-full px-2 italic font-mono text-[9px]">Unscheduled</span>
                  )}
                </div>

                {/* Quick controls on hover */}
                <div className="absolute right-0 opacity-0 group-hover:opacity-100 flex gap-1 bg-white border border-slate-200 p-0.5 rounded shadow-sm transition">
                  {isEditing ? (
                    <div className="flex items-center gap-1 px-1">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={editPercent}
                        onChange={(e) => setEditPercent(parseInt(e.target.value))}
                        className="w-14 h-1 cursor-pointer accent-indigo-500"
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="text-[9px] font-bold text-emerald-600 px-1 bg-emerald-50 hover:bg-emerald-100 rounded"
                      >
                        SAVE
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(item)}
                        className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline px-1 py-0.5"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => deleteGanttItem(item.id)}
                        className="text-[9px] font-bold text-red-500 hover:text-red-600 hover:underline px-1 py-0.5"
                      >
                        DEL
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Timeline markings exactly matching the wireframe */}
          <div className="mt-auto flex justify-between border-t border-slate-100 pt-2 text-slate-400 font-semibold tracking-wider select-none shrink-0">
            {DAYS.map(day => (
              <span key={day} className="w-[14%] text-center">{day}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
