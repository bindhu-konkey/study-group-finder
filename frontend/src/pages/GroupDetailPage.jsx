import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Users,
  ShieldCheck,
  Plus,
  BookOpen,
  Share2,
  Tag,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const GroupDetailPage = ({
  groupId,
  onBack,
  onJoinGroup,
  onLeaveGroup,
  onScheduleMeeting,
  onDeleteGroup,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [group, setGroup] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;
      try {
        setLoading(true);
        const [groupRes, meetingsRes] = await Promise.all([
          api.groups.getById(groupId),
          api.sessions.getByGroup(groupId).catch(() => ({ meetings: [] })),
        ]);
        setGroup(groupRes.group);
        setMeetings(meetingsRes.meetings || meetingsRes.sessions || []);
      } catch (err) {
        console.error('Error fetching group detail:', err);
        setError(err.message || 'Study group could not be found.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="lg:col-span-7 h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="lg:col-span-3 h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Study Group Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          {error || 'This group may have been deleted or archived by its organizer.'}
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-[#0056D6] text-white text-xs font-semibold shadow-sm"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const currentUserId = user?._id?.toString() || '';
  const creatorId =
    typeof group.creator === 'object'
      ? group.creator?._id?.toString()
      : group.creator?.toString() || group.createdBy?._id?.toString() || '';
  const isCreator = isAuthenticated && creatorId === currentUserId;

  const membersList = Array.isArray(group.members) ? group.members : [];
  const isMember =
    isAuthenticated &&
    membersList.some((m) => {
      const mId = typeof m === 'object' ? m._id?.toString() : m.toString();
      return mId === currentUserId;
    });

  const memberLimit = group.memberLimit || group.maxMembers || 5;
  const currentCount = membersList.length;
  const isFull = currentCount >= memberLimit;
  const pct = Math.min(100, Math.round((currentCount / memberLimit) * 100));

  const nextMeeting = meetings.length > 0 ? meetings[0] : null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Top Controls */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Explore</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copied!' : 'Share Group'}</span>
        </button>
      </div>

      {/* 70% / 30% Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: 70% Main Information & Scheduled Meetings */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Info Card */}
          <div className="academic-card p-6 sm:p-8 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
            {/* Subject & Semester Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0056D6] dark:text-blue-300 border border-blue-200/70 dark:border-blue-800">
                {group.subject}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {group.branch || 'Engineering'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {group.semester || 'All Semesters'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              {group.title}
            </h1>

            {/* Detailed Description */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              <p className="whitespace-pre-line">{group.description}</p>
            </div>

            {/* Topics / Tags */}
            {group.tags && group.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  Focus Topics & Keywords
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {group.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Highlighted Meeting Info Section */}
          <div className="academic-card p-6 sm:p-7 bg-white dark:bg-[#161B22] border border-blue-200/80 dark:border-blue-900/60 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-[#0056D6]" />

            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0056D6] dark:text-blue-300 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Next Scheduled Study Session
                </h3>
              </div>

              {(isMember || isCreator) && onScheduleMeeting && (
                <button
                  onClick={() => onScheduleMeeting(group)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0056D6] hover:text-[#0047B3] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Schedule Session
                </button>
              )}
            </div>

            {nextMeeting ? (
              <div className="rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {nextMeeting.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {nextMeeting.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {nextMeeting.time}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {nextMeeting.location || 'Library Room 204'}
                      </span>
                    </div>

                    {nextMeeting.agenda && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5">
                        <strong className="text-gray-700 dark:text-gray-300">Agenda:</strong> {nextMeeting.agenda}
                      </p>
                    )}
                  </div>

                  {nextMeeting.meetingLink && (
                    <a
                      href={nextMeeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                <p>No upcoming study sessions scheduled for this group yet.</p>
                {(isMember || isCreator) && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Click "Schedule Session" above to set a meeting date, room number, or video link.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: 30% Sidebar (Organizer, Members, CTA) */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-6">
          {/* Action & Capacity Card */}
          <div className="academic-card p-6 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-5">
            {/* Member Capacity Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Pod Capacity</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {currentCount} / {memberLimit} Members
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull ? 'bg-amber-500' : 'bg-[#0056D6]'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {isFull ? 'Group is currently at maximum limit' : `${memberLimit - currentCount} seats available to join`}
              </p>
            </div>

            {/* Primary CTA Button */}
            <div>
              {isCreator ? (
                <div className="space-y-2.5">
                  <button
                    onClick={() => onScheduleMeeting(group)}
                    className="w-full py-2.5 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule Study Session
                  </button>
                  {onDeleteGroup && (
                    <button
                      onClick={() => onDeleteGroup(group)}
                      className="w-full py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Study Group
                    </button>
                  )}
                </div>
              ) : isMember ? (
                <button
                  onClick={() => onLeaveGroup(group._id)}
                  className="w-full py-2.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/50 hover:bg-rose-50 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all shadow-sm"
                >
                  Leave Study Group
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-semibold cursor-not-allowed"
                >
                  Group Full
                </button>
              ) : (
                <button
                  onClick={() => onJoinGroup(group._id)}
                  className="w-full py-2.5 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
                >
                  Join Study Group
                </button>
              )}
            </div>

            {/* Organizer Info */}
            <div className="pt-5 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2.5">
                Group Organizer
              </span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#0056D6] dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  {typeof group.creator === 'object' && group.creator?.name
                    ? group.creator.name[0].toUpperCase()
                    : 'O'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {typeof group.creator === 'object' ? group.creator?.name : 'Peer Lead'}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {typeof group.creator === 'object' ? group.creator?.branch : 'Organizer'}
                  </p>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="pt-5 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Enrolled Members ({membersList.length})
                </span>
                <Users className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {membersList.map((m, idx) => {
                  const mName = typeof m === 'object' ? m.name : 'Student Member';
                  const mBranch = typeof m === 'object' ? m.branch : 'Department Peer';
                  return (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold flex items-center justify-center">
                        {mName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs text-gray-800 dark:text-gray-200 truncate block">
                          {mName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default GroupDetailPage;
