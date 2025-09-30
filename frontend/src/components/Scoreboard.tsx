import React, { useState, useEffect } from 'react';
import { getScoreboard } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import type { ScoreboardEntry } from '../types';

export const Scoreboard: React.FC = () => {
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

  return (
    <div className="card h-full">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        Leaderboard
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : scores.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-dark-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-dark-400">No solves yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {scores.map((entry) => (
            <div
              key={entry.username}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                entry.rank <= 3
                  ? 'bg-gradient-to-r from-primary-900/30 to-transparent border border-primary-700/50'
                  : 'bg-dark-900/50 hover:bg-dark-900'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
                entry.rank === 1
                  ? 'bg-yellow-500 text-yellow-900'
                  : entry.rank === 2
                  ? 'bg-gray-300 text-gray-700'
                  : entry.rank === 3
                  ? 'bg-orange-600 text-orange-100'
                  : 'bg-dark-700 text-dark-300'
              }`}>
                {entry.rank <= 3 ? (
                  <span>{['🥇', '🥈', '🥉'][entry.rank - 1]}</span>
                ) : (
                  <span>{entry.rank}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">
                  {entry.username}
                </div>
                <div className="text-xs text-dark-400">
                  {formatDate(entry.solvedAt)}
                </div>
              </div>

              <div className="flex items-center gap-1 text-primary-400 font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {entry.points}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};