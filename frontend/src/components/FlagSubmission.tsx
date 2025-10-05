import React, { useState } from 'react';
import { useChallengeState } from '../hooks/useChallengeState';

export const FlagSubmission: React.FC = () => {
  const [flagInput, setFlagInput] = useState('');
  const [flagSubmitStatus, setFlagSubmitStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });
  
  const { challengeState, submitFlagAnswer, startChallengeTimer } = useChallengeState();

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;
    
    // Check if challenge is started
    if (!challengeState.isStarted) {
      setFlagSubmitStatus({ 
        message: 'Starting challenge first...', 
        type: null 
      });
      
      try {
        await startChallengeTimer();
      } catch (err) {
        setFlagSubmitStatus({ 
          message: 'Failed to start challenge. Please try again.', 
          type: 'error' 
        });
        return;
      }
    }
    
    setFlagSubmitStatus({ message: 'Verifying flag...', type: null });
    
    try {
      const result = await submitFlagAnswer(flagInput.trim());
      
      if (result.success) {
        setFlagSubmitStatus({ 
          message: `✅ ${result.message}`, 
          type: 'success' 
        });
        setFlagInput('');
      } else if (result.isDummy) {
        // Special handling for dummy flag
        setFlagSubmitStatus({ 
          message: result.message, 
          type: 'error' 
        });
        // Clear the input so they try something else
        setFlagInput('');
      } else {
        setFlagSubmitStatus({ 
          message: `❌ ${result.message}`, 
          type: 'error' 
        });
      }
    } catch (error: any) {
      setFlagSubmitStatus({ 
        message: '❌ Failed to submit flag. Please try again.', 
        type: 'error' 
      });
    }
  };

  if (challengeState.completed) {
    return (
      <div className="glass rounded-xl p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-300">
        <h3 className="text-2xl font-bold mb-3 gradient-text">🏆 CHALLENGE COMPLETED!</h3>
        <p className="text-slate-700 mb-4">
          Congratulations! You've successfully solved the SQL injection challenge.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="glass rounded-lg px-4 py-3">
            <span className="text-cyan-600 text-sm font-medium">SCORE</span>
            <p className="text-2xl font-bold gradient-text">{challengeState.score} points</p>
          </div>
          <div className="glass rounded-lg px-4 py-3">
            <span className="text-cyan-600 text-sm font-medium">TIME</span>
            <p className="text-2xl font-bold gradient-text">
              {formatTime(
                challengeState.completionTime && challengeState.startTime
                  ? challengeState.completionTime - challengeState.startTime
                  : 0
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-cyan-700 font-bold text-lg mb-4 gradient-text">SUBMIT FLAG</h3>
      <form onSubmit={handleFlagSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            className="flex-1 px-4 py-2 bg-white/80 backdrop-blur border-2 border-cyan-300 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
            placeholder="Enter flag (e.g., FLAG{...})"
            autoComplete="off"
            disabled={challengeState.completed}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!flagInput.trim() || challengeState.completed}
          >
            VERIFY
          </button>
        </div>
        
        {flagSubmitStatus.message && (
          <div className={`text-sm font-medium ${
            flagSubmitStatus.type === 'success' 
            ? 'text-green-600' 
            : flagSubmitStatus.type === 'error' 
            ? 'text-red-600' 
            : 'text-cyan-600'
          }`}>
            {flagSubmitStatus.message}
          </div>
        )}
        
        {!challengeState.isStarted && (
          <div className="text-xs text-slate-500">
            Note: The timer has already started when you logged in.
          </div>
        )}
      </form>
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
