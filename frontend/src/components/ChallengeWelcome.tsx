import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChallengeState } from '../hooks/useChallengeState';

interface ChallengeWelcomeProps {
  onStart: () => void;
}

export const ChallengeWelcome: React.FC<ChallengeWelcomeProps> = ({ onStart }) => {
  const { user } = useAuth();
  const { challengeState, startChallengeTimer } = useChallengeState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typedText, setTypedText] = useState('');
  
  const welcomeText = 'SQL INJECTION CHALLENGE TERMINAL';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < welcomeText.length) {
        setTypedText(prev => prev + welcomeText.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="terminal-window h-full">
      <div className="terminal-header">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-green-400 font-bold">SQL CTF</span>
        <div className="w-4"></div>
      </div>

      <div className="terminal-body p-6 flex flex-col items-center justify-center">
        {/* Logo/Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-400 glow-text text-center">
            {typedText}<span className="blink">█</span>
          </h1>
        </div>
        
        {/* System Info */}
        <div className="bg-black/30 border border-green-700 rounded-lg p-4 mb-8 w-full max-w-xl">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-green-600">USER</div>
              <div className="text-green-400 font-bold">{user?.username || 'guest'}</div>
            </div>
            <div>
              <div className="text-green-600">ACCESS</div>
              <div className="text-green-400 font-bold">{user?.isAdmin ? 'ADMIN' : 'USER'}</div>
            </div>
            <div>
              <div className="text-green-600">CHALLENGE</div>
              <div className="text-green-400 font-bold">SQL INJECTION</div>
            </div>
            <div>
              <div className="text-green-600">POINTS</div>
              <div className="text-green-400 font-bold">500</div>
            </div>
          </div>
        </div>
        
        {/* Mission Brief */}
        <div className="bg-black/30 border border-green-700 rounded-lg p-4 mb-8 w-full max-w-xl">
          <h2 className="text-green-500 font-bold mb-2 border-b border-green-800 pb-1">MISSION BRIEF</h2>
          <p className="text-green-300 mb-3">
            Your objective is to extract the hidden FLAG from a vulnerable database using SQL injection techniques.
          </p>
          <ul className="space-y-1 text-sm text-green-400">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">►</span>
              Find and exploit SQL injection vulnerabilities
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">►</span>
              Discover hidden database tables
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">►</span>
              Extract and submit the FLAG to complete the challenge
            </li>
          </ul>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-6 text-red-400 w-full max-w-xl">
            {error}
          </div>
        )}
        
        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-terminal px-8 py-3 text-lg"
        >
          {loading ? (
            <>
              INITIALIZING<span className="blink">█</span>
            </>
          ) : challengeState.isStarted ? (
            'CONTINUE MISSION'
          ) : (
            'START CHALLENGE'
          )}
        </button>
        
        {/* Status indicators */}
        <div className="mt-8 flex gap-6 text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-green-500">System Ready</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-yellow-500">Database Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};