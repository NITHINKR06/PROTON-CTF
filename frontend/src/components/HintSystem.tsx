import React, { useState, useEffect } from 'react';
import { getHints, unlockHint } from '../services/api';
import type { Hint } from '../types';

export const HintSystem: React.FC = () => {
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    loadHints();
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadHints = async () => {
    try {
      const hintsData = await getHints();
      setHints(hintsData);
    } catch (error) {
      console.error('Failed to load hints:', error);
    }
  };

  const handleUnlock = async (hintId: number) => {
    setLoading(true);
    try {
      const updatedHints = await unlockHint(hintId);
      setHints(updatedHints);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to unlock hint');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (unlocksAt: number) => {
    const seconds = Math.max(0, Math.ceil((unlocksAt - now) / 1000));
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card-terminal">
      <h2 className="text-xl font-bold text-green-400 mb-4 glow-text flex items-center gap-2">
        <span className="text-green-500">▶</span> HINT SYSTEM
      </h2>

      <div className="space-y-3">
        {hints.map((hint, index) => (
          <div
            key={hint.id}
            className={`border-2 rounded p-3 transition-all ${
              hint.unlocked
                ? 'border-yellow-500 bg-yellow-900/10'
                : 'border-green-900 bg-black'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-green-400 mb-1 flex items-center gap-2">
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border-2 ${
                    hint.unlocked ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-black text-green-500 border-green-500'
                  }`}>
                    {index + 1}
                  </span>
                  {hint.title}
                </h3>
                
                {hint.unlocked ? (
                  <p className="text-green-300 text-sm mt-2 font-mono">{hint.content}</p>
                ) : hint.unlocksAt && hint.unlocksAt > now ? (
                  <p className="text-green-700 text-sm mt-2">
                    🔒 Unlocks in {formatTimeRemaining(hint.unlocksAt)}
                  </p>
                ) : (
                  <p className="text-green-700 text-sm mt-2">
                    🔓 Click to unlock
                  </p>
                )}
              </div>

              {!hint.unlocked && (!hint.unlocksAt || hint.unlocksAt <= now) && (
                <button
                  onClick={() => handleUnlock(hint.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 text-black text-sm font-bold rounded"
                >
                  UNLOCK
                </button>
              )}

              {hint.unlocked && (
                <span className="text-yellow-500 text-xl">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};