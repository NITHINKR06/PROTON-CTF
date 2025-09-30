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
      content: 'SQL Injection Challenge Terminal v2.0',
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
  const [flagInput, setFlagInput] = useState('');
  const [flagSubmitStatus, setFlagSubmitStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });
  
  const { challengeState, submitFlagAnswer } = useChallengeState();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
              return '[FLAG FOUND! Submit your answer below]';
            }
            return cell;
          })
        );
      }
      
      setLines(prev => [...prev, {
        type: result.flagFound ? 'success' : 'output',
        content: result.flagFound 
          ? `🎉 FLAG PATTERN DETECTED! Submit the exact flag below to claim points.` 
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

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;
    
    setFlagSubmitStatus({ message: 'Verifying flag...', type: null });
    
    try {
      const result = await submitFlagAnswer(flagInput.trim());
      
      if (result.success) {
        setFlagSubmitStatus({ 
          message: result.message, 
          type: 'success' 
        });
        setFlagInput('');
      } else {
        setFlagSubmitStatus({ 
          message: result.message, 
          type: 'error' 
        });
      }
    } catch (error: any) {
      setFlagSubmitStatus({ 
        message: 'Failed to submit flag', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="terminal-window h-full">
      <div className="terminal-header">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-green-400 font-bold">root@sqlctf:~$</span>
        <button
          onClick={clearTerminal}
          className="text-green-500 hover:text-green-400 text-sm"
        >
          CLEAR
        </button>
      </div>

      <div 
        className="terminal-body overflow-auto" 
        style={{ minHeight: '500px', maxHeight: '70vh' }}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-2 mb-4">
          {lines.map((line, index) => (
            <div key={index}>
              {line.type === 'input' && (
                <div className="flex gap-2">
                  <span className="terminal-prompt">root@sqlctf:~$</span>
                  <span className="text-green-300">{line.content}</span>
                </div>
              )}
              
              {line.type === 'output' && (
                <div className="text-green-400">{line.content}</div>
              )}
              
              {line.type === 'system' && (
                <div className="text-green-600">[SYSTEM] {line.content}</div>
              )}
              
              {line.type === 'error' && (
                <div className="text-red-400">
                  <span className="font-bold">[ERROR]</span> {line.content}
                </div>
              )}
              
              {line.type === 'success' && (
                <div className="text-yellow-400 font-bold glow-text">
                  [SUCCESS] {line.content}
                </div>
              )}

              {line.data && line.data.rows.length > 0 && (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-green-700">
                        {line.data.columns.map((col, i) => (
                          <th key={i} className="text-left px-3 py-2 text-green-500 font-bold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {line.data.rows.map((row, i) => (
                        <tr key={i} className="border-b border-green-900">
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 text-green-300">
                              {cell === null ? (
                                <span className="text-green-700 italic">NULL</span>
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-green-700 text-xs mt-2">
                    → {line.data.rowCount} row(s) returned
                  </div>
                </div>
              )}

              {line.data && line.data.rows.length === 0 && (
                <div className="text-green-700 italic mt-2">→ Query returned no results</div>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <span className="terminal-prompt">root@sqlctf:~$</span>
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
          {loading && <span className="text-green-500 blink">█</span>}
        </form>

        {/* Flag Submission Form */}
        {!challengeState.completed && (
          <div className="mt-8 border-t-2 border-green-700 pt-4">
            <h3 className="text-green-400 font-bold mb-2">SUBMIT FLAG</h3>
            <form onSubmit={handleFlagSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                className="bg-black border-2 border-green-700 rounded px-3 py-2 text-green-300 w-full focus:outline-none focus:border-green-500"
                placeholder="Enter flag (e.g., FLAG{...})"
                autoComplete="off"
                disabled={challengeState.completed}
              />
              <button
                type="submit"
                className="bg-green-700 text-black font-bold px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!flagInput.trim() || challengeState.completed}
              >
                VERIFY
              </button>
            </form>
            {flagSubmitStatus.message && (
              <div className={`mt-2 text-sm ${
                flagSubmitStatus.type === 'success' 
                ? 'text-yellow-400' 
                : flagSubmitStatus.type === 'error' 
                ? 'text-red-400' 
                : 'text-green-500'
              }`}>
                {flagSubmitStatus.message}
              </div>
            )}
          </div>
        )}

        {/* Challenge Completed Message */}
        {challengeState.completed && (
          <div className="mt-8 border-2 border-yellow-500 rounded-lg bg-yellow-900/20 p-4">
            <h3 className="text-yellow-400 font-bold text-xl mb-2">🏆 CHALLENGE COMPLETED!</h3>
            <p className="text-green-300 mb-2">
              Congratulations! You've successfully solved the SQL injection challenge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="bg-black/50 border border-green-700 rounded px-4 py-2">
                <span className="text-green-500 text-sm">SCORE</span>
                <p className="text-yellow-400 font-bold text-xl">{challengeState.score} points</p>
              </div>
              <div className="bg-black/50 border border-green-700 rounded px-4 py-2">
                <span className="text-green-500 text-sm">TIME</span>
                <p className="text-yellow-400 font-bold text-xl">
                  {formatTime(
                    challengeState.completionTime && challengeState.startTime
                      ? challengeState.completionTime - challengeState.startTime
                      : 0
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
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