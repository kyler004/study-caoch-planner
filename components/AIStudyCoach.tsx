'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { Send, Sparkles, MessageSquare, Bot, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIStudyCoach() {
  const { tasks, exams, studyHours, focusScore } = useStudy();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your **StudyFlow AI Coach**. I've synchronized with your task queue and exams list. Ask me anything to design a customized recall schedule, resolve study blockages, or optimize your focus cycles!",
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Can act as collapsible panel

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText ? customText.trim() : inputMessage.trim();
    if (!textToSend || isGenerating) return;

    // Add user message to state
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          previousMessages: messages.map(m => ({ role: m.role, content: m.content })),
          taskList: tasks,
          examList: exams,
          studyHours,
          focusScore,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const answerMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || 'No response details. Let me know if you want to try again.',
      };

      setMessages((prev) => [...prev, answerMsg]);
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ **Unable to connect**: ${e?.message || 'Please make sure your GEMINI_API_KEY environment variable is configured in settings.'}`,
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const currentStatusString = isGenerating 
    ? 'StudyCoach is drafting suggestion...' 
    : 'StudyCoach synced & online';

  const suggestionChips = [
    'Analyze my task list',
    'Econ Quiz study guide',
    'Biology active recalls',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md flex flex-col h-full hover:shadow-lg transition duration-200">
      {/* HEADER SECTION */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-900 text-white flex justify-between items-center cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-[10px] font-black">AI</div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              StudyCoach Assistant <Sparkles size={11} className="text-yellow-400 fill-yellow-400" />
            </h4>
            <span className="text-[9px] text-slate-400 font-mono font-medium block">{currentStatusString}</span>
          </div>
        </div>
        
        <button className="text-slate-300 hover:text-white p-1">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* CHAT VIEW (Only expanded or full height depending on screen config) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? 'h-[350px] md:h-full' : 'h-[350px] md:h-full'}`}>
        {/* MESSAGES LOG */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[350px] md:max-h-[none]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="w-7 h-7 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center justify-center shrink-0 font-bold leading-none select-none">
                  SC
                </div>
              )}
              
              <div 
                className={`p-3 rounded-lg leading-relaxed max-w-[85%] whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {/* Basic pseudo markdown support (for bold formatting returned by Gemini) */}
                {msg.content.split('**').map((tok, idx) => {
                  if (idx % 2 === 1) { // is bold
                    return <strong key={idx} className="font-extrabold text-indigo-900 mix-blend-difference">{tok}</strong>;
                  }
                  return tok;
                })}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="w-7 h-7 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center justify-center shrink-0 animate-spin font-bold">
                ⌛
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 italic">
                Formulating personalized study layout recommendations...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion tags list */}
        <div className="px-4 py-1.5 flex gap-1.5 overflow-x-auto shrink-0 border-t border-slate-100 bg-slate-50/50">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              disabled={isGenerating || isGenerating}
              className="text-[9px] font-bold text-slate-600 font-sans hover:text-indigo-600 bg-white hover:bg-indigo-50 px-2 py-1 rounded border border-slate-200 transition shrink-0 select-none cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* CHAT INPUT FORM */}
        <div className="p-3 border-t border-slate-200 bg-white shrink-0 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isGenerating}
            placeholder="Ask about active recalls, exam timelines..."
            className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isGenerating || !inputMessage.trim()}
            className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-slate-900 text-white rounded-lg transition disabled:opacity-40"
            title="Send message"
          >
            <Send size={13} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
