import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  BookOpen,
  ChevronRight,
  Filter,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CalendarPage = ({ onViewDetails, onOpenMeeting, onExploreClick }) => {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, online, offline

  useEffect(() => {
    const fetchSessions = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.sessions.getMySessions();
        setSessions(res.sessions || []);
      } catch (err) {
        console.error('Error fetching calendar sessions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [isAuthenticated]);

  const filteredSessions = sessions.filter((s) => {
    if (filterType === 'online') return !!s.meetingLink || s.meetingType === 'online';
    if (filterType === 'offline') return !s.meetingLink || s.meetingType === 'offline';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Academic Schedule & Sessions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track all scheduled study sessions, Google Meet calls, and campus room locations across your study groups.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 self-start md:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            All Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setFilterType('online')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filterType === 'online'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Online Only
          </button>
          <button
            onClick={() => setFilterType('offline')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filterType === 'offline'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            In-Person
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 animate-pulse h-28"
            />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#161B22]/50 p-12 text-center max-w-xl mx-auto my-12">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0056D6] dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            No sessions scheduled yet.
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6 max-w-sm mx-auto">
            Join or create a study group to schedule upcoming review sessions, lab meetups, and exam prep circles!
          </p>
          <button
            onClick={onExploreClick}
            className="px-4 py-2 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-medium transition-all shadow-sm"
          >
            Explore Groups
          </button>
        </div>
      ) : (
        /* Session List */
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isOnline = !!session.meetingLink;
            const groupTitle = session.groupId?.title || 'Study Pod';
            const groupSubject = session.groupId?.subject || 'Academics';

            return (
              <div
                key={session._id}
                className="academic-card p-5 sm:p-6 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Date & Info */}
                <div className="flex items-start gap-4">
                  {/* Calendar Chip */}
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-center flex flex-col justify-center items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D6] dark:text-blue-400">
                      {session.date ? new Date(session.date).toLocaleDateString([], { month: 'short' }) : 'DATE'}
                    </span>
                    <span className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">
                      {session.date ? new Date(session.date).toLocaleDateString([], { day: 'numeric' }) : '--'}
                    </span>
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-[#0056D6] dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                        {groupSubject}
                      </span>
                      {isOnline ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Online
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          In-Person
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {session.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Group: <strong className="text-gray-700 dark:text-gray-300">{groupTitle}</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {session.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {session.location || 'Classroom / Library'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800 shrink-0">
                  {isOnline && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}

                  {session.groupId?._id && onViewDetails && (
                    <button
                      onClick={() => onViewDetails(session.groupId)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors"
                    >
                      <span>View Group</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default CalendarPage;
