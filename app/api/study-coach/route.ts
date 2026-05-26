import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Standard initialization for Google GenAI with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, exams, schedule, stats, preferences } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing 'action' parameter" }, { status: 400 });
    }

    if (action === "generate-schedule") {
      // Prompt Gemini to translate exams & study preferences into a weekly study plan
      const prompt = `
        You are an elite academic tutor and study organizational expert. 
        I have the following upcoming exams:
        ${JSON.stringify(exams || [], null, 2)}
        
        And my study preferences/additional requirements are: "${preferences || "None"}"
        
        Generate a highly structured and realistic recommended study schedule for the upcoming days. 
        Return a list of study slots that I can immediately insert into my calendar.
        
        Return ONLY valid JSON that matches this structure:
        [
          {
            "subject": "Name of the course/subject",
            "date": "YYYY-MM-DD",
            "time": "HH:MM",
            "duration": 45, // RECOMMENDED DURATION IN MINUTES (e.g. 45, 60 or 90)
            "notes": "Specific subtopics and focused execution tips (e.g. Solve 2 past question papers, read chapter 4)",
            "priority": "High" | "Medium" | "Low"
          }
        ]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                date: { type: Type.STRING },
                time: { type: Type.STRING },
                duration: { type: Type.INTEGER },
                notes: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
              },
              required: ["subject", "date", "time", "duration", "notes", "priority"]
            }
          }
        }
      });

      const parsedData = JSON.parse(response.text || "[]");
      return NextResponse.json({ schedule: parsedData });

    } else if (action === "generate-report") {
      // Prompt Gemini to write a progress insights summary and construct a beautifully written weekly report email digest
      const prompt = `
        You are an elite academic study coach and cheerleader. I need a progress report and email draft.
        Here are my current progress statistics:
        - Total hours studied: ${stats?.totalHours || 0} hours
        - Completed sessions: ${stats?.sessionsCompleted || 0}
        - Studying breakdown by subject: ${JSON.stringify(stats?.categoryBreakdown || {}, null, 2)}
        
        My current study schedules are:
        ${JSON.stringify(schedule || [], null, 2)}

        My upcoming exams list:
        ${JSON.stringify(exams || [], null, 2)}

        Generate:
        1. "insights": An inspiring, specific analysis of my achievements, actionable advice, and motivation guidelines.
        2. "emailSubject": A highly professional, motivating subject line for an email progress report to myself.
        3. "emailBody": A beautifully formatted plain-text email message body matching my performance, study load, and showing urgent recalls if exams are within 3 days. Include specific, tailored tips.

        Return ONLY a JSON object that matches this structure:
        {
          "insights": "Detailed string of coach analysis and study advice",
          "emailSubject": "String subject line",
          "emailBody": "Complete draft of the email message"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insights: { type: Type.STRING },
              emailSubject: { type: Type.STRING },
              emailBody: { type: Type.STRING }
            },
            required: ["insights", "emailSubject", "emailBody"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      return NextResponse.json(parsedData);
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });

  } catch (error: any) {
    console.error("AI Study Coach Endpoint Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
