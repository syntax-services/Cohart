# Cohart System Architecture & Design Specification

## 1. Aesthetic DNA
- Base: Deep Monochrome (#06080D, #0D111A, #121824)
- Accent: Exclusively Google Gemini Blue (#1A73E8, #3B82F6, #60A5FA)
- Iconography: 100% bespoke thin SVG icons (no emojis)
- Navigation: Mobile-first PWA floating bottom navigation bar

## 2. Core Segments
1. Campus Hub & Transit: CartoDB Dark Matter with API key cb1_3rjp_1_f8a6fb6d946dbbfeac97230a, unwatermarked, venue sheet, live map for OOU
2. Interactive Reader: Clean typography, bionic mode, highlight-to-explain AI, active recall check-ins
3. Schedule & Smart Attendance: Timetable, one-tap attendance mark, behavioral attendance notifications
4. Profile & Cognition: Quick auth, cognitive learning traits (ADHD, visual, real-world analogies), test reminders, referral wallet
5. AI Study Companion & Voice: Deepgram STT/TTS with Aura-2 models, conversational tutor, campus insider anti-cheat verification
6. Exam Question Engine & QuizRunner: AI exam question setter, dedicated distraction-free QuizRunner, in-quiz Mini AI tutor, peer URL sharing, lecturer-style debrief
7. Public Universities Directory & Searchable Combobox: 103 accredited Federal & State universities with instant search and category filtering

## 3. Database Schema (Supabase)
- profiles: id, email, full_name, matric_number, faculty, department, level, institution, cognitive_traits, learning_style, referral_code, wallet_balance, is_verified_coordinator
- attendance_logs: id, user_id, course_code, venue, status, attended_at
- study_notes: id, user_id, course_code, highlight_text, ai_explanation, created_at
