'use client';

import React, { useState } from 'react';
import { StudyProvider, useStudy } from '@/context/StudyContext';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import StudySchedule from '@/components/StudySchedule';
import CountdownCalendar from '@/components/CountdownCalendar';
import FocusTimer from '@/components/FocusTimer';
import SchedulesGantt from '@/components/SchedulesGantt';
import AIStudyCoach from '@/components/AIStudyCoach';
import { 
  GraduationCap, 
  BarChart, 
  CalendarRange, 
  Clock, 
  Sliders, 
  Sparkles, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';

function DashboardContent() {
  const { user, handleLogin, handleLogout, isAuthenticating } = useStudy();
  
  // Custom navigation tabs
  type ActiveTab = 'performance' | 'schedule' | 'calendar' | 'timer' | 'gantt' | 'coach';
  const [activeTab, setActiveTab] = useState<ActiveTab>('performance');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tab configurations
  const tabConfig = [
    { id: 'performance', label: 'Performance Hub', icon: BarChart },
    { id: 'schedule', label: 'Study Timetables', icon: BookOpen },
    { id: 'calendar', label: 'Exam Countdown', icon: Calendar },
    { id: 'timer', label: 'Focus Clock', icon: Clock },
    { id: 'gantt', label: 'Task Gantt', icon: Layers },
    { id: 'coach', label: 'AI Study Mentor', icon: Sparkles }
  ] as const;

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#1c1b1a] antialiased flex flex-col justify-between" id="app-workspace-container">
      
      {/* 1. Header Bar Area */}
      <header className="border-b border-[#e9e6e0] bg-white sticky top-0 z-50 px-4 py-3 sm:px-6" id="app-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Title and Slogan */}
          <div className="flex items-center gap-2.5">
            <div className="bg-[#4f6356] text-white p-2 rounded-xl border border-[#3d5245]" id="header-logo-badge">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-sans font-bold tracking-tight text-[#1c1b1a]">Study Schedule Tracker</h1>
              <p className="text-[10px] text-[#8a857c] font-mono leading-none mt-0.5">Customized Academic Planner & Tutor</p>
            </div>
          </div>

          {/* Right Area: Session user details & Google Auth Button */}
          <div className="flex items-center gap-3">
            
            {isAuthenticating ? (
              <div className="w-20 h-8 bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3 bg-[#fbfaf7] border border-[#e9e6e0] rounded-xl px-3 py-1.5" id="user-session-card">
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Google study profile'} 
                    className="w-5 h-5 rounded-full border border-[#e9e6e0]"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="hidden sm:block text-left text-[11px] leading-tight select-none">
                  <p className="font-semibold text-[#1c1b1a] truncate max-w-[120px]">{user.displayName}</p>
                  <p className="text-[#8a857c] font-mono text-[9px] truncate max-w-[120px]">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-[#8a857c] hover:text-[#b8542c] p-1 rounded hover:bg-[#f1eeeb] transition-colors"
                  title="Logout session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Google Sign-In formatted as prescribed by Workspace Integration guidelines */
              <button 
                onClick={handleLogin}
                id="google-sign-in-launcher"
                className="gsi-material-button text-xs font-mono font-bold bg-white text-[#1c1b1a] border border-[#e9e6e0] px-3.5 py-1.5 rounded-lg hover:bg-[#fbfaf7] transition-all flex items-center gap-2"
              >
                <div className="gsi-material-button-icon w-4 h-4 flex items-center justify-center">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span>Connect With Google</span>
              </button>
            )}

            {/* Mobile Layout Menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-[#1c1b1a] p-1.5 border border-[#e9e6e0] bg-white rounded-lg hover:bg-[#fbfaf7] transition-all"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </header>

      {/* 2. Main Body Tabs Layout Split */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 relative" id="app-body">
        
        {/* Navigation Tabs - Desktop layout (Horizontal) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#f1eeeb] border border-[#e9e6e0] rounded-xl p-1 mb-6 max-w-3xl" id="desktop-navigation-tabs">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 text-xs font-mono font-semibold py-2 px-4 rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white border border-[#e9e6e0] text-[#1c1b1a] shadow-sm' 
                    : 'text-[#8a857c] hover:text-[#1c1b1a]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Navigation Tabs - Mobile slideout layout */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-4 left-4 right-4 bg-white border border-[#e9e6e0] rounded-xl p-4 shadow-lg z-40 space-y-2 animate-fade-in" id="mobile-navigation-tabs">
            <h4 className="text-[10px] font-mono font-bold text-[#8a857c] uppercase tracking-wider mb-2">Study Modules</h4>
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 text-xs font-mono font-semibold py-2.5 px-3 rounded-lg transition-all ${
                    activeTab === tab.id 
                      ? 'bg-[#fbfaf7] border border-[#e9e6e0] text-[#1c1b1a]' 
                      : 'text-[#8a857c] hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Panel Assemblies */}
        <div className="space-y-6" id="dashboard-tab-panel">
          {activeTab === 'performance' && <PerformanceDashboard />}
          {activeTab === 'schedule' && <StudySchedule />}
          {activeTab === 'calendar' && <CountdownCalendar />}
          {activeTab === 'timer' && <FocusTimer />}
          {activeTab === 'gantt' && <SchedulesGantt />}
          {activeTab === 'coach' && <AIStudyCoach />}
        </div>

      </main>

      {/* 4. Footer credits bar */}
      <footer className="border-t border-[#e9e6e0] bg-white text-center py-4 px-4 text-[11px] text-[#8a857c] font-mono" id="app-footer">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2.5">
          <p>© 2026 Study Schedule Tracker. Designed utilizing elegant negative space & warm editorial layout.</p>
          <div className="flex gap-4">
            <span className="text-emerald-700">● Local Storage Active</span>
            {user && <span className="text-blue-700">🌎 Live Workspace Synchronized</span>}
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function Home() {
  return (
    <StudyProvider>
      <DashboardContent />
    </StudyProvider>
  );
}
