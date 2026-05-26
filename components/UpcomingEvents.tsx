'use client';

import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { Calendar, Trash2, Plus, X, ChevronRight } from 'lucide-react';

export default function UpcomingEvents() {
  const { exams, addExam, deleteExam } = useStudy();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-06-12');
  const [note, setNote] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addExam(title.trim(), date, note.trim() || 'No additional notes');
      setTitle('');
      setNote('');
      setIsAdding(false);
    }
  };

  const getDaysLeft = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const today = new Date();
    // set to midnight for correct day diff
    examDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const msDiff = examDate.getTime() - today.getTime();
    const days = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatMonthDay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return {
        month: months[d.getMonth()] || 'OCT',
        day: d.getDate() || '12',
      };
    } catch {
      return { month: 'OCT', day: '12' };
    }
  };

  const getUrgencyClasses = (days: number) => {
    if (days <= 0) return 'border-slate-200 bg-slate-50 opacity-50';
    if (days <= 3) return 'border-red-100 bg-red-50 text-red-700';
    if (days <= 7) return 'border-amber-100 bg-amber-50 text-amber-700';
    return 'border-indigo-100 bg-indigo-50/50 text-indigo-700';
  };

  const getCalendarBubbleColor = (days: number) => {
    if (days <= 0) return 'text-slate-400';
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-amber-500';
    return 'text-indigo-500';
  };

  const getDaysLeftString = (days: number) => {
    if (days < 0) return 'Passed';
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <div id="upcoming-events-card" className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full hover:shadow-sm transition duration-200">
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1.5 font-sans tracking-wide">
          <Calendar size={15} className="text-indigo-500" /> Upcoming Events
        </h3>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
          title="Add event/exam"
        >
          {isAdding ? <X size={13} /> : <Plus size={13} />} {isAdding ? 'CANCEL' : 'ADD NEW'}
        </button>
      </div>

      {/* WORK CONTENT */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="p-3 border border-slate-100 bg-indigo-50/30 rounded-lg space-y-3">
            <p className="text-[10px] font-bold text-indigo-900 uppercase">Schedule Exam / Recall</p>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[9px] text-slate-400 uppercase font-bold mb-0.5">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g. History Midterm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase font-bold mb-0.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono text-[10px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase font-bold mb-0.5">Quick Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Prep level: 60%"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-1 px-3 text-[10px] rounded hover:bg-indigo-700 transition uppercase tracking-wider"
            >
              Add Event
            </button>
          </form>
        ) : null}

        <div className="space-y-4">
          {!mounted ? (
            <p className="text-xs text-slate-400 italic text-center py-6">Checking event schedules...</p>
          ) : exams.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">No upcoming events or tests</p>
          ) : (
            exams.map((exam) => {
              const daysLeft = getDaysLeft(exam.date);
              const urgencyClass = getUrgencyClasses(daysLeft);
              const bubbleColor = getCalendarBubbleColor(daysLeft);
              const { month, day } = formatMonthDay(exam.date);

              return (
                <div 
                  key={exam.id} 
                  className={`flex gap-4 p-3 border rounded-lg group hover:scale-[1.01] transition duration-150 relative ${urgencyClass}`}
                >
                  {/* Calendar Widget Block */}
                  <div className="text-center select-none shrink-0 w-10">
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${bubbleColor}`}>
                      {month}
                    </span>
                    <span className="text-2xl font-black block leading-none font-sans mt-0.5">
                      {day}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate" title={exam.title}>
                      {exam.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate" title={exam.note}>
                      {exam.note}
                    </p>
                    <span className="inline-block px-1.5 py-0.5 bg-black/5 rounded font-mono text-[8px] font-bold text-slate-600 mt-1">
                      {getDaysLeftString(daysLeft)}
                    </span>
                  </div>

                  {/* Action row visible on hover */}
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Delete event"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
