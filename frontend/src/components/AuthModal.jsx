import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  apiBaseUrl = 'http://localhost:8080/api'
}) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('attendee'); // 'attendee' or 'organizer'

  // Status & Error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const switchMode = (newMode) => {
    clearForm();
    setMode(newMode);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validations
    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Full name is required.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'register' ? `${apiBaseUrl}/auth/register` : `${apiBaseUrl}/auth/login`;
      const payload = mode === 'register' 
        ? { name: name.trim(), email: email.trim().toLowerCase(), password, role }
        : { email: email.trim().toLowerCase(), password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication request failed.');
      }

      setSuccessMessage(mode === 'register' ? 'Account created successfully!' : 'Login successful!');
      
      // Store token and notify parent
      if (data.token) {
        localStorage.setItem('eventsync_jwt_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('eventsync_user', JSON.stringify(data.user));
      }

      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        onClose();
      }, 500);

    } catch (err) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Server connection error. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Autofill Helpers
  const autofillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-slate-900 border border-slate-750 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">
            {mode === 'login' ? 'Sign In to EventSync' : 'Create User Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' 
              ? 'Access your role-based dashboard and digital passes' 
              : 'Register for CIT-U IT342 EventSync Platform'}
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl mt-4 border border-slate-700/80">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register (New Account)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error & Success Banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Full Name (Registration only) */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@citu.edu.ph"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Password * {mode === 'register' && <span className="text-[10px] text-slate-400 font-normal">(Min 6 chars)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Confirm Password (Registration only) */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Role Selection (Requirement 1: Assign appropriate user roles) */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Select Your Role *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => setRole('attendee')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    role === 'attendee'
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold text-white block">Attendee</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Discover & purchase tickets</span>
                </div>

                <div
                  onClick={() => setRole('organizer')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    role === 'organizer'
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold text-white block">Event Organizer</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Create & manage sales</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center py-2.5 text-xs sm:text-sm mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In & Access Dashboard' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Credentials Helpers */}
          {mode === 'login' && (
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2 text-center">
                Demo Accounts for Grading / Testing
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => autofillDemo('cit.student@citu.edu.ph', 'Password123!')}
                  className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  Attendee Demo
                </button>
                <button
                  type="button"
                  onClick={() => autofillDemo('mark.organizer@eventsync.ph', 'Password123!')}
                  className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  Organizer Demo
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
