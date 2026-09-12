import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({
  onViewDetails,
  onOpenMeetings,
  onJoinGroup,
  onLeaveGroup,
  onExploreClick,
  refreshTrigger,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.dashboard.getOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-80 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="lg:col-span-5 h-80 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const enrolledGroups = data?.enrolledGroups || [];
  const upcomingMeetings = data?.upcomingMeetings || [];
  const nextThreeSessions = upcomingMeetings.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section (Section 14) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Here’s what’s happening with your study groups.
          </p>
        </div>

        <button
          onClick={onExploreClick}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0056D6] dark:text-blue-400 hover:underline self-start sm:self-auto"
        >
          <span>Explore all study groups</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid Layout (Section 14: Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* "My Upcoming Sessions" Widget (7/12 cols) */}
        <div className="lg:col-span-7 academic-card rounded-2xl p-6 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0056D6] dark:text-blue-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                My Upcoming Sessions
              </h3>
            </div>
            <span className="text-xs font-semibold text-gray-400">
              Next {nextThreeSessions.length} of {upcomingMeetings.length}
            </span>
          </div>

          {/* List View with Prominent Nearest Session */}
          {nextThreeSessions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800/80 text-gray-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  No sessions scheduled yet.
                </p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Join a group to get started!
                </p>
              </div>
              <button
                onClick={onExploreClick}
                className="btn-primary px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5 mt-2"
              >
                Explore Groups
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {nextThreeSessions.map((session, index) => {
                const groupTitle = session.groupId?.title || session.group?.title || 'Study Pod';
                const subject = session.groupId?.subject || session.group?.subject || 'Course';
                const isNearest = index === 0;
                const isOnline = session.meetingType === 'online' || !!session.meetingLink;

                return (
                  <div
                    key={session._id || index}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                      isNearest
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm'
                        : 'border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/30 hover:border-gray-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {isNearest && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0056D6] text-white">
                            Next Up
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {subject}
                        </span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[220px]">
                          {groupTitle}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {session.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          {session.date} • {session.time}
                        </span>
                        <span className="flex items-center gap-1">
                          {isOnline ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-blue-600 dark:text-blue-400">Online</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{session.location || 'Classroom'}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Join Meeting & View Details */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {isOnline && session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary py-1.5 px-3 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meeting</span>
                        </a>
                      )}
                      <button
                        onClick={() => onViewDetails(session.groupId?._id || session.groupId || session.group)}
                        className="btn-ghost py-1.5 px-3 text-xs font-medium inline-flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="w-3 h-3 opacity-70" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* "My Active Groups" Widget (5/12 cols) */}
        <div className="lg:col-span-5 academic-card rounded-2xl p-6 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                My Active Groups
              </h3>
            </div>
            <span className="text-xs font-semibold text-gray-400">
              {enrolledGroups.length} Enrolled
            </span>
          </div>

          {enrolledGroups.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Users className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  You haven't joined any groups yet.
                </p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Discover active cohorts for your subject in the Explore tab.
                </p>
              </div>
              <button
                onClick={onExploreClick}
                className="btn-ghost py-1.5 px-3.5 text-xs font-medium inline-flex items-center gap-1 mt-1"
              >
                <span>Browse Groups</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledGroups.slice(0, 5).map((group) => {
                const membersCount = group.members?.length || 0;
                const limit = group.maxMembers || group.memberLimit || 8;
                const progress = Math.min(100, Math.round((membersCount / limit) * 100));

                return (
                  <div
                    key={group._id}
                    className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:border-gray-200 dark:hover:border-gray-700 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {group.title}
                        </h4>
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          {group.subject}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                        {membersCount} / {limit} Members
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-[#0056D6] rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-end pt-0.5">
                      <button
                        onClick={() => onViewDetails(group)}
                        className="btn-ghost py-1 px-2.5 text-xs font-semibold inline-flex items-center gap-1 hover:text-[#0056D6]"
                      >
                        <span>View Group</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
