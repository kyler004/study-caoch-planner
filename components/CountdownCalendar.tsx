'use client';

import React, { useState, useMemo } from 'react';
import { useStudy, Exam } from '@/context/StudyContext';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, ShieldAlert, Sparkles, Check } from 'lucide-react';

export default function CountdownCalendar() {
  const { exams, addExam, deleteExam, user, accessToken, setNeedsAuth } = useStudy();

  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [notes, setNotes] = useState('');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Month rendering constants
  const currentYear = 2026;
  const currentMonth = 4; // May (0-indexed represents April, so 4 is May)
  const monthName = "May 2026";

  // Grid dates construction helper for May 2026
  // May 1st 2026 starts on Friday (5 blank slots in weekly row starting with Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5)
  const calendarDays = useMemo(() => {
    const daysInMonth = 31;
    const startOffset = 5; // Friday 
    const list = [];
    
    // Fill pre-offset
    for (let i = 0; i < startOffset; i++) {
      list.push({ dayNumber: null, dateStr: null });
    }

    // Fill days
    for (let i = 1; i <= daysInMonth; i++) {
      const formattedDay = i < 10 ? `0${i}` : `${i}`;
      const dateStr = `${currentYear}-05-${formattedDay}`;
      
      // Get events on this date
      const daysExams = exams.filter(e => e.date === dateStr);
      list.push({ dayNumber: i, dateStr, exams: daysExams });
    }

    return list;
  }, [exams]);

  // Submit Exam Target
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !date) return;

    addExam({
      subject,
      date,
      time,
      priority,
      notes
    });

    setSubject('');
    setDate('');
    setTime('09:00');
    setPriority('High');
    setNotes('');
    setShowForm(false);
  };

  // Google Calendar Integration Actions
  const handleCalendarSync = async () => {
    if (!exams.length) {
      alert("Introduce some upcoming exams to synchronize first!");
      return;
    }

    if (!user || !accessToken) {
      setNeedsAuth(true);
      return;
    }

    // Require explicit user confirmation dialog for writing/updating Google Calendar data (Workspace Skill mandate)
    const confirmed = window.confirm(
      `Synchronize Study Schedule Tracker: Create ${exams.length} exam event(s) directly on your primary Google Calendar accounts?`
    );
    if (!confirmed) return;

    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      let createdCount = 0;
      
      for (const exam of exams) {
        const examHour = exam.time || "09:00";
        // Define simple startTime and endTime (usually 2.5 hours)
        const startTimeStr = `${exam.date}T${examHour}:00`;
        const dateObj = new Date(startTimeStr);
        const startISO = dateObj.toISOString();
        
        dateObj.setHours(dateObj.getHours() + 2.5); // 2 and a half hours duration
        const endISO = dateObj.toISOString();

        const payload = {
          summary: `🎓 Exam Target: ${exam.subject}`,
          description: `Study Tracker Target Details: ${exam.notes || 'No description provided'}.\nPriority: ${exam.priority} Importance level.`,
          start: {
            dateTime: startISO,
            timeZone: "UTC"
          },
          end: {
            dateTime: endISO,
            timeZone: "UTC"
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 24 * 60 }, // 1 day before recall
              { method: "popup", minutes: 30 } // 30 minutes before
            ]
          }
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.status === 401) {
          // Token expired, require re-auth
          setNeedsAuth(true);
          throw new Error("Google Session credentials expired. Please log in again.");
        }

        if (!response.ok) {
          const errData = await response.json();
          console.error("Google Calendar API Error Details:", errData);
          throw new Error(`Cloud Sync failed: ${errData?.error?.message || response.statusText}`);
        }

        createdCount++;
      }

      setSyncSuccess(true);
      alert(`🎉 Synchronized successfully! ${createdCount} exam event(s) created on your Google Calendar.`);
    } catch (error: any) {
      console.error("Sync Error:", error);
      alert(error.message || "An unexpected error occurred during cloud calendar sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white border border-[#e9e6e0] rounded-xl p-6" id="countdown-calendar-root">
      
      {/* Head section with Google Calendar Controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h4 className="text-sm font-sans font-semibold text-[#1c1b1a]">Event Countdown & Exam Organizer</h4>
          <p className="text-xs text-[#8a857c]">Track dates before exams and push milestones directly to Google Calendar</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cloud Sync Button */}
          {user ? (
            <button 
              onClick={handleCalendarSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-[#3b4a5a] text-white border border-[#2b3a4a] px-3.5 py-1.5 rounded-lg hover:bg-opacity-95 transition-all disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </>
              ) : syncSuccess ? (
                <>
                  <Check className="w-4 h-4 text-green-300" />
                  Synced to Google!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Sync Google Calendar
                </>
              )}
            </button>
          ) : (
            <div className="text-[11px] font-mono text-[#8a857c] flex items-center gap-1.5 bg-[#fbfaf7] px-2.5 py-1.5 border border-[#e9e6e0] rounded-md">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Sign in with Google to sync calendar
            </div>
          )}

          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-[#1c1b1a] text-white px-3 py-1.5 rounded-lg hover:bg-opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Exam Target
          </button>
        </div>
      </div>

      {/* Slideout inputs Form */}
      {showForm && (
        <form onSubmit={handleAddExam} id="exam-target-form" className="bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg p-4 mb-6 space-y-4">
          <h5 className="text-xs font-mono font-semibold text-[#1c1b1a]">Define Exam Target</h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Exam Subject / Topic</label>
              <input 
                type="text"
                placeholder="e.g. Real Analysis II"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Exam Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Hour of Examination</label>
              <input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Exam Syllabus & Highlights</label>
              <input 
                type="text"
                placeholder="Topics, formulas, chapters notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Importance / Priority Weight</label>
              <div className="flex gap-2.5 mt-1">
                {(['High', 'Medium', 'Low'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`text-xs font-mono px-3.5 py-1.5 rounded transition-all border ${
                      priority === lvl 
                        ? 'bg-[#1c1b1a] text-white border-[#1c1b1a]' 
                        : 'bg-white text-[#8a857c] border-[#e9e6e0] hover:bg-[#fbfaf7]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="text-xs font-mono font-semibold bg-[#1c1b1a] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
            >
              Add Exam Milestone
            </button>
          </div>
        </form>
      )}

      {/* Main split: Calendar Month Grid Side & Countdown Target List Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="calendar-countdown-split">
        
        {/* Calendar Grid Section */}
        <div className="lg:col-span-7 border border-[#e9e6e0] rounded-xl p-4 bg-[#fbfaf7]" id="monthly-calendar-grid">
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-xs font-sans font-bold text-[#1c1b1a]">{monthName}</h5>
            <span className="text-[10px] font-mono text-[#8a857c]">Study Targets Highlighted</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-[#8a857c] uppercase tracking-wider mb-2 border-b border-[#e9e6e0] pb-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              const hasExams = cell.exams && cell.exams.length > 0;
              return (
                <div 
                  key={idx}
                  className={`min-h-[56px] p-1 border rounded-md flex flex-col justify-between transition-all relative ${
                    cell.dayNumber === null 
                      ? 'bg-stone-100/50 border-transparent' 
                      : hasExams 
                        ? 'bg-orange-50/70 border-orange-200' 
                        : 'bg-white border-[#e9e6e0] hover:border-[#c2944f]'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-semibold ${
                    cell.dayNumber === null 
                      ? 'text-transparent' 
                      : hasExams 
                        ? 'text-[#b8542c]' 
                        : 'text-[#1c1b1a]'
                  }`}>
                    {cell.dayNumber}
                  </span>

                  {hasExams && cell.exams && (
                    <div className="space-y-0.5 mt-0.5">
                      {cell.exams.map((ex, exIdx) => (
                        <div 
                          key={ex.id || exIdx}
                          className="bg-[#b8542c] text-[8px] text-white rounded px-1 py-0.5 truncate leading-none font-sans font-medium"
                          title={`${ex.subject} at ${ex.time || 'all day'}`}
                        >
                          {ex.subject}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Exams countdown list panel */}
        <div className="lg:col-span-5" id="real-time-exams-countdown">
          <h5 className="text-xs font-mono font-semibold text-[#1c1b1a] uppercase tracking-wider mb-3">Exams Days Countdowns</h5>
          
          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1" id="countdown-targets">
            {exams.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#e9e6e0] rounded-xl text-xs text-[#8a857c]">
                No exams listed. Click &quot;Add Exam Target&quot; to track days before every event!
              </div>
            ) : (
              [...exams]
                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((exam) => {
                  const daysLeft = Math.ceil(
                    (new Date(exam.date).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div 
                      key={exam.id} 
                      id={`exam-countdown-card-${exam.id}`}
                      className="border border-[#e9e6e0] rounded-xl p-3.5 bg-white space-y-2.5 relative hover:border-[#c2944f] transition-all"
                    >
                      {/* Top title and delete */}
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="text-xs font-semibold text-[#1c1b1a] leading-tight">{exam.subject}</p>
                          {exam.notes && <p className="text-[10px] text-[#8a857c] font-sans mt-0.5">{exam.notes}</p>}
                        </div>
                        <button 
                          onClick={() => deleteExam(exam.id)}
                          className="text-[#8a857c] hover:text-[#b8542c] p-1 rounded hover:bg-[#fbfaf7] transition-colors"
                          title="Remove exam milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom row displaying countdown and date stats */}
                      <div className="flex items-center justify-between border-t border-[#f1eeeb] pt-2 mt-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#8a857c] font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{exam.date} @ {exam.time || '09:00'}</span>
                        </div>

                        {/* Days countdown display */}
                        <div>
                          {daysLeft === 0 ? (
                            <span className="text-xs font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded animate-pulse">
                              ★ Exam Today!
                            </span>
                          ) : daysLeft < 0 ? (
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                              Passed
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-bold bg-orange-100 text-[#b8542c] px-2.5 py-0.5 rounded">
                              {daysLeft} day{daysLeft > 1 ? 's' : ''} left
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
