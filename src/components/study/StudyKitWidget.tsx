'use client';

import React, { useState } from 'react';
import { StudyKitPayload, InteractiveQuizQuestion, QuizData } from '@/lib/types';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface StudyKitWidgetProps {
  kit: StudyKitPayload;
  onLaunchFullQuiz?: (quiz: QuizData) => void;
}

export const StudyKitWidget: React.FC<StudyKitWidgetProps> = ({ kit, onLaunchFullQuiz }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz' | 'checklist' | 'predictions'>('summary');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [checklistItems, setChecklistItems] = useState(
    kit.checklist || [
      { id: 'c1', label: 'Review core definitions and formulas', completed: true },
      { id: 'c2', label: 'Master active recall flashcard deck', completed: false },
      { id: 'c3', label: 'Complete 10-question CBT practice drill', completed: false },
      { id: 'c4', label: 'Audit lecturer exam traps & predicted questions', completed: false },
    ]
  );
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [revealedQuiz, setRevealedQuiz] = useState<Record<string, boolean>>({});

  const toggleChecklist = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = checklistItems.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / (checklistItems.length || 1)) * 100);

  const flashcards = kit.flashcards && kit.flashcards.length > 0 ? kit.flashcards : [
    { question: 'What is the primary principle tested in this course?', answer: 'Foundational concept clarity applied to Nigerian university exam scenarios.', memoryHook: 'Remember the real-world campus example discussed in class.' }
  ];

  const currentFlashcard = flashcards[flashcardIndex] || flashcards[0];

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const questions = kit.quiz?.questions || [];

  return (
    <div className="w-full my-3 rounded-2xl bg-white/90 dark:bg-[#121620]/90 border border-black/[0.08] dark:border-white/[0.1] shadow-xl overflow-hidden backdrop-blur-xl">
      {/* Kit Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                AI Exam Done & Dusted Kit
              </span>
              <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">
                {kit.courseCode}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-sans">
              {kit.title}
            </h3>
          </div>

          {/* Readiness Meter Badge */}
          <div className="flex items-center gap-3 bg-black/[0.04] dark:bg-white/[0.06] px-3 py-2 rounded-xl border border-black/[0.06] dark:border-white/[0.08] shrink-0">
            <div className="text-right">
              <span className="block text-[10px] font-mono uppercase text-neutral-500">Readiness Score</span>
              <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {Math.max(kit.readinessScore || 75, progressPercent)}% Exam Ready
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="flex items-center gap-1 mt-4 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'summary', label: 'Executive Notes', icon: 'sparkle' },
            { id: 'flashcards', label: `Flashcards (${flashcards.length})`, icon: 'arrow-right' },
            { id: 'quiz', label: `CBT Drill (${questions.length})`, icon: 'check' },
            { id: 'checklist', label: 'Checklist', icon: 'check' },
            { id: 'predictions', label: 'Predictions', icon: 'sparkle' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body */}
      <div className="p-4 sm:p-5">
        {/* Tab 1: Executive Notes */}
        {activeTab === 'summary' && (
          <div className="space-y-4 text-sm text-neutral-800 dark:text-neutral-200">
            <div>
              <h4 className="text-xs font-mono uppercase text-neutral-400 font-bold mb-1">Concept Overview</h4>
              <p className="leading-relaxed bg-black/[0.02] dark:bg-white/[0.03] p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
                {kit.summary.overview}
              </p>
            </div>

            {kit.summary.keyDefinitions && kit.summary.keyDefinitions.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase text-neutral-400 font-bold mb-2">High-Yield Lecturer Keywords</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {kit.summary.keyDefinitions.map((def, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]"
                    >
                      <span className="block font-bold text-xs text-[#0B57D0] dark:text-[#1A73E8] mb-0.5 font-mono">
                        {def.term}
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                        {def.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kit.summary.lecturerEmphasis && kit.summary.lecturerEmphasis.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase text-neutral-400 font-bold mb-1">Lecturer Emphasis (Exam Probable)</h4>
                <ul className="space-y-1 pl-4 list-disc text-xs text-neutral-700 dark:text-neutral-300">
                  {kit.summary.lecturerEmphasis.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed">{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {kit.summary.examPitfalls && kit.summary.examPitfalls.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
                <span className="font-bold block mb-1">Common Student Pitfalls to Avoid in the Exam:</span>
                <ul className="space-y-1 list-disc pl-4">
                  {kit.summary.examPitfalls.map((pit, idx) => (
                    <li key={idx}>{pit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Active Recall Flashcards */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
              <span>Card {flashcardIndex + 1} of {flashcards.length}</span>
              <span>Tap card to reveal answer</span>
            </div>

            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[170px] sm:min-h-[200px] p-6 rounded-2xl bg-gradient-to-br from-black/[0.03] to-black/[0.01] dark:from-white/[0.05] dark:to-white/[0.02] border border-black/[0.08] dark:border-white/[0.1] shadow-inner flex flex-col justify-between cursor-pointer transition-all hover:border-[#0B57D0]/40 group"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-neutral-400 block mb-2">
                  {isFlipped ? 'Answer & Memory Hook' : 'Active Recall Question'}
                </span>
                <p className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white leading-relaxed">
                  {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
                </p>
              </div>

              {isFlipped && currentFlashcard.memoryHook && (
                <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  Anchor: {currentFlashcard.memoryHook}
                </div>
              )}

              <div className="text-right text-[10px] font-mono text-neutral-400 group-hover:text-[#0B57D0] transition-colors mt-2">
                {isFlipped ? 'Tap to see Question' : 'Tap to Flip'}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevFlashcard}
                className="px-4 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-bold text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNextFlashcard}
                className="px-4 py-2 rounded-xl bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Next Card
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: CBT Exam Drill */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs font-mono">
                No quiz questions attached. Ask Nova to generate a full CBT practice drill!
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, qIndex) => {
                  const selectedOpt = quizAnswers[q.questionId];
                  const isRevealed = revealedQuiz[q.questionId];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={q.questionId || qIndex}
                      className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white leading-snug">
                          Q{qIndex + 1}. {q.question}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIndex) => {
                          const isOptionSelected = selectedOpt === optIndex;
                          const isOptionCorrect = optIndex === q.correctIndex;

                          let btnStyle = 'bg-black/[0.03] dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]';
                          if (isRevealed) {
                            if (isOptionCorrect) {
                              btnStyle = 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-[#0B57D0]/15 border border-[#0B57D0]/40 text-[#0B57D0] dark:text-[#1A73E8] font-bold';
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => {
                                setQuizAnswers((prev) => ({ ...prev, [q.questionId]: optIndex }));
                                setRevealedQuiz((prev) => ({ ...prev, [q.questionId]: true }));
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isRevealed && isOptionCorrect && <span>✓</span>}
                              {isRevealed && isOptionSelected && !isOptionCorrect && <span>✗</span>}
                            </button>
                          );
                        })}
                      </div>

                      {isRevealed && (
                        <div className="p-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.05] text-[11px] space-y-1 font-sans">
                          <p className="font-semibold text-neutral-900 dark:text-white">{q.explanation}</p>
                          {q.psychologicalMemoryHook && (
                            <p className="font-mono text-emerald-600 dark:text-emerald-400 text-[10px]">
                              Hook: {q.psychologicalMemoryHook}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {onLaunchFullQuiz && (
                  <button
                    type="button"
                    onClick={() =>
                      onLaunchFullQuiz({
                        id: kit.quiz?.quizId || kit.kitId,
                        title: kit.quiz?.title || `${kit.courseCode} CBT Exam Simulator`,
                        courseCode: kit.courseCode,
                        type: 'objective',
                        createdAt: new Date().toISOString(),
                        questions: questions.map((q) => ({
                          id: q.questionId,
                          question: q.question,
                          options: q.options,
                          correctIndex: q.correctIndex,
                          explanation: q.explanation,
                        })),
                      })
                    }
                    className="w-full py-2.5 rounded-xl bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Launch Full Screen CBT Exam Mode</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Exam Readiness Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-2">
              <span>Exam Day Preparation Steps</span>
              <span>{completedCount}/{checklistItems.length} Completed</span>
            </div>

            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    item.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-neutral-900 dark:text-white'
                      : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.05] dark:border-white/[0.06] text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-neutral-400 dark:border-neutral-600'
                    }`}
                  >
                    {item.completed && '✓'}
                  </div>
                  <span className={`text-xs font-medium ${item.completed ? 'line-through text-neutral-500' : ''}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-neutral-400 font-mono pt-2">
              Tip: Ticking off all items unlocks peak psychological confidence before walking into the examination venue.
            </p>
          </div>
        )}

        {/* Tab 5: Predictions & Panic Reliever */}
        {activeTab === 'predictions' && (
          <div className="space-y-4 text-xs text-neutral-800 dark:text-neutral-200">
            {kit.panicReliefTip && (
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-1">
                <span className="font-bold text-purple-700 dark:text-purple-300 font-mono text-[10px] uppercase block">
                  Campus Exam Panic Reliever
                </span>
                <p className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-sans">
                  {kit.panicReliefTip}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-mono uppercase text-neutral-400 font-bold mb-2">
                Lecturer Question Predictions (Historical Exam Patterns)
              </h4>
              <div className="space-y-2">
                {(kit.predictedQuestions && kit.predictedQuestions.length > 0 ? kit.predictedQuestions : [
                  'Compare and contrast the primary definitions with real-world institutional examples.',
                  'State the statutory or theoretical assumptions governing this topic.',
                  'Calculate or derive the key formulas under standard exam conditions.'
                ]).map((pred, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] flex items-start gap-2.5"
                  >
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">#{idx + 1}</span>
                    <span className="leading-snug">{pred}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
