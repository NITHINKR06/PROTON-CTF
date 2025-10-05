import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // For login, use the usernameOrEmail field
        await login(usernameOrEmail, password);
      } else {
        // For registration, use separate username and email fields
        if (!email) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        await register(username, email, password);
      }
      navigate('/challenge');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 scanline">
      <div className="terminal-window max-w-2xl w-full animate-slide-in">
        <div className="terminal-header">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors"></div>
          </div>
          <span className="text-white font-bold">PROTON Terminal - Authentication</span>
          <div className="w-16"></div>
        </div>

        <div className="terminal-body space-y-6 p-8">
          {/* ASCII Art Header with gradient effect */}
          <pre className="gradient-text text-xs font-bold text-center select-none">
{`
██████╗ ██████╗  ██████╗ ████████╗ ██████╗ ███╗   ██╗
██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗████╗  ██║
██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║██╔██╗ ██║
██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║██║╚██╗██║
██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝██║ ╚████║
╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═══╝
`}
          </pre>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold gradient-text">
              Association Terminal
            </h1>
            <p className="text-slate-600">
              {isLogin ? 'Welcome back! Login to continue' : 'Create an account to start the challenge'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              <div>
                <label className="block text-cyan-700 mb-2 font-bold text-sm">
                  <span className="terminal-prompt">$</span> USERNAME OR EMAIL
                </label>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="input-terminal"
                  placeholder="Enter username or email..."
                  required
                  autoComplete="username"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-cyan-700 mb-2 font-bold text-sm">
                    <span className="terminal-prompt">$</span> USERNAME
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-terminal"
                    placeholder="Enter username..."
                    required
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="block text-cyan-700 mb-2 font-bold text-sm">
                    <span className="terminal-prompt">$</span> EMAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-terminal"
                    placeholder="Enter email..."
                    required
                    autoComplete="email"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-cyan-700 mb-2 font-bold text-sm">
                <span className="terminal-prompt">$</span> PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-terminal"
                placeholder="Enter password..."
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg font-mono text-sm">
                <span className="font-bold">ERROR:</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-terminal w-full text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>PROCESSING...</span>
                </>
              ) : (
                isLogin ? 'LOGIN' : 'REGISTER'
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t-2 border-cyan-200">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                // Clear form fields when switching between login and register
                setUsernameOrEmail('');
                setUsername('');
                setEmail('');
                setPassword('');
              }}
              className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              {isLogin ? '→ Create new account' : '→ Already have an account?'}
            </button>
          </div>

          <div className="text-center text-xs text-slate-500 mt-4">
            <p>PROTON Terminal v1.0.0</p>
            <p>Type 'help' for available commands</p>
          </div>
        </div>
      </div>
    </div>
  );
};
