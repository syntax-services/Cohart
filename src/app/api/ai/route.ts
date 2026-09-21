import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

// Daily in-memory rate limiter per IP / User: 30 requests per day
const requestCounts = new Map<string, { count: number; date: string }>();
const MAX_DAILY_REQUESTS = 30;

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().split('T')[0];
  const record = requestCounts.get(identifier);

  if (!record || record.date !== today) {
    requestCounts.set(identifier, { count: 1, date: today });
    return { allowed: true, remaining: MAX_DAILY_REQUESTS - 1 };
  }

  if (record.count >= MAX_DAILY_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_DAILY_REQUESTS - record.count };
}

// Log anonymized query learning for daily review
function logDailyLearning(entry: {
  userId?: string;
  department?: string;
  query: string;
  category: 'reader_explanation' | 'campus_navigation' | 'general';
  timestamp: string;
}) {
  try {
    const dir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const today = new Date().toISOString().split('T')[0];
    const filePath = path.join(dir, `ai_learnings_${today}.jsonl`);
    fs.appendFileSync(filePath, JSON.stringify(entry) + '\n', 'utf8');
  } catch (e) {
    console.warn('Could not write daily learning log:', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      context = 'campus_navigation',
      studentProfile,
      highlightedText,
    } = body;

    if (!prompt && !highlightedText) {
      return NextResponse.json({ error: 'Prompt or highlighted text is required.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const identifier = studentProfile?.id || ip.split(',')[0].trim();

    // Enforce Rate Limiting (30 requests/day/student)
    const { allowed, remaining } = checkRateLimit(identifier);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Daily AI quota reached (${MAX_DAILY_REQUESTS} prompts/day). Please try again tomorrow.`,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // API key resolution: env var -> Supabase app_config table -> Supabase Edge Function
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      try {
        const { data: configData } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'GEMINI_API_KEY')
          .single();
        if (configData?.value) {
          apiKey = configData.value;
        }
      } catch {
        // Fallback to Supabase Edge Function
      }
    }

    // Cohart Context & Persona Injection
    const systemPrompt = `You are Cohart AI, the premier academic copilot designed exclusively for students of Olabisi Onabanjo University (OOU), Ago-Iwoye, Ogun State, Nigeria.

Student Profile:
- Name: ${studentProfile?.full_name || 'Scholar'}
- Department: ${studentProfile?.department || 'General Studies'} (${studentProfile?.level || 'Undergraduate'})
- Cognitive & Learning Style: ${studentProfile?.learning_style || 'visual_analogies'} (ADHD-friendly micro-breakdowns, real-world Nigerian market analogies like Ago-Iwoye Saburi market, clear formula derivations).

Campus Geography Ground-Truth:
- LLT 3 (Law Lecture Theatre 3) is at Motion Ground on the southern campus belt, directly next to New Motion commercial hub and ICAN Building.
- LLT 1 (Arts Lecture Theatre I) and LLT 2 (Law Lecture Theatre II) are situated across the Faculty of Arts, Law, and Education quadrangle.
- The Main OOU Sports Centre (Stadium, Basketball & Volleyball courts) is at the far northern campus boundary.
- The OOU Park (Shuttle Terminal) and Security Unit are situated near Mass Communication on the eastern ring road.
- ICT Centre (CBT Testing) is located central-west near the Admin Block.

Mandatory Response Directives:
1. Direct Answer First: ALWAYS answer the user's question directly, clearly, and comprehensively in simple, accessible language. Never brush off or dodge any question.
2. Contextual Book / Location Citation: At the conclusion of EVERY response, ALWAYS provide an explicit citation or reference tag:
   - For academic queries: "📖 *Course Reference: [Course Code / Chapter / Core Theorem]*"
   - For campus/navigation queries: "📍 *Campus Reference: [Hall / Quad / Campus Axis]*"
   - For conversational queries: "💬 *Discussion Context: [Topic / Study Unit]*"
3. Plain Academic Explanations: Use clear, relatable Nigerian analogies (e.g., Ago-Iwoye market vendors, telecom data tariffs, local transport logistics) so that any student grasps the concept instantly.
4. Campus Accuracy: OOU does NOT assign seat numbers to students; lecture halls are open seating based on lecture arrival and departmental signing. Never mention assigned seat numbers.
5. Zero Hallucinations: Be faithful to real academic principles and actual OOU campus locations.`;

    let userContent = prompt || '';
    if (context === 'reader_explanation' && highlightedText) {
      userContent = `Please explain this highlighted passage for a ${studentProfile?.department || 'Economics'} student with a ${studentProfile?.learning_style || 'visual analogies'} preference:
"${highlightedText}"
Follow-up context or question: ${prompt || 'Break this down simply.'}`;
    }

    let replyText = '';
    let usedModel = 'gemini-3.6-flash';

    // Try primary Gemini 3.6 Flash
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUser Question:\n${userContent}` }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 400,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch {
      // Primary model fetch failed, try fallback
    }

    // Fallback: Gemini 3.5 Flash Lite or Supabase Edge Function
    if (!replyText) {
      try {
        const fbRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUser Question:\n${userContent}` }],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 350,
              },
            }),
          }
        );
        if (fbRes.ok) {
          const data = await fbRes.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          usedModel = 'gemini-3.5-flash-lite';
        }
      } catch {
        // Fallback to Supabase Edge Function
      }
    }

    // Last line of defense: Live Supabase Edge Function
    if (!replyText) {
      try {
        const edgeRes = await fetch(
          'https://fnqnxdmdyevzavsbfelv.supabase.co/functions/v1/ai',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucW54ZG1keWV2emF2c2JmZWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTI3NDUsImV4cCI6MjEwNTQ4ODc0NX0.BdJAhqwdSiPbGHCb5d3KbwNHalTlbO1jaqWTgXvVz6A',
            },
            body: JSON.stringify({
              prompt: userContent,
              context,
              studentProfile,
              highlightedText,
            }),
          }
        );
        if (edgeRes.ok) {
          const data = await edgeRes.json();
          replyText = data.reply || '';
          usedModel = 'supabase-edge-ai';
        }
      } catch {
        // Continue
      }
    }

    if (!replyText) {
      replyText = "I'm here to assist your academic journey at OOU. Could you please rephrase your request?";
    }

    // Asynchronously log for daily learning digest
    logDailyLearning({
      userId: studentProfile?.id,
      department: studentProfile?.department,
      query: userContent.slice(0, 200),
      category: context,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      reply: replyText,
      remaining,
      model: usedModel,
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error processing AI query.' }, { status: 500 });
  }
}
