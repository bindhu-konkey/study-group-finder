import React, { useState, useEffect } from 'react';
import { FolderHeart, PlusCircle, Users, Calendar, Trash2, Edit2, LogOut } from 'lucide-react';
import { GroupCard } from './GroupCard';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MyGroups = ({
  onViewDetails,
  onOpenMeetings,
  onEditGroup,
  onDeleteGroup,
  onLeaveGroup,
  onCreateClick,
  refreshTrigger,
  showToast,
}) => {
  const { user } = useAuth();
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('created'); // 'created' | 'joined'

  // Delete modal state
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyGroups = async () => {
    setLoading(true);
    try {
      const res = await api.groups.getMyGroups();
      setCreatedGroups(res.createdGroups || []);
      setJoinedGroups(res.joinedGroups || []);
    } catch (err) {
      console.error('Failed to load my groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGroups();
  }, [refreshTrigger]);

  // Open confirmation modal
  const handleInitiateDelete = (group) => {
    setGroupToDelete(group);
  };

  // Execute actual deletion
  const handleConfirmDelete = async () => {
    if (!groupToDelete?._id) return;

    setIsDeleting(true);
    const targetId = groupToDelete._id;
    const targetTitle = groupToDelete.title;

    try {
      const res = await api.groups.delete(targetId);

      // 1. Immediately remove from local state for instant UI update
      setCreatedGroups((prev) => prev.filter((g) => g._id !== targetId));

      // 2. Notify user with proper success message
      const successMsg = res.message || 'Group deleted successfully.';
      if (showToast) {
        showToast(successMsg, 'success');
      }

      // 3. Close modal
      setGroupToDelete(null);

      // 4. Notify parent to synchronize state across other tabs
      if (onDeleteGroup) {
        onDeleteGroup(targetId);
      }
    } catch (err) {
      let errorMsg = 'Unable to delete the group. Please try again.';
      if (err.message.includes('permission') || err.message.includes('creator') || err.message.includes('403')) {
        errorMsg = "You don't have permission to delete this group.";
      } else if (err.message.includes('not found') || err.message.includes('404')) {
        errorMsg = 'Group not found.';
      } else if (err.message.includes('expired') || err.message.includes('token') || err.message.includes('401')) {
        errorMsg = 'Authentication expired. Please log in again.';
      }

      if (showToast) {
        showToast(errorMsg, 'error');
      } else {
        alert(errorMsg);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-[#0056D6] dark:text-blue-400" />
            My Study Pods
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage groups you lead and scheduled study sessions for groups you have joined.
          </p>
        </div>

        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Group
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 max-w-sm">
        <button
          onClick={() => setActiveSubTab('created')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'created'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <span>Created by Me</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#0056D6] dark:bg-blue-900/40 dark:text-blue-300">
            {createdGroups.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('joined')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'joined'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <span>Joined Pods</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#0056D6] dark:bg-blue-900/40 dark:text-blue-300">
            {joinedGroups.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="academic-card rounded-2xl p-6 h-60 animate-pulse bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800"
            />
          ))}
        </div>
      ) : activeSubTab === 'created' ? (
        createdGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-[#161B22]/60 p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              You haven't created any study groups yet.
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Start a new cohort for your course to lead study sessions, set locations, and prepare together.
            </p>
            <button
              onClick={onCreateClick}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0056D6] hover:bg-[#0047B3] text-xs font-semibold text-white transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {createdGroups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                onViewDetails={onViewDetails}
                onJoin={() => {}}
                onLeave={onLeaveGroup}
                onOpenMeetings={onOpenMeetings}
                onEdit={onEditGroup}
                onDelete={handleInitiateDelete}
              />
            ))}
          </div>
        )
      ) : joinedGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-[#161B22]/60 p-12 text-center space-y-3">
          <FolderHeart className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            You haven't joined any peer pods yet.
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Explore active study groups across computer science, mathematics, and engineering to join sessions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {joinedGroups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onViewDetails={onViewDetails}
              onJoin={() => {}}
              onLeave={onLeaveGroup}
              onOpenMeetings={onOpenMeetings}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={handleConfirmDelete}
        groupTitle={groupToDelete?.title}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MyGroups;
