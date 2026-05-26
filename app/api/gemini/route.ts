import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

// Lazy initialize Gemini API client to avoid startup crash if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please add it to Settings.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const { message, previousMessages, taskList, examList, studyHours, focusScore } = await req.json();

    const client = getAiClient();

    // Setup an expert academic planner persona
    const systemPrompt = `You are a warm, highly encouraging, and super organized AI Academic Coach named StudyCoach, embedded inside the StudyFlow Study Planner.
Your job is to help the student organize their tasks, prepare for their exams, manage stress, and suggest concrete active recall or spaced repetition schedules based on their dashboard.

Current student stats:
- Completing Rate: ${taskList ? Math.round((taskList.filter(t => t.completed).length / Math.max(1, taskList.length)) * 100) : 'unknown'}%
- Study Hours This Week: ${studyHours ?? '34.5'} hours
- Focus Score: ${focusScore ?? '9.2'}/10

Active study items (priority tasks):
${taskList ? taskList.map((t, idx) => `- [${t.completed ? 'completed' : 'pending'}] ${t.title} (${t.subject})`).join('\n') : 'No tasks listed'}

Upcoming Exams & Events:
${examList ? examList.map(e => `- ${e.title} on ${e.date}: ${e.note}`).join('\n') : 'No exams configured'}

Please respond directly to the student's question in a supportive, highly scannable, and extremely practical way.
Use bold highlights, bullet points, and actionable study tips (e.g., Feynman Technique, active recall, or suggest a 25-minute Pomodoro block).
Stay focused and professional. Keep response lengths balanced, and write in the voice of a friendly, motivating, world-class personal study coach. No clinical jargon. Or typical AI preambles.`;

    const chatHistory = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      }
    ];

    // Push previous messages if any
    if (previousMessages && Array.isArray(previousMessages)) {
      previousMessages.forEach(msg => {
        chatHistory.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Push the latest user message
    chatHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      // Pass contents matching SDK schema
      contents: chatHistory,
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Something went wrong during coach generation' },
      { status: 500 }
    );
  }
}
