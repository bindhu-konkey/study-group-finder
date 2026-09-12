import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [availability, setAvailability] = useState("All");

  // Backend connection
  const [backendStatus, setBackendStatus] = useState("");
  const [groups, setGroups] = useState([]);

  // Selected group for View button
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Check backend connection
  useEffect(() => {
    fetch("http://localhost:4000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setBackendStatus(data.status);
      })
      .catch(() => {
        setBackendStatus("Backend not connected");
      });
  }, []);

  // Get groups from backend
  useEffect(() => {
    fetch("http://localhost:4000/api/groups")
      .then((response) => response.json())
      .then((data) => {
        setGroups(data);
      })
      .catch((error) => {
        console.error("Error fetching groups:", error);
      });
  }, []);

  // Filter groups
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.subject
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      group.description
        .toLowerCase()
        .includes(search.toLowerCase());

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

          <p className="menu-title study-title">
            STUDY
          </p>

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


      {/* MAIN */}
      <main className="main">

        {/* TOP BAR */}
        <header className="topbar">

          <div>
            <h1>Dashboard</h1>

            <p>
              Stay organized and study better together.
            </p>
          </div>

          <div className="top-actions">

            <button className="top-notification">
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


        {/* WELCOME */}
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


        {/* BACKEND STATUS */}
        {backendStatus && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontWeight: "500"
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

            <div className="stat-icon">
              ♟
            </div>

            <div>
              <span>My Groups</span>
              <strong>3</strong>
              <small>groups joined</small>
            </div>

            <b>›</b>

          </div>


          <div className="stat-card green-card">

            <div className="stat-icon">
              ▣
            </div>

            <div>
              <span>Upcoming Sessions</span>
              <strong>2</strong>
              <small>this week</small>
            </div>

            <b>›</b>

          </div>


          <div className="stat-card blue-card">

            <div className="stat-icon">
              ◷
            </div>

            <div>
              <span>Study Hours</span>
              <strong>12h</strong>
              <small>total this week</small>
            </div>

            <b>›</b>

          </div>


          <div className="stat-card orange-card">

            <div className="stat-icon">
              ♢
            </div>

            <div>
              <span>Notifications</span>
              <strong>3</strong>
              <small>new updates</small>
            </div>

            <b>›</b>

          </div>

        </section>


        {/* SEARCH */}
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


        {/* FILTER PANEL */}
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

                <option value="All">
                  All Subjects
                </option>

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
                onChange={(e) =>
                  setAvailability(e.target.value)
                }
              >

                <option value="All">
                  All
                </option>

                <option value="Open">
                  Open
                </option>

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


        {/* STUDY GROUPS */}
        <section className="content-section">

          <div className="section-heading">

            <div>

              <h2>
                Explore Study Groups
              </h2>

              <p>
                Find students learning the same subjects.
              </p>

            </div>

            <button className="view-all">
              View all →
            </button>

          </div>


          <div className="group-grid">

            {filteredGroups.length > 0 ? (

              filteredGroups.map((group) => (

                <div
                  className={`group-card ${group.color}`}
                  key={group.subject}
                >

                  <div className="card-top">

                    <div className="subject-icon">
                      {group.icon}
                    </div>

                    <span className="available">
                      {group.availability}
                    </span>

                  </div>


                  <h3>
                    {group.subject}
                  </h3>


                  <p>
                    {group.description}
                  </p>


                  <div className="card-footer">

                    <div className="members">
                      ♟ &nbsp;
                      {group.members} members
                    </div>


                    <button
                      onClick={() =>
                        setSelectedGroup(group)
                      }
                    >
                      View →
                    </button>

                  </div>

                </div>

              ))

            ) : (

              <div className="no-results">

                <div>⌕</div>

                <h3>
                  No groups found
                </h3>

                <p>
                  Try changing your search or filters.
                </p>

              </div>

            )}

          </div>

        </section>


        {/* UPCOMING SESSIONS */}
        <section className="content-section">

          <div className="section-heading">

            <div>

              <h2>
                Upcoming Study Sessions
              </h2>

              <p>
                Don't miss your scheduled sessions.
              </p>

            </div>

            <button className="view-all">
              View schedule →
            </button>

          </div>


          <div className="sessions">


            <div className="session-card">

              <div className="date-box">

                <span>SEP</span>
                <strong>15</strong>

              </div>


              <div className="session-info">

                <h3>
                  Java Study Session
                </h3>

                <p>
                  ◷ &nbsp;4:00 PM &nbsp; • &nbsp;
                  📍 Computer Lab / Google Meet
                </p>

              </div>


              <span className="session-status">
                Upcoming
              </span>


              <button className="details-btn">
                Details →
              </button>

            </div>


            <div className="session-card">

              <div className="date-box blue-date">

                <span>SEP</span>
                <strong>17</strong>

              </div>


              <div className="session-info">

                <h3>
                  Computer Networks Discussion
                </h3>

                <p>
                  ◷ &nbsp;5:00 PM &nbsp; • &nbsp;
                  📍 Classroom 204
                </p>

              </div>


              <span className="session-status">
                Upcoming
              </span>


              <button className="details-btn">
                Details →
              </button>

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
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >

          <div
            style={{
              background: "white",
              width: "420px",
              maxWidth: "90%",
              padding: "30px",
              borderRadius: "18px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}
            >

              <h2 style={{ margin: 0 }}>
                {selectedGroup.subject}
              </h2>

              <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  }}
>
  <h2 style={{ margin: 0 }}>
    {selectedGroup.icon} {selectedGroup.subject}
  </h2>

  <button
    onClick={() => setSelectedGroup(null)}
    style={{
      border: "none",
      background: "transparent",
      fontSize: "24px",
      cursor: "pointer",
      color: "#333"
    }}
  >
    ✕
  </button>
</div>

            </div>


            <p>
              {selectedGroup.description}
            </p>


            <p>
              <strong>Members:</strong>{" "}
              {selectedGroup.members}
            </p>


            <p>
              <strong>Availability:</strong>{" "}
              {selectedGroup.availability}
            </p>


            <button
              onClick={() => alert(
                `You selected ${selectedGroup.subject}`
              )}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600"
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