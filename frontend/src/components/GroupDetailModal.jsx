import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Users,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const GroupDetailModal = ({ isOpen, onClose, group, onJoin, onLeave, onDelete, showToast }) => {
  const { user, isAuthenticated } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const currentUserId = user?._id?.toString();
  const isMember =
    currentUserId &&
    (group?.members || []).some((m) => (m._id || m)?.toString() === currentUserId);
  const isCreator = currentUserId && (group?.creator?._id || group?.creator)?.toString() === currentUserId;

  const membersList = group?.members || [];
  const membersCount = membersList.length;
  const limit = group?.memberLimit || 8;
  const isFull = membersCount >= limit;

  // Fetch group meetings
  useEffect(() => {
    if (isOpen && group?._id) {
      const fetchGroupMeetings = async () => {
        setLoadingMeetings(true);
        try {
          const res = await api.meetings.getByGroup(group._id);
          setMeetings(res.meetings || []);
        } catch (err) {
          console.error('Failed to load meetings:', err);
        } finally {
          setLoadingMeetings(false);
        }
      };
      fetchGroupMeetings();
    }
  }, [isOpen, group?._id]);

  if (!isOpen || !group) return null;

  const nextMeeting = meetings.length > 0 ? meetings[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>Groups</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-semibold">{group.subject}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 70% / 30% Two-Column Layout */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Left Column (70%) - Main Info */}
          <div className="w-full md:w-[68%] p-6 sm:p-8 space-y-6 md:border-r border-gray-100 dark:border-gray-800">
            {/* Subject Tag & Title */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <BookOpen className="w-3.5 h-3.5" />
                {group.subject}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-2.5">
                {group.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>{group.branch || 'General Engineering'}</span>
                <span>•</span>
                <span>{group.semester || 'Current Semester'}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                About this study group
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {group.description}
              </p>
            </div>

            {/* Tags */}
            {group.tags && group.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {group.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Dedicated Highlighted Box: Next Scheduled Meeting */}
            <div className="p-5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Next Scheduled Meeting
                </span>
                {nextMeeting && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                    Confirmed
                  </span>
                )}
              </div>

              {loadingMeetings ? (
                <div className="text-xs text-gray-500 py-2">Loading session details...</div>
              ) : nextMeeting ? (
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {nextMeeting.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{nextMeeting.date} at {nextMeeting.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Room: {nextMeeting.location}</span>
                    </div>
                  </div>

                  {nextMeeting.agenda && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-900/60 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900">
                      <strong>Agenda: </strong>{nextMeeting.agenda}
                    </p>
                  )}

                  {nextMeeting.meetingLink && (
                    <div className="pt-1">
                      <a
                        href={nextMeeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <Video className="w-4 h-4" />
                        Google Meet Link
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>No sessions currently on the schedule. Organizer will announce the next meeting soon.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (30%) - Sidebar Info & Actions */}
          <div className="w-full md:w-[32%] p-6 sm:p-7 bg-gray-50/50 dark:bg-gray-900/20 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Organizer Card */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                  Organizer
                </h4>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#0056D6] dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                    {group.creator?.name ? group.creator.name[0].toUpperCase() : 'O'}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {group.creator?.name || 'Peer Student'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {group.creator?.email || 'Student Lead'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Members List with Avatars */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Members ({membersCount})
                  </h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isFull
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {membersCount}/{limit} Members
                  </span>
                </div>

                <div className="flex items-center -space-x-2 overflow-hidden py-1">
                  {membersList.slice(0, 8).map((m, i) => {
                    const name = m.name || `Peer ${i + 1}`;
                    return (
                      <div
                        key={m._id || i}
                        title={name}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[11px] font-bold text-gray-700 dark:text-gray-200"
                      >
                        {name[0].toUpperCase()}
                      </div>
                    );
                  })}
                  {membersCount > 8 && (
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-medium text-gray-500">
                      +{membersCount - 8}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFull ? 'bg-rose-500' : 'bg-[#0056D6]'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((membersCount / limit) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Solid Primary Action Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              {isCreator && onDelete && (
                <button
                  onClick={() => {
                    onClose();
                    onDelete(group);
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Study Group
                </button>
              )}
              {isMember ? (
                <button
                  onClick={() => {
                    onLeave(group._id);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-rose-50 dark:bg-gray-800 dark:hover:bg-rose-950/40 text-gray-700 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-300 text-sm font-semibold border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  Leave Group
                </button>
              ) : (
                <button
                  onClick={() => {
                    onJoin(group._id);
                    onClose();
                  }}
                  disabled={isFull}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                    isFull
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0056D6] hover:bg-[#0047B3] text-white active:scale-[0.98]'
                  }`}
                >
                  {isFull ? 'Capacity Reached (Full)' : 'Join Group'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
