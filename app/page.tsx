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
  const { 
    activeView, 
    setActiveView, 
    weeklyReportEnabled, 
    setWeeklyReportEnabled, 
    exams,
    user,
    loadingAuth,
    login,
    logoutUser
  } = useStudy();

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

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-905 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-mono mt-4 uppercase tracking-widest">Initialising Workspace...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row font-sans text-slate-100 overflow-hidden relative">
        {/* Abstract background glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Sidebar Info Panel */}
        <div className="w-full md:w-[45%] bg-slate-950/80 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3 text-indigo-400 font-bold text-xl tracking-tight select-none">
            <div className="w-9 h-9 bg-indigo-500 rounded flex items-center justify-center text-white text-lg">Σ</div>
            STUDYFLOW
          </div>

          <div className="my-12 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[10px] font-bold uppercase tracking-widest font-mono">
              <Sparkles size={11} className="text-yellow-400 fill-yellow-400 animate-pulse" /> SPACING & ACTIVE RECALLS
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-none uppercase">
              Unlock Your <span className="text-indigo-400 underline decoration-indigo-500 underline-offset-4">Academic Velocity</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed font-sans font-medium">
              A premium, offline-first study suite centering Pomodoro cycles, interactive task priority lists, customizable Gantt timetables, and automated Gmail report dispatch.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono tracking-wider">
            STUDYFLOW INC • © 2026 AUTHENTIC SYSTEM
          </div>
        </div>

        {/* Auth Interaction Form Panel */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 relative z-10 bg-slate-900/40">
          <div className="w-full max-w-md bg-slate-955 p-8 rounded-2xl border border-slate-800 gap-6 flex flex-col shadow-2xl">
            <div className="text-center space-y-1.5">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Enterprise Credentials Interface</h2>
              <p className="text-xs text-slate-400 font-medium">Link your Google Account securely in one-click for authenticated APIs</p>
            </div>

            {/* List of features unblocked by OAuth */}
            <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 space-y-3.5 text-xs text-slate-300">
              <div className="flex gap-3">
                <CheckSquare size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white uppercase tracking-tight">Unified State Center</h4>
                  <p className="text-[11px] text-slate-404 mt-0.5 font-medium">Synchronize prioritised tasks, active-recall exams lists, and timetables locally.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white uppercase tracking-tight">Direct Gmail Dispatch</h4>
                  <p className="text-[11px] text-slate-404 mt-0.5 font-medium">Securely send weekly performance breakdowns and coach recommendations to any address.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <BrainCircuit size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white uppercase tracking-tight">AI Academic Coach</h4>
                  <p className="text-[11px] text-slate-404 mt-0.5 font-medium">Generate custom cognitive intervals directly referencing live dashboard states via Gemini API.</p>
                </div>
              </div>
            </div>

            {/* Google OAuth Login Action */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={login}
                className="flex items-center justify-center gap-3 w-full py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl text-xs sm:text-sm transition duration-150 cursor-pointer shadow-lg select-none active:scale-[0.98] outline-none"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Authenticate with Google</span>
              </button>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 leading-normal justify-center max-w-sm mx-auto text-center font-medium">
                <AlertCircle size={12} className="text-slate-500 shrink-0 mt-0.5" />
                <p>Firebase authentication secures OAuth callback tokens. No personal profile data or mail is permanently recorded.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            <div className="flex items-center gap-4 border-l pl-6 border-slate-200 select-none">
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full border border-indigo-200" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xs">
                    {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-700 hidden sm:inline leading-tight">
                    {user?.displayName || 'Authorized User'}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:inline leading-none mt-0.5">
                    {user?.email}
                  </span>
                </div>
              </div>
              
              <button
                onClick={logoutUser}
                className="p-1 px-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded border border-slate-200 transition text-[10px] font-bold uppercase cursor-pointer shrink-0 select-none"
                title="Disconnect account"
              >
                Logout
              </button>
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
