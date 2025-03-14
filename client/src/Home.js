import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SelfEvaluation from "./components/SelfEvaluation";
import "./Home.css";
import BookDonationPage from "./components/BookDonation";
import DiscussionSection from "./components/Discussion";
import AboutUs from "./components/AboutUs";
import { jwtDecode } from 'jwt-decode';

function Home1({ user, setUser }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const savedScreen = localStorage.getItem("activeScreen");
  const [activeScreen, setActiveScreen] = useState(savedScreen ? parseInt(savedScreen) : 1);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const body = document.body;
  // Assuming classId is stored in the user object
  let classId = null;
  const token = localStorage.getItem('token');

  // Decode JWT to extract user details
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      classId = decodedToken.class;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!classId) return; // Don't fetch if classId is missing
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/class/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classId }),
        });
        if (!response.ok) throw new Error("Failed to fetch announcements");
        const data = await response.json();
        // Initialize each announcement with an expanded flag (and other properties if needed)
        const updatedData = data.map((note) => ({
          ...note,
          expanded: false,
        }));
        setAnnouncements(updatedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [classId]);

  useEffect(() => {
    localStorage.setItem("activeScreen", activeScreen);
    activeScreen === 3 ? openChat() : closeChat();
  }, [activeScreen]);

  function openChat() {
    body.classList.add("blurred");
  }

  function closeChat() {
    body.classList.remove("blurred");
  }

  // Toggle expansion of an announcement (to show full details and date)
  const toggleExpansion = (index) => {
    setAnnouncements((prev) =>
      prev.map((n, i) =>
        i === index ? { ...n, expanded: !n.expanded } : n
      )
    );
  };

  // Dismiss (remove) an announcement from the list
  const dismissAnnouncement = (index) => {
    setAnnouncements((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="app">
      <Navbar
        setActiveScreen={setActiveScreen}
        user={user}
        setUser={setUser}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {activeScreen === 1 && (
        <div className="announcement-section">
          <h2 className="announcement-title">Announcements</h2>
          {loading ? (
            <p>Loading announcements...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : announcements.length > 0 ? (
            <ul className="announcement-list">
              {announcements.map((note, idx) => (
                <li
                  key={idx}
                  className={`announcement-item flyIn ${note.expanded ? "expanded" : ""}`}
                  style={{ animationDelay: `${idx * 0.3}s` }}
                  onClick={() => toggleExpansion(idx)}
                >
                  {/* Tick Button (acts as dismiss) placed at the top-right */}
                  <button
                    className="tick-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissAnnouncement(idx);
                    }}
                  >
                    ✓
                  </button>
                  <span className="ping-dot">
                    <span className="ping-animate"></span>
                    <span className="ping-core"></span>
                  </span>
                  <p className="announcement-text">
                    {note.expanded ? (
                      <>
                        {note.message} <br />
                        <small>- {note.teacherName}</small>
                        <small>
                          Date: {note.date ? new Date(note.date).toLocaleString() : "Not available"}
                        </small>
                      </>
                    ) : (
                      <>
                        {note.message.substring(0, 50)}... <br />
                        <small>- {note.teacherName}</small>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No announcements available.</p>
          )}
        </div>
      )}

      {activeScreen === 2 && <DiscussionSection />}
      {activeScreen === 4 && <AboutUs />}
      {activeScreen === 5 && <BookDonationPage />}
      {activeScreen === 7 && <SelfEvaluation />}
    </div>
  );
}

export default Home1;
