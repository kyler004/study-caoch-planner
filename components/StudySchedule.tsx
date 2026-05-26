'use client';

import React, { useState } from 'react';
import { useStudy, StudySession } from '@/context/StudyContext';
import { Calendar, Clock, Plus, Trash2, Edit2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export default function StudySchedule() {
  const { 
    schedule, 
    addScheduleSession, 
    toggleScheduleSession, 
    deleteScheduleSession, 
    editScheduleSession,
    addStudyLog 
  } = useStudy();

  // Create form state
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<StudySession>>({});

  // Feedback states
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [showForm, setShowForm] = useState(false);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !date || !time) return;

    addScheduleSession({
      subject,
      date,
      time,
      duration: Number(duration),
      notes,
      priority
    });

    // Reset fields
    setSubject('');
    setDate('');
    setTime('');
    setDuration(45);
    setNotes('');
    setPriority('Medium');
    setShowForm(false);
  };

  // Toggle Checkmark log prompts
  const handleCheckSession = (session: StudySession) => {
    toggleScheduleSession(session.id);
    
    // If it's being checked as completed, let's offer to automatically log the hours!
    if (!session.isCompleted) {
      if (window.confirm(`Add this completed study session (${session.duration} mins) to your progress history?`)) {
        addStudyLog({
          subject: session.subject,
          duration: session.duration,
          notes: session.notes || 'Scheduled study slot checked off'
        });
      }
    }
  };

  // Start Editing Handler
  const startEditing = (session: StudySession) => {
    setEditingId(session.id);
    setEditFields({
      subject: session.subject,
      date: session.date,
      time: session.time,
      duration: session.duration,
      notes: session.notes,
      priority: session.priority
    });
  };

  // Save Edit Handler
  const saveEditing = (id: string) => {
    editScheduleSession(id, editFields);
    setEditingId(null);
  };

  // Filtered schedule list
  const filteredSchedule = schedule.filter(s => {
    if (filterPriority === 'All') return true;
    return s.priority === filterPriority;
  }).sort((a,b) => {
    const dateComp = new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
    return dateComp;
  });

  return (
    <div className="bg-white border border-[#e9e6e0] rounded-xl p-6" id="study-schedule-root">
      
      {/* Upper bar controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h4 className="text-sm font-sans font-semibold text-[#1c1b1a]">Active Timetable & Study Sessions</h4>
          <p className="text-xs text-[#8a857c]">Customize schedules, organize priorities, and tick off tasks</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="text-xs font-mono bg-[#fbfaf7] border border-[#e9e6e0] rounded px-2 py-1.5 text-[#1c1b1a] focus:outline-none focus:border-[#c2944f]"
          >
            <option value="All">All Priorities</option>
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>

          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-[#4f6356] border border-[#3d5245] text-white px-3 py-1.5 rounded-lg hover:bg-[#3d5245] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Close Scheduler' : 'New Study Slot'}
          </button>
        </div>
      </div>

      {/* Slideout Scheduler inputs form */}
      {showForm && (
        <form onSubmit={handleSubmit} id="scheduler-form" className="bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg p-4 mb-6 space-y-4">
          <h5 className="text-xs font-mono font-semibold text-[#1c1b1a]">Schedule Study Slot</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Subject / Course Module</label>
              <input 
                type="text"
                placeholder="e.g. Calculus Complex Integrals"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Target Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Start Time</label>
              <input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Planned Span (Minutes)</label>
              <input 
                type="number"
                min="5"
                max="300"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Coaching Priority</label>
              <div className="flex gap-2.5 mt-1">
                {(['High', 'Medium', 'Low'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`text-xs font-mono px-3 py-1.5 rounded transition-all border ${
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

            <div>
              <label className="block text-[10px] font-mono text-[#8a857c] uppercase mb-1">Task Subtopics & Goals</label>
              <input 
                type="text"
                placeholder="Read chapter 3, solve exercise set..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded px-3 py-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="text-xs font-mono font-semibold bg-[#1c1b1a] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
            >
              Add Scheduled Session
            </button>
          </div>
        </form>
      )}

      {/* Study sessions dynamic display list */}
      <div className="space-y-3" id="timetable-slots-list">
        {filteredSchedule.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#e9e6e0] rounded-xl text-xs text-[#8a857c]">
            No study sessions are planned. Add a study session or ask your AI Study Assistant above for schedule recommendations!
          </div>
        ) : (
          filteredSchedule.map((session) => (
            <div 
              key={session.id} 
              id={`session-slot-item-${session.id}`}
              className={`flex flex-col md:flex-row md:items-center justify-between border rounded-xl p-4 transition-all hover:shadow-sm ${
                session.isCompleted 
                  ? 'bg-stone-50 border-[#e9e6e0] opacity-75' 
                  : editingId === session.id 
                    ? 'bg-[#fbfaf7] border-[#c2944f]' 
                    : 'bg-white border-[#e9e6e0]'
              }`}
            >
              {/* Left Details block */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button 
                  onClick={() => handleCheckSession(session)}
                  className="mt-0.5 text-[#8a857c] hover:text-[#3d5245] transition-colors focus:outline-none"
                  title={session.isCompleted ? "Mark incomplete" : "Mark study completed"}
                >
                  {session.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#3d5245]" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {editingId === session.id ? (
                    <div className="space-y-2">
                      <input 
                        type="text"
                        value={editFields.subject || ''}
                        onChange={(e) => setEditFields({ ...editFields, subject: e.target.value })}
                        className="text-xs font-semibold w-full border border-[#e9e6e0] bg-white rounded px-2 py-1 focus:outline-none"
                      />
                      <input 
                        type="text"
                        value={editFields.notes || ''}
                        onChange={(e) => setEditFields({ ...editFields, notes: e.target.value })}
                        className="text-[11px] w-full border border-[#e9e6e0] bg-white rounded px-2 py-1 focus:outline-none text-[#8a857c]"
                        placeholder="Aim details"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${session.isCompleted ? 'line-through text-[#8a857c]' : 'text-[#1c1b1a]'}`}>
                          {session.subject}
                        </span>
                        
                        {/* Priority indicator Tag */}
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded leading-none ${
                          session.priority === 'High' 
                            ? 'bg-orange-50 text-[#b8542c] border border-orange-100' 
                            : session.priority === 'Medium'
                              ? 'bg-amber-50 text-[#c2944f] border border-amber-100'
                              : 'bg-green-50 text-[#4f6356] border border-green-100'
                        }`}>
                          {session.priority} Priority
                        </span>
                      </div>
                      
                      {session.notes && (
                        <p className={`text-[11px] mt-0.5 ${session.isCompleted ? 'line-through text-[#8a857c]/65' : 'text-[#8a857c]'}`}>
                          {session.notes}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-[#8a857c] font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{session.time} ({session.duration}m planned)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons (Edit/Save/Remove) */}
              <div className="flex items-center gap-2.5 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-none border-[#f1eeeb] justify-end">
                {editingId === session.id ? (
                  <>
                    <button
                      onClick={() => saveEditing(session.id)}
                      className="text-xs font-mono font-semibold text-[#3d5245] bg-green-50 px-2.5 py-1 border border-green-100 rounded hover:bg-green-100 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs font-mono font-semibold text-[#8a857c] bg-[#fbfaf7] px-2.5 py-1 border border-[#e9e6e0] rounded hover:bg-[#f1eeeb] transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => startEditing(session)}
                      className="text-[#8a857c] hover:text-[#3d5245] p-1.5 rounded-lg hover:bg-[#fbfaf7] transition-colors"
                      title="Edit schedule details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => deleteScheduleSession(session.id)}
                      className="text-[#8a857c] hover:text-[#b8542c] p-1.5 rounded-lg hover:bg-[#fbfaf7] transition-colors"
                      title="Delete study slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
              
            </div>
          ))
        )}
      </div>

    </div>
  );
}
