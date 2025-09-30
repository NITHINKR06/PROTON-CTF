import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminQueries } from '../components/admin/AdminQueries';
import { AdminSettings } from '../components/admin/AdminSettings';
import { getAdminStats } from '../services/api';

export const AdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'queries' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user?.isAdmin) {
      navigate('/challenge');
      return;
    }

    // Load initial stats
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col scanline">
      {/* Header */}
      <div className="border-b-2 border-green-500 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-red-500 font-bold text-lg glow-text">
              ADMIN_CONSOLE
            </span>
            <span className="text-green-700">|</span>
            <span className="text-green-600">ADMIN: {user.username}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/challenge')}
              className="btn-terminal-secondary text-sm"
            >
              EXIT ADMIN
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
      <div className="flex-1 flex">
        {/* Sidebar */}
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        {/* Content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-green-500 font-bold text-xl">
                LOADING<span className="blink">█</span>
              </span>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border-2 border-red-700 rounded-lg p-6 text-center">
              <h3 className="text-red-500 font-bold text-xl mb-2">ERROR</h3>
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadStats}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
              >
                RETRY
              </button>
            </div>
          ) : (
            <>
              {activeSection === 'dashboard' && <AdminDashboard stats={stats} />}
              {activeSection === 'users' && <AdminUsers />}
              {activeSection === 'queries' && <AdminQueries />}
              {activeSection === 'settings' && <AdminSettings />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};