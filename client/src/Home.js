import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import SelfEvaluation from "./components/SelfEvaluation";
import "./Home.css";
import BookDonationPage from "./components/BookDonation";
import DiscussionSection from "./components/Discussion";
import TestComponent from "./components/TestComponent";
import TestCreator from "./components/TestCreator";
import AboutUs from "./components/AboutUs";
import { jwtDecode } from 'jwt-decode';
import HeroSection from "./components/HeroSection";
import Evaluate from "./components/Examevaluate";


const backend_link = "https://hackblitz-nine.vercel.app";
function Home1({ user, setUser ,isLoggedIn, setIsLoggedIn, token, setToken }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const savedScreen = localStorage.getItem("activeScreen");
  const [activeScreen, setActiveScreen] = useState(savedScreen ? parseInt(savedScreen) : 1);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // New state: show/hide announcement panel
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const body = document.body;

// Inside your component
const announcementRef = useRef(null);

// Click outside handler
useEffect(() => {
  const handleClickOutside = (event) => {
    if (announcementRef.current && !announcementRef.current.contains(event.target)) {
      // Check if the click was not on the bell icon
      const bellIcon = document.querySelector('.announcement-bell');
      if (bellIcon && !bellIcon.contains(event.target)) {
        setShowAnnouncements(false);
      }
    }
  };

  if (showAnnouncements) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showAnnouncements]);
  
  // Assuming classId is stored in the user object
  let classId = null;
  //const token = localStorage.getItem('token');

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
        const response = await fetch(`${backend_link}/api/class/announcements`, {
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

  // Toggle the announcement panel visibility
  const toggleAnnouncementPanel = () => {
    setShowAnnouncements(!showAnnouncements);
  };

  return (
    <div className="app">
      <Navbar
        setActiveScreen={setActiveScreen}
        user={user}
        setUser={setUser}
        token={token}
        setToken={setToken}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        // Pass the announcement count and toggle function to Navbar
        announcementCount={announcements.length}
        toggleAnnouncementPanel={toggleAnnouncementPanel}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* Announcements Panel (only appears when toggled by the bell icon) */}
      {showAnnouncements && (
        <div className="announcement-section" ref={announcementRef}>
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
      
      
  {activeScreen === 1 ? (
    <>
      <HeroSection setActiveScreen={setActiveScreen}
        user={user}
        setUser={setUser}
        token={token}
        setToken={setToken}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        // Pass the announcement count and toggle function to Navbar
        announcementCount={announcements.length}
        toggleAnnouncementPanel={toggleAnnouncementPanel}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}/>
    </>
  ) : activeScreen === 2 ? (
    <DiscussionSection />
  ) : activeScreen === 3 ? (
    <TestComponent />
  ) : activeScreen === 4 ? (
    <AboutUs />
  ) : activeScreen === 5 ? (
    <BookDonationPage />
  ) : activeScreen === 7 ? (
    <SelfEvaluation />
  ) : activeScreen === 9 ? (
    <Evaluate />
  ) : (
    <p>Invalid Screen</p>
  )}


    </div>
  );
}

export default Home1;