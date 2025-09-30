import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ChallengeProvider } from '../hooks/useChallengeState';
import { useChallengeState } from '../hooks/useChallengeState';
import { Terminal } from '../components/Terminal';
import { Instructions } from '../components/Instructions';
import { HintSystem } from '../components/HintSystem';
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
      <div className="border-b-2 border-green-500 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-green-400 font-bold text-lg glow-text">
              SQL_CTF_TERMINAL
            </span>
            <span className="text-green-700">|</span>
            <span className="text-green-600">USER: {user.username}</span>
            {challengeState.isStarted && (
              <>
                <span className="text-green-700">|</span>
                <span className="text-green-600">
                  TIME: {formatElapsedTime(challengeState.startTime)}
                </span>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {user.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="btn-terminal-secondary text-sm bg-red-900/50 border-red-700"
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
            className={`px-3 py-1 text-sm font-bold rounded border-2 transition-colors ${
              showInstructions
                ? 'bg-green-600 text-black border-green-600'
                : 'bg-black text-green-500 border-green-500 hover:bg-green-900'
            }`}
          >
            INSTRUCTIONS
          </button>
          <button
            onClick={() => setShowHints(!showHints)}
            className={`px-3 py-1 text-sm font-bold rounded border-2 transition-colors ${
              showHints
                ? 'bg-green-600 text-black border-green-600'
                : 'bg-black text-green-500 border-green-500 hover:bg-green-900'
            }`}
          >
            HINTS
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

          {/* Terminal */}
          <div className={showInstructions || showHints ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <Terminal />
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
      <div className="min-h-screen scanline">
        <ChallengeContent />
      </div>
    </ChallengeProvider>
  );
};

// Helper to format elapsed time
function formatElapsedTime(startTime: number | null): string {
  if (!startTime) return "00:00";
  
  const elapsed = Date.now() - startTime;
  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  
  return `${minutes}:${seconds}`;
}