'use client';

import React, { useState } from 'react';
import { useStudy } from '@/context/StudyContext';
import { Sparkles, Mail, Send, CheckCircle, ShieldAlert, BookOpen, Brain, Loader } from 'lucide-react';

export default function AIStudyCoach() {
  const { exams, schedule, logs, addScheduleSession, user, accessToken, setNeedsAuth } = useStudy();

  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState('');
  
  // AI Results
  const [insights, setInsights] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState<string | null>(null);
  const [emailBody, setEmailBody] = useState<string | null>(null);
  const [scheduledSlotsCreated, setScheduledSlotsCreated] = useState<number>(0);

  // Email status feedback
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Helper calculating statistics
  const calculatedStats = () => {
    const totalMinutes = logs.reduce((sum, item) => sum + item.duration, 0);
    // Subject breakdown
    const categoryBreakdown: Record<string, number> = {};
    logs.forEach(log => {
      categoryBreakdown[log.subject] = (categoryBreakdown[log.subject] || 0) + log.duration;
    });

    return {
      totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
      sessionsCompleted: logs.length,
      categoryBreakdown
    };
  };

  // Action 1: Generate AI Study Timetable
  const handleGenerateAISchedule = async () => {
    if (exams.length === 0) {
      alert("Please list a few upcoming exams first so the AI Coach understands your academic load!");
      return;
    }

    setIsLoading(true);
    setScheduledSlotsCreated(0);
    try {
      const response = await fetch('/api/study-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-schedule',
          exams,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error(`AI Request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedSlots = data.schedule || [];

      if (generatedSlots.length > 0) {
        // Append these slots directly into the customizable study schedule!
        generatedSlots.forEach((slot: any) => {
          addScheduleSession({
            subject: slot.subject,
            date: slot.date,
            time: slot.time || '10:00',
            duration: slot.duration || 45,
            notes: slot.notes || 'Drafted by AI Coach',
            priority: slot.priority || 'Medium'
          });
        });
        setScheduledSlotsCreated(generatedSlots.length);
        alert(`🎉 AI Study Coach successfully planned ${generatedSlots.length} study sessions custom-tailored for your upcoming exams. Check them out under the active timetable!`);
      } else {
        alert("The AI Coach couldn't optimize a schedule slot. Try refining your preferences.");
      }

    } catch (error: any) {
      console.error("AI Schedule Error:", error);
      alert(error?.message || "An error occurred while generating study schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  // Action 2: Generate Progress Coach Review & Email Draft
  const handleGenerateCoachReview = async () => {
    setIsLoading(true);
    setEmailSentSuccess(false);
    try {
      const response = await fetch('/api/study-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-report',
          exams,
          schedule,
          stats: calculatedStats()
        })
      });

      if (!response.ok) {
        throw new Error(`AI Request failed: ${response.statusText}`);
      }

      const data = await response.json();
      setInsights(data.insights || '');
      setEmailSubject(data.emailSubject || 'Academic Progress Weekly Review Digest');
      setEmailBody(data.emailBody || '');

    } catch (error: any) {
      console.error("AI Coach Review Error:", error);
      alert(error?.message || "An error occurred while synthesizing your progress summary.");
    } finally {
      setIsLoading(false);
    }
  };

  // Action 3: Physically Deliver drafted email via Client-side Gmail API
  const handleSendGmailReport = async () => {
    if (!emailSubject || !emailBody) return;

    if (!user || !accessToken) {
      setNeedsAuth(true);
      return;
    }

    // Explicit confirmation dialouge required before sending emails on behalf of user (Workspace Skill mandate)
    const receiverEmail = user.email || 'rayann.kenne@facsciences-uy1.cm';
    const confirmed = window.confirm(
      `Deliver this progress report email message directly to your study inbox (${receiverEmail})?`
    );
    if (!confirmed) return;

    setIsSendingEmail(true);
    setEmailSentSuccess(false);

    try {
      // Compose base64 encoded raw RFC 2822 email message
      // Note: Use btoa(unescape(encodeURIComponent(str))) to reliably handle UTF-8/Special characters in student names & syllabus
      const emailContent = [
        `From: "Study Scheduler Tracker" <${receiverEmail}>`,
        `To: ${receiverEmail}`,
        `Subject: ${emailSubject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        emailBody
      ].join('\n');

      const rawBase64 = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: rawBase64
        })
      });

      if (response.status === 401) {
        setNeedsAuth(true);
        throw new Error("Gmail session expired. Please sign in again.");
      }

      if (!response.ok) {
        const errDetail = await response.json();
        throw new Error(`Gmail Send Failed: ${errDetail?.error?.message || response.statusText}`);
      }

      setEmailSentSuccess(true);
      alert(`📬 Report successfully delivered! Check your email inbox at ${receiverEmail}.`);
    } catch (error: any) {
      console.error("Gmail Delivery Error:", error);
      alert(error.message || "An error occurred during Gmail report dispatch.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="bg-white border border-[#e9e6e0] rounded-xl p-6" id="ai-study-coach-root">
      
      {/* Intro info bar */}
      <div className="flex items-start gap-3.5 mb-5 border-b border-[#f1eeeb] pb-4">
        <div className="p-2.5 bg-[#fbfaf7] border border-[#e9e6e0] rounded-xl text-[#3b4a5a]">
          <Brain className="w-5 h-5 text-[#3d5245]" />
        </div>
        <div>
          <h4 className="text-sm font-sans font-semibold text-[#1c1b1a]">AI Academic Tutor & Advisor</h4>
          <p className="text-xs text-[#8a857c]">Generate personalized, study timetables and send detailed summaries to your inbox</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="coach-operations-split">
        
        {/* Left Side: Generative Inputs */}
        <div className="lg:col-span-5 space-y-4" id="ai-controls-left">
          
          {/* Section 1: Scheduler inputs */}
          <div className="space-y-3 p-4 bg-[#fbfaf7] border border-[#e9e6e0] rounded-xl">
            <h5 className="text-xs font-mono font-bold text-[#1c1b1a] uppercase">1. Auto-Plan Study Schedule</h5>
            <p className="text-[11px] text-[#8a857c]">The AI Assistant analyzes your upcoming exams load to compile optimized daily intervals.</p>
            
            <div>
              <label className="block text-[9px] font-mono text-[#8a857c] uppercase mb-1">Study preferences (Optional)</label>
              <textarea
                placeholder="e.g. Include breaks every 30m, ignore morning slots, prioritize mathematics algorithms exam."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                rows={3}
                className="w-full text-xs bg-white border border-[#e9e6e0] rounded-lg p-2 text-[#1c1b1a] focus:outline-none focus:border-[#3d5245] resize-none"
              />
            </div>

            <button
              onClick={handleGenerateAISchedule}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-mono font-semibold bg-[#3d5245] hover:bg-[#2b3c31] text-white py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Syllabus...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Synthesize Schedule
                </>
              )}
            </button>

            {scheduledSlotsCreated > 0 && (
              <div className="text-[10px] text-[#3d5245] font-mono bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-100 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Successfully appended {scheduledSlotsCreated} scheduled slots!
              </div>
            )}
          </div>

          {/* Section 2: Progress report triggers */}
          <div className="space-y-3 p-4 bg-[#fbfaf7] border border-[#e9e6e0] rounded-xl flex flex-col justify-between">
            <div>
              <h5 className="text-xs font-mono font-bold text-[#1c1b1a] uppercase">2. Weekly performance reports</h5>
              <p className="text-[11px] text-[#8a857c]">Compare schedules, track logs, calculate streaks, and generate email drafts.</p>
            </div>

            <button
              onClick={handleGenerateCoachReview}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-mono font-semibold bg-[#1c1b1a] hover:bg-opacity-90 text-white py-2 rounded-lg transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  Compiling Data...
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-gray-300" />
                  Review Academic Report
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Generated Performance summaries and Email drafts */}
        <div className="lg:col-span-7 flex flex-col justify-between" id="ai-outputs-right">
          
          {!insights && !emailBody ? (
            <div className="flex-1 border border-dashed border-[#e9e6e0] rounded-xl flex flex-col items-center justify-center text-center p-8 bg-stone-50 text-xs text-[#8a857c]">
              <Sparkles className="w-8 h-8 text-amber-500 mb-2 opacity-65" />
              <p className="font-semibold">Your Workspace is ready.</p>
              <p className="max-w-[280px] mt-1 text-[11px]">Generate schedules or compile performance reviews above to see structured tips & email message drafts here.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              
              {/* Dynamic coach insights block */}
              {insights && (
                <div className="bg-[#fbfaf7] border border-[#e9e6e0] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1b1a]">
                    <BookOpen className="w-4 h-4 text-[#3d5245]" />
                    <span>AI Tutor Progress Review</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#5a564d] whitespace-pre-wrap">{insights}</p>
                </div>
              )}

              {/* Drafted Email block */}
              {emailBody && (
                <div className="border border-[#e9e6e0] rounded-xl p-4 bg-white flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-[#f1eeeb] pb-2 mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1c1b1a]">
                      <Mail className="w-4 h-4 text-amber-600" />
                      <span>Report Email Draft Message</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#fbfaf7] border border-[#e9e6e0] rounded text-[#8a857c]">Editable Draft</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Subject field */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-[#8a857c] select-none">Subject:</span>
                      <input 
                        type="text" 
                        value={emailSubject || ''} 
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="flex-1 font-semibold text-[#1c1b1a] border-b border-transparent focus:border-[#3d5245] focus:outline-none"
                      />
                    </div>
                    {/* Body text area */}
                    <textarea 
                      value={emailBody || ''} 
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={6}
                      className="w-full text-xs font-mono text-[#5a564d] p-2 bg-[#fbfaf7] border border-[#e9e6e0] rounded-lg focus:outline-none focus:border-[#3d5245] resize-y"
                    />
                  </div>

                  {/* Gmail Integration Actions Panel */}
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-3 pt-3 border-t border-[#f1eeeb] gap-3">
                    
                    {user ? (
                      <div className="text-[10px] font-mono text-[#4f6356] flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        Connected as {user.email}
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-[#b8542c] flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        Gmail verification required
                      </div>
                    )}

                    <button
                      onClick={handleSendGmailReport}
                      disabled={isSendingEmail || !user}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-mono font-bold bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                          Sending...
                        </>
                      ) : emailSentSuccess ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-green-300" />
                          Email Delivered!
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-amber-200" />
                          Email to my Inbox
                        </>
                      )}
                    </button>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
