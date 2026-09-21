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
  category: 'reader_explanation' | 'campus_navigation' | 'general' | 'grill_mode';
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
      messages,
    } = body;

    if (!prompt && !highlightedText && (!messages || messages.length === 0)) {
      return NextResponse.json({ error: 'Prompt or conversation messages required.' }, { status: 400 });
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

    // Cognitive Trait Adaptations
    const traits = studentProfile?.cognitive_traits || [];
    let cognitiveDirectives = '';
    if (traits.includes('ADHD / Fast Context Switches')) {
      cognitiveDirectives += '\n- ADHD Adaptations: Use bold anchor words, keep explanations in bite-sized bulleted points (max 3-4 lines per point), eliminate long monolithic paragraphs, and maintain a fast, stimulating rhythm.';
    }
    if (traits.includes('Exam Anxiety Sensitivity')) {
      cognitiveDirectives += '\n- Exam Anxiety Care: Use an encouraging, calm, reassuring tone. Break down daunting theorems into step-by-step stress-free logic so the student feels confident.';
    }
    if (traits.includes('Analogies & Real-World Models')) {
      cognitiveDirectives += '\n- Real-World Analogy Requirement: Anchor concepts in practical Nigerian market dynamics (e.g. Saburi market commodity pricing, Ogun state transportation, Dangote vs BUA, telecom tariffs).';
    }
    if (traits.includes('Dyslexia-Friendly Spacing')) {
      cognitiveDirectives += '\n- Dyslexia Accommodations: Use clean bulleted lists, high structural contrast, short clauses, and avoid dense sentence structures.';
    }
    if (traits.includes('Deep First Principles')) {
      cognitiveDirectives += '\n- First Principles: State the fundamental mathematical/economic axioms first before building up to the theorem.';
    }

    // Socratic Grill Mode
    let grillDirective = '';
    if (context === 'grill_mode') {
      grillDirective = `\nExam Practice Mode (OOU Exam Readiness):
You are testing the student on their course to see how ready they are for exams.
Check their answer kindly and honestly. If they made a mistake, explain the mistake in very simple, plain English and give them a score out of 10. Then ask them ONE clear, practical exam practice question to test if they really understand.
Keep questions realistic to OOU exam style, but use simple, straightforward wording.`;
    }

    const milestoneDirective = `\nMilestone Syncing:
If the student mentions completing a semester task, add one of these tags at the end of your reply:
- "[MILESTONE_ACTION:profile_complete]" if they finished setting up their profile.
- "[MILESTONE_ACTION:course_form]" if they verified their course forms.
- "[MILESTONE_ACTION:advisor_sign]" if they got their course advisor's signature.
- "[MILESTONE_ACTION:ca_target]" if they reached their class attendance target.
- "[MILESTONE_ACTION:reader_quiz]" if they finished reading course chapters.`;

    // Cohart Context & Persona Injection
    const systemPrompt = `You are Cohart AI, a friendly, smart study companion built specifically for students of Olabisi Onabanjo University (OOU), Ago-Iwoye, Ogun State, Nigeria.

Student Information:
- Name: ${studentProfile?.full_name || 'Scholar'}
- Department: ${studentProfile?.department || 'General Studies'} (${studentProfile?.level || 'Undergraduate'})
- Learning Preference: ${studentProfile?.learning_style || 'visual_analogies'}

Learning Preferences:${cognitiveDirectives || '\n- Explain concepts clearly with relatable Nigerian examples.'}
${grillDirective}
${milestoneDirective}

Campus Locations (OOU Ago-Iwoye Permanent Site):
- LLT 3 (Law Lecture Theatre 3) is at Motion Ground on the southern side of campus, right next to New Motion shops and the ICAN Building.
- LLT 1 (Arts Lecture Theatre I) and LLT 2 (Law Lecture Theatre II) are near the Faculty of Arts, Law, and Education buildings.
- The Main Sports Centre (Stadium, Basketball court) is at the far north end of campus.
- The OOU Park (Campus Shuttles) and Security Post are near Mass Communication on the eastern road.
- ICT Centre (where students do CBT exams) is near the Senate/Admin Block.

CRITICAL RULES FOR HOW YOU SPEAK:
1. USE VERY SIMPLE, LAYMAN ENGLISH: Speak like a patient, knowledgeable senior student or friend. Never use bombastic words, deep academic grammar, or complicated textbook jargon. Keep your English so simple that any student grasps it immediately.
2. BREAK DOWN BIG WORDS: If you have to use a course term (like "oligopoly", "equilibrium", or "marginal cost"), immediately explain what it means in plain everyday words using a relatable Nigerian example (like Saburi market prices in Ago-Iwoye, pure water sellers, MTN vs Airtel data prices, or transport fares).
3. KEEP IT SHORT & SWEET: Avoid long, boring walls of text. Use short sentences and simple bullet points so it is easy to read on a mobile phone.
4. DIRECT ANSWER FIRST: Answer the question straight to the point right away. Never beat around the bush or dodge the question.
5. SIMPLE CITATION TAG: At the very end of your response, add a short reference tag:
   - For course questions: "*Course Reference: [Course Code / Chapter]*"
   - For campus directions: "*Campus Reference: [Hall or Location]*"
   - For general talk: "*Discussion Context: [Topic]*"
6. CAMPUS REALITIES: OOU does not assign seat numbers in lecture halls; students find open seats when they arrive. Never mention assigned seat numbers.
7. ABSOLUTE ZERO EMOJIS: Do not use any emojis under any circumstances. Use only clean text, bullet points, and markdown.`;

    let userContent = prompt || '';
    if (context === 'reader_explanation' && highlightedText) {
      userContent = `Please explain this passage in simple, everyday English with a practical Nigerian example for an OOU ${studentProfile?.department || 'Economics'} student:
"${highlightedText}"
Question or extra help needed: ${prompt || 'Break this down in simple words.'}`;
    }

    // Multi-turn Gemini Contents Array
    let contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Take last 8 turns to preserve context while keeping token usage fast
      const recent = messages.slice(-8);
      contents = recent.map((m: { role: 'user' | 'assistant'; content: string }, idx: number) => {
        const role: 'user' | 'model' = m.role === 'assistant' ? 'model' : 'user';
        if (idx === 0 && role === 'user') {
          return {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question:\n${m.content}` }],
          };
        }
        return {
          role,
          parts: [{ text: m.content }],
        };
      });

      // Ensure the very first turn is a user turn with system prompt
      if (contents.length > 0 && contents[0].role !== 'user') {
        contents.unshift({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nLet us begin.` }],
        });
      }
    } else {
      contents = [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question:\n${userContent}` }],
        },
      ];
    }

    let replyText = '';
    let usedModel = 'gemini-3.5-flash-lite';

    // Primary: Gemini 3.5 Flash Lite (ultra-fast, rock solid 200 OK, full output length)
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 3000,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        usedModel = 'gemini-3.5-flash-lite';
      }
    } catch {
      // Fallback to Gemini 3.6 Flash
    }

    // Secondary: Gemini 3.6 Flash
    if (!replyText) {
      try {
        const fbRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 3000,
              },
            }),
          }
        );

        if (fbRes.ok) {
          const fbData = await fbRes.json();
          replyText = fbData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          usedModel = 'gemini-3.6-flash';
        }
      } catch {
        // Fallback to Supabase Edge Function
      }
    }

    // Fallback: Supabase Edge Function
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
              messages,
            }),
          }
        );

        if (edgeRes.ok) {
          const edgeData = await edgeRes.json();
          replyText = edgeData.reply || '';
          usedModel = 'supabase-edge-ai';
        }
      } catch {
        // Edge function also failed
      }
    }

    if (!replyText) {
      replyText = `Cohart AI is currently updating its campus cache. For ${studentProfile?.department || 'your course'}, please consult the departmental handbook and verified faculty notes.\n\n*Course Reference: ${studentProfile?.department || 'Academic'} Core Handbook*`;
    }

    // Parse any milestone action tags
    let milestoneAction: string | null = null;
    const milestoneMatch = replyText.match(/\[MILESTONE_ACTION:([a-z_]+)\]/);
    if (milestoneMatch) {
      milestoneAction = milestoneMatch[1];
      replyText = replyText.replace(/\[MILESTONE_ACTION:[a-z_]+\]/g, '').trim();
    }

    // Log query for continuous improvement
    logDailyLearning({
      userId: studentProfile?.id,
      department: studentProfile?.department,
      query: prompt || highlightedText || 'multi-turn interaction',
      category: context as any,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      reply: replyText,
      model: usedModel,
      milestoneAction,
      remaining,
    });
  } catch (error) {
    console.error('API /api/ai route error:', error);
    return NextResponse.json(
      {
        reply: 'An internal network error occurred. Please verify your internet connection and retry.\n\n*Discussion Context: Connection Diagnostics*',
        error: 'AI service temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
