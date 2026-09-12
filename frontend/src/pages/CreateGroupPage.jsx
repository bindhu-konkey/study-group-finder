import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SUBJECT_OPTIONS = [
  'Computer Science',
  'Mathematics',
  'Electrical Engineering',
  'Data Science & AI',
  'Mechanical Engineering',
  'Physics',
  'Chemistry',
  'Economics & Finance',
];

const BRANCH_OPTIONS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Mathematics & Computing',
  'General Engineering',
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

export const CreateGroupPage = ({ onCancel, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Computer Science',
    description: '',
    branch: user?.branch || 'Computer Science & Engineering',
    semester: user?.semester || '6th Semester',
    memberLimit: 6,
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a descriptive title for your study group.');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 15) {
      setError('Please add at least 15 characters of description outlining the syllabus or study goals.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        subject: formData.subject,
        description: formData.description.trim(),
        branch: formData.branch,
        semester: formData.semester,
        memberLimit: parseInt(formData.memberLimit, 10),
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      const res = await api.groups.create(payload);
      if (onSuccess) {
        onSuccess(res.group);
      }
    } catch (err) {
      setError(err.message || 'Failed to create study group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Groups</span>
        </button>
      </div>

      <div className="academic-card p-6 sm:p-8 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0056D6] dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create New Study Group
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Launch a collaborative study circle for your course, lab assignments, or midterm prep.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
              Group Title / Course Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. CS 314: Operating Systems & Kernel Architecture"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056D6]/20 focus:border-[#0056D6] transition-all"
              required
            />
          </div>

          {/* Subject Category & Member Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                Subject Area <span className="text-rose-500">*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0056D6]/20 focus:border-[#0056D6] transition-all"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Maximum Member Capacity
                </label>
                <span className="text-xs font-bold text-[#0056D6] dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900">
                  {formData.memberLimit} Students
                </span>
              </div>
              <input
                type="range"
                name="memberLimit"
                min="2"
                max="30"
                value={formData.memberLimit}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#0056D6]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Recommended: 4 to 8 peers for optimal discussion dynamics.
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
              Description & Study Objectives <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline what topics this group covers, weekly expectations, target grade, or upcoming assignments..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056D6]/20 focus:border-[#0056D6] transition-all resize-none"
              required
            />
          </div>

          {/* Branch & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                Target Department / Branch
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0056D6]/20 focus:border-[#0056D6] transition-all"
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                Academic Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0056D6]/20 focus:border-[#0056D6] transition-all"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
              Course Topics / Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. Memory Management, File Systems, Virtual Memory, C"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056D6]/20 focus:border-[#0056D6] transition-all"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Creating Group...' : 'Create Group'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateGroupPage;
