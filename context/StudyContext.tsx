'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { googleSignIn, logout, initAuth } from '@/lib/firebase';

export interface Exam {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  notes?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface StudySession {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  notes?: string;
  priority: 'High' | 'Medium' | 'Low';
  isCompleted: boolean;
}

export interface StudyLog {
  id: string;
  subject: string;
  duration: number; // minutes
  timestamp: string; // Date ISO
  notes?: string;
}

export interface GanttTask {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  progress: number; // 0 to 100
  subject: string;
}

interface StudyContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticating: boolean;
  needsAuth: boolean;
  setNeedsAuth: (val: boolean) => void;
  exams: Exam[];
  schedule: StudySession[];
  logs: StudyLog[];
  ganttTasks: GanttTask[];
  
  // Auth procedures
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  
  // Custom storage hooks
  addExam: (exam: Omit<Exam, 'id'>) => void;
  deleteExam: (id: string) => void;
  editExam: (id: string, exam: Partial<Exam>) => void;
  
  addScheduleSession: (session: Omit<StudySession, 'id' | 'isCompleted'>) => void;
  toggleScheduleSession: (id: string) => void;
  deleteScheduleSession: (id: string) => void;
  editScheduleSession: (id: string, update: Partial<StudySession>) => void;
  
  addStudyLog: (log: Omit<StudyLog, 'id' | 'timestamp'>) => void;
  deleteStudyLog: (id: string) => void;
  
  addGanttTask: (task: Omit<GanttTask, 'id'>) => void;
  deleteGanttTask: (id: string) => void;
  editGanttTask: (id: string, task: Partial<GanttTask>) => void;
}

// Utility functions hoisted to top to solve immutability rules
const getFutureDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const getPastDate = (days: number, timeStr: string): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const dateStr = d.toISOString().split('T')[0];
  return `${dateStr}T${timeStr}:00.000Z`;
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);

  // Lazy initialize state synchronous blocks: avoids cascade renderings warning
  const [exams, setExams] = useState<Exam[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('study_exams');
      if (local) return JSON.parse(local);
    }
    return [
      { id: '1', subject: 'Mathematics (Calculus II)', date: getFutureDate(7), time: '09:00', priority: 'High', notes: 'Integration, series, and differential equations' },
      { id: '2', subject: 'Computer Science (Algorithms)', date: getFutureDate(12), time: '14:00', priority: 'High', notes: 'Dynamic programming, graphs, and greedy algorithms' },
      { id: '3', subject: 'Physics (Electromagnetism)', date: getFutureDate(18), time: '11:00', priority: 'Medium', notes: 'Gauss\' law, capacitance, and RC circuits' }
    ];
  });

  const [schedule, setSchedule] = useState<StudySession[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('study_schedule');
      if (local) return JSON.parse(local);
    }
    return [
      { id: '1', subject: 'Mathematics (Calculus II)', date: getFutureDate(1), time: '10:00', duration: 45, priority: 'High', notes: 'Review partial fractions and trig substitution integration techniques.', isCompleted: false },
      { id: '2', subject: 'Computer Science (Algorithms)', date: getFutureDate(2), time: '15:30', duration: 60, priority: 'High', notes: 'Practice 3 medium LeetCode problems using Depth-First Search (DFS).', isCompleted: false },
      { id: '3', subject: 'Physics (Electromagnetism)', date: getFutureDate(3), time: '11:00', duration: 30, priority: 'Medium', notes: 'Solve exercise problems on dielectric capacitors.', isCompleted: false }
    ];
  });

  const [logs, setLogs] = useState<StudyLog[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('study_logs');
      if (local) return JSON.parse(local);
    }
    return [
      { id: 'l1', subject: 'Mathematics (Calculus II)', duration: 45, timestamp: getPastDate(2, "10:30") },
      { id: 'l2', subject: 'Computer Science (Algorithms)', duration: 60, timestamp: getPastDate(1, "16:00") },
      { id: 'l3', subject: 'Physics (Electromagnetism)', duration: 30, timestamp: getPastDate(3, "09:00") }
    ];
  });

  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('study_gantt');
      if (local) return JSON.parse(local);
    }
    return [
      { id: 'g1', name: 'Real Analysis Revision', startDate: getPastDate(1, "12:00").split('T')[0], endDate: getFutureDate(3), progress: 70, subject: 'Mathematics (Calculus II)' },
      { id: 'g2', name: 'Leitner System Flashcards', startDate: getFutureDate(1), endDate: getFutureDate(6), progress: 30, subject: 'Physics (Electromagnetism)' },
      { id: 'g3', name: 'Solve 2018-2023 Mock Papers', startDate: getFutureDate(2), endDate: getFutureDate(9), progress: 10, subject: 'Computer Science (Algorithms)' }
    ];
  });

  // Automatically persist on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('study_exams', JSON.stringify(exams));
    }
  }, [exams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('study_schedule', JSON.stringify(schedule));
    }
  }, [schedule]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('study_logs', JSON.stringify(logs));
    }
  }, [logs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('study_gantt', JSON.stringify(ganttTasks));
    }
  }, [ganttTasks]);

  // Initialize Auth on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setNeedsAuth(false);
        setIsAuthenticating(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsAuthenticating(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Auth Functions
  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login action failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Exam Hooks
  const addExam = (newExam: Omit<Exam, 'id'>) => {
    const item: Exam = { ...newExam, id: crypto.randomUUID() };
    setExams(prev => [...prev, item]);
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const editExam = (id: string, update: Partial<Exam>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...update } : e));
  };

  // Schedule Session Hooks
  const addScheduleSession = (newSession: Omit<StudySession, 'id' | 'isCompleted'>) => {
    const item: StudySession = { ...newSession, id: crypto.randomUUID(), isCompleted: false };
    setSchedule(prev => [...prev, item]);
  };

  const toggleScheduleSession = (id: string) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, isCompleted: !s.isCompleted } : s));
  };

  const deleteScheduleSession = (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const editScheduleSession = (id: string, update: Partial<StudySession>) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, ...update } : s));
  };

  // Study Log Hooks (Pomodoro completed logs)
  const addStudyLog = (newLog: Omit<StudyLog, 'id' | 'timestamp'>) => {
    const item: StudyLog = { 
      ...newLog, 
      id: crypto.randomUUID(), 
      timestamp: new Date().toISOString() 
    };
    setLogs(prev => [item, ...prev]);
  };

  const deleteStudyLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  // Gantt Chart Tasks Hooks
  const addGanttTask = (newTask: Omit<GanttTask, 'id'>) => {
    const item: GanttTask = { ...newTask, id: crypto.randomUUID() };
    setGanttTasks(prev => [...prev, item]);
  };

  const deleteGanttTask = (id: string) => {
    setGanttTasks(prev => prev.filter(t => t.id !== id));
  };

  const editGanttTask = (id: string, update: Partial<GanttTask>) => {
    setGanttTasks(prev => prev.map(t => t.id === id ? { ...t, ...update } : t));
  };

  return (
    <StudyContext.Provider value={{
      user,
      accessToken,
      isAuthenticating,
      needsAuth,
      setNeedsAuth,
      exams,
      schedule,
      logs,
      ganttTasks,
      handleLogin,
      handleLogout,
      addExam,
      deleteExam,
      editExam,
      addScheduleSession,
      toggleScheduleSession,
      deleteScheduleSession,
      editScheduleSession,
      addStudyLog,
      deleteStudyLog,
      addGanttTask,
      deleteGanttTask,
      editGanttTask
    }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
