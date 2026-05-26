'use client';

import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Mail, GraduationCap, AreaChart, Smile, Sparkles, Send, CheckCircle } from 'lucide-react';

export default function PerformanceInsights() {
  const { studyHours, completionRate, focusScore } = useStudy();
  const [reportEmail, setReportEmail] = useState('rayann.kenne@facsciences-uy1.cm');
  const [wasSent, setWasSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const subjectBreakdown = [
    { name: 'Calculus II', hours: 14.5, color: 'bg-indigo-500', barWidth: '72%' },
    { name: 'Biology 101', hours: 9.0, color: 'bg-sky-400', barWidth: '45%' },
    { name: 'Macro-Econ', hours: 7.5, color: 'bg-amber-400', barWidth: '38%' },
    { name: 'History 404', hours: 3.5, color: 'bg-purple-400', barWidth: '18%' },
  ];

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setWasSent(true);
      setTimeout(() => setWasSent(false), 4000);
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-full animate-fadeIn">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5 uppercase">
            <AreaChart size={17} className="text-indigo-500" /> Performance Insights
          </h2>
          <p className="text-xs text-slate-400">Personalized analytics and recall patterns</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded text-[10px] font-bold text-indigo-600 uppercase font-mono">
          <Smile size={11} /> Cognitive Recall: Strong
        </span>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1">
        {/* Chart Column */}
        <div className="col-span-12 md:col-span-7 space-y-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Study Hours Breakdown</h3>
          
          <div className="space-y-4">
            {subjectBreakdown.map((subject, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 font-semibold">{subject.name}</span>
                  <span className="text-slate-500 font-mono font-bold">{subject.hours}h ({Math.round((subject.hours / studyHours) * 100) || 0}%)</span>
                </div>
                
                {/* Visual Bar row */}
                <div className="w-full bg-slate-100 h-3.5 rounded overflow-hidden flex relative items-center">
                  <div 
                    className={`${subject.color} h-full transition-all duration-700`} 
                    style={{ width: subject.barWidth }}
                  />
                  <span className="absolute left-2 text-[8px] font-mono font-black text-white mix-blend-difference uppercase">
                    CYCLE {idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Recall Frequency</span>
              <p className="text-base font-black text-slate-800 mt-1">Every 48h</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cognitive Velocity</span>
              <p className="text-base font-black text-emerald-600 mt-1">↑ 8.4% faster</p>
            </div>
          </div>
        </div>

        {/* Email Report dispatch Column */}
        <div className="col-span-12 md:col-span-5 border-l border-slate-100 pl-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest block flex items-center gap-1">
              <Mail size={13} /> Dispatch Weekly Report
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed leading-5">
              Receive a detailed compilation of your subject milestones, focus retention scores, and suggested spaced-repetition schedules directly in your inbox every Sunday morning.
            </p>

            <form onSubmit={handleSendReport} className="space-y-3 pt-2">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-0.5">Destination Address</label>
                <input
                  type="email"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                  placeholder="rayann.kenne@facsciences-uy1.cm"
                  className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-900 hover:bg-slate-800 text-white rounded font-bold uppercase text-[10px] tracking-wider transition disabled:opacity-50"
              >
                {loading ? (
                  <span>DISPATCHING...</span>
                ) : wasSent ? (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> SENT SUCCESSFULLY!</span>
                ) : (
                  <>
                    <Send size={11} /> DISPATCH EMAIL REPORT
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs flex gap-2.5 mt-5">
            <GraduationCap size={15} className="text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-700 text-[11px] mb-0.5">COGNITIVE RECOMMENDATION</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your recall rating is superb in Macroeconomics but slightly lagging in Biology 101. Try to schedule a 25-minute Pomodoro session focused primarily on Biology Cell Structures before midnight tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
