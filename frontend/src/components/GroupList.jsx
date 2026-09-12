import React, { useState, useEffect } from 'react';
import { Search, BookOpen, X, Plus, ChevronDown } from 'lucide-react';
import { GroupCard } from './GroupCard';
import { api } from '../services/api';

const SUBJECT_OPTIONS = [
  'All Subjects',
  'Computer Science',
  'Mathematics',
  'Electrical',
  'Data Science',
  'Physics',
  'Chemistry',
];

const BRANCH_OPTIONS = [
  'All Departments',
  'Computer Science',
  'Electrical Engineering',
  'Mathematics',
  'Data Science',
  'Physics',
  'Chemistry',
];

const SEMESTER_OPTIONS = [
  'All Semesters',
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

export const GroupList = ({
  onViewDetails,
  onJoinGroup,
  onLeaveGroup,
  onOpenMeetings,
  onEditGroup,
  onDeleteGroup,
  onCreateClick,
  refreshTrigger,
}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedBranch, setSelectedBranch] = useState('All Departments');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');
  const [availability, setAvailability] = useState('all'); // all | open

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.groups.search({
        query: searchQuery,
        subject: selectedSubject === 'All Subjects' ? undefined : selectedSubject,
        branch: selectedBranch === 'All Departments' ? undefined : selectedBranch,
        semester: selectedSemester === 'All Semesters' ? undefined : selectedSemester,
        availability: availability === 'open' ? 'open' : undefined,
      });
      setGroups(res.groups || []);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [selectedSubject, selectedBranch, selectedSemester, availability, refreshTrigger]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('All Subjects');
    setSelectedBranch('All Departments');
    setSelectedSemester('All Semesters');
    setAvailability('all');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSubject !== 'All Subjects' ||
    selectedBranch !== 'All Departments' ||
    selectedSemester !== 'All Semesters' ||
    availability !== 'all';

  return (
    <div className="space-y-8">
      {/* Header (Section C & 15) */}
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Find Your Study Group
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          Discover students learning the same subjects and working toward the same goals.
        </p>
      </div>

      {/* Prominent Search & Filters Bar */}
      <div className="space-y-3">
        {/* Wide Search Bar with Subtle Shadow */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study groups, subjects, or topics..."
            className="w-full bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0056D6]/20 focus:border-[#0056D6] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Subject Dropdown */}
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-sm focus:outline-none focus:border-[#0056D6] cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Semester Dropdown */}
          <div className="relative">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-sm focus:outline-none focus:border-[#0056D6] cursor-pointer"
            >
              {SEMESTER_OPTIONS.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Branch Dropdown */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-sm focus:outline-none focus:border-[#0056D6] cursor-pointer"
            >
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Availability Dropdown */}
          <div className="relative">
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-sm focus:outline-none focus:border-[#0056D6] cursor-pointer"
            >
              <option value="all">All Availability</option>
              <option value="open">Open Spots Only</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Meta & Active Filters */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
        <span>
          Showing <strong className="text-gray-900 dark:text-white">{groups.length}</strong> study group{groups.length === 1 ? '' : 's'}
        </span>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[#0056D6] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Reset all filters
          </button>
        )}
      </div>

      {/* Results Grid (Section C) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="academic-card rounded-xl p-6 h-60 animate-pulse bg-white dark:bg-[#161B22]"
            />
          ))}
        </div>
      ) : groups.length === 0 ? (
        /* Empty State */
        <div className="academic-card rounded-2xl p-12 text-center bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0056D6] dark:text-blue-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No study groups matched your filters.
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Try adjusting your search keywords or reset filters to view all active campus study circles.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={clearFilters}
              className="btn-ghost px-4 py-2 text-xs font-medium"
            >
              Reset Filters
            </button>
            <button
              onClick={onCreateClick}
              className="btn-primary px-4 py-2 text-xs font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Study Group
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onViewDetails={onViewDetails}
              onJoin={onJoinGroup}
              onLeave={onLeaveGroup}
              onOpenMeetings={onOpenMeetings}
              onEdit={onEditGroup}
              onDelete={onDeleteGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
};
