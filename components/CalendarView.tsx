'use client';

import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { ChevronLeft, ChevronRight, CalendarRange, MapPin, Sparkles, Plus, AlertCircle } from 'lucide-react';

export default function CalendarView() {
  const { exams, addExam } = useStudy();
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed represents June in our list)
  const [currentYear, setCurrentYear] = useState(2026);
  
  const [isAddingInDay, setIsAddingInDay] = useState(false);
  const [daySelected, setDaySelected] = useState<number | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventNote, setNewEventNote] = useState('Prep Study Period');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Number of days in June 2026 (30 days, starting on MON (1))
  const daysInMonth = 30;
  const startDayOffset = 0; // June 1st 2026 starts on Monday! Perfect offset = 0 columns

  const daysArray = useMemo(() => {
    const arr = [];
    // padding for offset
    for (let i = 0; i < startDayOffset; i++) {
      arr.push({ date: null, isCurrent: false });
    }
    // actual days
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push({ date: i, isCurrent: true });
    }
    return arr;
  }, []);

  const getEventsForDay = (dayNum: number) => {
    // June 2026 is 2026-06-...
    const matchPrefix = `2026-06-${dayNum.toString().padStart(2, '0')}`;
    return exams.filter(e => e.date === matchPrefix);
  };

  const handleDayClick = (dayNum: number) => {
    setDaySelected(dayNum);
    setIsAddingInDay(true);
  };

  const handleAddQuickEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (daySelected && newEventTitle.trim()) {
      const formattedDate = `2026-06-${daySelected.toString().padStart(2, '0')}`;
      addExam(newEventTitle.trim(), formattedDate, newEventNote.trim());
      setNewEventTitle('');
      setIsAddingInDay(false);
      setDaySelected(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-full animate-fadeIn">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5 uppercase">
            <CalendarRange size={16} className="text-indigo-500" /> Study Calendar
          </h2>
          <p className="text-xs text-slate-400">June 2026 Study Cycles</p>
        </div>

        {/* Month selector navigation */}
        <div className="flex items-center gap-2">
          <button className="p-1 text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded text-xs transition duration-150">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-mono font-black text-slate-700 tracking-wider">
            {monthNames[currentMonth].toUpperCase()} 2026
          </span>
          <button className="p-1 text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded text-xs transition duration-150">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1">
        {/* DAY SELECTOR DIALOG */}
        <div className="col-span-12 md:col-span-8 flex flex-col justify-between">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2 select-none">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>
          </div>

          {/* CALENDAR CALENDAR GRID */}
          <div className="grid grid-cols-7 gap-2 flex-1 min-h-[300px]">
            {daysArray.map((day, idx) => {
              if (!day.date) {
                return <div key={idx} className="bg-slate-50/50 rounded-lg min-h-[50px] border border-transparent" />;
              }

              const dailyEvents = getEventsForDay(day.date);
              const hasEvents = dailyEvents.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day.date!)}
                  className={`min-h-[60px] p-2 rounded-lg border flex flex-col justify-between cursor-pointer transition select-none group relative ${
                    hasEvents 
                      ? 'bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50/65 hover:border-indigo-300' 
                      : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold ${hasEvents ? 'text-indigo-600' : 'text-slate-400'} group-hover:text-indigo-600`}>
                    {day.date.toString().padStart(2, '0')}
                  </span>

                  {/* Bubble badges list */}
                  <div className="space-y-1">
                    {dailyEvents.map(e => (
                      <div 
                        key={e.id}
                        className="text-[8px] leading-3 font-bold px-1 py-0.5 bg-indigo-500 text-white rounded-sm truncate uppercase tracking-tight"
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>

                  {/* Mini plus indicator visible on hover */}
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-[8px] text-indigo-500 font-bold transition">
                    + ADD
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR DETAIL CONTROLS */}
        <div className="col-span-12 md:col-span-4 border-l border-slate-100 pl-4 flex flex-col justify-between">
          {isAddingInDay && daySelected ? (
            <form onSubmit={handleAddQuickEvent} className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Add Exam: June {daySelected}</p>
                <button
                  type="button" 
                  onClick={() => setIsAddingInDay(false)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-red-500"
                >
                  <X size={13} />
                </button>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Title</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Econometrics quiz"
                  className="w-full bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Recall notes</label>
                <input
                  type="text"
                  value={newEventNote}
                  onChange={(e) => setNewEventNote(e.target.value)}
                  placeholder="e.g. Chapter 1-5"
                  className="w-full bg-white border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold uppercase text-[10px] tracking-wider transition"
              >
                Schedule Study Block
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Period Reviews</h3>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs flex gap-2">
                <AlertCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Click on any calendar day block to immediately schedule and align a new active-recall session, midterm test, or project deadline milestone.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[9px] text-slate-300 font-bold uppercase tracking-wider">Scheduled for June</p>
                {exams.filter(e => e.date.includes('-06-')).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No exams schedules currently active for June.</p>
                ) : (
                  exams.filter(e => e.date.includes('-06-')).map(e => (
                    <div key={e.id} className="p-2 border border-slate-100 rounded text-[11px] flex justify-between items-center uppercase tracking-tight">
                      <div>
                        <span className="font-black text-slate-700 block">{e.title}</span>
                        <span className="text-[9px] text-slate-400">Recall set: {e.note}</span>
                      </div>
                      <span className="font-mono text-[9px] bg-indigo-50 text-indigo-500 font-bold px-1.5 py-0.5 rounded leading-none shrink-0 border border-indigo-100">
                        {e.date.split('-')[2]}th
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
