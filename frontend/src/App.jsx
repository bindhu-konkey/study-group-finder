import { useState, useEffect } from "react";
import "./App.css";
import CreateGroupForm from "./components/CreateGroupForm";

const API_URL = "http://localhost:4000/api";
const CURRENT_USER_ID = "demo-user";

function App() {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [availability, setAvailability] = useState("All");

  const [backendStatus, setBackendStatus] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [editingGroup, setEditingGroup] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ============================================
  // CHECK BACKEND CONNECTION
  // ============================================

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend health check failed");
        }

        return response.json();
      })
      .then((data) => {
        setBackendStatus(data.status);
      })
      .catch((error) => {
        console.error("Backend connection error:", error);
        setBackendStatus("Backend not connected");
      });
  }, []);

  // ============================================
  // GET GROUPS FROM BACKEND
  // ============================================

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);

      const response = await fetch(`${API_URL}/groups`);

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // ============================================
  // HANDLE GROUP CREATED
  // ============================================

  const handleGroupCreated = async () => {
    await fetchGroups();
    setShowCreateForm(false);
    alert("Group created successfully");
  };

  // ============================================
  // UPDATE GROUP
  // ============================================

  const updateGroup = async (groupId, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedData,
          creatorId: CURRENT_USER_ID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update group");
      }

      setGroups((previousGroups) =>
        previousGroups.map((group) =>
          String(group.id || group._id) === String(groupId)
            ? data.group
            : group
        )
      );

      setEditingGroup(null);
      setShowEditForm(false);

      alert("Group updated successfully");
    } catch (error) {
      console.error("Update group error:", error);
      alert(error.message);
    }
  };

  // ============================================
  // DELETE GROUP
  // ============================================

  const deleteGroup = async (groupId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this group?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId: CURRENT_USER_ID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete group");
      }

      setGroups((previousGroups) =>
        previousGroups.filter(
          (group) =>
            String(group.id || group._id) !== String(groupId)
        )
      );

      if (
        selectedGroup &&
        String(selectedGroup.id || selectedGroup._id) ===
          String(groupId)
      ) {
        setSelectedGroup(null);
      }

      alert("Group deleted successfully");
    } catch (error) {
      console.error("Delete group error:", error);
      alert(error.message);
    }
  };

  // ============================================
  // FILTER GROUPS
  // ============================================

  const filteredGroups = groups.filter((group) => {
    const name = group.name || "";
    const subject = group.subject || "";
    const description = group.description || "";
    const groupAvailability = group.availability || "Open";

    const searchText = search.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(searchText) ||
      subject.toLowerCase().includes(searchText) ||
      description.toLowerCase().includes(searchText);

    const matchesSubject =
      selectedSubject === "All" || subject === selectedSubject;

    const matchesAvailability =
      availability === "All" ||
      groupAvailability === availability;

    return matchesSearch && matchesSubject && matchesAvailability;
  });

  // ============================================
  // CLEAR FILTERS
  // ============================================

  const clearFilters = () => {
    setSelectedSubject("All");
    setAvailability("All");
    setSearch("");
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

          <button className="menu-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button className="menu-item">
            <span>♟</span>
            My Groups
          </button>

          <button className="menu-item">
            <span>⌕</span>
            Explore Groups
          </button>

          <p className="menu-title study-title">STUDY</p>

          <button className="menu-item">
            <span>▣</span>
            Schedule
          </button>

          <button className="menu-item">
            <span>♢</span>
            Notifications
            <span className="notification-count">2</span>
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

      {/* MAIN CONTENT */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Stay organized and study better together.</p>
          </div>

          <div className="top-actions">
            <button className="top-notification">
              ♢ <span>2</span>
            </button>

            <div className="top-profile">
              <div className="small-avatar">B</div>

              <div>
                <strong>Bindhu</strong>
                <small>Student</small>
              </div>

              <span>⌄</span>
            </div>
          </div>
        </header>

        {/* WELCOME SECTION */}
        <section className="welcome">
          <div>
            <p className="welcome-label">GOOD MORNING ☀️</p>

            <h2>Welcome back, Bindhu 👋</h2>

            <p>
              Find your study group and keep your learning on track.
            </p>
          </div>

          <div className="welcome-books">📚</div>
        </section>

        {/* BACKEND STATUS */}
        {backendStatus && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontWeight: "500",
            }}
          >
            {backendStatus === "ok" ? (
              <span>🟢 Backend connected</span>
            ) : (
              <span>🔴 Backend not connected</span>
            )}
          </div>
        )}

        {/* STATISTICS */}
        <section className="stats">
          <div className="stat-card purple-card">
            <div className="stat-icon">♟</div>

            <div>
              <span>My Groups</span>
              <strong>3</strong>
              <small>groups joined</small>
            </div>

            <b>›</b>
          </div>

          <div className="stat-card green-card">
            <div className="stat-icon">▣</div>

            <div>
              <span>Upcoming Sessions</span>
              <strong>2</strong>
              <small>this week</small>
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

        {/* CREATE GROUP BUTTON AND FORM */}
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Create a Study Group</h2>
              <p>Start a new group and invite other students.</p>
            </div>

            {!showCreateForm && (
              <button
                className="view-all"
                onClick={() => {
                  setShowCreateForm(true);
                  setShowEditForm(false);
                  setEditingGroup(null);
                }}
              >
                + Create Group
              </button>
            )}
          </div>

          {showCreateForm && (
            <CreateGroupForm
              onGroupCreated={handleGroupCreated}
              onClose={() => setShowCreateForm(false)}
            />
          )}
        </section>

        {/* EDIT GROUP FORM */}
        {showEditForm && editingGroup && (
          <section className="content-section">
            <CreateGroupForm
              initialData={editingGroup}
              onSubmit={(updatedData) =>
                updateGroup(
                  editingGroup.id || editingGroup._id,
                  updatedData
                )
              }
              onClose={() => {
                setEditingGroup(null);
                setShowEditForm(false);
              }}
            />
          </section>
        )}

        {/* SEARCH AREA */}
        <section className="search-area">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search groups by subject or course..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            className="filter-btn"
            onClick={() => setShowFilter(!showFilter)}
          >
            ☷ &nbsp; Filter
          </button>
        </section>

        {/* FILTER PANEL */}
        {showFilter && (
          <div className="filter-panel">
            <div className="filter-group">
              <h4>Subject</h4>

              <select
                value={selectedSubject}
                onChange={(event) =>
                  setSelectedSubject(event.target.value)
                }
              >
                <option value="All">All Subjects</option>
                <option value="Java Programming">
                  Java Programming
                </option>
                <option value="Computer Networks">
                  Computer Networks
                </option>
                <option value="Database Management">
                  Database Management
                </option>
              </select>
            </div>

            <div className="filter-group">
              <h4>Availability</h4>

              <select
                value={availability}
                onChange={(event) =>
                  setAvailability(event.target.value)
                }
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
              </select>
            </div>

            <button className="clear-filter" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {/* STUDY GROUPS */}
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Explore Study Groups</h2>
              <p>Find students learning the same subjects.</p>
            </div>

            <button className="view-all" onClick={fetchGroups}>
              Refresh Groups →
            </button>
          </div>

          {loadingGroups ? (
            <p>Loading study groups...</p>
          ) : (
            <div className="group-grid">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group, index) => {
                  const groupId =
                    group.id || group._id || index;

                  const isMyGroup =
                    group.creatorId === CURRENT_USER_ID;

                  return (
                    <div
                      className={`group-card ${group.color || ""}`}
                      key={groupId}
                    >
                      <div className="card-top">
                        <div className="subject-icon">
                          {group.icon || "📚"}
                        </div>

                        <span className="available">
                          {group.availability || "Open"}
                        </span>
                      </div>

                      <h3>{group.name || group.subject}</h3>

                      <p>
                        <strong>Subject:</strong>{" "}
                        {group.subject}
                      </p>

                      <p>{group.description}</p>

                      <div className="card-footer">
                        <div className="members">
                          ♟ &nbsp; Member limit:{" "}
                          {group.memberLimit}
                        </div>

                        <button
                          onClick={() => setSelectedGroup(group)}
                        >
                          View →
                        </button>
                      </div>

                      {isMyGroup && (
                        <div className="card-actions">
                          <button
                            onClick={() => {
                              setEditingGroup(group);
                              setShowEditForm(true);
                              setShowCreateForm(false);

                              window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                              });
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteGroup(
                                group.id || group._id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="no-results">
                  <div>⌕</div>
                  <h3>No groups found</h3>
                  <p>Try changing your search or filters.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* UPCOMING SESSIONS */}
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Upcoming Study Sessions</h2>
              <p>Don't miss your scheduled sessions.</p>
            </div>

            <button className="view-all">View schedule →</button>
          </div>

          <div className="sessions">
            <div className="session-card">
              <div className="date-box">
                <span>SEP</span>
                <strong>15</strong>
              </div>

              <div className="session-info">
                <h3>Java Study Session</h3>
                <p>
                  ◷ 4:00 PM &nbsp; • &nbsp; 📍 Computer Lab / Google Meet
                </p>
              </div>

              <span className="session-status">Upcoming</span>

              <button className="details-btn">Details →</button>
            </div>

            <div className="session-card">
              <div className="date-box blue-date">
                <span>SEP</span>
                <strong>17</strong>
              </div>

              <div className="session-info">
                <h3>Computer Networks Discussion</h3>
                <p>◷ 5:00 PM &nbsp; • &nbsp; 📍 Classroom 204</p>
              </div>

              <span className="session-status">Upcoming</span>

              <button className="details-btn">Details →</button>
            </div>
          </div>
        </section>
      </main>

      {/* GROUP DETAILS POPUP */}
      {selectedGroup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              width: "420px",
              maxWidth: "90%",
              padding: "30px",
              borderRadius: "18px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {selectedGroup.icon || "📚"}{" "}
                {selectedGroup.name || selectedGroup.subject}
              </h2>

              <button
                onClick={() => setSelectedGroup(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#333",
                }}
              >
                ✕
              </button>
            </div>

            <p>
              <strong>Subject:</strong>{" "}
              {selectedGroup.subject}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {selectedGroup.description}
            </p>

            <p>
              <strong>Member limit:</strong>{" "}
              {selectedGroup.memberLimit}
            </p>

            <p>
              <strong>Created by:</strong>{" "}
              {selectedGroup.creatorId}
            </p>

            <p>
              <strong>Availability:</strong>{" "}
              {selectedGroup.availability || "Open"}
            </p>

            <button
              onClick={() =>
                alert(
                  `You selected ${
                    selectedGroup.name || selectedGroup.subject
                  }`
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Join Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;