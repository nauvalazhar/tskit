import { useState } from 'react';
import type { ErrorComponentProps } from '@tanstack/react-router';

interface StackFrame {
  raw: string;
  functionName: string;
  file: string;
  line: number | null;
  column: number | null;
  isApp: boolean;
}

function stripOrigin(file: string): string {
  try {
    const url = new URL(file);
    return url.pathname + (url.search || '');
  } catch {
    return file;
  }
}

// Handles V8 (`at fn (file:line:col)`) and Safari (`fn@file:line:col`)
function parseStackTrace(stack: string): StackFrame[] {
  return stack.split('\n').reduce<StackFrame[]>((frames, raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return frames;

    // V8: "at functionName (file:line:col)" or "at file:line:col"
    const v8 = trimmed.match(/^at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
    if (v8) {
      const file = stripOrigin(v8[2]);
      frames.push({
        raw: trimmed,
        functionName: v8[1] || '(anonymous)',
        file,
        line: Number(v8[3]),
        column: Number(v8[4]),
        isApp: !file.includes('node_modules'),
      });
      return frames;
    }

    // Safari: "functionName@file:line:col"
    const safari = trimmed.match(/^(.+?)@(.+?):(\d+):(\d+)$/);
    if (safari) {
      const file = stripOrigin(safari[2]);
      frames.push({
        raw: trimmed,
        functionName: safari[1] || '(anonymous)',
        file,
        line: Number(safari[3]),
        column: Number(safari[4]),
        isApp: !file.includes('node_modules'),
      });
      return frames;
    }

    // Fallback: display raw line
    frames.push({
      raw: trimmed,
      functionName: trimmed,
      file: '',
      line: null,
      column: null,
      isApp: false,
    });
    return frames;
  }, []);
}

function formatForCopy(error: Error, frames: StackFrame[]): string {
  const lines = [`${error.name || 'Error'}: ${error.message}`, ''];
  if (frames.length > 0) {
    lines.push('Stack Trace:');
    for (const frame of frames) {
      const loc = frame.file
        ? ` ${frame.file}${frame.line != null ? `:${frame.line}` : ''}${frame.column != null ? `:${frame.column}` : ''}`
        : '';
      lines.push(`  ${frame.functionName}${loc}`);
    }
  }
  return lines.join('\n');
}

export function DevErrorOverlay({ error, reset }: ErrorComponentProps) {
  const errorName = error.name || 'Error';
  const frames = error.stack ? parseStackTrace(error.stack) : [];
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(formatForCopy(error, frames)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/10 p-6 backdrop-blur-sm font-mono">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-neutral-950 p-6 text-neutral-200 space-y-6 shadow-2xl">
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-4 right-4 cursor-pointer rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-200"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <span className="inline-block rounded-full bg-red-500/20 px-3 py-1 text-sm font-semibold text-red-400">
          {errorName}
        </span>

        <p className="text-2xl font-semibold text-white">
          {error.message || 'An unexpected error occurred.'}
        </p>

        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
        >
          Try again
        </button>

        {frames.length > 0 && (
          <details open className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-neutral-400 select-none">
              <svg
                className="size-4 transition-transform group-open:rotate-90"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
              Stack Trace
            </summary>
            <ul className="mt-3 space-y-1">
              {frames.map((frame, i) => (
                <li
                  key={i}
                  className={`rounded px-3 py-1.5 text-sm ${
                    frame.isApp
                      ? 'bg-neutral-800/50 text-neutral-200'
                      : 'text-neutral-500'
                  }`}
                >
                  <span className="font-semibold">{frame.functionName}</span>
                  {frame.file && (
                    <span className="ml-2 text-neutral-500">
                      {frame.file}
                      {frame.line != null && `:${frame.line}`}
                      {frame.column != null && `:${frame.column}`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-neutral-600">
              Check browser devtools console for the source-mapped stack trace.
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
