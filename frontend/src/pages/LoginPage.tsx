import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
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
        await login(username, password);
      } else {
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
    <div className="min-h-screen flex items-center justify-center p-4 scanline">
      <div className="terminal-window max-w-2xl w-full">
        <div className="terminal-header">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-green-400 font-bold">SQL CTF Challenge - Login</span>
          <div className="w-16"></div>
        </div>

        <div className="terminal-body space-y-6 p-8">
          {/* ASCII Art Header */}
          <pre className="text-green-500 text-xs glow-text text-center">
{`
███████╗ ██████╗ ██╗         ██████╗████████╗███████╗
██╔════╝██╔═══██╗██║        ██╔════╝╚══██╔══╝██╔════╝
███████╗██║   ██║██║        ██║        ██║   █████╗  
╚════██║██║▄▄ ██║██║        ██║        ██║   ██╔══╝  
███████║╚██████╔╝███████╗   ╚██████╗   ██║   ██║     
╚══════╝ ╚══▀▀═╝ ╚══════╝    ╚═════╝   ╚═╝   ╚═╝     
`}
          </pre>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-green-400 glow-text">
              Welcome to SQL Injection CTF
            </h1>
            <p className="text-green-600">
              {isLogin ? 'Login to continue your challenge' : 'Register to start the challenge'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-green-500 mb-2 font-bold">
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

            {!isLogin && (
              <div>
                <label className="block text-green-500 mb-2 font-bold">
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
            )}

            <div>
              <label className="block text-green-500 mb-2 font-bold">
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
              <div className="border-2 border-red-500 bg-red-900/20 text-red-400 px-4 py-3 rounded font-mono text-sm">
                <span className="font-bold">ERROR:</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-terminal w-full text-lg"
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'REGISTER')}
            </button>
          </form>

          <div className="text-center pt-4 border-t-2 border-green-900">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-green-500 hover:text-green-400 transition-colors"
            >
              {isLogin ? '→ Create new account' : '→ Already have an account?'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};