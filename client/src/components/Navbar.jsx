import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TestComponent from "./TestComponent";
import TestCreator from "./TestCreator";
import Evaluate from "./examevaluate";
import "./styles/Navbar.css";
import darkmode from "../icons/dark.png";
import lightmode from "../icons/light.png";
import l from "../icons/user.png"; // Assuming user image is here
import { Home, MessageCircle, ClipboardList, Info, Heart, PlusCircle, BookOpenCheck } from 'lucide-react';
import ProfileBookModal from "./ProfileBookModal"; // Ensure the path is correct
import { jwtDecode } from 'jwt-decode';

function Navbar({ setActiveScreen, user, setUser, isDarkMode, setIsDarkMode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isTestCreatorOpen, setIsTestCreatorOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  const profileRef = useRef(null);

  // Adjust layout based on window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle between dark and light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode", !isDarkMode);
  };

  // Handle logout: clear token and reload the page
  const handleLogout = () => {
    console.log("Attempting to log out...");
    localStorage.removeItem("token");
    setUser(null);
    console.log("Logout successful.");
    window.location.reload();
  };

  // Function to fetch the user profile when "View Your Profile" is clicked
  const handleViewProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
  
    // Decode the token to extract the user ID
    const decoded = jwtDecode(token);
    const userId = decoded.id; // Ensure your token contains an 'id' field
    console.log("User ID:", userId);
    if (!userId) {
      console.error("User ID not found in token");
      return;
    }
  
    try {
      // Send a GET request to your API endpoint with the user ID in the URL
      const response = await axios.get(`http://localhost:5000/api/auth/profile/${userId}`);
      const data = response.data;
      setProfileData(data);
      console.log("Profile Data:", data);
      setUser(data.username);
      setIsProfileModalOpen(true);
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Use dynamic username if available; fallback to provided user prop
  const fullFirstName = (profileData?.username || user || "User").split(" ")[0];
  const displayName = isMobile ? fullFirstName.charAt(0) : fullFirstName;

  const navItems = [
    { id: 1, name: 'Home', icon: <Home /> },
    { id: 2, name: 'Discussion', icon: <MessageCircle /> },
    { id: 3, name: 'Test', icon: <ClipboardList /> },
    { id: 4, name: 'About Us', icon: <Info /> },
    { id: 5, name: 'Donate', icon: <Heart /> },
    { id: 7, name: 'Self Evaluation', icon: <BookOpenCheck /> },
    { id: 8, name: 'Evaluate', icon: <BookOpenCheck /> } 
   
  ];

  // Handle navigation clicks and toggle related components
  const handleNavClick = (screen) => {
    setIsTestOpen(false);
    setIsTestCreatorOpen(false);
    setIsMobileMenuOpen(false);

    if (screen === 3) {
      setIsTestOpen(true);
      setActiveScreen(null);
    } else if (screen === 6) {
      setIsTestCreatorOpen(true);
      setActiveScreen(null);
    } 
    else if (screen === 8) {
      setIsEvaluateOpen(true); // Open Evaluate component
      setActiveScreen(null);
    }
    else {
      setActiveScreen(screen);
    }
  };

  // Updated default profile data including academic details (className and averageScore)
  const defaultProfileData = {
    name: profileData?.username || "John Doe",
    email: profileData?.email || "johndoe@example.com",
    phone: profileData?.phone || "123-456-7890",
    className: profileData?.className || "Not Provided",
    testsAttempted: profileData?.tests?.length || 0,
    averageScore: profileData?.averageScore !== undefined 
      ? `${(profileData.averageScore * 100).toFixed(2)}%`
      : "85%",
    otherInfo: profileData?.otherInfo || "Enrolled in Computer Science"
  };
  

  return (
    <>
      <nav className={`navbar ${isDarkMode ? 'dark' : 'light'}`}>
        {/* Left Section: Hamburger and Brand */}
        <div className="navbar-left">
          <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg width="30" height="30" viewBox="0 0 100 80" fill="currentColor">
              <rect width="100" height="10"></rect>
              <rect y="30" width="100" height="10"></rect>
              <rect y="60" width="100" height="10"></rect>
            </svg>
          </div>
          <div className="navbar-brand">[Name]</div>
        </div>

        {/* Center Navigation Links */}
        <ul className="navbar-links">
          {navItems.map((item) => (
            <li
              key={item.id}
              className="nav-item"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleNavClick(item.id)}
            >
              <div className={`nav-icon ${hovered === item.id ? 'hovered' : ''}`}>
                {item.icon}
                {hovered === item.id && <span className="icon-label">{item.name}</span>}
              </div>
            </li>
          ))}
          {/* Navigation Item for Test Creator */}
          <li
            className="nav-item"
            onMouseEnter={() => setHovered(6)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleNavClick(6)}
          >
            <div className={`nav-icon ${hovered === 6 ? 'hovered' : ''}`}>
              <PlusCircle />
              {hovered === 6 && <span className="icon-label">Create Test</span>}
            </div>
          </li>
        </ul>

        {/* Right Section: Mode Toggle, Profile, and Logout */}
        <div className="navbar-right">
          <img
            src={isDarkMode ? lightmode : darkmode}
            alt={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            className="mode-toggle icon-image"
            onClick={toggleTheme}
          />

          <div className="profile-container" ref={profileRef}>
            <img
              src={l}
              alt="Profile"
              className="profile-icon"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            />

            {isProfileDropdownOpen && (
              <div className="profile-dropdown">
                <img src={l} alt="Profile" className="profile-pic" />
                <div className="profile-username">{fullFirstName}</div>
                <button 
                  className="view-profile-btn" 
                  onClick={handleViewProfile}
                >
                  View Your Profile
                </button>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            <li><a onClick={() => handleNavClick(1)}>Home</a></li>
            <li><a onClick={() => handleNavClick(2)}>Documents</a></li>
            <li><a onClick={() => handleNavClick(3)}>Chat</a></li>
            <li><a onClick={() => handleNavClick(4)}>About Us</a></li>
            <li><a onClick={() => handleNavClick(6)}>Create Test</a></li>
          </ul>
        </div>
      )}

      {/* Test Component */}
      {isTestOpen && <TestComponent isOpen={isTestOpen} onClose={() => setIsTestOpen(false)} />}

      {/* Test Creator Component */}
      {isTestCreatorOpen && (
        <TestCreator
          onClose={() => setIsTestCreatorOpen(false)}
          teacherId={user}
        />
      )}

{isEvaluateOpen && (
  <Evaluate
    onClose={() => setIsEvaluateOpen(false)}
    teacherId={user} // Pass the teacherId to the Evaluate component
  />
)}

      {/* Profile Book Modal */}
      {isProfileModalOpen && (
        <ProfileBookModal 
          onClose={() => setIsProfileModalOpen(false)} 
          profileData={defaultProfileData} 
        />
      )}
    </>
  );
}

export default Navbar;
