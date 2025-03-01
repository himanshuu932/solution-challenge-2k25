import React, { useState, useEffect, act } from "react";
import Navbar from "./components/Navbar";
import TestComponent from "./components/TestComponent";

import "./Home.css";


function Home1({ user, setUser,saved,setSaved }) {
  // Check localStorage for the saved activeScreen value or default to 1
  const [isDarkMode, setIsDarkMode] = useState(false);
  const savedScreen = localStorage.getItem("activeScreen");
  const [activeScreen, setActiveScreen] = useState(savedScreen?parseInt(savedScreen):1);
  const [savedFolderLink, setSavedFolderLink] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    localStorage.setItem("activeScreen", activeScreen);
    activeScreen==3? openChat():closeChat();
  }, [activeScreen]);
  const body = document.body;

 function openChat() {
    // Show the chat container
    body.classList.add('blurred');       // Add blur effect
  }
  
  // Function to close the chat
  function closeChat() {
   // chatContainer.style.display = 'none'; // Hide the chat container
    body.classList.remove('blurred');    // Remove blur effect
  }

  const announcements = [
    'Scheduled maintenance on Feb 28th, 12:00 AM - 2:00 AM.',
    'New feature rollout next week!',
    'Join our community event on March 5th.'
  ];
  

  return (
    <div className="app">
      {/* Navbar */}
      <Navbar setActiveScreen={setActiveScreen} user={user} setUser={setUser} 
      connectionStatus={connectionStatus} isProcessing={isProcessing}
      isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
      />
      {/* Start Screen */
      <div className="start-screen-section">
        {/* {activeScreen === 1 && <StartScreen  setActiveScreen={setActiveScreen} />}
        {activeScreen === 2 && 
        <DocumentModal activeScreen={activeScreen} 
         savedFolderLink={savedFolderLink} 
         setSavedFolderLink={setSavedFolderLink}
         setConnectionStatus={setConnectionStatus}
         isProcessing={isProcessing}
         setIsProcessing={setIsProcessing}
         />} */}
        {/* {activeScreen === 4 && <AboutUs  isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}/>}
        {activeScreen === 3 && <ChatSection setActiveScreen={setActiveScreen}   messages={messages} setMessages={setMessages} />} */}
      </ div>}
     {/* Render only the selected screen */}
     {activeScreen === 1 && (
        <>
         
          <div className="announcement-section">
            <h2 className="announcement-title">Announcements</h2>
            <ul className="announcement-list">
              {announcements.map((note, idx) => (
                <li key={idx} className="announcement-item">
                  <span className="ping-dot">
                    <span className="ping-animate"></span>
                    <span className="ping-core"></span>
                  </span>
                  <p className="announcement-text">{note}</p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default Home1;