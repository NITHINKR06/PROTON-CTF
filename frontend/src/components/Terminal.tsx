import React, { useState, useRef, useEffect } from 'react';
import { executeQuery } from '../services/api';
import { useChallengeState } from '../hooks/useChallengeState';
import type { QueryResult } from '../types';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  content: string;
  data?: QueryResult;
  timestamp: Date;
}

export const Terminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: 'system',
      content: 'PROTON Association Terminal v1.0.0',
      timestamp: new Date(),
    },
    {
      type: 'system',
      content: 'Type SQL queries to interact with the vulnerable database.',
      timestamp: new Date(),
    },
    {
      type: 'system',
      content: 'Your mission: Find the hidden FLAG{...} then submit it using the form below.',
      timestamp: new Date(),
    },
    {
      type: 'output',
      content: '━'.repeat(70),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { challengeState } = useChallengeState();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Challenge timer is now started automatically on login
  // No need to auto-start here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput('');
    setLoading(true);

    // Add to history
    setHistory(prev => [...prev, query]);
    setHistoryIndex(-1);

    // Add input to terminal
    setLines(prev => [...prev, {
      type: 'input',
      content: query,
      timestamp: new Date(),
    }]);

    try {
      const result = await executeQuery(query);
      
      // Don't display the flag directly in the output
      let sanitizedResult = { ...result };
      
      // Hide flag in output
      if (result.flagFound) {
        sanitizedResult.rows = result.rows.map(row => 
          row.map(cell => {
            if (typeof cell === 'string' && cell.includes('FLAG{')) {
              return '🔐 [FLAG DETECTED! Submit below to verify]';
            }
            return cell;
          })
        );
      }
      
      setLines(prev => [...prev, {
        type: result.flagFound ? 'success' : 'output',
        content: result.flagFound 
          ? `🎯 FLAG PATTERN DETECTED! Submit the exact flag below to claim your points.` 
          : `Query executed successfully (${result.executionTime}ms)`,
        data: sanitizedResult,
        timestamp: new Date(),
      }]);

    } catch (error: any) {
      setLines(prev => [...prev, {
        type: 'error',
        content: error.response?.data?.error || 'Query execution failed',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const clearTerminal = () => {
    setLines([{
      type: 'system',
      content: 'Terminal cleared',
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="terminal-window h-full animate-slide-in">
      <div className="terminal-header">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"></div>
          <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors"></div>
        </div>
        <span className="text-white font-bold">proton@kali:~$</span>
        <button
          onClick={clearTerminal}
          className="text-white/90 hover:text-white text-sm font-semibold transition-colors"
        >
          CLEAR
        </button>
      </div>

      <div 
        className="terminal-body overflow-auto rounded-b-2xl" 
        style={{ minHeight: '500px', maxHeight: '70vh' }}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-2 mb-4">
          {lines.map((line, index) => (
            <div key={index} className="animate-slide-in">
              {line.type === 'input' && (
                <div className="flex gap-2">
                  <span className="terminal-prompt">proton@kali:~$</span>
                  <span className="text-blue-600 font-semibold">{line.content}</span>
                </div>
              )}
              
              {line.type === 'output' && (
                <div className="text-slate-600">{line.content}</div>
              )}
              
              {line.type === 'system' && (
                <div className="text-cyan-600 font-medium">[SYSTEM] {line.content}</div>
              )}
              
              {line.type === 'error' && (
                <div className="text-rose-600">
                  <span className="font-bold">[ERROR]</span> {line.content}
                </div>
              )}
              
              {line.type === 'success' && (
                <div className="text-emerald-600 font-bold glow-text">
                  [SUCCESS] {line.content}
                </div>
              )}

              {line.data && line.data.rows.length > 0 && (
                <div className="mt-2 overflow-x-auto">
                  <table className="terminal-table">
                    <thead>
                      <tr>
                        {line.data.columns.map((col, i) => (
                          <th key={i}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {line.data.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j}>
                              {cell === null ? (
                                <span className="text-slate-400 italic">NULL</span>
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-slate-500 text-xs mt-2">
                    → {line.data.rowCount} row(s) returned
                  </div>
                </div>
              )}

              {line.data && line.data.rows.length === 0 && (
                <div className="text-slate-500 italic mt-2">→ Query returned no results</div>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <span className="terminal-prompt">proton@kali:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            disabled={loading || challengeState.completed}
            placeholder={
              challengeState.completed 
                ? 'Challenge completed!' 
                : loading 
                ? 'Executing...' 
                : 'Enter SQL query...'
            }
            autoComplete="off"
          />
          {loading && <span className="loading-spinner"></span>}
        </form>

      </div>
    </div>
  );
};

// Helper function to format time in minutes and seconds
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}
