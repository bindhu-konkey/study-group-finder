import React, { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { Navbar } from "./components/Navbar";
import { GroupList } from "./components/GroupList";
import { Dashboard } from "./components/Dashboard";
import { MyGroups } from "./components/MyGroups";

import { CalendarPage } from "./pages/CalendarPage";
import { CreateGroupPage } from "./pages/CreateGroupPage";
import { GroupDetailPage } from "./pages/GroupDetailPage";

import { AuthModal } from "./components/AuthModal";
import { ProfileModal } from "./components/ProfileModal";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { MeetingModal } from "./components/MeetingModal";
import { GroupDetailModal } from "./components/GroupDetailModal";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { Toast } from "./components/Toast";

import { api } from "./services/api";

function MainApp() {
  const { isAuthenticated } = useAuth();

  const getInitialRoute = () => {
    const path = window.location.pathname;

    if (path.startsWith("/groups/")) {
      const id = path.replace("/groups/", "").trim();
      return { tab: "group-detail", groupId: id };
    }

    if (path === "/calendar") {
      return { tab: "calendar", groupId: null };
    }

    if (path === "/my-groups") {
      return { tab: "my-groups", groupId: null };
    }

    if (path === "/create-group") {
      return { tab: "create-group", groupId: null };
    }

    if (path === "/dashboard") {
      return { tab: "dashboard", groupId: null };
    }

    return { tab: "explore", groupId: null };
  };

  const initialRoute = getInitialRoute();

  const [activeTab, setActiveTabState] = useState(initialRoute.tab);
  const [selectedDetailGroupId, setSelectedDetailGroupId] = useState(
    initialRoute.groupId
  );

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedMeetingGroup, setSelectedMeetingGroup] = useState(null);
  const [selectedDetailGroup, setSelectedDetailGroup] = useState(null);

  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  const [toast, setToast] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showToast = (message, type = "info") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("studysync_theme");
  }, []);

  const navigateTo = useCallback((tab, param = null) => {
    setActiveTabState(tab);

    if (tab === "group-detail" && param) {
      setSelectedDetailGroupId(param);
      window.history.pushState(
        null,
        "",
        "/groups/" + param
      );
    } else {
      setSelectedDetailGroupId(null);

      const targetUrl =
        tab === "explore" ? "/" : "/" + tab;

      window.history.pushState(null, "", targetUrl);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();

      setActiveTabState(route.tab);
      setSelectedDetailGroupId(route.groupId);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleJoinGroup = async (groupId) => {
    if (!isAuthenticated) {
      showToast(
        "Please sign in or create an account to join study groups.",
        "info"
      );

      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await api.groups.join(groupId);

      showToast(
        res.message || "Joined study group successfully!",
        "success"
      );

      setRefreshTrigger((prev) => prev + 1);

      if (selectedDetailGroup?._id === groupId) {
        setSelectedDetailGroup(res.group);
      }
    } catch (err) {
      showToast(
        err.message || "Failed to join group.",
        "error"
      );
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!isAuthenticated) return;

    try {
      const res = await api.groups.leave(groupId);

      showToast(
        res.message || "Left study group.",
        "info"
      );

      setRefreshTrigger((prev) => prev + 1);

      if (selectedDetailGroup?._id === groupId) {
        setSelectedDetailGroup(res.group || null);
      }
    } catch (err) {
      showToast(
        err.message || "Failed to leave group.",
        "error"
      );
    }
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      showToast(
        "Please sign in to create and lead a study group.",
        "info"
      );

      setAuthModalOpen(true);
      return;
    }

    navigateTo("create-group");
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setCreateModalOpen(true);
  };

  const handleDeleteGroup = (groupOrId) => {
    if (!groupOrId) return;

    if (typeof groupOrId === "string") {
      const deletedId = groupOrId;

      setRefreshTrigger((prev) => prev + 1);

      if (selectedDetailGroup?._id === deletedId) {
        setSelectedDetailGroup(null);
      }

      if (
        activeTab === "group-detail" &&
        selectedDetailGroupId === deletedId
      ) {
        navigateTo("my-groups");
      }

      return;
    }

    setGroupToDelete(groupOrId);
  };

  const handleConfirmGlobalDelete = async () => {
    if (!groupToDelete?._id) return;

    setIsDeletingGroup(true);

    const targetId = groupToDelete._id;

    try {
      const res = await api.groups.delete(targetId);

      showToast(
        res.message || "Group deleted successfully.",
        "success"
      );

      setRefreshTrigger((prev) => prev + 1);

      if (selectedDetailGroup?._id === targetId) {
        setSelectedDetailGroup(null);
      }

      if (
        activeTab === "group-detail" &&
        selectedDetailGroupId === targetId
      ) {
        navigateTo("my-groups");
      }

      setGroupToDelete(null);
    } catch (err) {
      let errorMsg =
        "Unable to delete the group. Please try again.";

      const msg = err.message || "";

      if (
        msg.includes("permission") ||
        msg.includes("403")
      ) {
        errorMsg =
          "You don't have permission to delete this group.";
      } else if (
        msg.includes("not found") ||
        msg.includes("404")
      ) {
        errorMsg = "Group not found.";
      } else if (
        msg.includes("expired") ||
        msg.includes("token") ||
        msg.includes("401") ||
        msg.includes("Authentication")
      ) {
        errorMsg =
          "Authentication expired. Please log in again.";
      }

      showToast(errorMsg, "error");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const handleViewDetails = (groupOrId) => {
    const id =
      typeof groupOrId === "object"
        ? groupOrId._id
        : groupOrId;

    navigateTo("group-detail", id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => navigateTo(tab)}
        onCreateGroupClick={handleCreateClick}
        onAuthClick={() => setAuthModalOpen(true)}
        onProfileClick={() => setProfileModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "explore" && (
          <GroupList
            onViewDetails={handleViewDetails}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onOpenMeetings={(group) =>
              setSelectedMeetingGroup(group)
            }
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onCreateClick={handleCreateClick}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === "dashboard" && (
          <Dashboard
            onViewDetails={handleViewDetails}
            onOpenMeetings={(group) =>
              setSelectedMeetingGroup(group)
            }
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onExploreClick={() => navigateTo("explore")}
            showToast={showToast}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === "my-groups" && (
          <MyGroups
            onViewDetails={handleViewDetails}
            onOpenMeetings={(group) =>
              setSelectedMeetingGroup(group)
            }
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onLeaveGroup={handleLeaveGroup}
            onCreateClick={handleCreateClick}
            refreshTrigger={refreshTrigger}
            showToast={showToast}
          />
        )}

        {activeTab === "calendar" && (
          <CalendarPage
            onViewDetails={handleViewDetails}
            onOpenMeeting={(group) =>
              setSelectedMeetingGroup(group)
            }
            onExploreClick={() => navigateTo("explore")}
          />
        )}

        {activeTab === "create-group" && (
          <CreateGroupPage
            onCancel={() => navigateTo("explore")}
            onSuccess={(newGroup) => {
              showToast(
                "Study group \"" +
                  newGroup.title +
                  "\" created successfully!",
                "success"
              );

              setRefreshTrigger((prev) => prev + 1);

              navigateTo(
                "group-detail",
                newGroup._id
              );
            }}
          />
        )}

        {activeTab === "group-detail" &&
          selectedDetailGroupId && (
            <GroupDetailPage
              groupId={selectedDetailGroupId}
              onBack={() => navigateTo("explore")}
              onJoinGroup={handleJoinGroup}
              onLeaveGroup={handleLeaveGroup}
              onScheduleMeeting={(group) =>
                setSelectedMeetingGroup(group)
              }
              onDeleteGroup={handleDeleteGroup}
            />
          )}
      </main>

      <footer className="mt-auto border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Study Group Finder</strong> • Academic
            Elegance UI/UX Platform
          </div>

          <div>
            Inspired by Notion & Linear • Peer Study Circle &
            Schedule Management
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() =>
          setRefreshTrigger((prev) => prev + 1)
        }
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
        onGroupCreated={() =>
          setRefreshTrigger((prev) => prev + 1)
        }
        showToast={showToast}
      />

      <MeetingModal
        isOpen={!!selectedMeetingGroup}
        group={selectedMeetingGroup}
        onClose={() =>
          setSelectedMeetingGroup(null)
        }
        showToast={showToast}
      />

      <GroupDetailModal
        isOpen={!!selectedDetailGroup}
        group={selectedDetailGroup}
        onClose={() =>
          setSelectedDetailGroup(null)
        }
        onJoin={handleJoinGroup}
        onLeave={handleLeaveGroup}
        onDelete={handleDeleteGroup}
        showToast={showToast}
      />

      <DeleteConfirmationModal
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={handleConfirmGlobalDelete}
        groupTitle={groupToDelete?.title}
        isDeleting={isDeletingGroup}
      />

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
export default App;
