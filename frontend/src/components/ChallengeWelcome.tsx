import React from 'react';
import { useChallengeState } from '../hooks/useChallengeState';

interface ChallengeWelcomeProps {
  onStart: () => void;
}

export const ChallengeWelcome: React.FC<ChallengeWelcomeProps> = ({ onStart }) => {
  const { challengeState, startChallengeTimer } = useChallengeState();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    
    try {
      await startChallengeTimer();
      onStart();
    } catch (err: any) {
      setError(err.message || 'Failed to start challenge');
    } finally {
      setLoading(false);
    }
  };

  if (challengeState.loading) {
    return (
      <div className="terminal-window h-full flex items-center justify-center">
        <div className="text-green-500 font-bold text-xl">
          Loading<span className="blink">█</span>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-window h-full">
      <div className="terminal-header">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-green-400 font-bold">SQL CTF CHALLENGE</span>
        <div className="w-6"></div>
      </div>

      <div className="terminal-body p-8 flex flex-col items-center justify-center">
        <pre className="text-green-500 text-xs sm:text-sm md:text-base glow-text mb-8">
{`
███████╗ ██████╗ ██╗         ██████╗████████╗███████╗
██╔════╝██╔═══██╗██║        ██╔════╝╚══██╔══╝██╔════╝
███████╗██║   ██║██║        ██║        ██║   █████╗  
╚════██║██║▄▄ ██║██║        ██║        ██║   ██╔══╝  
███████║╚██████╔╝███████╗   ╚██████╗   ██║   ██║     
╚══════╝ ╚══▀▀═╝ ╚══════╝    ╚═════╝   ╚═╝   ╚═╝     
`}
        </pre>

        <h1 className="text-3xl font-bold text-green-400 mb-4 glow-text text-center">
          Welcome to the SQL Injection Challenge
        </h1>

        <div className="max-w-2xl text-center mb-8">
          <p className="text-green-300 mb-4">
            Your mission is to exploit SQL injection vulnerabilities to extract a 
            hidden flag from the database. The clock starts when you're ready.
          </p>
          
          <div className="bg-black/50 border-2 border-green-700 rounded-lg p-4 text-left mb-6">
            <h3 className="text-green-400 font-bold mb-2">⚠️ MISSION PARAMETERS</h3>
            <ul className="text-green-500 space-y-1 text-sm">
              <li>• You must find the hidden FLAG{`...`} in the database</li>
              <li>• Once you start, your time will be recorded</li>
              <li>• Submit the exact flag to complete the challenge</li>
              <li>• Faster times earn higher rankings</li>
              <li>• Hints are available but with time delays</li>
            </ul>
          </div>
          
          {challengeState.isStarted && !challengeState.completed ? (
            <div className="bg-green-900/30 border-2 border-green-700 rounded-lg p-4 mb-6">
              <p className="text-green-400">
                Challenge already in progress! Continue your mission.
              </p>
            </div>
          ) : challengeState.completed ? (
            <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-400 font-bold mb-2">🏆 CHALLENGE COMPLETED!</h3>
              <p className="text-green-300">
                You've already solved this challenge with a time of{' '}
                <span className="text-yellow-400 font-bold">
                  {formatTime(
                    challengeState.completionTime && challengeState.startTime
                      ? challengeState.completionTime - challengeState.startTime
                      : 0
                  )}
                </span>
              </p>
              <p className="text-green-500 mt-2">
                You can review the challenge or check the leaderboard.
              </p>
            </div>
          ) : null}

          {error && (
            <div className="bg-red-900/30 border-2 border-red-700 rounded-lg p-4 mb-6 text-red-400">
              {error}
            </div>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-terminal text-xl py-3 px-8"
        >
          {loading ? (
            <span>INITIALIZING<span className="blink">█</span></span>
          ) : challengeState.isStarted ? (
            'CONTINUE MISSION'
          ) : challengeState.completed ? (
            'REVIEW CHALLENGE'
          ) : (
            'START MISSION'
          )}
        </button>
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