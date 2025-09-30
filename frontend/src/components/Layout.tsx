import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              <h1 className="text-xl font-bold text-white">SQL CTF</h1>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-dark-900 rounded-lg">
                    <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="btn-secondary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-dark-800 border-t border-dark-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-dark-400 text-sm">
          <p>© 2024 SQL CTF Challenge. Built with React, TypeScript, and Tailwind CSS.</p>
        </div>
      </footer>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};