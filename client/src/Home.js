import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SelfEvaluation from "./components/SelfEvaluation";
import "./Home.css";
import BookDonationPage from "./components/BookDonation";
import DiscussionSection from "./components/Discussion";
import TestComponent from "./components/TestComponent";
import TestCreator from "./components/TestCreator";
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
  
    // Decode JWT to extract user ID
    let userId = null;
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
      //  userId = decodedToken.id;
      classId=decodedToken.class;
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
          body: JSON.stringify({ classId }), // Send classId in JSON body
        });

        if (!response.ok) throw new Error("Failed to fetch announcements");

        const data = await response.json();
        setAnnouncements(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [classId]); // Refetch when classId changes

  return (
    <div className="app">
      <Navbar setActiveScreen={setActiveScreen} user={user} setUser={setUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

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
                <li key={idx} className="announcement-item">
                  <span className="ping-dot">
                    <span className="ping-animate"></span>
                    <span className="ping-core"></span>
                  </span>
                  <p className="announcement-text">
                    {note.message} <br />
                    <small>- {note.teacherName}</small>
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
      {activeScreen === 3 && <TestComponent/>}
      {activeScreen === 4 && <AboutUs />}
      {activeScreen === 5 && <BookDonationPage />}
      {activeScreen === 6 && <SelfEvaluation />}
      {activeScreen === 7 && <TestCreator />}
    </div>
  );
}

export default Home1;
