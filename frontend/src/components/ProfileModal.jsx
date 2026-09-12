import React, { useState } from 'react';
import { X, User, Mail, GraduationCap, BookOpen, Save, Lock } from 'lucide-react';
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

export const ProfileModal = ({ isOpen, onClose, showToast }) => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    branch: user?.branch || 'Computer Science',
    semester: user?.semester || '6th Semester',
    bio: user?.bio || '',
    password: '',
  });

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white text-gray-900 border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
          <div className="w-13 h-13 rounded-2xl bg-blue-50 text-[#0056D6] border border-blue-200 flex items-center justify-center text-xl font-bold">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-snug">{user.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {user.email}
            </p>
            <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#0056D6] border border-blue-200/70">
              {user.branch} • {user.semester}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Branch / Department</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
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
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
              >
                {SEMESTER_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Bio / Study Goals</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell peers what topics you're focusing on..."
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              New Password <span className="text-gray-400 font-normal text-[10px]">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Optional new password"
                className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ProfileModal;
