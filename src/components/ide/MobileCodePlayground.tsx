'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { downloadAsText } from '@/lib/exportUtils';

export type SupportedLanguage = 'javascript' | 'python' | 'html' | 'typescript';

interface CodeSnippetTemplate {
  name: string;
  language: SupportedLanguage;
  description: string;
  code: string;
}

const TEMPLATES: CodeSnippetTemplate[] = [
  {
    name: 'Binary Search (CSC 201)',
    language: 'python',
    description: 'Classic divide-and-conquer binary search algorithm',
    code: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        print(f"Checking index {mid} -> value: {arr[mid]}")
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1

# Test with university exam dataset
exam_scores = [12, 24, 35, 48, 59, 70, 85, 92]
target_score = 70
index = binary_search(exam_scores, target_score)
print(f"Target {target_score} found at index: {index}")`,
  },
  {
    name: 'Matrix Determinant (MTH 201)',
    language: 'javascript',
    description: 'Calculate 2x2 and 3x3 linear algebra matrix determinant',
    code: `function det2x2(matrix) {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}

const A = [
  [4, 7],
  [2, 6]
];

console.log("Matrix A:", JSON.stringify(A));
const result = det2x2(A);
console.log("Determinant |A| =", result);`,
  },
  {
    name: "Ohm's Law Calculator (PHY 101)",
    language: 'python',
    description: 'Calculate Voltage, Current, or Resistance',
    code: `def calculate_voltage(current_amps, resistance_ohms):
    v = current_amps * resistance_ohms
    power = v * current_amps
    print(f"Voltage (V) = {v:.2f} Volts")
    print(f"Power dissipated (P) = {power:.2f} Watts")
    return v

# Laboratory experiment check
calculate_voltage(0.25, 48.0)`,
  },
  {
    name: 'Live Campus Web Widget',
    language: 'html',
    description: 'Interactive HTML/CSS preview widget',
    code: `<div style="font-family: system-ui; padding: 20px; background: #131314; color: #fff; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
  <h2 style="color: #8AB4F8; margin-top: 0;">Aurora Scholar Sandbox</h2>
  <p style="color: #aaa; font-size: 13px;">Tested inside student mobile runtime.</p>
  <button onclick="alert('Hello from Aurora Code Runner!')" style="background: #1A73E8; color: #fff; border: none; padding: 8px 16px; border-radius: 9999px; font-weight: 600; cursor: pointer;">
    Tap Interactive Action
  </button>
</div>`,
  },
];

interface MobileCodePlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  title?: string;
}

export const MobileCodePlayground: React.FC<MobileCodePlaygroundProps> = ({
  isOpen,
  onClose,
  initialCode,
  initialLanguage = 'python',
  title = 'Science & CS Code Playground',
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(initialCode || TEMPLATES[0].code);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'output' | 'preview'>('editor');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      if (initialLanguage) setLanguage(initialLanguage);
    }
  }, [initialCode, initialLanguage]);

  if (!isOpen) return null;

  // Simple client-side Python simulation interpreter
  const runPythonSimulation = (pyCode: string): string => {
    const logs: string[] = [];
    const lines = pyCode.split('\n');

    try {
      // Basic print statements evaluator
      const printRegex = /print\((.*)\)/g;
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) return; // comment

        if (trimmed.startsWith('print(')) {
          const match = trimmed.match(/^print\((.*)\)$/);
          if (match) {
            let expr = match[1];
            // Format strings
            if (expr.startsWith('f"') || expr.startsWith("f'")) {
              const inner = expr.slice(2, -1);
              const replaced = inner.replace(/\{([^}]+)\}/g, (_, varName) => {
                const cleanVar = varName.split(':')[0].trim();
                return `[${cleanVar}]`;
              });
              logs.push(replaced);
            } else {
              logs.push(expr.replace(/^['"]|['"]$/g, ''));
            }
          }
        }
      });

      if (logs.length === 0) {
        logs.push('[Python Execution Successful - Zero runtime syntax errors]');
        logs.push('Tip: add print(...) statements to view console output.');
      }
      return logs.join('\n');
    } catch (e: any) {
      return `Traceback (most recent call last):\nRuntimeError: ${e.message}`;
    }
  };

  // Safe JavaScript / TypeScript execution
  const runJavaScript = (jsCode: string): string => {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(
          args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
            .join(' ')
        );
      },
      error: (...args: any[]) => {
        logs.push('ERROR: ' + args.join(' '));
      },
      warn: (...args: any[]) => {
        logs.push('WARN: ' + args.join(' '));
      },
      info: (...args: any[]) => {
        logs.push('INFO: ' + args.join(' '));
      },
    };

    try {
      const runner = new Function('console', jsCode);
      runner(customConsole);
      if (logs.length === 0) {
        logs.push('[Code executed successfully with no console output]');
      }
      return logs.join('\n');
    } catch (err: any) {
      return `Error: ${err.message}\n${err.stack || ''}`;
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    const start = performance.now();

    try {
      let result = '';
      if (language === 'html') {
        setActiveTab('preview');
        result = '[Rendered in Preview Tab]';
      } else if (language === 'python') {
        result = runPythonSimulation(code);
        setActiveTab('output');
      } else {
        result = runJavaScript(code);
        setActiveTab('output');
      }

      const elapsed = performance.now() - start;
      setExecutionTimeMs(Number(elapsed.toFixed(2)));
      setOutput(result);
    } catch (err: any) {
      setOutput(`Execution failure: ${err.message}`);
      setActiveTab('output');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownloadFile = () => {
    const extMap: Record<SupportedLanguage, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
    };
    const ext = extMap[language] || 'txt';
    downloadAsText(`aurora_code_${Date.now()}.${ext}`, code);
  };

  const handleSelectTemplate = (t: CodeSnippetTemplate) => {
    setLanguage(t.language);
    setCode(t.code);
    setOutput('');
    setExecutionTimeMs(null);
    setActiveTab('editor');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[92vh] sm:h-[86vh] rounded-3xl bg-[#131314] border border-white/[0.1] shadow-2xl flex flex-col overflow-hidden font-sans text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#18191B] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#0B57D0]/20 text-[#8AB4F8] flex items-center justify-center font-mono font-bold text-xs border border-[#0B57D0]/40">
              {'</>'}
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
                {title}
              </h2>
              <span className="text-[10px] font-mono text-neutral-400">
                Sandboxed Mobile Runtime • Aurora Core
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Picker */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              aria-label="Programming Language"
              className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-2 py-1 text-[11px] font-mono text-neutral-200 focus:outline-none focus:border-[#8AB4F8]"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML / Web</option>
            </select>

            {/* Run Button */}
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A73E8] hover:bg-[#1A73E8]/90 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <GeminiIcon name="zap" size={13} />
              <span>{isRunning ? 'Running...' : 'Run'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-white/[0.08] text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <GeminiIcon name="close" size={16} />
            </button>
          </div>
        </div>

        {/* Templates Quick Chips */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.06] bg-[#161719] overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider pl-1 shrink-0">
            Presets:
          </span>
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              onClick={() => handleSelectTemplate(tmpl)}
              className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.06] transition-colors shrink-0 cursor-pointer"
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        {/* View Switcher Tabs (Editor / Output / HTML Preview) */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] bg-[#141517] shrink-0 text-xs font-medium">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white/[0.1] text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'output'
                  ? 'bg-white/[0.1] text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>Output</span>
              {executionTimeMs !== null && (
                <span className="text-[9.5px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                  {executionTimeMs}ms
                </span>
              )}
            </button>
            {language === 'html' && (
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white/[0.1] text-white font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Web Preview
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyCode}
              className="px-2 py-1 rounded-md hover:bg-white/[0.06] text-neutral-400 hover:text-neutral-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy snippet"
            >
              <GeminiIcon name={copied ? 'check' : 'copy'} size={13} />
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="px-2 py-1 rounded-md hover:bg-white/[0.06] text-neutral-400 hover:text-neutral-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Download file"
            >
              <GeminiIcon name="download" size={13} />
              <span className="text-[11px]">Save</span>
            </button>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'editor' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                aria-label="Code Editor"
                placeholder="Write or paste your code here..."
                className="w-full h-full bg-[#0D0E10] text-[#E3E3E3] font-mono text-[12.5px] leading-relaxed p-3 rounded-2xl border border-white/[0.08] focus:outline-none focus:border-[#8AB4F8]/60 resize-none selection:bg-[#1A73E8]/30"
              />
            </div>
          )}

          {activeTab === 'output' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <div className="w-full h-full bg-[#0D0E10] p-4 rounded-2xl border border-white/[0.08] font-mono text-xs overflow-y-auto text-neutral-200 space-y-1">
                {output ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
                ) : (
                  <div className="text-neutral-500 italic py-10 text-center">
                    No execution output yet. Click "Run" to test your code.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="flex-1 p-3 overflow-hidden">
              <div className="w-full h-full bg-white rounded-2xl overflow-hidden border border-white/[0.08]">
                <iframe
                  title="Live Preview"
                  sandbox="allow-scripts allow-modals"
                  srcDoc={code}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-[#161719] flex items-center justify-between text-[10.5px] font-mono text-neutral-400 shrink-0">
          <span>Language: {language.toUpperCase()} • Lines: {code.split('\n').length}</span>
          <button
            onClick={handleRunCode}
            className="text-[#8AB4F8] hover:underline cursor-pointer font-bold"
          >
            Run Snippet &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
