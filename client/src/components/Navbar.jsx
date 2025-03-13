import React, { useState, useEffect, useRef } from "react";
import TestComponent from "./TestComponent";
import TestCreator from "./TestCreator";
import "./styles/Navbar.css";
import darkmode from "../icons/dark.png";
import lightmode from "../icons/light.png";
import l from "../icons/user.png"; // Assuming user image is here
import { Home, MessageCircle, ClipboardList, Info, Heart, PlusCircle,BookOpenCheck } from 'lucide-react'; // Added PlusCircle for "Create Test"

function Navbar({ setActiveScreen, user, setUser, isDarkMode, setIsDarkMode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isTestCreatorOpen, setIsTestCreatorOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode", !isDarkMode);
  };

  const handleLogout = () => {
    console.log("Attempting to log out...");
    if (typeof setUser === "function") {
      localStorage.removeItem("token");
      setUser(null); // Set user to null
      console.log("Logout successful.");
      window.location.reload();
    } else {
      console.error("setUser is not a function");
    }
  };

  const fullFirstName = user.split(" ")[0] || "User";
  const displayName = isMobile ? fullFirstName.charAt(0) : fullFirstName;

  const navItems = [
    { id: 1, name: 'Home', icon: <Home /> },
    { id: 2, name: 'Discussion', icon: <MessageCircle /> },
    { id: 3, name: 'Test', icon: <ClipboardList /> },
    { id: 4, name: 'About Us', icon: <Info /> },
    { id: 5, name: 'Donate', icon: <Heart /> },
     { id: 6, name: 'Self Evaluation', icon: <BookOpenCheck/>},
     { id: 7, name: 'Create', icon: <PlusCircle/>}
  ];

  const handleNavClick = (screen) => {
    // Close all other components when a new navigation item is clicked
    setIsTestOpen(false);
    setIsTestCreatorOpen(false);
    setIsMobileMenuOpen(false);

      setActiveScreen(screen); 
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
          {/* Add a new navigation item for Test Creator */}
        
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
                <button className="view-profile-btn" onClick={() => setActiveScreen(6)}>View Your Profile</button>
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

     
    </>
  );
}

export default Navbar;