'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { StudyProvider, useStudy, ViewType } from '../context/StudyContext';
import StatsDashboard from '../components/StatsDashboard';
import FocusTimer from '../components/FocusTimer';
import SchedulesGantt from '../components/SchedulesGantt';
import UpcomingEvents from '../components/UpcomingEvents';
import DraggableTaskQueue from '../components/DraggableTaskQueue';
import CalendarView from '../components/CalendarView';
import PerformanceInsights from '../components/PerformanceInsights';
import AIStudyCoach from '../components/AIStudyCoach';
import { 
  LayoutDashboard, 
  Calendar, 
  TableProperties, 
  TrendingUp, 
  Mail, 
  User, 
  Sparkles, 
  CheckSquare, 
  Flame,
  BrainCircuit,
  AlertCircle
} from 'lucide-react';

function DashboardGrid() {
  return (
    <div className="grid grid-cols-12 gap-6 flex-1">
      {/* STATS DASHBOARD - Top Span 8 */}
      <div className="col-span-12 lg:col-span-8">
        <StatsDashboard />
      </div>

      {/* FOCUS TIMER - Right Span 4 (Takes 2 visual rows) */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:row-span-2">
        <FocusTimer />
      </div>

      {/* GANTT CHART - Bottom Left Span 8 */}
      <div className="col-span-12 lg:col-span-8">
        <SchedulesGantt />
      </div>

      {/* DRAGGABLE TASK QUEUE - Bottom Left Span 8 */}
      <div className="col-span-12 lg:col-span-8">
        <DraggableTaskQueue />
      </div>

      {/* EXAM LIST / RECALLS - Right Span 4 */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <UpcomingEvents />
      </div>
    </div>
  );
}

function MainLayout() {
  const { activeView, setActiveView, weeklyReportEnabled, setWeeklyReportEnabled, exams } = useStudy();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextActiveRecallString = useMemo(() => {
    if (!mounted) return 'Checking recall schedules...';
    if (exams.length === 0) return 'No exams scheduled';
    const sorted = [...exams].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Get closest upcoming
    const today = new Date().setHours(0,0,0,0);
    const upcoming = sorted.filter(e => new Date(e.date).getTime() >= today);
    const target = upcoming[0] || sorted[0];
    
    // Calculate days
    const diffMs = new Date(target.date).getTime() - today;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `Exam recall: ${target.title} passed`;
    if (days === 0) return `Exam recall: ${target.title} today!`;
    if (days === 1) return `Exam recall: ${target.title} tomorrow`;
    return `Exam Recall: ${target.title} in ${days} Days`;
  }, [exams, mounted]);

  const navItems = [
    { view: 'dashboard' as ViewType, label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { view: 'calendar' as ViewType, label: 'Calendar View', icon: <Calendar size={16} /> },
    { view: 'gantt' as ViewType, label: 'Project Gantt', icon: <TableProperties size={16} /> },
    { view: 'insights' as ViewType, label: 'Performance Insights', icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-400 font-bold text-xl tracking-tight select-none">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white text-base">Σ</div>
            STUDYFLOW
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition select-none cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dynamic Weekly Report trigger card */}
        <div className="p-6 border-t border-slate-800 shrink-0">
          <div className="p-4 bg-slate-800 rounded-lg text-xs">
            <p className="text-slate-400 mb-2 font-mono text-[9px] font-black tracking-widest uppercase">WEEKLY REPORT STATUS</p>
            <div className="flex items-center justify-between text-white font-sans">
              <span className="font-semibold text-slate-300">Next email in 2d</span>
              <button
                onClick={() => setWeeklyReportEnabled(!weeklyReportEnabled)}
                className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded leading-none transition-colors duration-150 ${
                  weeklyReportEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {weeklyReportEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN SCREEN AREA */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen">
        
        {/* HEADER BRANDING */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shrink-0">
          <h1 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tight">
            {activeView === 'dashboard' ? 'Midterm Prep: Fall Semester' : `${activeView.toUpperCase()} PANEL`}
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                {nextActiveRecallString}
              </span>
            </div>

            <div className="flex items-center gap-3 border-l pl-6 border-slate-200 select-none">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xs">
                JD
              </div>
              <span className="text-xs font-bold text-slate-600 hidden sm:inline">John Doe</span>
            </div>
          </div>
        </header>

        {/* VIEWPORT CONTROLLER */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* Main Interactive Screen Content */}
            <div className="col-span-12 lg:col-span-8 h-full">
              {activeView === 'dashboard' && <DashboardGrid />}
              {activeView === 'calendar' && <CalendarView />}
              {activeView === 'gantt' && <SchedulesGantt />}
              {activeView === 'insights' && <PerformanceInsights />}
            </div>

            {/* AI Assistant Coach Frame always beside the core container on large devices, adding magnificent workspace balance */}
            <div className="col-span-12 lg:col-span-4 self-stretch flex flex-col justify-stretch">
              <AIStudyCoach />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <StudyProvider>
      <MainLayout />
    </StudyProvider>
  );
}
