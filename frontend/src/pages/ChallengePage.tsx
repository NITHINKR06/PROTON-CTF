import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ChallengeProvider } from '../hooks/useChallengeState';
import { useChallengeState } from '../hooks/useChallengeState';
import { Terminal } from '../components/Terminal';
import { Instructions } from '../components/Instructions';
import { HintSystem } from '../components/HintSystem';
import { FlagSubmission } from '../components/FlagSubmission';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { ChallengeWelcome } from '../components/ChallengeWelcome';

const ChallengeContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { challengeState } = useChallengeState();
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  // Update elapsed time every second
  useEffect(() => {
    if (challengeState.isStarted && !challengeState.completed) {
      const interval = setInterval(() => {
        if (challengeState.startTime) {
          const elapsed = Date.now() - challengeState.startTime;
          const totalSeconds = Math.floor(elapsed / 1000);
          const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
          const seconds = (totalSeconds % 60).toString().padStart(2, '0');
          setElapsedTime(`${minutes}:${seconds}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [challengeState.isStarted, challengeState.startTime, challengeState.completed]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    navigate('/');
    return null;
  }

  // If challenge is not started or they're coming back, show welcome screen
  if (!showChallenge) {
    return <ChallengeWelcome onStart={() => setShowChallenge(true)} />;
  }

  return (
    <>
      {/* Header */}
      <div className="bg-gray-50 border-b-2 border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg text-gray-900">
              PROTON_TERMINAL
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-700 font-medium">USER: {user.username}</span>
            {challengeState.isStarted && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-gray-700 font-mono font-bold">
                  TIME: {elapsedTime}
                </span>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {user.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-1.5 text-sm font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ADMIN PANEL
              </button>
            )}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="btn-terminal-secondary text-sm"
            >
              LEADERBOARD
            </button>
            <button
              onClick={handleLogout}
              className="btn-terminal-secondary text-sm"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Control Panel */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors border-2 ${
              showInstructions
                ? 'bg-lime-500 text-white border-lime-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            📖 INSTRUCTIONS
          </button>
          <button
            onClick={() => setShowHints(!showHints)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors border-2 ${
              showHints
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            💡 HINTS
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          {(showInstructions || showHints) && (
            <div className="lg:col-span-4 space-y-6">
              {showInstructions && <Instructions />}
              {showHints && <HintSystem />}
            </div>
          )}

          {/* Main Content Area */}
          <div className={showInstructions || showHints ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <div className="space-y-6">
              {/* Terminal */}
              <Terminal />
              
              {/* Flag Submission */}
              <FlagSubmission />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </>
  );
};

export const ChallengePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <ChallengeProvider>
      <div className="min-h-screen bg-white">
        <ChallengeContent />
      </div>
    </ChallengeProvider>
  );
};
