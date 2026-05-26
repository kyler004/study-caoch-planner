'use client';

import React, { useState } from 'react';
import { useStudy, Task } from '../context/StudyContext';
import { Sparkles, Trash2, Plus, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DraggableTaskQueue() {
  const { tasks, addTask, toggleTask, deleteTask, reorderTasks } = useStudy();

  const [isAdding, setIsAdding] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskSubject, setTaskSubject] = useState('Math');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      addTask(taskName.trim(), taskSubject);
      setTaskName('');
      setIsAdding(false);
    }
  };

  const handleMoveLeft = (index: number) => {
    if (index > 0) {
      reorderTasks(index, index - 1);
    }
  };

  const handleMoveRight = (index: number) => {
    if (index < tasks.length - 1) {
      reorderTasks(index, index + 1);
    }
  };

  const getSubjectColor = (subj: string) => {
    const s = subj.toLowerCase();
    if (s.includes('math') || s.includes('calc')) return 'text-indigo-500 bg-indigo-50 border-indigo-100';
    if (s.includes('bio') || s.includes('lab')) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (s.includes('econ') || s.includes('market')) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-purple-500 bg-purple-50 border-purple-100';
  };

  return (
    <div id="reorder-task-queue-card" className="bg-white border border-slate-200 rounded-xl p-5 h-full hover:shadow-sm transition duration-200 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Drag & Reorder Priority
        </h3>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs text-indigo-500 font-bold hover:text-indigo-600 flex items-center gap-0.5"
        >
          {isAdding ? 'Close' : '+ Add Priority'}
        </button>
      </div>

      {isAdding ? (
        <form onSubmit={handleAddTask} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 animate-fadeIn mb-3 text-xs shrink-0">
          <input
            type="text"
            placeholder="Add new task..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-medium"
            required
            autoFocus
          />
          <select
            value={taskSubject}
            onChange={(e) => setTaskSubject(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none"
          >
            <option value="Math">Math</option>
            <option value="Bio">Bio</option>
            <option value="Econ">Econ</option>
            <option value="General">General</option>
          </select>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded text-[10px]"
          >
            ADD
          </button>
        </form>
      ) : null}

      {/* HORIZONTAL CARDS */}
      <div className="flex-1 flex gap-4 overflow-x-auto py-1 min-h-[70px]">
        {tasks.length === 0 ? (
          <div className="w-full text-center py-4 text-xs italic text-slate-400 flex items-center justify-center">
            No priorities listed. Add one to clear up work flow!
          </div>
        ) : (
          tasks.map((task, idx) => {
            const subjClasses = getSubjectColor(task.subject);

            return (
              <div 
                key={task.id} 
                className={`flex-1 min-w-[200px] p-3 bg-slate-50 border hover:border-indigo-200 hover:bg-indigo-50/10 rounded-lg flex items-center justify-between gap-3 group transition duration-150 relative ${
                  task.completed ? 'opacity-50 border-emerald-100 bg-emerald-50/15' : 'border-slate-200'
                }`}
              >
                {/* Left Side: Drag Handle simulation and check toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col select-none shrink-0 text-slate-300 font-mono text-xs cursor-grab" title="Priority rank">
                    <span>⋮</span>
                    <span>⋮</span>
                  </div>

                  {/* Complete checkbox trigger */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex shrink-0 items-center justify-center text-slate-300 hover:text-emerald-500 rounded bg-white border border-slate-300 hover:border-emerald-400 w-4 h-4 transition"
                    title={task.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={12} className="text-emerald-500" fill="currentColor" />
                    ) : null}
                  </button>

                  <div className="min-w-0 pr-4">
                    <p className={`text-xs font-bold leading-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    <span className={`inline-block text-[9px] font-bold uppercase px-1 rounded-sm mt-0.5 leading-none ${subjClasses}`}>
                      {task.subject}
                    </span>
                  </div>
                </div>

                {/* Right Side Arrow keys to sort priority + Delete control */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition duration-150">
                  <button
                    type="button"
                    onClick={() => handleMoveLeft(idx)}
                    disabled={idx === 0}
                    className="p-1 hover:bg-white rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move higher priority"
                  >
                    <ArrowLeft size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveRight(idx)}
                    disabled={idx === tasks.length - 1}
                    className="p-1 hover:bg-white rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move lower priority"
                  >
                    <ArrowRight size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-300 transition"
                    title="Delete task"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
