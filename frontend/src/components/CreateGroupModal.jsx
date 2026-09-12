import React, { useState, useEffect } from 'react';
import { X, Users, Sparkles, Tag, GraduationCap } from 'lucide-react';
import { api } from '../services/api';

const SUBJECT_OPTIONS = [
  'Computer Science',
  'Mathematics',
  'Electrical Engineering',
  'Data Science',
  'Physics',
  'Chemistry',
  'Mechanical Engineering',
  'Civil Engineering',
];

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

export const CreateGroupModal = ({ isOpen, onClose, initialData, onGroupCreated, showToast }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Computer Science',
    description: '',
    memberLimit: 5,
    branch: 'Computer Science',
    semester: '6th Semester',
    tags: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        subject: initialData.subject || 'Computer Science',
        description: initialData.description || '',
        memberLimit: initialData.memberLimit || 5,
        branch: initialData.branch || 'Computer Science',
        semester: initialData.semester || '6th Semester',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
      });
    } else {
      setFormData({
        title: '',
        subject: 'Computer Science',
        description: '',
        memberLimit: 5,
        branch: 'Computer Science',
        semester: '6th Semester',
        tags: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData?._id) {
        // Edit mode
        const res = await api.groups.update(initialData._id, formData);
        showToast('Study group updated successfully!', 'success');
        onGroupCreated?.(res.group);
      } else {
        // Create mode
        const res = await api.groups.create(formData);
        showToast(`Created study group "${formData.title}"!`, 'success');
        onGroupCreated?.(res.group);
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save group.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white text-gray-900 border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-[#0056D6] mb-2.5">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {initialData ? 'Edit Study Group' : 'Create New Study Group'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Gather course peers to collaborate on problem sets, lab projects, and exams.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Group Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. CS 314: Advanced Algorithms Sprint"
              className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Subject Area <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
              >
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Member Capacity Limit <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={2}
                max={50}
                required
                value={formData.memberLimit}
                onChange={(e) => setFormData({ ...formData, memberLimit: parseInt(e.target.value, 10) || 2 })}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Recommended 3–6 students</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description & Objectives <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline what topics you'll tackle, weekly meeting cadence, or prerequisites..."
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Branch</label>
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Algorithms, LeetCode, MidtermPrep, PyTorch"
                className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0056D6] focus:ring-1 focus:ring-[#0056D6]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Save Group Updates' : 'Create Study Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateGroupModal;
