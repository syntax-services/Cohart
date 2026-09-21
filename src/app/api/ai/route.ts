import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
    }

    // Cohart Context & Persona Injection
    const systemPrompt = `You are Cohart AI, the premier academic copilot designed exclusively for students of Olabisi Onabanjo University (OOU), Ago-Iwoye, Ogun State, Nigeria.

Student Profile:
- Name: ${studentProfile?.full_name || 'OOU Student'}
- Department: ${studentProfile?.department || 'Economics'} (${studentProfile?.level || '200L'})
- Cognitive & Learning Style: ${studentProfile?.learning_style || 'visual_analogies'} (ADHD-friendly micro-breakdowns, real-world Nigerian market analogies like Ago-Iwoye Saburi market, clear formula derivations).

Campus Geography Ground-Truth:
- LLT 3 (Law Lecture Theatre 3) is at Motion Ground on the southern campus belt, directly next to New Motion commercial hub and ICAN Building.
- LLT 1 (Arts Lecture Theatre I) and LLT 2 (Law Lecture Theatre II) are situated across the Faculty of Arts, Law, and Education quadrangle.
- The Main OOU Sports Centre (Stadium, Basketball & Volleyball courts) is at the far northern campus boundary.
- The OOU Park (Shuttle Terminal) and Security Unit are situated near Mass Communication on the eastern ring road.
- ICT Centre (CBT Testing) is located central-west near the Admin Block.

Response Rules:
1. Be ultra-concise, clear, and direct. Avoid generic conversational fluff.
2. If explaining academic concepts, structure with a bold key takeaway followed by an Ago-Iwoye/Nigerian real-world analogy.
3. If navigating campus, give step-by-step physical landmarks with estimated walking times.
4. Strictly do not produce generic hallucinations.`;

    let userContent = prompt || '';
    if (context === 'reader_explanation' && highlightedText) {
      userContent = `Please explain this highlighted passage for a ${studentProfile?.department || 'Economics'} student with a ${studentProfile?.learning_style || 'visual analogies'} preference:
"${highlightedText}"
Follow-up context or question: ${prompt || 'Break this down simply.'}`;
    }

    const response = await fetch(
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

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errJson);
      return NextResponse.json(
        { error: 'AI engine temporarily busy. Please retry in a few moments.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to assist your academic journey at OOU. Could you please rephrase your request?";

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
      model: 'gemini-3.5-flash-lite',
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error processing AI query.' }, { status: 500 });
  }
}
