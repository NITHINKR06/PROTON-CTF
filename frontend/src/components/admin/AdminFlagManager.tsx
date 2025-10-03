import React, { useState, useEffect } from 'react';
import { getAdminFlag, updateAdminFlag } from '../../services/api';

export const AdminFlagManager: React.FC = () => {
  const [currentFlag, setCurrentFlag] = useState('');
  const [newFlag, setNewFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCurrentFlag();
  }, []);

  const loadCurrentFlag = async () => {
    try {
      const response = await getAdminFlag();
      setCurrentFlag(response.flag);
      setNewFlag(response.flag);
    } catch (error) {
      console.error('Failed to load current flag:', error);
      setMessage({ type: 'error', text: 'Failed to load current flag' });
    }
  };

  const handleUpdateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFlag.trim()) {
      setMessage({ type: 'error', text: 'Flag cannot be empty' });
      return;
    }

    if (!newFlag.startsWith('FLAG{') || !newFlag.endsWith('}')) {
      setMessage({ type: 'error', text: 'Flag must be in format FLAG{...}' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await updateAdminFlag(newFlag.trim());
      setCurrentFlag(response.flag);
      setMessage({ type: 'success', text: 'Flag updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update flag' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNewFlag(currentFlag);
    setMessage(null);
  };

  return (
    <div className="card-terminal p-6">
      <h2 className="text-xl font-bold text-green-400 mb-4 glow-text">
        FLAG MANAGEMENT
      </h2>

      <div className="space-y-4">
        {/* Current Flag Display */}
        <div className="bg-black/50 border border-green-700 rounded-lg p-4">
          <label className="block text-green-500 text-sm font-bold mb-2">
            Current Flag:
          </label>
          <div className="font-mono text-white bg-black/70 p-3 rounded border border-green-900">
            {currentFlag || 'Loading...'}
          </div>
        </div>

        {/* Update Flag Form */}
        <form onSubmit={handleUpdateFlag} className="space-y-4">
          <div>
            <label className="block text-green-500 text-sm font-bold mb-2">
              New Flag:
            </label>
            <input
              type="text"
              value={newFlag}
              onChange={(e) => setNewFlag(e.target.value)}
              className="w-full px-4 py-2 bg-black/70 border border-green-700 rounded-lg text-white font-mono focus:outline-none focus:border-green-500 transition-colors"
              placeholder="FLAG{...}"
              disabled={loading}
            />
            <p className="text-xs text-green-600 mt-1">
              Format: FLAG{'{'}YOUR_CUSTOM_FLAG_HERE{'}'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || newFlag === currentFlag}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'UPDATING...' : 'UPDATE FLAG'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading || newFlag === currentFlag}
              className="px-6 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              RESET
            </button>
          </div>
        </form>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg font-medium ${
            message.type === 'success' 
              ? 'bg-green-900/50 border border-green-600 text-green-400' 
              : 'bg-red-900/50 border border-red-600 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
          <p className="text-yellow-500 text-sm">
            <strong>⚠️ Warning:</strong> Changing the flag will affect all users. 
            Users who have already completed the challenge with the old flag will remain marked as completed.
            New submissions will be validated against the new flag.
          </p>
        </div>
      </div>
    </div>
  );
};
