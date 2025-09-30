import React from 'react';

interface AdminSidebarProps {
  activeSection: 'dashboard' | 'users' | 'queries' | 'settings';
  onSectionChange: (section: 'dashboard' | 'users' | 'queries' | 'settings') => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  return (
    <div className="w-64 bg-black border-r-2 border-green-900">
      <div className="p-4">
        <h2 className="text-red-500 font-bold text-xl glow-text mb-6">
          ADMIN PANEL
        </h2>
        
        <nav className="space-y-2">
          <button
            onClick={() => onSectionChange('dashboard')}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${
              activeSection === 'dashboard'
                ? 'bg-green-800 text-white'
                : 'text-green-500 hover:bg-green-900/50'
            }`}
          >
            📊 Dashboard
          </button>
          
          <button
            onClick={() => onSectionChange('users')}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${
              activeSection === 'users'
                ? 'bg-green-800 text-white'
                : 'text-green-500 hover:bg-green-900/50'
            }`}
          >
            👥 Users
          </button>
          
          <button
            onClick={() => onSectionChange('queries')}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${
              activeSection === 'queries'
                ? 'bg-green-800 text-white'
                : 'text-green-500 hover:bg-green-900/50'
            }`}
          >
            🔍 SQL Queries
          </button>
          
          <button
            onClick={() => onSectionChange('settings')}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${
              activeSection === 'settings'
                ? 'bg-green-800 text-white'
                : 'text-green-500 hover:bg-green-900/50'
            }`}
          >
            ⚙️ Settings
          </button>
        </nav>
      </div>
    </div>
  );
};