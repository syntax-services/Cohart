'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QuizData, QuizQuestion, QuizAttemptResult } from '@/lib/types';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface QuizRunnerProps {
  quiz: QuizData;
  onClose: () => void;
  onReviewWithAi: (summaryPrompt: string) => void;
  onAddMoreQuestions?: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  quiz,
  onClose,
  onReviewWithAi,
  onAddMoreQuestions,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [assistedQuestions, setAssistedQuestions] = useState<Record<number, boolean>>({});
  const [miniAiExplanation, setMiniAiExplanation] = useState<{
    index: number;
    text: string;
    isLoading: boolean;
  } | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  const questions = quiz.questions || [];
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // already answered this question

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleAskMiniAi = async (qIndex: number) => {
    const targetQ = questions[qIndex];
    if (!targetQ) return;

    // Mark as Cohart Assisted (won't count toward independent final grade)
    setAssistedQuestions((prev) => ({
      ...prev,
      [qIndex]: true,
    }));

    setMiniAiExplanation({
      index: qIndex,
      text: '',
      isLoading: true,
    });

    try {
      const prompt = `You are Cohart Mini AI tutor. Explain this university exam question in very simple, plain everyday English with a quick relatable Nigerian example:
Question: "${targetQ.question}"
Options: ${targetQ.options.join(', ')}
Keep the explanation under 3 short sentences so the student grasps the fundamental concept immediately.`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: 'quick_tutor' }),
      });

      if (!res.ok) throw new Error('Failed to fetch explanation');
      const data = await res.json();
      setMiniAiExplanation({
        index: qIndex,
        text: data.reply || targetQ.explanation || 'Think about the core principle behind the question.',
        isLoading: false,
      });
    } catch {
      setMiniAiExplanation({
        index: qIndex,
        text: targetQ.explanation || 'Consider the main definition and eliminate options that contradict the rules.',
        isLoading: false,
      });
    }
  };

  const calculateResults = (): QuizAttemptResult => {
    let rawScore = 0;
    let assisted = 0;
    const missed: QuizAttemptResult['missedQuestionsSummary'] = [];
    const missedIds: string[] = [];

    questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      const isAssisted = Boolean(assistedQuestions[idx]);

      if (isAssisted) {
        assisted += 1;
      }

      if (chosen === q.correctIndex) {
        if (!isAssisted) {
          rawScore += 1;
        }
      } else {
        missedIds.push(q.id || `q_${idx}`);
        missed.push({
          question: q.question,
          chosenAnswer: chosen !== undefined ? q.options[chosen] || 'None' : 'Skipped',
          correctAnswer: q.options[q.correctIndex] || 'Option ' + q.correctIndex,
          explanation: q.explanation || 'Refer to the textbook definitions for this concept.',
        });
      }
    });

    return {
      quizId: quiz.id,
      courseCode: quiz.courseCode,
      title: quiz.title,
      totalQuestions,
      score: rawScore,
      assistedCount: assisted,
      missedQuestionIds: missedIds,
      missedQuestionsSummary: missed,
      timeTakenSeconds: elapsedSeconds,
      completedAt: new Date().toISOString(),
    };
  };

  const handleFinishQuiz = () => {
    setIsCompleted(true);
  };

  const handleShareQuiz = () => {
    if (typeof window === 'undefined') return;
    try {
      const encoded = encodeURIComponent(
        btoa(unescape(encodeURIComponent(JSON.stringify(quiz))))
      );
      const url = `${window.location.origin}/?tab=quiz&quizPayload=${encoded}`;
      navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    } catch {
      const url = `${window.location.origin}/?tab=quiz&quizId=${quiz.id}`;
      navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If quiz is finished, show the Summary & Review screen
  if (isCompleted) {
    const result = calculateResults();
    const percentage = Math.round((result.score / Math.max(1, totalQuestions)) * 100);

    return (
      <div className="fixed inset-0 z-[100] bg-neutral-950/95 backdrop-blur-2xl text-white flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto my-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8C7FA]">
                Quiz Complete • {quiz.courseCode}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans">{quiz.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <GeminiIcon name="close" size={18} />
            </button>
          </div>

          {/* Score Banner */}
          <GeminiCard className="p-6 rounded-3xl bg-white/[0.04] border border-white/[0.08] text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B57D0]/20 text-[#A8C7FA] text-2xl font-mono font-bold">
              {percentage}%
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {percentage >= 70
                  ? 'Excellent Performance! Solid Exam Readiness'
                  : percentage >= 50
                  ? 'Good Progress! Ready for targeted revision'
                  : 'Needs Practice: Let Cohart AI drill the tricky parts'}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Independent Score: {result.score} / {totalQuestions} • Time: {formatTime(result.timeTakenSeconds)}
              </p>
            </div>

            {/* Breakdown stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.08]">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-mono text-emerald-400 block uppercase">Correct</span>
                <span className="text-base font-bold font-mono text-emerald-300">{result.score}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] font-mono text-amber-400 block uppercase">Cohart Assisted</span>
                <span className="text-base font-bold font-mono text-amber-300">{result.assistedCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] font-mono text-rose-400 block uppercase">Missed</span>
                <span className="text-base font-bold font-mono text-rose-300">
                  {result.missedQuestionIds.length}
                </span>
              </div>
            </div>
          </GeminiCard>

          {/* Missed questions review */}
          {result.missedQuestionsSummary.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Questions to review with Cohart AI ({result.missedQuestionsSummary.length}):
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {result.missedQuestionsSummary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1.5"
                  >
                    <p className="font-medium text-neutral-200">{item.question}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                      <span className="text-rose-400">You picked: {item.chosenAnswer}</span>
                      <span className="text-emerald-400">Correct: {item.correctAnswer}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-sans leading-relaxed pt-1">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Handlers */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              onClick={() => {
                const missedSnippet = result.missedQuestionsSummary
                  .map((m) => `• "${m.question}" (I picked: ${m.chosenAnswer}, Correct: ${m.correctAnswer})`)
                  .slice(0, 5)
                  .join('\n');

                const debriefPrompt = `I just finished the ${quiz.courseCode} practice quiz!
Score: ${result.score}/${totalQuestions} (${percentage}%).
Cohart Assisted Questions: ${result.assistedCount}.
Missed Questions:
${missedSnippet || 'None! I got 100% independent.'}

Please review my results, tell me what made those concepts tricky, and test me under the same context using the exact style Nigerian university course lecturers use on exams!`;

                onReviewWithAi(debriefPrompt);
                onClose();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-full bg-[#A8C7FA] hover:bg-white text-neutral-950 font-bold text-xs font-mono transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#0B57D0]/20 flex items-center justify-center gap-2"
            >
              <GeminiIcon name="sparkle" size={16} />
              <span>Review Result with Cohart AI &rarr;</span>
            </button>

            <button
              onClick={handleShareQuiz}
              className="w-full sm:w-auto py-3 px-5 rounded-full bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <GeminiIcon name="share" size={14} />
              <span>{copiedShareLink ? 'Link Copied!' : 'Share with Peers'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Interface: Distraction-free, single-question view
  if (!currentQ) {
    return (
      <div className="fixed inset-0 z-[100] bg-neutral-950 text-white flex items-center justify-center p-4">
        <p className="text-xs font-mono text-neutral-400">No questions loaded in this quiz.</p>
        <button onClick={onClose} className="ml-4 text-xs font-mono text-[#A8C7FA] underline">
          Close
        </button>
      </div>
    );
  }

  const selectedAnswer = selectedAnswers[currentIndex];
  const isAnswered = selectedAnswer !== undefined;
  const isAssistedThisQ = Boolean(assistedQuestions[currentIndex]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0E1015] text-neutral-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Progress & Control Bar */}
      <div className="h-14 px-4 sm:px-8 border-b border-white/[0.08] flex items-center justify-between bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-md bg-[#0B57D0]/20 text-[#A8C7FA] border border-[#0B57D0]/30">
            {quiz.courseCode}
          </span>
          <span className="text-xs font-mono text-neutral-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
            <GeminiIcon name="clock" size={13} />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            title="Share quiz with peers"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <GeminiIcon name="share" size={16} />
          </button>

          <button
            onClick={onClose}
            title="Exit quiz"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <GeminiIcon name="close" size={18} />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1 bg-white/[0.04]">
        <div
          className="h-full bg-gradient-to-r from-[#0B57D0] to-[#A8C7FA] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Main Focus Area: Question Card */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                {quiz.type === 'theory' ? 'Structured Theory' : 'Multiple Choice Objective'}
              </span>

              {isAssistedThisQ && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                  <GeminiIcon name="brain" size={11} />
                  <span>Cohart Assisted</span>
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-medium text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Options (Objective style) */}
          {quiz.type !== 'theory' && currentQ.options && (
            <div className="space-y-2.5">
              {currentQ.options.map((optionText, optIdx) => {
                const isSelected = selectedAnswer === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;

                let stateClasses =
                  'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] text-neutral-200';

                if (isAnswered) {
                  if (isCorrect) {
                    stateClasses =
                      'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-medium shadow-sm';
                  } else if (isSelected && !isCorrect) {
                    stateClasses =
                      'bg-rose-500/15 border-rose-500/50 text-rose-200 font-medium';
                  } else {
                    stateClasses = 'bg-white/[0.01] border-white/[0.04] text-neutral-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${stateClasses}`}
                  >
                    <span className="flex-shrink-0 h-6 w-6 rounded-xl bg-white/[0.06] flex items-center justify-center text-xs font-mono font-bold text-neutral-300">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-xs sm:text-sm pt-0.5 leading-snug">{optionText}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Theory Response Preview (if theory) */}
          {quiz.type === 'theory' && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Lecturer's Expected Marking Scheme:
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {currentQ.theorySampleAnswer || currentQ.explanation}
              </p>
            </div>
          )}

          {/* Feedback & Explanation (shows automatically once answered) */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                {selectedAnswer === currentQ.correctIndex ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <GeminiIcon name="check-circle" size={14} /> Correct Answer
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <GeminiIcon name="close" size={14} /> Incorrect
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Mini AI Assistant Slide-in */}
          {miniAiExplanation && miniAiExplanation.index === currentIndex && (
            <div className="p-4 rounded-2xl bg-[#0B57D0]/10 border border-[#0B57D0]/30 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-[#A8C7FA] font-mono">
                <span className="flex items-center gap-1 font-bold">
                  <GeminiIcon name="sparkle" size={13} /> Cohart Mini AI Explanation
                </span>
                <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  Assisted Question
                </span>
              </div>
              {miniAiExplanation.isLoading ? (
                <p className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A8C7FA] animate-ping" />
                  Breaking down concept in simple everyday English...
                </p>
              ) : (
                <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                  {miniAiExplanation.text}
                </p>
              )}
            </div>
          )}

          {/* Question Action Controls */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {!isAnswered && !isAssistedThisQ && (
                <button
                  type="button"
                  onClick={() => handleAskMiniAi(currentIndex)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <GeminiIcon name="brain" size={13} />
                  <span>Explain this question</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentIndex > 0 && (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
                >
                  &larr; Prev
                </button>
              )}

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-4 py-2 rounded-full bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white font-mono text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  Next &rarr;
                </button>
              ) : (
                <button
                  onClick={handleFinishQuiz}
                  className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  Submit & Finish Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#161822] border border-white/10 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GeminiIcon name="share" size={16} className="text-[#A8C7FA]" />
                <h3 className="text-sm font-bold text-white">Share Quiz with Peers</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white cursor-pointer"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Your study mates can open this link to attempt this exact {totalQuestions}-question {quiz.courseCode} practice quiz.
            </p>

            <button
              onClick={handleShareQuiz}
              className="w-full py-2.5 rounded-full bg-[#A8C7FA] hover:bg-white text-neutral-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-xs"
            >
              {copiedShareLink ? 'Link Copied to Clipboard!' : 'Copy Shareable Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
