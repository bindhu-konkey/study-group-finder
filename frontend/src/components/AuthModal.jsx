import React, { useState } from 'react';
import { X, Lock, Mail, User, BookOpen, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BRANCH_OPTIONS = [
  'Computer Science',
  'Electrical Engineering',
  'Mathematics',
  'Data Science',
  'Physics',
  'Chemistry',
  'Mechanical Engineering',
  'Civil Engineering',
];

const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

export const AuthModal = ({ isOpen, onClose, onSuccess, showToast }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: 'Computer Science',
    semester: '6th Semester',
    bio: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(formData);
        showToast('Account created successfully! Welcome to Study Group Finder.', 'success');
      } else {
        await login(formData.email, formData.password);
        showToast('Welcome back! Successfully signed in.', 'success');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (key) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(key);
      showToast('Logged in with demo student account!', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white text-gray-900 border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#0056D6] mb-3">
            {isRegisterMode ? <GraduationCap className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isRegisterMode ? 'Join Study Group Finder' : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isRegisterMode
              ? 'Connect with peers in your courses and study circles'
              : 'Sign in to access your study groups and sessions'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-5 border border-gray-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              !isRegisterMode ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              isRegisterMode ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Chen"
                  className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Campus Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@campus.edu"
                className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Branch</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
                >
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
                >
                  {SEMESTER_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isRegisterMode ? 'Create Student Account' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Instant Demo Accounts */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-[#0056D6] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant One-Click Demo Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('alex')}
              className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-left transition-all"
            >
              <div className="text-xs font-bold text-gray-900 truncate">Alex Chen</div>
              <div className="text-[10px] text-gray-500 truncate">CS • 6th Sem</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('maya')}
              className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-left transition-all"
            >
              <div className="text-xs font-bold text-gray-900 truncate">Maya Patel</div>
              <div className="text-[10px] text-gray-500 truncate">EE • 4th Sem</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('liam')}
              className="px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-left transition-all"
            >
              <div className="text-xs font-bold text-gray-900 truncate">Liam R.</div>
              <div className="text-[10px] text-gray-500 truncate">Math • 5th Sem</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuthModal;
