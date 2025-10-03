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
      <h2 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
        <span className="text-cyan-500">💡</span> HINT SYSTEM
      </h2>

      <div className="space-y-3">
        {hints.map((hint, index) => (
          <div
            key={hint.id}
            className={`border rounded-lg p-4 transition-all ${
              hint.unlocked
                ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50'
                : 'border-cyan-200 bg-white/60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-cyan-700 mb-1 flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    hint.unlocked 
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-md' 
                      : 'bg-white border-2 border-cyan-400 text-cyan-600'
                  }`}>
                    {index + 1}
                  </span>
                  {hint.title}
                </h3>
                
                {hint.unlocked ? (
                  <p className="text-slate-700 text-sm mt-2 font-mono bg-white/80 rounded p-2">
                    {hint.content}
                  </p>
                ) : hint.unlocksAt && hint.unlocksAt > now ? (
                  <p className="text-slate-500 text-sm mt-2 flex items-center gap-1">
                    <span>🔒</span> Unlocks in {formatTimeRemaining(hint.unlocksAt)}
                  </p>
                ) : (
                  <p className="text-cyan-600 text-sm mt-2 flex items-center gap-1">
                    <span>🔓</span> Click to unlock this hint
                  </p>
                )}
              </div>

              {!hint.unlocked && (!hint.unlocksAt || hint.unlocksAt <= now) && (
                <button
                  onClick={() => handleUnlock(hint.id)}
                  disabled={loading}
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-bold rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:transform-none"
                >
                  UNLOCK
                </button>
              )}

              {hint.unlocked && (
                <span className="text-amber-500 text-xl">✨</span>
              )}
            </div>
          </div>
        ))}

        {hints.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No hints available yet.</p>
            <p className="text-xs mt-2">Hints will appear as you progress through the challenge.</p>
          </div>
        )}
      </div>
    </div>
  );
};
