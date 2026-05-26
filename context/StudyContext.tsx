'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from '../lib/firebase';

export interface Task {
  id: string;
  title: string;
  subject: string;
  completed: boolean;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  note: string;
}

export interface GanttItem {
  id: string;
  subject: string;
  topic: string;
  percent: number; // 0 to 100
  startDay: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  endDay: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
}

export type ViewType = 'dashboard' | 'calendar' | 'gantt' | 'insights';

interface StudyContextProps {
  // Navigation
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  // Focus Timer
  timerIsRunning: boolean;
  setTimerIsRunning: (val: boolean) => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  initialTime: number;
  setInitialTime: (time: number) => void;
  sessionTask: string;
  setSessionTask: (task: string) => void;
  studyHours: number;
  incrementStudyHours: (hours: number) => void;

  // Tasks
  tasks: Task[];
  addTask: (title: string, subject: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;

  // Exams / Upcoming events
  exams: Exam[];
  addExam: (title: string, date: string, note: string) => void;
  deleteExam: (id: string) => void;

  // Gantt items
  ganttItems: GanttItem[];
  addGanttItem: (item: Omit<GanttItem, 'id'>) => void;
  updateGanttItemProgress: (id: string, percent: number) => void;
  deleteGanttItem: (id: string) => void;

  // Core metrics
  completionRate: number;
  focusScore: number;
  weeklyReportEnabled: boolean;
  setWeeklyReportEnabled: (enabled: boolean) => void;

  // Authentication
  user: User | null;
  authToken: string | null;
  loadingAuth: boolean;
  login: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const StudyContext = createContext<StudyContextProps | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Focus Timer state - starting fresh
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60); // 25 mins initial
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  // Lazy initialize client side states from localStorage to avoid Mock data while preserving client interactions
  const [sessionTask, setSessionTask] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('studyflow_sessionTask') || 'Review Ch. 1 Notes';
    }
    return '';
  });

  const [studyHours, setStudyHours] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studyflow_studyHours');
      return saved ? parseFloat(saved) : 0.0;
    }
    return 0.0;
  });

  const [focusScore, setFocusScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studyflow_focusScore');
      return saved ? parseFloat(saved) : 0.0;
    }
    return 0.0;
  });

  // Tasks (priority queue) - initially empty
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studyflow_tasks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Exams - initially empty
  const [exams, setExams] = useState<Exam[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studyflow_exams');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Gantt Items - initially empty
  const [ganttItems, setGanttItems] = useState<GanttItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('studyflow_ganttItems');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(true);

  // Firebase auth sync
  useEffect(() => {
    setLoadingAuth(true);
    const unsubscribe = initAuth(
      (signedInUser, token) => {
        setUser(signedInUser);
        setAuthToken(token);
        setLoadingAuth(false);
      },
      () => {
        setUser(null);
        setAuthToken(null);
        setLoadingAuth(false);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save states to localStorage upon changes
  useEffect(() => {
    localStorage.setItem('studyflow_sessionTask', sessionTask);
  }, [sessionTask]);

  useEffect(() => {
    localStorage.setItem('studyflow_studyHours', studyHours.toString());
  }, [studyHours]);

  useEffect(() => {
    localStorage.setItem('studyflow_focusScore', focusScore.toString());
  }, [focusScore]);

  useEffect(() => {
    localStorage.setItem('studyflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('studyflow_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('studyflow_ganttItems', JSON.stringify(ganttItems));
  }, [ganttItems]);

  // Auth Operations
  const login = async () => {
    try {
      setLoadingAuth(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAuthToken(res.accessToken);
      }
    } catch (err) {
      console.error('Context Sign In error:', err);
      throw err;
    } finally {
      setLoadingAuth(false);
    }
  };

  const logoutUser = async () => {
    try {
      setLoadingAuth(true);
      await logout();
      setUser(null);
      setAuthToken(null);
    } catch (err) {
      console.error('Context Sign Out error:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  // Timer countdown implementation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerIsRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerIsRunning(false);
            setStudyHours((h) => {
              const updated = parseFloat((h + initialTime / 3600).toFixed(1));
              return updated;
            });
            setFocusScore((score) => {
              const updated = Math.min(10, parseFloat((score + 0.5).toFixed(1)));
              return updated;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerIsRunning, timeLeft, initialTime]);

  const incrementStudyHours = (hours: number) => {
    setStudyHours((prev) => parseFloat((prev + hours).toFixed(1)));
  };

  // Real, derived completion rate calculations without arbitrary values
  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedCount = tasks.filter((t) => t.completed).length;
    return Math.round((completedCount / tasks.length) * 100);
  }, [tasks]);

  const addTask = (title: string, subject: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      subject,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    // Reward/Adjust focus score slightly based on dynamic goal alignment
    setFocusScore((score) => Math.min(10, parseFloat((score + 0.1).toFixed(1))));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Reorder for priority list
  const reorderTasks = (startIndex: number, endIndex: number) => {
    if (startIndex < 0 || startIndex >= tasks.length || endIndex < 0 || endIndex >= tasks.length) return;
    const result = Array.from(tasks);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setTasks(result);
  };

  const addExam = (title: string, date: string, note: string) => {
    const newExam: Exam = {
      id: Date.now().toString(),
      title,
      date,
      note,
    };
    setExams((prev) => [...prev, newExam]);
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const addGanttItem = (item: Omit<GanttItem, 'id'>) => {
    const newItem: GanttItem = {
      ...item,
      id: Date.now().toString(),
    };
    setGanttItems((prev) => [...prev, newItem]);
  };

  const updateGanttItemProgress = (id: string, percent: number) => {
    setGanttItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, percent: Math.max(0, Math.min(100, percent)) } : item))
    );
  };

  const deleteGanttItem = (id: string) => {
    setGanttItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <StudyContext.Provider
      value={{
        activeView,
        setActiveView,
        timerIsRunning,
        setTimerIsRunning,
        timeLeft,
        setTimeLeft,
        initialTime,
        setInitialTime,
        sessionTask,
        setSessionTask,
        studyHours,
        incrementStudyHours,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        reorderTasks,
        exams,
        addExam,
        deleteExam,
        ganttItems,
        addGanttItem,
        updateGanttItemProgress,
        deleteGanttItem,
        completionRate,
        focusScore,
        weeklyReportEnabled,
        setWeeklyReportEnabled,
        user,
        authToken,
        loadingAuth,
        login,
        logoutUser,
      }}
    >
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

