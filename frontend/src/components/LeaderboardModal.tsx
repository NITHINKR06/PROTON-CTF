import React, { useState, useEffect } from 'react';
import { getScoreboard } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import type { ScoreboardEntry } from '../types';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [scores, setScores] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { lastMessage } = useWebSocket('/ws');

  useEffect(() => {
    loadScoreboard();
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'scoreboard_update') {
      setScores(lastMessage.data);
    }
  }, [lastMessage]);

  const loadScoreboard = async () => {
    try {
      const data = await getScoreboard();
      setScores(data);
    } catch (error) {
      console.error('Failed to load scoreboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="terminal-window max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <div className="terminal-header">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-green-400 font-bold">LEADERBOARD</span>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400 font-bold"
          >
            ✕
          </button>
        </div>

        <div className="terminal-body p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-green-500 font-bold">LOADING<span className="blink">█</span></span>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-green-600 mb-2">No solves yet.</p>
              <p className="text-green-700 text-sm">Be the first to capture the flag!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-green-500 font-bold mb-4 text-lg glow-text">
                ═══ TOP HACKERS ═══
              </div>
              {scores.map((entry) => (
                <div
                  key={entry.username}
                  className={`flex items-center gap-3 p-3 rounded border-2 transition-colors ${
                    entry.rank <= 3
                      ? 'border-yellow-500 bg-yellow-900/10'
                      : 'border-green-900 bg-black'
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded font-bold flex-shrink-0 ${
                    entry.rank === 1
                      ? 'bg-yellow-500 text-black text-xl'
                      : entry.rank === 2
                      ? 'bg-gray-400 text-black'
                      : entry.rank === 3
                      ? 'bg-orange-600 text-white'
                      : 'bg-green-900 text-green-400'
                  }`}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-green-400 truncate">
                      {entry.username}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-green-600">
                      <span>{formatDate(entry.solvedAt)}</span>
                      {entry.timeTaken && (
                        <span className="bg-green-900/50 px-2 py-0.5 rounded text-green-400">
                          ⏱️ {formatTime(entry.timeTaken)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-400 font-bold">
                    <span className="text-lg">{entry.points}</span>
                    <span className="text-xs">pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};