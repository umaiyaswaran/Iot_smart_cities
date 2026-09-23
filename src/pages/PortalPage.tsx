import React, { useState } from 'react';
import { UserSession } from '../types';
import { authApi, setStoredSession } from '../services/api';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  LogOut 
} from 'lucide-react';

interface PortalPageProps {
  session: UserSession | null;
  onLoginSuccess: (session: UserSession) => void;
  onLogout: () => void;
}

export const PortalPage: React.FC<PortalPageProps> = ({
  session,
  onLoginSuccess,
  onLogout,
}) => {
  const [selectedPortal, setSelectedPortal] = useState<'admin' | 'judge' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenLogin = (type: 'admin' | 'judge') => {
    setSelectedPortal(type);
    setUsername('');
    setPassword('');
    setError(null);
    setShowPassword(false);
  };

  const handleLoginSubmit = async () => {
    if (!selectedPortal) return;

    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authApi.login(username.trim(), password, selectedPortal);
      setStoredSession(result);
      onLoginSuccess(result);
      setSelectedPortal(null);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Central Event Authority</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Euphoria'26 Central Portal
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Secure gateway for authorized event administrators and technical evaluation judges of the IoT Based Smart Cities Challenge.
        </p>
      </div>

      {/* Active Session Notice if already logged in */}
      {session && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Active Authorized Session</p>
              <p className="text-base font-bold text-emerald-950 capitalize">
                {session.role} Portal Active ({session.username})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="portal-logout-btn"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Two Portal Cards (Section 4) */}
      {!selectedPortal && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Admin Portal Card */}
          <div className="rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/50 p-8 shadow-sm hover:shadow-lg transition-all space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-emerald-300 flex items-center justify-center shadow-md shadow-emerald-950/10 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  ADMIN PORTAL
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Authorized Event Administration
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Coordinate full event operations, register and manage teams, assign evaluators, verify participant attendance, monitor live scoring, download official PDF reports, and configure system settings.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                id="portal-card-admin-btn"
                onClick={() => handleOpenLogin('admin')}
                className="w-full py-3 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <span>Access Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Judge Portal Card */}
          <div className="rounded-3xl bg-white border border-slate-200 hover:border-teal-500/50 p-8 shadow-sm hover:shadow-lg transition-all space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-900 text-teal-300 flex items-center justify-center shadow-md shadow-teal-950/10 group-hover:scale-105 transition-transform">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  JUDGE PORTAL
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Authorized Event Evaluation
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dedicated workspace for appointed technical judges to evaluate assigned teams across both rounds: Round 1 Technical Quiz (40 Marks) and Round 2 IoT Based Simulation (60 Marks).
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                id="portal-card-judge-btn"
                onClick={() => handleOpenLogin('judge')}
                className="w-full py-3 px-5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <span>Access Judge Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Login Modal / Container */}
      {selectedPortal && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                selectedPortal === 'admin' ? 'bg-emerald-800' : 'bg-teal-800'
              }`}>
                {selectedPortal === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 capitalize">
                  {selectedPortal} Login
                </h2>
                <p className="text-xs text-slate-500">
                  Authorized credentials required
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPortal(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold p-1"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleLoginSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="portal-input-username"
                type="text"
                placeholder={selectedPortal === 'admin' ? 'Admin' : 'Judge'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="portal-input-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="portal-submit-login-btn"
              type="button"
              onClick={() => void handleLoginSubmit()}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                selectedPortal === 'admin'
                  ? 'bg-emerald-800 hover:bg-emerald-900'
                  : 'bg-teal-800 hover:bg-teal-900'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : `Sign in to ${selectedPortal === 'admin' ? 'Admin' : 'Judge'} Portal`}</span>
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
