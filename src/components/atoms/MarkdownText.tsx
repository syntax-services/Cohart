'use client';

import React from 'react';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content by lines to process blocks cleanly
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const parseInline = (text: string, keyPrefix: string): React.ReactNode[] => {
    // Regex matches bold (**text**), italics (*text*), inline code (`code`), and references
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let idx = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        tokens.push(
          <strong
            key={`${keyPrefix}-b-${idx++}`}
            className="font-semibold text-neutral-950 dark:text-white tracking-tight"
          >
            {boldMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Inline code `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        tokens.push(
          <code
            key={`${keyPrefix}-c-${idx++}`}
            className="px-1.5 py-0.5 rounded-md bg-black/[0.06] dark:bg-white/[0.1] font-mono text-[11px] text-[#0B57D0] dark:text-[#A8C7FA] font-medium"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Italic *text*
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch) {
        tokens.push(
          <em
            key={`${keyPrefix}-i-${idx++}`}
            className="italic text-neutral-800 dark:text-neutral-200"
          >
            {italicMatch[2]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Plain text up to next special character
      const nextSpecial = remaining.search(/[\*_`]/);
      if (nextSpecial === -1) {
        tokens.push(<span key={`${keyPrefix}-t-${idx++}`}>{remaining}</span>);
        break;
      } else if (nextSpecial > 0) {
        tokens.push(
          <span key={`${keyPrefix}-t-${idx++}`}>
            {remaining.slice(0, nextSpecial)}
          </span>
        );
        remaining = remaining.slice(nextSpecial);
      } else {
        // Just a stray symbol
        tokens.push(<span key={`${keyPrefix}-s-${idx++}`}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }

    return tokens;
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Code block toggle ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        renderedElements.push(
          <pre
            key={`codeblock-${lineIdx}`}
            className="my-2 p-3 rounded-xl bg-black/[0.06] dark:bg-black/50 border border-black/[0.08] dark:border-white/[0.08] font-mono text-xs overflow-x-auto text-neutral-900 dark:text-neutral-100"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Empty line
    if (!trimmed) {
      renderedElements.push(<div key={`empty-${lineIdx}`} className="h-1.5" />);
      return;
    }

    // Headers (### Header)
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h4
          key={`h4-${lineIdx}`}
          className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mt-2.5 mb-1 tracking-tight"
        >
          {parseInline(trimmed.replace(/^###\s+/, ''), `h4-${lineIdx}`)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h3
          key={`h3-${lineIdx}`}
          className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white mt-3 mb-1 tracking-tight"
        >
          {parseInline(trimmed.replace(/^##\s+/, ''), `h3-${lineIdx}`)}
        </h3>
      );
      return;
    }

    // Special Reference / Citation Pill or Box
    if (
      trimmed.includes('Course Reference:') ||
      trimmed.includes('Campus Reference:') ||
      trimmed.includes('Discussion Context:')
    ) {
      const isCampus = trimmed.includes('Campus Reference:');
      const isCourse = trimmed.includes('Course Reference:');
      renderedElements.push(
        <div
          key={`ref-${lineIdx}`}
          className={`mt-2.5 p-2.5 rounded-xl text-[11px] sm:text-xs font-mono flex items-start gap-2 border transition-all ${
            isCampus
              ? 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : isCourse
              ? 'bg-[#0B57D0]/[0.08] dark:bg-[#A8C7FA]/[0.12] border-[#0B57D0]/20 text-[#0B57D0] dark:text-[#A8C7FA]'
              : 'bg-neutral-500/[0.08] dark:bg-neutral-400/[0.12] border-neutral-400/20 text-neutral-700 dark:text-neutral-300'
          }`}
        >
          <span className="shrink-0 text-sm">
            {isCampus ? '📍' : isCourse ? '📖' : '💬'}
          </span>
          <div className="leading-snug">
            {parseInline(trimmed.replace(/^(\*|_|📍|📖|💬|\s)+/, ''), `ref-${lineIdx}`)}
          </div>
        </div>
      );
      return;
    }

    // Bullet points (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.slice(2);
      renderedElements.push(
        <div key={`bullet-${lineIdx}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] mt-1.5 shrink-0" />
          <div className="text-xs sm:text-[13px] leading-relaxed">
            {parseInline(text, `b-${lineIdx}`)}
          </div>
        </div>
      );
      return;
    }

    // Numbered list (1. 2.)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num-${lineIdx}`} className="flex items-start gap-2 my-1 pl-1">
          <span className="font-mono text-[11px] text-[#0B57D0] dark:text-[#A8C7FA] font-semibold shrink-0">
            {numMatch[1]}.
          </span>
          <div className="text-xs sm:text-[13px] leading-relaxed">
            {parseInline(numMatch[2], `n-${lineIdx}`)}
          </div>
        </div>
      );
      return;
    }

    // Blockquote (> )
    if (trimmed.startsWith('> ')) {
      renderedElements.push(
        <blockquote
          key={`quote-${lineIdx}`}
          className="border-l-2 border-[#0B57D0] dark:border-[#A8C7FA] pl-3 py-1 my-2 text-xs italic text-neutral-600 dark:text-neutral-400 bg-black/[0.02] dark:bg-white/[0.02] rounded-r-lg"
        >
          {parseInline(trimmed.slice(2), `q-${lineIdx}`)}
        </blockquote>
      );
      return;
    }

    // Regular paragraph
    renderedElements.push(
      <p
        key={`p-${lineIdx}`}
        className="text-xs sm:text-[13px] leading-relaxed my-0.5"
      >
        {parseInline(line, `p-${lineIdx}`)}
      </p>
    );
  });

  return <div className={`space-y-1 font-sans ${className}`}>{renderedElements}</div>;
};
