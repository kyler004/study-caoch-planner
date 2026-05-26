'use client';

import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { Mail, GraduationCap, AreaChart, Smile, Send, CheckCircle, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import { googleSignIn, logout, initAuth } from '../lib/firebase';
import { User } from 'firebase/auth';

export default function PerformanceInsights() {
  const { studyHours, completionRate, focusScore } = useStudy();
  const [reportEmail, setReportEmail] = useState('rayann.kenne@facsciences-uy1.cm');
  const [wasSent, setWasSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OAuth Authentication States
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Unsubscribe listener for Firebase auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (signedInUser, accessToken) => {
        setUser(signedInUser);
        setAuthToken(accessToken);
        if (signedInUser.email) {
          setReportEmail(signedInUser.email);
        }
      },
      () => {
        setUser(null);
        setAuthToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await googleSignIn();
      if (response) {
        setUser(response.user);
        setAuthToken(response.accessToken);
        if (response.user.email) {
          setReportEmail(response.user.email);
        }
      }
    } catch (err: any) {
      console.error('Firebase Auth Login Failed:', err);
      setErrorMsg('Login interrupted or failed. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    if (window.confirm('Are you sure you want to disconnect your Google Account?')) {
      try {
        await logout();
        setUser(null);
        setAuthToken(null);
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }
  };

  const subjectBreakdown = [
    { name: 'Calculus II', hours: 14.5, color: 'bg-indigo-500', barWidth: '72%' },
    { name: 'Biology 101', hours: 9.0, color: 'bg-sky-400', barWidth: '45%' },
    { name: 'Macro-Econ', hours: 7.5, color: 'bg-amber-400', barWidth: '38%' },
    { name: 'History 404', hours: 3.5, color: 'bg-purple-400', barWidth: '18%' },
  ];

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setWasSent(false);

    if (authToken) {
      // 100% Real API integration using Gmail Send endpoint when user is authenticated with Google OAuth!
      try {
        const subject = `Your Dynamic StudyFlow Weekly Performance Report (${new Date().toLocaleDateString()})`;
        const htmlBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.025em;">StudyFlow Analytics</h2>
              <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Personalized weekly Spaced-Repetition metrics and performance breakdowns</p>
            </div>
            
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">Hello <strong>${user?.displayName || 'Learner'}</strong>,</p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">Here is a comprehensive overview of your current active-recall cycles and cognitive achievements in StudyFlow:</p>
            
            <div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 14px;">Total Study Hours Locked</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #1e293b; font-size: 14px;">${studyHours} hours</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 14px;">Cognitive Velocity</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #10b981; font-size: 14px;">↑ 8.4% faster</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 14px;">Priority Task Completion</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #6366f1; font-size: 14px;">${completionRate}%</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #475569; font-size: 14px;">Focus Score Velocity</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #eab308; font-size: 14px;">${focusScore} / 10.0</td>
                </tr>
              </table>
            </div>

            <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Weekly Subject Load Breakdown</h3>
            <div style="font-size: 14px; color: #334155; line-height: 1.5; margin-bottom: 24px;">
              <ul style="padding-left: 20px; margin: 0 0 16px 0;">
                <li><strong>Calculus II:</strong> 14.5 hours (72%)</li>
                <li><strong>Biology 101:</strong> 9.0 hours (45%)</li>
                <li><strong>Macro-Econ:</strong> 7.5 hours (38%)</li>
                <li><strong>History 404:</strong> 3.5 hours (18%)</li>
              </ul>
            </div>

            <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; padding: 18px; border-radius: 8px; margin: 24px 0;">
              <strong style="color: #6d28d9; font-size: 14px; text-transform: uppercase;">StudyCoach Expert Recommendation</strong>
              <p style="margin: 6px 0 0 0; color: #5b21b6; font-size: 14px; line-height: 1.6;">
                Your recall rating is superb in Macroeconomics but slightly lagging in Biology 101. We suggest scheduling a 25-minute Pomodoro session focused primarily on Biology Cell Structures before midnight tomorrow to maintain your target cognitive retention standard.
              </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">This email was dispatched securely from your Google OAuth email address via Google Workspace APIs.</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0;">StudyFlow Inc. © 2026</p>
            </div>
          </div>
        `;

        // Helper to construct RFC 2822 email format
        const emailContent = [
          `To: ${reportEmail}`,
          `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
          'Content-Type: text/html; charset="utf-8"',
          'MIME-Version: 1.0',
          '',
          htmlBody
        ].join('\r\n');

        const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            raw: encodedEmail
          })
        });

        if (!sendRes.ok) {
          const detailStr = await sendRes.text();
          throw new Error(`Gmail API returned code ${sendRes.status}: ${detailStr}`);
        }

        setWasSent(true);
        setTimeout(() => setWasSent(false), 5000);
      } catch (err: any) {
        console.error('Failed to dispatch using Gmail API:', err);
        setErrorMsg('Gmail dispatch failed. Verify that proper Gmail credentials and scopes were accepted.');
      } finally {
        setLoading(false);
      }
    } else {
      // Offline / Local Mock dispatch fallback
      setTimeout(() => {
        setLoading(false);
        setWasSent(true);
        setTimeout(() => setWasSent(false), 4000);
      }, 1200);
    }
  };

  return (
    <div id="performance-insights-container" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-full animate-fadeIn">
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
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive a detailed compilation of your subject milestones, focus retention scores, and suggested spaced-repetition schedules directly in your inbox.
            </p>

            {/* OAUTH CONNECTIVITY CARD */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs space-y-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Authentication State</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                  user ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {user ? 'AUTHENTICATED' : 'LOCAL DEFAULT'}
                </span>
              </div>

              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Google avatar" className="w-7 h-7 rounded-full border border-slate-100" />
                    ) : (
                      <div className="w-7 h-7 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-[11px]">
                        {user.displayName?.charAt(0) || 'G'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 truncate text-[11px] leading-tight">{user.displayName || 'Authorized User'}</p>
                      <p className="text-slate-400 text-[10px] truncate leading-none">{user.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogout}
                    className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition tracking-tighter"
                  >
                    <LogOut size={11} /> Disconnect Gmail
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Sign in with Google below to securely link your verified Gmail address and dispatch reports directly via the Google API.
                  </p>
                  
                  {/* Styled Material Google Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2.5 w-full py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition duration-150 cursor-pointer shadow-sm select-none"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-3.5 h-3.5 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-2 bg-red-50 text-red-600 text-[10px] rounded border border-red-100 flex items-start gap-1">
                <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

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
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-900 hover:bg-slate-800 text-white rounded font-bold uppercase text-[10px] tracking-wider transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>DISPATCHING...</span>
                ) : wasSent ? (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> {authToken ? 'SENT VIA GMAIL!' : 'MOCKED DISPATCH!'}</span>
                ) : (
                  <>
                    <Send size={11} /> {authToken ? 'DISPATCH WITH REAL GMAIL' : 'DISPATCH MOCK REPORT'}
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
