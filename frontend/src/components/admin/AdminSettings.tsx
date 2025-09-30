import React, { useState, useEffect } from 'react';
import { getAdminSettings, updateAdminSetting } from '../../services/api';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      setSettings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    await updateSetting(key, newValue);
  };

  const handleValueChange = async (key: string, newValue: string) => {
    await updateSetting(key, newValue);
  };

  const updateSetting = async (key: string, value: string) => {
    setSaving(key);
    setSuccessMessage(null);
    try {
      await updateAdminSetting(key, value);
      
      // Update local state
      setSettings((prev: any) => ({
        ...prev,
        [key]: {
          ...prev[key],
          value
        }
      }));
      
      setSuccessMessage(`Setting "${key}" updated successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to update setting "${key}"`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400 glow-text">
          System Settings
        </h1>
        <button
          onClick={loadSettings}
          className="btn-terminal-secondary text-sm"
        >
          Refresh Settings
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-green-500 font-bold">
            LOADING SETTINGS<span className="blink">█</span>
          </span>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border-2 border-red-700 rounded-lg p-6 text-center">
          <h3 className="text-red-500 font-bold text-xl mb-2">ERROR</h3>
          <p className="text-red-400">{error}</p>
        </div>
      ) : settings ? (
        <div className="space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-900/20 border-2 border-green-700 rounded-lg p-4">
              <p className="text-green-400">{successMessage}</p>
            </div>
          )}
          
          {/* Settings Cards */}
          <div className="card-terminal p-6">
            <h3 className="text-green-500 font-bold mb-6">Challenge Settings</h3>
            
            <div className="space-y-6">
              {/* Challenge Enabled */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-green-300 font-bold">Challenge Enabled</h4>
                  <p className="text-sm text-green-600 mt-1">
                    {settings.challenge_enabled.description}
                  </p>
                </div>
                
                <button
                  onClick={() => handleToggle('challenge_enabled', settings.challenge_enabled.value)}
                  disabled={saving === 'challenge_enabled'}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    settings.challenge_enabled.value === 'true'
                      ? 'bg-green-600'
                      : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      settings.challenge_enabled.value === 'true' 
                        ? 'translate-x-6' 
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Registration Enabled */}
              <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                <div>
                  <h4 className="text-green-300 font-bold">Registration Enabled</h4>
                  <p className="text-sm text-green-600 mt-1">
                    {settings.registration_enabled.description}
                  </p>
                </div>
                
                <button
                  onClick={() => handleToggle('registration_enabled', settings.registration_enabled.value)}
                  disabled={saving === 'registration_enabled'}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    settings.registration_enabled.value === 'true'
                      ? 'bg-green-600'
                      : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      settings.registration_enabled.value === 'true' 
                        ? 'translate-x-6' 
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Max Queries Per User */}
              <div className="pt-4 border-t border-dark-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-green-300 font-bold">Max Queries Per User</h4>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.max_queries_per_user.value}
                      onChange={(e) => handleValueChange('max_queries_per_user', e.target.value)}
                      min="1"
                      max="10000"
                      className="w-24 bg-black border-2 border-green-700 rounded px-3 py-1 text-green-300 text-sm focus:outline-none focus:border-green-500"
                    />
                    {saving === 'max_queries_per_user' && (
                      <div className="absolute right-2 top-2">
                        <svg className="animate-spin h-4 w-4 text-green-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-green-600">
                  {settings.max_queries_per_user.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Admin Actions */}
          <div className="card-terminal p-6">
            <h3 className="text-red-500 font-bold mb-6">Admin Actions</h3>
            
            <div className="space-y-4">
              <button
                className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all user progress? This cannot be undone.')) {
                    alert('This would reset all user progress in a real implementation');
                  }
                }}
              >
                Reset All User Progress
              </button>
              
              <button
                className="w-full bg-yellow-900 hover:bg-yellow-800 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all query logs? This cannot be undone.')) {
                    alert('This would clear all query logs in a real implementation');
                  }
                }}
              >
                Clear All Query Logs
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-green-600">
          No settings found. Please check the database configuration.
        </div>
      )}
    </div>
  );
};