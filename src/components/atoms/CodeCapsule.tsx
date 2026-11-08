'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { downloadAsText } from '@/lib/exportUtils';

interface CodeCapsuleProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeCapsule: React.FC<CodeCapsuleProps> = ({
  code,
  language = 'code',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const cleanLang = language.toLowerCase().trim() || 'code';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      python: 'py',
      py: 'py',
      javascript: 'js',
      js: 'js',
      typescript: 'ts',
      ts: 'ts',
      html: 'html',
      css: 'css',
      sql: 'sql',
      json: 'json',
      c: 'c',
      cpp: 'cpp',
      java: 'java',
    };
    const ext = extMap[cleanLang] || 'txt';
    downloadAsText(`aurora_snippet_${Date.now()}.${ext}`, code);
  };

  return (
    <div className={`my-3 rounded-2xl bg-[#0D0E11] border border-white/[0.08] shadow-sm overflow-hidden font-sans ${className}`}>
      {/* Capsule Top Control Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.06] bg-black/[0.2] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white/60" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
            {cleanLang}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Copy Snippet */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-mono text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer active:scale-95"
            title="Copy snippet"
          >
            <GeminiIcon name={copied ? 'check' : 'copy'} size={11} />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download file */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-mono text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer active:scale-95"
            title="Download source file"
          >
            <GeminiIcon name="download" size={11} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Code Monospace Body */}
      <pre className="p-3.5 font-mono text-[12px] leading-relaxed overflow-x-auto text-neutral-200 selection:bg-white/20">
        <code>{code}</code>
      </pre>
    </div>
  );
};
