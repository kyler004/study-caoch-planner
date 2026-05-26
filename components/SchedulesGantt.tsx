'use client';

import React, { useState, useMemo } from 'react';
import { useStudy, GanttTask } from '@/context/StudyContext';
import { Layers, Calendar, Plus, Trash2, Sliders, Milestone } from 'lucide-react';

export default function SchedulesGantt() {
  const { ganttTasks, addGanttTask, deleteGanttTask, editGanttTask, exams } = useStudy();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subject, setSubject] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Generate date columns for our timeline (the upcoming 10 days)
  const timelineDates = useMemo(() => {
    const list = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i - 1); // From yesterday up to 9 days in future
      list.push({
        dateStr: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'narrow' })
      });
    }
    return list;
  }, []);

  // Filter subject options
  const subjects = useMemo(() => {
    const set = new Set<string>();
    set.add('General Study');
    exams.forEach(ex => set.add(ex.subject));
    return Array.from(set);
  }, [exams]);

  // Handle Create Task
  const handleCreateGantt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    addGanttTask({
      name,
      startDate,
      endDate,
      progress: 20, // default starts at 20%
      subject: subject || 'General Study'
    });

    setName('');
    setStartDate('');
    setEndDate('');
    setSubject('');
    setShowAddForm(false);
  };

  // Helper to calculate bar offset columns and span columns in our 10-day grid
  const calculateGridSpan = (taskStart: string, taskEnd: string) => {
    const startIdx = timelineDates.findIndex(d => d.dateStr === taskStart);
    const endIdx = timelineDates.findIndex(d => d.dateStr === taskEnd);

    // If both completely out of bounds, return null
    if (startIdx === -1 && endIdx === -1) {
      return { colStart: 2, colSpan: 1, outOfBounds: true };
    }

    // Default start/end fallbacks for partial overlaps
    const startCol = startIdx !== -1 ? startIdx + 2 : 2; // Column index (1-based, offset by 1 for left name column, so starts at col 2)
    const endCol = endIdx !== -1 ? endIdx + 2 : 11; // up to column 11

    const span = Math.max(1, endCol - startCol + 1);

    return { colStart: startCol, colSpan: span, outOfBounds: false };
  };

  // Handle Drag / Slider Progress change
  const handleProgressChange = (id: string, newProgress: number) => {
    editGanttTask(id, { progress: newProgress });
  };

  return (
    <div className="bg-white border border-[#e9e6e0] rounded-xl p-6" id="schedules-gantt-root">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h4 className="text-sm font-sans font-semibold text-[#1c1b1a]">Study Gantt Chart (Project Timelines)</h4>
          <p className="text-xs text-[#8a857c]">Schedule horizontal roadmap bars and adjust progress sliders interactively</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-[#4f6356] text-white px-3.5 py-1.5 border border-[#3d5245] rounded-lg hover:bg-[#3d5245] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel Form' : 'Add Gantt Task'}
        </button>
      </div>

      {/* Creation form */}
      {showAddForm && (
        <form onSubmit={handleCreateGantt} id="gantt-task-form" className="bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg p-4 mb-6 space-y-4">
          <h5 className="text-xs font-mono font-semibold text-[#1c1b1a]">New Roadmap Milestone</h5>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Milestone/Task name</label>
              <input 
                type="text"
                placeholder="e.g. Prep Real Analysis formula cards"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Study Category</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              >
                {subjects.map((sub, sIdx) => (
                  <option key={sIdx} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Start Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Target End Date</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>

            <div className="flex items-end pt-2">
              <button
                type="submit"
                className="w-full text-xs font-mono font-semibold bg-[#1c1b1a] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
              >
                Save Timeline bar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Gantt Interactive Board Container */}
      <div className="overflow-x-auto border border-[#e9e6e0] rounded-xl bg-[#fbfaf7]">
        
        {/* Render Grid headers */}
        <div className="min-w-[800px] grid grid-cols-12 border-b border-[#e9e6e0] bg-[#faf9f6] text-center text-[10px] font-mono uppercase text-[#8a857c] tracking-wider py-2.5">
          <div className="col-span-2 text-left pl-4 font-semibold text-[#1c1b1a] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Project milestone
          </div>

          {timelineDates.map((d, colIdx) => (
            <div key={colIdx} className="border-l border-[#f1eeeb] flex flex-col justify-center leading-tight">
              <span>{d.label}</span>
              <span className="text-[8px] text-[#b8542c]">{d.dayOfWeek}</span>
            </div>
          ))}
        </div>

        {/* Rows wrapper */}
        <div className="min-w-[800px] divide-y divide-[#e9e6e0]" id="gantt-tasks-rows-holder">
          {ganttTasks.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#8a857c]">
              No active Gantt tracks. Add the study timeline bar using the action above!
            </div>
          ) : (
            ganttTasks.map((task) => {
              const { colStart, colSpan, outOfBounds } = calculateGridSpan(task.startDate, task.endDate);

              return (
                <div key={task.id} className="grid grid-cols-12 min-h-[60px] items-center relative py-1.5 hover:bg-white transition-colors">
                  
                  {/* Left Column: Task Name, details and remove icon */}
                  <div className="col-span-2 pl-4 pr-1.5 flex flex-col justify-center select-none">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs font-semibold text-[#1c1b1a] line-clamp-1 leading-tight" title={task.name}>
                        {task.name}
                      </span>
                      <button 
                        onClick={() => deleteGanttTask(task.id)}
                        className="text-[#8a857c] hover:text-[#b8542c] p-0.5 rounded hover:bg-[#f1eeeb] transition-all"
                        title="Delete Gantt row"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[9px] font-mono text-[#8a857c] truncate mt-0.5">
                      {task.subject}
                    </span>
                  </div>

                  {/* Right Columns: Gantt Timeline Bar span */}
                  <div className="col-span-10 grid grid-cols-10 h-full relative border-l border-[#e9e6e0]/50">
                    
                    {/* Visual vertical background column separators */}
                    {Array.from({ length: 10 }).map((_, bi) => (
                      <div key={bi} className="absolute inset-y-0 border-r border-[#e9e6e0]/25 pointer-events-none" style={{ left: `${(bi + 1) * 10}%` }} />
                    ))}

                    {/* Timeline bar */}
                    <div 
                      id={`gantt-bar-element-${task.id}`}
                      className={`relative z-10 h-10 border rounded-lg px-2 flex flex-col justify-center bg-white shadow-sm transition-all`}
                      style={{
                        gridColumnStart: colStart - 1, // Offset column for colspan positioning (colStart indices start from 2, so offset by 1)
                        gridColumnEnd: `span ${colSpan}`
                      }}
                    >
                      {/* Bar Content info */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#8a857c]">
                        <span className="font-semibold text-[#4f6356] truncate pr-1">Progress: {task.progress}%</span>
                        <div className="flex gap-1 items-center">
                          <Calendar className="w-2.5 h-2.5" />
                          <span className="text-[8px]">{task.startDate}</span>
                        </div>
                      </div>

                      {/* Bar Fill & Drag slider */}
                      <div className="mt-1 relative flex items-center">
                        {/* Progress percentage track fill */}
                        <div className="absolute inset-y-0 left-0 bg-[#3d5245] opacity-20 rounded-md" style={{ width: `${task.progress}%` }} />
                        
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={task.progress}
                          onChange={(e) => handleProgressChange(task.id, Number(e.target.value))}
                          className="w-full h-1.5 bg-[#e9e6e0] rounded-lg appearance-none cursor-pointer accent-[#3d5245] outline-none relative z-20"
                          title="Slide to update study progress"
                        />
                      </div>
                    </div>

                    {outOfBounds && (
                      <div className="col-span-12 flex justify-center py-2 text-[9px] font-mono text-amber-600 bg-amber-50">
                        * Task timeline out of range ({task.startDate} to {task.endDate})
                      </div>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Guide label and timeline indicator */}
      <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-[#8a857c]">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#3d5245]" />
          <span>Slide bar centers to instantly record study milestones completion %</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Milestone className="w-3.5 h-3.5 text-[#b8542c]" />
          <span>Timeline ranges from Yesterday up to the next 9 days</span>
        </div>
      </div>

    </div>
  );
}
