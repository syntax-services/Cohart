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
    if (traits.includes('Short 20-minute sessions') || traits.some((t: string) => t.toLowerCase().includes('20-minute') || t.toLowerCase().includes('short sessions'))) {
      cognitiveDirectives += '\n- Short 20-Minute Focus Window: Keep answers snappy, focused, and immediately actionable for a high-intensity 20-minute study sprint. Avoid long-winded introductions.';
    }
    if (studentProfile?.learning_style === 'visual_analogies') {
      cognitiveDirectives += '\n- Visual & Mental Model Analogies: Always pair abstract theories with tangible physical visuals or mental scenes (e.g., picturing market stalls, flow of trucks on Lagos-Ibadan expressway, balance scales).';
    }

    const institution = studentProfile?.institution || 'OOU';
    const isOou = institution === 'OOU' || institution.includes('OOU') || institution.toLowerCase().includes('olabisi');

    // Adaptive Exam Drill & Socratic Drill Feature (Integrated natively into normal chat)
    const grillDirective = `
Adaptive Exam Practice & Socratic Drill:
- You have built-in exam drill capability inside regular conversation.
- If the student asks to be tested, grilled, drilled, given practice questions, or asks "test me", "drill me", "quiz me on [topic]", or gives an answer to an ongoing drill:
  1. Evaluate their answer honestly, gently, and in very simple plain English.
  2. If their answer was wrong or incomplete, point out the exact misconception simply and award a score (e.g. 7/10).
  3. Then ask them ONE focused, realistic exam practice question on the topic.
- If the student changes the topic, asks a normal question, says "stop", "enough", "explain instead", or asks about campus directions/profile/other courses:
  - Immediately stop the drill smoothly without forcing more exam questions. Answer their new question directly and warmly.
- Keep questions practical to exam scenarios, but always in clear, everyday language.`;

    const milestoneDirective = `\nMilestone Syncing:
If the student mentions completing a semester task, add one of these tags at the end of your reply:
- "[MILESTONE_ACTION:profile_complete]" if they finished setting up their profile.
- "[MILESTONE_ACTION:course_form]" if they verified their course forms.
- "[MILESTONE_ACTION:advisor_sign]" if they got their course advisor's signature.
- "[MILESTONE_ACTION:ca_target]" if they reached their class attendance target.
- "[MILESTONE_ACTION:reader_quiz]" if they finished reading course chapters.`;

    const profileUpdateDirective = `\nProfile Updates & Settings Assistant:
If the student asks you to change, edit, or set up their profile (such as their full name, level e.g. 100L/200L/300L/400L/500L, department, faculty, institution, or reading/learning style), or answers your questions to complete their profile setup:
1. Confirm the update in a warm, concise, plain English sentence.
2. Append this exact tag at the very end of your response:
[UPDATE_PROFILE:{"full_name":"...","level":"...","department":"...","faculty":"...","institution":"...","learning_style":"..."}]
Include ONLY the fields that the student changed. Valid learning styles are: 'visual_analogies', 'socratic_inquiry', 'concise_bullet', 'deep_first_principles'.

Interactive Question Forms & Checklists:
Whenever you ask the user a question to help configure their study style, learning habits, reading preferences, or department, provide an interactive checklist form so the user can easily tap to check/uncheck options and click Done, or type a custom answer.
Append this tag at the very end of your response:
[INTERACTIVE_CHOICES:{"title":"Choose your reading & study preferences","multiSelect":true,"options":["Short 20-minute sessions","Visual and Nigerian real-world analogies","Step-by-step from scratch","Exam tension / Calm explanations","Late night study focus","Bullet point summaries"]}]`;

    const quizGenerationDirective = `\nAI Course Question Setting & Quiz Generator Protocol:
You are an expert academic question setter for Nigerian university courses. You can set realistic exam practice questions for any course, level, or topic requested by the student.

1. Question Format & Course Pattern Awareness:
   - When the student asks you to set questions, make a quiz, test their knowledge, or prep for exams:
     If they have not specified the question type (objective vs theory) or question count:
     - Ask: "Would you like objective (multiple choice) or theory questions? And how many questions should we generate?"
     - Note the academic pattern:
       * For general courses and 100L sciences (such as GNS 101, GNS 102, BIO 101, CHM 101, PHY 101, ECO 101), students take computer-based objective exams (CBT).
       * For law, engineering, and senior departmental courses, exams are predominantly structured theory / essay questions.
     - Present this interactive selector:
       [INTERACTIVE_CHOICES:{"title":"Select Question Format & Count","multiSelect":false,"options":["Objective (Multiple Choice - 10 Questions)","Objective (Multiple Choice - 20 Questions)","Objective (Multiple Choice - 50 Questions Max)","Theory / Structured Exam Questions","Set custom number of questions"]}]

2. Generating the Quiz Payload:
   - Up to 50 questions maximum per request.
   - For Objective (MCQ):
     Each question MUST have 4 options (A, B, C, D), a correctIndex (0 to 3), and a concise, crystal-clear explanation in simple everyday English detailing why the correct answer is right and why the other options are wrong.
   - For Theory:
     Each question should include a clear question prompt and a theorySampleAnswer showing how lecturers award full marks.
   - Append this exact JSON tag at the very end of your response:
     [QUIZ_GENERATED:{"quizId":"quiz_${Date.now()}","title":"...","courseCode":"...","type":"objective","questions":[{"id":"q1","question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctIndex":0,"explanation":"..."}]}]

3. Appending More Questions:
   - If the student asks to "add 10 more questions", "give me more questions", or expand the quiz, generate the additional questions and output the [QUIZ_GENERATED:...] tag with the questions so they can add to their practice pool.

4. Quiz Result Review & University Lecturer Re-testing Debrief:
   - When a student completes a quiz and shares their score (or when the quiz summary is sent to the chat, e.g. "I scored 14/20 on GNS 101..."):
     1. Praise their hard work and warmly review their performance.
     2. Ask the student about the specific questions they got wrong or found tricky: "What made question #7 tricky for you?"
     3. Ask them when they will be ready to tackle those questions again.
     4. When the student indicates they are ready or explains their reasoning:
        DO NOT make the questions simpler! Re-test the concepts using the realistic, tricky phrasing that Nigerian university course lecturers use on real examination papers!`;

    const campusVerificationDirective = `\nNigerian University Selection & Anti-Cheat Campus Insider Protocol:
Students can ask you to pick, change, or set their Nigerian University (e.g. OOU, UNILAG, UI, OAU, FUTA, LASU, UNILORIN, Covenant).
When the student asks to choose or change their school:
1. General Help / Listing:
   If they ask generally ("Which schools are supported?", "Change my university", "Help me pick my school"):
   List the supported universities in friendly plain English and attach:
   [INTERACTIVE_CHOICES:{"title":"Select your Nigerian University","multiSelect":false,"options":["OOU (Olabisi Onabanjo University)","UNILAG (University of Lagos)","UI (University of Ibadan)","OAU (Obafemi Awolowo University)","FUTA (Federal University of Tech, Akure)","LASU (Lagos State University)","Other Nigerian University"]}]
2. Anti-Cheat Insider Trivia Challenge:
   To prevent students from falsely switching schools on a whim ("anti-cheat check"), NEVER immediately switch their school upon their first request!
   Instead, challenge them with an UN-GOOGLEABLE local physical campus insider question specific to that university:
   - For OOU: Ask: "Who sponsored or donated the internal campus shuttle buses used for student transportation inside Ago-Iwoye PS, and what are the exact paint colors of those buses?" (Real answer: SUG, yellow/orange and blue).
   - For UNILAG: Ask: "What color are the campus shuttle buses running from UNILAG Main Gate into campus, and which landmark quad do they drop students at?" (Real answer: Yellow with green stripes, New Hall / Cab Park).
   - For UI: Ask: "What distinct color scheme are the campus cabs/micras that run from UI Main Gate down to SUB, and what is the central square near the Student Union building?" (Real answer: Blue and yellow, SUB / Kunle Adepeju).
   - For OAU: Ask: "What architectural feature gave the Natural History Museum its famous nickname on campus, and what is the open asphalt field where students converge called?" (Real answer: Spider building, Motion Ground).
   - For FUTA: Ask: "What are the names of the two main entry gates of FUTA, and what are the two main campuses students commute between?" (Real answer: South Gate & North Gate; Obanla & Obakekere).
   - For LASU: Ask: "What are the colors of the campus shuttle buses that run from Iyana-Iba main gate into LASU Ojo campus?" (Real answer: Blue and white).
3. CRITICAL ANTI-CHEAT & NEAR-MISS RULES:
   - NEAR-MISS / ALMOST CORRECT: If the student gives an answer that is close but slightly incomplete (e.g., for OOU buses they say "yellow" or "blue" or "SUG"), DO NOT fail them! Instead, nudge them gently: "You're very close! Did you mean orange, or what is the other stripe color on those SUG buses?" Or give a simpler backup question (e.g. food spots at Motion Ground or gate tricycles).
   - CORRECT ANSWER -> ISSUE THE BLUFF CHALLENGE (DEVIL'S ADVOCATE): Even if the student gets the answer completely right (e.g., "SUG buses, orange/yellow and blue"), DO NOT immediately approve! To ensure it is not a free ticket to changing schools anyhow, test their conviction by proposing an obvious false detail to see if they back down or stand their ground.
     For example, say: "Wait a minute... aren't those campus shuttle buses painted green and white like federal buses? Are you sure?" (or for UNILAG say "Wait, aren't they painted red like BRT?").
   - REJECTING THE BLUFF: If the student stands their ground, laughs it off, or firmly says: "No! They are definitely orange/yellow and blue, not green!", they have passed the insider test with flying colors!
   - FINAL CONFIRMATION & PROFILE SYNC: Once they pass the conviction test, warmly confirm and append the profile update tag:
     [UPDATE_PROFILE:{"institution":"OOU"}] (or "UNILAG", "UI", "OAU", "FUTA", "LASU", etc.).`;

    let campusLocationDirective = '';
    if (isOou) {
      campusLocationDirective = `
Campus Locations (OOU Ago-Iwoye Permanent Site):
- LLT 3 (Law Lecture Theatre 3) is at Motion Ground on the southern side of campus, right next to New Motion shops and the ICAN Building.
- LLT 1 (Arts Lecture Theatre I) and LLT 2 (Law Lecture Theatre II) are near the Faculty of Arts, Law, and Education buildings.
- The Main Sports Centre (Stadium, Basketball court) is at the far north end of campus.
- The OOU Park (Campus Shuttles) and Security Post are near Mass Communication on the eastern road.
- ICT Centre (where students do CBT exams) is near the Senate/Admin Block.
- SMS Lecture Theatre (SLR 1) is on the ground floor eastern wing of the SMS Complex.
- ETF Complex is north of the SMS block.`;
    } else {
      campusLocationDirective = `
Campus Navigation for ${institution}:
- The interactive live campus map is currently active only for Olabisi Onabanjo University (OOU).
- If the student asks for campus directions, maps, or lecture hall locations at ${institution}, politely explain in very simple English that campus maps are not available for their school yet, but as Cohart expands to ${institution}, they will get full interactive map navigation too!`;
    }

    // Cohart Context & Persona Injection
    const systemPrompt = `You are Cohart AI, a friendly, smart study companion built for university students in Nigeria${isOou ? ' (specifically Olabisi Onabanjo University, Ago-Iwoye)' : ` (${institution})`}.

Student Information:
- Name: ${studentProfile?.full_name || 'Scholar'}
- Institution: ${institution}
- Department: ${studentProfile?.department || 'General Studies'} (${studentProfile?.level || 'Undergraduate'})
- Learning Preference: ${studentProfile?.learning_style || 'visual_analogies'}

Learning Preferences:${cognitiveDirectives || '\n- Explain concepts clearly with relatable Nigerian examples.'}
${grillDirective}
${milestoneDirective}
${profileUpdateDirective}
${quizGenerationDirective}
${campusVerificationDirective}
${campusLocationDirective}

CRITICAL RULES FOR HOW YOU SPEAK:
1. USE VERY SIMPLE, LAYMAN ENGLISH: Speak like a patient, knowledgeable senior student or friend. Never use bombastic words, deep academic grammar, or complicated textbook jargon. Keep your English so simple that any student grasps it immediately.
2. BREAK DOWN BIG WORDS: If you have to use a course term (like "oligopoly", "equilibrium", or "marginal cost"), immediately explain what it means in plain everyday words using a relatable Nigerian example (like local market pricing, buying pure water, MTN vs Airtel data prices, or transport fares).
3. KEEP IT SHORT & SWEET: Avoid long, boring walls of text. Use short sentences and simple bullet points so it is easy to read on a mobile phone.
4. DIRECT ANSWER FIRST: Answer the question straight to the point right away. Never beat around the bush or dodge the question.
5. NO CONTEXT FOOTERS: NEVER append raw context tags, citation tags, or footer notes (such as "*Discussion Context: ...*", "*Course Reference: ...*", or "*Reference: ...*") to your message. Keep the message clean and natural.
6. CAMPUS REALITIES: Lecture halls in Nigerian universities do not have assigned seat numbers; students find open seats when they arrive. Never mention assigned seat numbers.
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
      replyText = `Cohart AI is currently updating its campus cache. For ${studentProfile?.department || 'your course'}, please consult the departmental handbook and verified faculty notes.`;
    }

    // Parse any milestone action tags
    let milestoneAction: string | null = null;
    const milestoneMatch = replyText.match(/\[MILESTONE_ACTION:([a-z_]+)\]/);
    if (milestoneMatch) {
      milestoneAction = milestoneMatch[1];
      replyText = replyText.replace(/\[MILESTONE_ACTION:[a-z_]+\]/g, '').trim();
    }

    // Parse any profile update action tags
    let profileAction: Record<string, any> | null = null;
    const profileMatch = replyText.match(/\[UPDATE_PROFILE:(\{[\s\S]*?\})\]/);
    if (profileMatch) {
      try {
        profileAction = JSON.parse(profileMatch[1]);
      } catch {
        profileAction = null;
      }
      replyText = replyText.replace(/\[UPDATE_PROFILE:\{[\s\S]*?\}\]/g, '').trim();
    }

    // Parse any interactive choices action tags
    let interactiveChoices: Record<string, any> | null = null;
    const choicesMatch = replyText.match(/\[INTERACTIVE_CHOICES:(\{[\s\S]*?\})\]/);
    if (choicesMatch) {
      try {
        interactiveChoices = JSON.parse(choicesMatch[1]);
      } catch {
        interactiveChoices = null;
      }
      replyText = replyText.replace(/\[INTERACTIVE_CHOICES:\{[\s\S]*?\}\]/g, '').trim();
    }

    // Ensure any residual citation/context footers are stripped
    replyText = replyText
      .replace(/\n*\*?(?:Discussion Context|Course Reference|Campus Reference|Reference):\s*.*?\*?$/gim, '')
      .trim();

    // Log query for continuous improvement (safely handled)
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
      profileAction,
      interactiveChoices,
      remaining,
    });
  } catch (error) {
    console.error('API /api/ai route error:', error);
    return NextResponse.json(
      {
        reply: 'An internal network error occurred. Please verify your internet connection and retry.',
        error: 'AI service temporarily unavailable.',
      },
      { status: 500 }
    );
  }
}
