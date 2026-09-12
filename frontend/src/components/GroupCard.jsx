import React from 'react';
import {
  Users,
  Calendar,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const GroupCard = ({
  group,
  onViewDetails,
  onJoin,
  onLeave,
  onOpenMeetings,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();

  const membersCount = group.members?.length || 0;
  const limit = group.memberLimit || 8;
  const seatsLeft = Math.max(0, limit - membersCount);
  const isFull = membersCount >= limit;

  const currentUserId = user?._id?.toString();
  const isCreator =
    currentUserId &&
    (group.creator?._id || group.creator || group.createdBy?._id || group.createdBy)?.toString() ===
      currentUserId;
  const isMember =
    currentUserId &&
    (group.members || []).some((m) => (m._id || m)?.toString() === currentUserId);

  const fillPercentage = Math.min(100, Math.round((membersCount / limit) * 100));

  return (
    <div className="academic-card rounded-xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
            <BookOpen className="w-3.5 h-3.5" />
            {group.subject}
          </span>

          {/* Member Count Pill */}
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isFull
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {membersCount} / {limit} Members
          </span>
        </div>

        {/* Group Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-snug hover:text-[#0056D6] dark:hover:text-blue-400 transition-colors">
          {group.title}
        </h3>

        {/* Brief Description */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
          {group.description}
        </p>

        {/* Branch & Semester Metadata (Section 16) */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2.5">
          <span className="font-medium text-gray-700 dark:text-gray-300">{group.branch || 'Computer Science'}</span>
          <span>•</span>
          <span>{group.semester || 'Semester 5'}</span>
        </div>

        {/* Tags */}
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {group.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar & Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1.5">
          <span>Capacity Status</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {isFull ? 'Group Full' : `${seatsLeft} spots open`}
          </span>
        </div>

        {/* Member Capacity Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFull ? 'bg-rose-500' : 'bg-[#0056D6]'
            }`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        {/* Actions: Ghost Button (Outline Style) "View Details" */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onViewDetails(group)}
            className="flex-1 btn-ghost py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Quick sessions trigger if logged in or member */}
          <button
            onClick={() => onOpenMeetings(group)}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            title="Scheduled Meetings"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </button>

          {/* Creator actions */}
          {isCreator && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(group)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                title="Edit Group"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(group)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 transition-colors"
                title="Delete Group"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
