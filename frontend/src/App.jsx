<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { GroupList } from './components/GroupList';
import { Dashboard } from './components/Dashboard';
import { MyGroups } from './components/MyGroups';
import { CalendarPage } from './pages/CalendarPage';
import { CreateGroupPage } from './pages/CreateGroupPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { MeetingModal } from './components/MeetingModal';
import { GroupDetailModal } from './components/GroupDetailModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { Toast } from './components/Toast';
import { api } from './services/api';

function MainApp() {
  const { user, isAuthenticated } = useAuth();

  // URL parsing helper
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path.startsWith('/groups/')) {
      const id = path.replace('/groups/', '').trim();
      return { tab: 'group-detail', groupId: id };
    }
    if (path === '/calendar') return { tab: 'calendar', groupId: null };
    if (path === '/my-groups') return { tab: 'my-groups', groupId: null };
    if (path === '/create-group') return { tab: 'create-group', groupId: null };
    if (path === '/dashboard') return { tab: 'dashboard', groupId: null };
    return { tab: 'explore', groupId: null };
  };

  const initialRoute = getInitialRoute();
  const [activeTab, setActiveTabState] = useState(initialRoute.tab);
  const [selectedDetailGroupId, setSelectedDetailGroupId] = useState(initialRoute.groupId);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedMeetingGroup, setSelectedMeetingGroup] = useState(null);
  const [selectedDetailGroup, setSelectedDetailGroup] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Enforce Light Mode Only
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('studysync_theme');
  }, []);

  // Navigate with URL history update
  const navigateTo = useCallback((tab, param = null) => {
    setActiveTabState(tab);
    if (tab === 'group-detail' && param) {
      setSelectedDetailGroupId(param);
      window.history.pushState(null, '', `/groups/${param}`);
    } else {
      setSelectedDetailGroupId(null);
      const targetUrl = tab === 'explore' ? '/' : `/${tab}`;
      window.history.pushState(null, '', targetUrl);
    }
  }, []);

  // Listen for browser forward/backward buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setActiveTabState(route.tab);
      setSelectedDetailGroupId(route.groupId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Join group handler
  const handleJoinGroup = async (groupId) => {
    if (!isAuthenticated) {
      showToast('Please sign in or create an account to join study groups.', 'info');
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await api.groups.join(groupId);
      showToast(res.message || 'Joined study group successfully!', 'success');
      setRefreshTrigger((prev) => prev + 1);
      if (selectedDetailGroup && selectedDetailGroup._id === groupId) {
        setSelectedDetailGroup(res.group);
      }
    } catch (err) {
      showToast(err.message || 'Failed to join group.', 'error');
    }
  };

  // Leave group handler
  const handleLeaveGroup = async (groupId) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.groups.leave(groupId);
      showToast(res.message || 'Left study group.', 'info');
      setRefreshTrigger((prev) => prev + 1);
      if (selectedDetailGroup && selectedDetailGroup._id === groupId) {
        setSelectedDetailGroup(res.group || null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to leave group.', 'error');
    }
  };

  // Open create group
  const handleCreateClick = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to create and lead a study group.', 'info');
      setAuthModalOpen(true);
      return;
    }
    navigateTo('create-group');
  };

  // Edit group
  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setCreateModalOpen(true);
  };

  // Delete group state
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // Initiate or finalize delete
  const handleDeleteGroup = (groupOrId) => {
    if (!groupOrId) return;

    // If an ID was passed, it was already deleted by a child component (e.g. MyGroups)
    if (typeof groupOrId === 'string') {
      const deletedId = groupOrId;
      setRefreshTrigger((prev) => prev + 1);
      if (selectedDetailGroup && selectedDetailGroup._id === deletedId) {
        setSelectedDetailGroup(null);
      }
      if (activeTab === 'group-detail' && selectedDetailGroupId === deletedId) {
        navigateTo('my-groups');
      }
      return;
    }

    // Otherwise, open the DeleteConfirmationModal
    setGroupToDelete(groupOrId);
  };

  // Confirm delete handler for global modal
  const handleConfirmGlobalDelete = async () => {
    if (!groupToDelete?._id) return;
    setIsDeletingGroup(true);
    const targetId = groupToDelete._id;
    const targetTitle = groupToDelete.title;

    try {
      const res = await api.groups.delete(targetId);
      const successMsg = res.message || 'Group deleted successfully.';
      showToast(successMsg, 'success');

      // Invalidate queries / refresh all data
      setRefreshTrigger((prev) => prev + 1);

      // Clean up detail views / redirect if active
      if (selectedDetailGroup && selectedDetailGroup._id === targetId) {
        setSelectedDetailGroup(null);
      }
      if (activeTab === 'group-detail' && selectedDetailGroupId === targetId) {
        navigateTo('my-groups');
      }

      setGroupToDelete(null);
    } catch (err) {
      let errorMsg = 'Unable to delete the group. Please try again.';
      const msg = err.message || '';
      if (msg.includes('permission') || msg.includes('403')) {
        errorMsg = "You don't have permission to delete this group.";
      } else if (msg.includes('not found') || msg.includes('404')) {
        errorMsg = 'Group not found.';
      } else if (msg.includes('expired') || msg.includes('token') || msg.includes('401') || msg.includes('Authentication')) {
        errorMsg = 'Authentication expired. Please log in again.';
      }
      showToast(errorMsg, 'error');
    } finally {
      setIsDeletingGroup(false);
    }
  };

  // View Details handler
  const handleViewDetails = (groupOrId) => {
    const id = typeof groupOrId === 'object' ? groupOrId._id : groupOrId;
    navigateTo('group-detail', id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900">
      {/* Global Navigation Header (Section A) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => navigateTo(tab)}
        onCreateGroupClick={handleCreateClick}
        onAuthClick={() => setAuthModalOpen(true)}
        onProfileClick={() => setProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Route: /explore */}
        {activeTab === 'explore' && (
          <GroupList
            onViewDetails={handleViewDetails}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onOpenMeetings={(group) => setSelectedMeetingGroup(group)}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onCreateClick={handleCreateClick}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* Route: /dashboard */}
        {activeTab === 'dashboard' && (
          <Dashboard
            onViewDetails={handleViewDetails}
            onOpenMeetings={(group) => setSelectedMeetingGroup(group)}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onExploreClick={() => navigateTo('explore')}
            showToast={showToast}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* Route: /my-groups */}
        {activeTab === 'my-groups' && (
          <MyGroups
            onViewDetails={handleViewDetails}
            onOpenMeetings={(group) => setSelectedMeetingGroup(group)}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onLeaveGroup={handleLeaveGroup}
            onCreateClick={handleCreateClick}
            refreshTrigger={refreshTrigger}
            showToast={showToast}
          />
        )}

        {/* Route: /calendar */}
        {activeTab === 'calendar' && (
          <CalendarPage
            onViewDetails={handleViewDetails}
            onOpenMeeting={(group) => setSelectedMeetingGroup(group)}
            onExploreClick={() => navigateTo('explore')}
          />
        )}

        {/* Route: /create-group */}
        {activeTab === 'create-group' && (
          <CreateGroupPage
            onCancel={() => navigateTo('explore')}
            onSuccess={(newGroup) => {
              showToast(`Study group "${newGroup.title}" created successfully!`, 'success');
              setRefreshTrigger((prev) => prev + 1);
              navigateTo('group-detail', newGroup._id);
            }}
          />
        )}

        {/* Route: /groups/:id (Group Details View) */}
        {activeTab === 'group-detail' && selectedDetailGroupId && (
          <GroupDetailPage
            groupId={selectedDetailGroupId}
            onBack={() => navigateTo('explore')}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onScheduleMeeting={(group) => setSelectedMeetingGroup(group)}
            onDeleteGroup={handleDeleteGroup}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Study Group Finder</strong> • Academic Elegance UI/UX Platform
          </div>
          <div>Inspired by Notion & Linear • Peer Study Circle & Schedule Management</div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        showToast={showToast}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        showToast={showToast}
      />

      <CreateGroupModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingGroup(null);
        }}
        initialData={editingGroup}
        onGroupCreated={() => setRefreshTrigger((prev) => prev + 1)}
        showToast={showToast}
      />

      <MeetingModal
        isOpen={!!selectedMeetingGroup}
        group={selectedMeetingGroup}
        onClose={() => setSelectedMeetingGroup(null)}
        showToast={showToast}
      />

      <GroupDetailModal
        isOpen={!!selectedDetailGroup}
        group={selectedDetailGroup}
        onClose={() => setSelectedDetailGroup(null)}
        onJoin={handleJoinGroup}
        onLeave={handleLeaveGroup}
        onDelete={handleDeleteGroup}
        showToast={showToast}
      />

      {/* Global Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={handleConfirmGlobalDelete}
        groupTitle={groupToDelete?.title}
        isDeleting={isDeletingGroup}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
=======
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:4000";
const USERNAME = "Bindhu";

function App() {
  const [groups, setGroups] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [availability, setAvailability] = useState("All");

  const [selectedGroup, setSelectedGroup] = useState(null);

  const [showMeetingForm, setShowMeetingForm] =
    useState(false);

  const [meetingForm, setMeetingForm] = useState({
    groupId: "",
    title: "",
    date: "",
    time: "",
    location: "",
    meetingLink: "",
  });

  /* =========================
     LOAD GROUPS
  ========================= */

  const loadGroups = async () => {
    try {
      const response = await fetch(`${API}/api/groups`);

      if (!response.ok) {
        throw new Error("Failed to load groups");
      }

      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Groups error:", error);
    }
  };

  /* =========================
     LOAD MEETINGS
  ========================= */

  const loadMeetings = async () => {
    try {
      const response = await fetch(`${API}/api/meetings`);

      if (!response.ok) {
        throw new Error("Failed to load meetings");
      }

      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Meetings error:", error);
    }
  };

  useEffect(() => {
    loadGroups();
    loadMeetings();
  }, []);

  /* =========================
     JOIN GROUP - MEMBER 3
  ========================= */

  const joinGroup = async (group) => {
    try {
      const response = await fetch(
        `${API}/api/groups/${group.id}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: USERNAME,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to join group");
        return;
      }

      alert("You joined the group successfully!");

      setSelectedGroup(null);
      await loadGroups();
    } catch (error) {
      console.error(error);
      alert("Backend connection failed.");
    }
  };

  /* =========================
     LEAVE GROUP - MEMBER 3
  ========================= */

  const leaveGroup = async (group) => {
    try {
      const response = await fetch(
        `${API}/api/groups/${group.id}/leave`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: USERNAME,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to leave group");
        return;
      }

      alert("You left the group.");

      setSelectedGroup(null);
      await loadGroups();
    } catch (error) {
      console.error(error);
      alert("Backend connection failed.");
    }
  };

  /* =========================
     CREATE MEETING - MEMBER 4
  ========================= */

  const createMeeting = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API}/api/meetings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(meetingForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to create meeting");
        return;
      }

      alert("Meeting scheduled successfully!");

      setMeetingForm({
        groupId: "",
        title: "",
        date: "",
        time: "",
        location: "",
        meetingLink: "",
      });

      setShowMeetingForm(false);

      await loadMeetings();
    } catch (error) {
      console.error(error);
      alert("Backend connection failed.");
    }
  };

  /* =========================
     DELETE MEETING
  ========================= */

  const deleteMeeting = async (meetingId) => {
    const confirmDelete = window.confirm(
      "Delete this meeting?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API}/api/meetings/${meetingId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to delete meeting");
        return;
      }

      await loadMeetings();
    } catch (error) {
      console.error(error);
      alert("Backend connection failed.");
    }
  };

  /* =========================
     GROUP FILTER
  ========================= */

  const filteredGroups = groups.filter((group) => {
    const text = search.toLowerCase();

    const matchesSearch =
      group.subject?.toLowerCase().includes(text) ||
      group.description?.toLowerCase().includes(text);

    const matchesSubject =
      selectedSubject === "All" ||
      group.subject === selectedSubject;

    const matchesAvailability =
      availability === "All" ||
      group.availability === availability;

    return (
      matchesSearch &&
      matchesSubject &&
      matchesAvailability
    );
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedSubject("All");
    setAvailability("All");
  };

  /* =========================
     GROUP STATUS
  ========================= */

  const isJoined = (group) => {
    return (
      Array.isArray(group.joinedMembers) &&
      group.joinedMembers.includes(USERNAME)
    );
  };

  /* =========================
     GROUP CARD
  ========================= */

  const GroupCard = ({ group }) => {
    const joined = isJoined(group);

    const full =
      group.memberCount >= group.maxMembers;

    return (
      <div
        className={`group-card ${
          group.color || "purple"
        }`}
      >
        <div className="card-top">
          <div className="subject-icon">
            {group.icon || "📚"}
          </div>

          <span
            className={
              full ? "full-badge" : "available"
            }
          >
            {full ? "Full" : "Open"}
          </span>
        </div>

        <h3>{group.subject}</h3>

        <p>{group.description}</p>

        <div className="card-footer">
          <span className="members">
            👥 {group.memberCount}/{group.maxMembers} members
          </span>

          <button
            onClick={() => setSelectedGroup(group)}
          >
            View
          </button>
        </div>
      </div>
    );
  };

  /* =========================
     DASHBOARD
  ========================= */

  const Dashboard = () => {
    const myGroups = groups.filter((group) =>
      isJoined(group)
    );

    return (
      <>
        <section className="welcome">
          <div>
            <p className="welcome-label">
              GOOD MORNING ☀️
            </p>

            <h2>
              Welcome back, Bindhu 👋
            </h2>

            <p>
              Find your study group and keep your
              learning on track.
            </p>
          </div>

          <div className="welcome-books">
            📚
          </div>
        </section>

        <section className="stats">
          <div className="stat-card purple-card">
            <div className="stat-icon">♟</div>

            <div>
              <span>My Groups</span>
              <strong>{myGroups.length}</strong>
              <small>groups joined</small>
            </div>

            <b>›</b>
          </div>

          <div className="stat-card green-card">
            <div className="stat-icon">▣</div>

            <div>
              <span>Upcoming Sessions</span>
              <strong>{meetings.length}</strong>
              <small>scheduled</small>
            </div>

            <b>›</b>
          </div>

          <div className="stat-card blue-card">
            <div className="stat-icon">◷</div>

            <div>
              <span>Study Hours</span>
              <strong>12h</strong>
              <small>total this week</small>
            </div>

            <b>›</b>
          </div>

          <div className="stat-card orange-card">
            <div className="stat-icon">♢</div>

            <div>
              <span>Notifications</span>
              <strong>3</strong>
              <small>new updates</small>
            </div>

            <b>›</b>
          </div>
        </section>

        <GroupSearch />

        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Study Groups</h2>

              <p>
                Find a group and start learning together.
              </p>
            </div>

            <button
              className="view-all"
              onClick={() =>
                setActivePage("Explore Groups")
              }
            >
              Explore All
            </button>
          </div>

          <div className="group-grid">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                />
              ))
            ) : (
              <div className="no-results">
                <div>📚</div>
                <h3>No groups found</h3>
                <p>
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </div>
        </section>

        <UpcomingSessions />
      </>
    );
  };

  /* =========================
     SEARCH
  ========================= */

  const GroupSearch = () => (
    <>
      <section className="search-area">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search groups by subject or course..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <button
          className="filter-btn"
          onClick={() =>
            setShowFilter(!showFilter)
          }
        >
          ☷ &nbsp; Filter
        </button>
      </section>

      {showFilter && (
        <div className="filter-panel">
          <div className="filter-group">
            <h4>Subject</h4>

            <select
              value={selectedSubject}
              onChange={(e) =>
                setSelectedSubject(e.target.value)
              }
            >
              <option value="All">All Subjects</option>

              {[
                ...new Set(
                  groups.map((group) => group.subject)
                ),
              ].map((subject) => (
                <option
                  key={subject}
                  value={subject}
                >
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h4>Availability</h4>

            <select
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value)
              }
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="Full">Full</option>
            </select>
          </div>

          <button
            className="clear-filter"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}
    </>
  );

  /* =========================
     UPCOMING SESSIONS
  ========================= */

  const UpcomingSessions = () => (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h2>Upcoming Sessions</h2>

          <p>
            Your scheduled study meetings.
          </p>
        </div>

        <button
          className="view-all"
          onClick={() =>
            setActivePage("Schedule")
          }
        >
          View All
        </button>
      </div>

      <div className="sessions">
        {meetings.length === 0 ? (
          <div className="empty-session">
            <span>📅</span>

            <div>
              <strong>No meetings scheduled yet</strong>
              <p>
                Go to Schedule and create your first
                study meeting.
              </p>
            </div>
          </div>
        ) : (
          meetings.slice(0, 3).map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
            />
          ))
        )}
      </div>
    </section>
  );

  /* =========================
     MY GROUPS
  ========================= */

  const MyGroups = () => {
    const myGroups = groups.filter((group) =>
      isJoined(group)
    );

    return (
      <section className="content-section page-section">
        <div className="page-intro">
          <div>
            <h2>My Groups</h2>

            <p>
              All study groups you have joined.
            </p>
          </div>

          <span className="page-count">
            {myGroups.length} groups
          </span>
        </div>

        <div className="group-grid">
          {myGroups.length > 0 ? (
            myGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
              />
            ))
          ) : (
            <div className="empty-page">
              <div>👥</div>
              <h3>No groups joined yet</h3>
              <p>
                Explore groups and join one to start
                studying together.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  setActivePage("Explore Groups")
                }
              >
                Explore Groups
              </button>
            </div>
          )}
        </div>
      </section>
    );
  };

  /* =========================
     EXPLORE GROUPS
  ========================= */

  const ExploreGroups = () => (
    <section className="content-section page-section">
      <div className="page-intro">
        <div>
          <h2>Explore Groups</h2>

          <p>
            Discover study groups and join the ones
            that interest you.
          </p>
        </div>
      </div>

      <GroupSearch />

      <div className="group-grid">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
            />
          ))
        ) : (
          <div className="no-results">
            <div>🔍</div>
            <h3>No matching groups</h3>
            <p>
              Try another subject or search term.
            </p>
          </div>
        )}
      </div>
    </section>
  );

  /* =========================
     MEETING CARD
  ========================= */

  const MeetingCard = ({ meeting, full = false }) => (
    <div className="session-card">
      <div className="date-box">
        <span>DATE</span>

        <strong>
          {meeting.date
            ? meeting.date.slice(-2)
            : "--"}
        </strong>
      </div>

      <div className="session-info">
        <h3>{meeting.title}</h3>

        <p>
          📚 {meeting.groupName || "Study Group"}
        </p>

        <p>
          🕐 {meeting.time}
          {meeting.location
            ? `  •  📍 ${meeting.location}`
            : ""}
        </p>
      </div>

      <span className="session-status">
        Scheduled
      </span>

      {full && (
        <button
          className="delete-btn"
          onClick={() =>
            deleteMeeting(meeting.id)
          }
        >
          Delete
        </button>
      )}
    </div>
  );

  /* =========================
     SCHEDULE
  ========================= */

  const Schedule = () => (
    <section className="content-section page-section">
      <div className="page-intro">
        <div>
          <h2>Study Schedule</h2>

          <p>
            Plan meetings and stay on track with your
            study group.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() =>
            setShowMeetingForm(!showMeetingForm)
          }
        >
          + Schedule Meeting
        </button>
      </div>

      {showMeetingForm && (
        <form
          className="meeting-form"
          onSubmit={createMeeting}
        >
          <div className="form-title">
            <div className="form-icon">📅</div>

            <div>
              <h3>Schedule a Meeting</h3>

              <p>
                Add the details of your study session.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Study Group *</label>

              <select
                required
                value={meetingForm.groupId}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    groupId: e.target.value,
                  })
                }
              >
                <option value="">
                  Select a study group
                </option>

                {groups.map((group) => (
                  <option
                    key={group.id}
                    value={group.id}
                  >
                    {group.subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Meeting Title *</label>

              <input
                required
                type="text"
                placeholder="e.g. Java Practice Session"
                value={meetingForm.title}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Date *</label>

              <input
                required
                type="date"
                value={meetingForm.date}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    date: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Time *</label>

              <input
                required
                type="time"
                value={meetingForm.time}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    time: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Classroom / Location</label>

              <input
                type="text"
                placeholder="e.g. Lab 3"
                value={meetingForm.location}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    location: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Online Meeting Link</label>

              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingForm.meetingLink}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    meetingLink: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                setShowMeetingForm(false)
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
            >
              Create Meeting
            </button>
          </div>
        </form>
      )}

      <div className="schedule-heading">
        <h3>Upcoming Meetings</h3>

        <span>{meetings.length} scheduled</span>
      </div>

      <div className="sessions">
        {meetings.length === 0 ? (
          <div className="empty-page">
            <div>📅</div>
            <h3>No meetings yet</h3>
            <p>
              Schedule a meeting for your study group.
            </p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id}>
              <MeetingCard
                meeting={meeting}
                full={true}
              />

              {meeting.meetingLink && (
                <div className="meeting-link-row">
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🔗 Join Online Meeting
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );

  /* =========================
     NOTIFICATIONS
  ========================= */

  const Notifications = () => (
    <section className="content-section page-section">
      <div className="page-intro">
        <div>
          <h2>Notifications</h2>

          <p>
            Stay updated with your study activities.
          </p>
        </div>
      </div>

      <div className="notification-list">
        <div className="notification-card">
          <div className="notification-icon">
            👥
          </div>

          <div>
            <h3>Study Group Updates</h3>

            <p>
              Check your joined groups for new
              activities and members.
            </p>
          </div>
        </div>

        <div className="notification-card">
          <div className="notification-icon green">
            📅
          </div>

          <div>
            <h3>Upcoming Sessions</h3>

            <p>
              You have {meetings.length} scheduled
              study session(s).
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  /* =========================
     PAGE CONTENT
  ========================= */

  const renderPage = () => {
    switch (activePage) {
      case "My Groups":
        return <MyGroups />;

      case "Explore Groups":
        return <ExploreGroups />;

      case "Schedule":
        return <Schedule />;

      case "Notifications":
        return <Notifications />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">S</div>

          <div>
            <h2>
              Study<span>Group</span>
            </h2>

            <small>FINDER</small>
          </div>
        </div>

        <nav>
          <p className="menu-title">MAIN</p>

          <button
            className={`menu-item ${
              activePage === "Dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("Dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`menu-item ${
              activePage === "My Groups"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("My Groups")
            }
          >
            <span>♟</span>
            My Groups
          </button>

          <button
            className={`menu-item ${
              activePage === "Explore Groups"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("Explore Groups")
            }
          >
            <span>⌕</span>
            Explore Groups
          </button>

          <p className="menu-title study-title">
            STUDY
          </p>

          <button
            className={`menu-item ${
              activePage === "Schedule"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("Schedule")
            }
          >
            <span>▣</span>
            Schedule
          </button>

          <button
            className={`menu-item ${
              activePage === "Notifications"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("Notifications")
            }
          >
            <span>♢</span>
            Notifications
            <span className="notification-count">
              2
            </span>
          </button>
        </nav>

        <div className="sidebar-profile">
          <div className="avatar">B</div>

          <div>
            <strong>Bindhu</strong>
            <small>Student</small>
          </div>

          <span className="profile-arrow">›</span>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main">

        <header className="topbar">
          <div>
            <h1>{activePage}</h1>

            <p>
              Stay organized and study better together.
            </p>
          </div>

          <div className="top-actions">
            <button
              className="top-notification"
              onClick={() =>
                setActivePage("Notifications")
              }
            >
              ♢
              <span>2</span>
            </button>

            <div className="top-profile">
              <div className="small-avatar">
                B
              </div>

              <div>
                <strong>Bindhu</strong>
                <small>Student</small>
              </div>

              <span>⌄</span>
            </div>
          </div>
        </header>

        {renderPage()}
      </main>

      {/* GROUP DETAILS MODAL */}

      {selectedGroup && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedGroup(null)
          }
        >
          <div
            className="group-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setSelectedGroup(null)
              }
            >
              ×
            </button>

            <div
              className={`modal-icon ${
                selectedGroup.color || "purple"
              }`}
            >
              {selectedGroup.icon || "📚"}
            </div>

            <span
              className={
                selectedGroup.memberCount >=
                selectedGroup.maxMembers
                  ? "full-badge"
                  : "available"
              }
            >
              {selectedGroup.memberCount >=
              selectedGroup.maxMembers
                ? "Group Full"
                : "Open for Joining"}
            </span>

            <h2>{selectedGroup.subject}</h2>

            <p className="modal-description">
              {selectedGroup.description}
            </p>

            <div className="group-details">
              <div>
                <span>Members</span>
                <strong>
                  {selectedGroup.memberCount}/
                  {selectedGroup.maxMembers}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedGroup.availability}
                </strong>
              </div>
            </div>

            {isJoined(selectedGroup) ? (
              <button
                className="danger-btn"
                onClick={() =>
                  leaveGroup(selectedGroup)
                }
              >
                Leave Group
              </button>
            ) : selectedGroup.memberCount >=
              selectedGroup.maxMembers ? (
              <button
                className="secondary-btn full-width"
                disabled
              >
                Group Full
              </button>
            ) : (
              <button
                className="primary-btn full-width"
                onClick={() =>
                  joinGroup(selectedGroup)
                }
              >
                Join Group
              </button>
            )}
          </div>
        </div>
      )}
>>>>>>> 452f9fbde59162178ac32d61d868c05608a7bfaa
    </div>
  );
}

<<<<<<< HEAD
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
=======
export default App;
>>>>>>> 452f9fbde59162178ac32d61d868c05608a7bfaa
