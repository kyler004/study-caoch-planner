'use client';

import React, { useMemo } from 'react';
import { useStudy } from '@/context/StudyContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Award, BookOpen, Clock, Flame, CalendarRange, Trash2 } from 'lucide-react';

export default function PerformanceDashboard() {
  const { logs, schedule, exams, deleteStudyLog } = useStudy();

  // Metrics calculation
  const totalHours = useMemo(() => {
    const totalMinutes = logs.reduce((acc, curr) => acc + curr.duration, 0);
    return parseFloat((totalMinutes / 60).toFixed(1));
  }, [logs]);

  const totalSessions = useMemo(() => logs.length, [logs]);

  // Current Streak Calculation
  const studyStreak = useMemo(() => {
    if (logs.length === 0) return 0;
    
    const uniqueDates = Array.from(
      new Set(logs.map(log => log.timestamp.split('T')[0]))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // descending (newest first)

    let streak = 0;
    let today = new Date().toISOString().split('T')[0];
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if user has studied today or yesterday to maintain active streak
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let expectedDate = new Date();
    if (uniqueDates[0] === yesterdayStr) {
      expectedDate.setDate(expectedDate.getDate() - 1);
    }

    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDateStr = expectedDate.toISOString().split('T')[0];
      if (uniqueDates[i] === currentDateStr) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [logs]);

  // Next upcoming exam info
  const nextExam = useMemo(() => {
    if (exams.length === 0) return null;
    const sorted = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const upcomingFiltered = sorted.filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0));
    return upcomingFiltered[0] || sorted[0];
  }, [exams]);

  // Chart Data 1: Subject Hours breakdown
  const subjectBreakdownData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach(log => {
      map[log.subject] = (map[log.subject] || 0) + log.duration;
    });
    
    return Object.entries(map).map(([subject, duration]) => ({
      subject: subject.length > 20 ? subject.substring(0, 17) + '...' : subject,
      originalSubject: subject,
      minutes: duration,
      hours: parseFloat((duration / 60).toFixed(1)),
    })).sort((a, b) => b.minutes - a.minutes);
  }, [logs]);

  // Chart Data 2: Study trend over last 7 days
  const sevenDayTrendData = useMemo(() => {
    const trendList = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = targetDate.toISOString().split('T')[0];

      // Sum minutes studied on this specific day
      const dailyMinutes = logs
        .filter(log => log.timestamp.split('T')[0] === dateStr)
        .reduce((sum, log) => sum + log.duration, 0);

      trendList.push({
        day: dayName,
        date: dateStr,
        minutes: dailyMinutes,
        hours: parseFloat((dailyMinutes / 60).toFixed(1))
      });
    }
    return trendList;
  }, [logs]);

  // Format dynamic dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6" id="performance-dashboard-root">
      
      {/* Visual KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
        
        {/* Card 1: Study hours */}
        <div id="kpi-card-focus-hours" className="bg-white border border-[#e9e6e0] rounded-xl p-5 hover:border-[#c2944f] transition-colors relative flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-[#8a857c] uppercase tracking-wider">Total Active Study</p>
            <h3 className="text-3xl font-sans font-semibold text-[#1c1b1a] mt-1">
              {totalHours} <span className="text-sm font-normal text-[#8a857c]">hrs</span>
            </h3>
            <p className="text-xs text-[#8a857c] mt-2">Cumulative focus time logged</p>
          </div>
          <div className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e9e6e0] text-[#3d5245]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Sessions completed */}
        <div id="kpi-card-sessions" className="bg-white border border-[#e9e6e0] rounded-xl p-5 hover:border-[#c2944f] transition-colors relative flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-[#8a857c] uppercase tracking-wider">Sessions Cleared</p>
            <h3 className="text-3xl font-sans font-semibold text-[#1c1b1a] mt-1">
              {totalSessions} <span className="text-sm font-normal text-[#8a857c]">logs</span>
            </h3>
            <p className="text-xs text-[#8a857c] mt-2">Productivity chunks logged</p>
          </div>
          <div className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e9e6e0] text-[#3b4a5a]">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Study streak */}
        <div id="kpi-card-streak" className="bg-white border border-[#e9e6e0] rounded-xl p-5 hover:border-[#c2944f] transition-colors relative flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-[#8a857c] uppercase tracking-wider">Daily Streak</p>
            <h3 className="text-3xl font-sans font-semibold text-[#1c1b1a] mt-1">
              {studyStreak} <span className="text-sm font-normal text-[#8a857c]">days</span>
            </h3>
            <p className="text-xs text-[#8a857c] mt-2">
              {studyStreak > 0 ? "You are on fire! Keep it up." : "Log a session today to start!"}
            </p>
          </div>
          <div className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e9e6e0] text-[#b8542c]">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Next Exam countdown */}
        <div id="kpi-card-next-exam" className="bg-white border border-[#e9e6e0] rounded-xl p-5 hover:border-[#c2944f] transition-colors relative flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-[#8a857c] uppercase tracking-wider">Closest Exam Target</p>
            {nextExam ? (
              <>
                <h3 className="text-lg font-sans font-semibold text-[#1c1b1a] mt-1.5 truncate max-w-[160px]">
                  {nextExam.subject}
                </h3>
                <p className="text-xs font-semibold text-[#b8542c] font-mono mt-0.5">
                  {(() => {
                    const days = Math.ceil(
                      (new Date(nextExam.date).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)
                    );
                    if (days === 0) return "★ Today!";
                    if (days < 0) return "Completed exam";
                    return `${days} day${days > 1 ? 's' : ''} left`;
                  })()}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-sans font-semibold text-[#8a857c] mt-1.5">No Exams Set</h3>
                <p className="text-xs text-[#8a857c] mt-0.5">Relax and learn</p>
              </>
            )}
          </div>
          <div className="p-3 bg-[#fbfaf7] rounded-lg border border-[#e9e6e0] text-[#c2944f]">
            <CalendarRange className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recharts Analytics Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-holder">
        
        {/* Study volume trend Area chart */}
        <div id="chart-card-study-trend" className="bg-white border border-[#e9e6e0] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-sans font-semibold text-[#1c1b1a]">Weekly Commitment Trend</h4>
            <p className="text-xs text-[#8a857c] mb-4">Minutes studied per day (Last 7 days)</p>
          </div>
          
          <div className="h-64 w-full" id="area-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sevenDayTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f6356" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f6356" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1eeeb" />
                <XAxis dataKey="day" stroke="#8a857c" fontSize={11} tickLine={false} />
                <YAxis stroke="#8a857c" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e9e6e0', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1c1b1a' }}
                />
                <Area type="monotone" dataKey="minutes" name="Minutes" stroke="#3d5245" strokeWidth={2} fillOpacity={1} fill="url(#colorMinutes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject wise duration Bar chart */}
        <div id="chart-card-subject-breakdown" className="bg-white border border-[#e9e6e0] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-sans font-semibold text-[#1c1b1a]">Academic Time Distribution</h4>
            <p className="text-xs text-[#8a857c] mb-4">Minutes dedicated to each study subject</p>
          </div>
          
          <div className="h-64 w-full" id="bar-chart-container">
            {subjectBreakdownData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#8a857c] text-xs">
                <p>Run the focus timer to populate metrics visualizers.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1eeeb" />
                  <XAxis dataKey="subject" stroke="#8a857c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8a857c" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e9e6e0', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1c1b1a' }}
                  />
                  <Bar dataKey="minutes" name="Minutes Study" fill="#3b4a5a" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Recents logs list (History tracker) */}
      <div id="performance-history-card" className="bg-white border border-[#e9e6e0] rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-sm font-sans font-semibold text-[#1c1b1a]">Performance Study Ledger</h4>
            <p className="text-xs text-[#8a857c]">Chronological records of study chunks completed</p>
          </div>
          <div className="text-xs font-mono px-2.5 py-1 bg-[#fbfaf7] border border-[#e9e6e0] rounded text-[#8a857c]">
            {logs.length} Total Logs
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 pr-1" id="logs-ledger-list">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8a857c]">
              No focus hours logged yet. Start a study countdown session below!
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                id={`ledger-row-${log.id}`}
                className="flex items-center justify-between text-xs py-2.5 px-3 bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3d5245]" />
                  <div>
                    <p className="font-semibold text-[#1c1b1a]">{log.subject}</p>
                    {log.notes && <p className="text-[#8a857c] text-[11px] mt-0.5">{log.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="font-mono bg-[#e9e6e0] px-2 py-0.5 rounded text-[#1c1b1a] font-semibold">
                      +{log.duration} min
                    </span>
                    <p className="text-[10px] text-[#8a857c] mt-0.5">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button 
                    onClick={() => deleteStudyLog(log.id)}
                    className="text-[#8a857c] hover:text-[#b8542c] p-1 rounded-md hover:bg-[#f1eeeb] transition-colors"
                    title="Remove session log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
