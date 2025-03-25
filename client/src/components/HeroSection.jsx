import React, { useEffect, useRef } from "react";
import Typed from "typed.js";
import "./styles/HeroSection.css"; // Import the CSS file for styling
import sdgIcon from "../icons/sdg4-icon.png"; // Path to the SDG 4 icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import sdg4Icon from "../icons/sdg4-icon2.png";

import {
  faHome,
  faInfoCircle,
  faProjectDiagram,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons"; // Solid icons
import {
  faFacebook,
  faTwitter,
  faLinkedin,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons"; // Brand icons

// Import the AboutUs component
import AboutUs from "./AboutUs";

function HeroSection() {
  const typedElement = useRef(null);

  useEffect(() => {
    if (!typedElement.current) return; // Ensure ref exists before initializing Typed.js

    const typed = new Typed(typedElement.current, {
      strings: [
        "Quality Education for All",
        "Empowering Future Generations",
        "Innovative Learning Experiences",
      ],
      typeSpeed: 50,
      backSpeed: 25,
      loop: true,
    });

    return () => typed.destroy();
  }, []);

  // Scroll handler for "Learn More" button
  const scrollToAVM = () => {
    const section = document.getElementById("avm-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      console.error("Element with ID 'avm-section' not found");
    }
  };

  return (
    <div className="hs-hero-section">
      {/* Hero Content Section */}
      <div className="hs-hero-content">
        <img src={sdgIcon} alt="SDG4 Icon" className="background-image" />
        <div className="hs-hero-text">
          <h1 style={{ lineHeight: "1.1", textAlign: "left" }}>
            <span
              style={{
                background: "linear-gradient(to left, #ff5900, #ff9500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
                fontSize: 80,
              }}
            >
              E
            </span>
            mpowering
            <br />
            <span
              style={{
                background: "linear-gradient(to left, #ff5900, #ff9500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
                fontSize: 80,
              }}
            >
              E
            </span>
            ducation for All
          </h1>
          <h2>
            <span ref={typedElement}></span>
          </h2>
          <p>
            Join us in our mission to ensure inclusive and equitable quality
            education for everyone, everywhere.
          </p>
          <div className="hs-cta-buttons">
            <button className="hs-cta-primary">Sign Up</button>
            <button className="hs-cta-secondary" onClick={scrollToAVM}>
              Learn More
            </button>
          </div>
        </div>
      </div>
      <div className="hs-sdg4-icon">
        <img src={sdg4Icon} alt="SDG 4 Icon" />
      </div>

      {/* Aims, Vision, Mission Section */}
      <div id="avm-section" className="hs-aims-vision-mission">
  <div className="hs-section-card">
    <div className="hs-section-content">
      <h2 className="hs-section-title">Our Aims</h2>
      <p>Providing access to quality education for all, promoting lifelong learning, and reducing educational inequalities.</p>
    </div>
    <div className="hs-section-image">Image Here</div>
  </div>

  <div className="hs-section-card">
    <div className="hs-section-content">
      <h2 className="hs-section-title">Our Vision</h2>
      <p>To create a world where every individual has the opportunity to learn, grow, and achieve their fullest potential.</p>
    </div>
    <div className="hs-section-image">Image Here</div>
  </div>

  <div className="hs-section-card">
    <div className="hs-section-content">
      <h2 className="hs-section-title">Our Mission</h2>
      <p>Empowering students and educators with resources, support, and technology to advance education globally.</p>
    </div>
    <div className="hs-section-image">Image Here</div>
  </div>
</div>

{/* Features Section */}
<h2 className="hs-section-title">Our Features</h2>
<div id="features" className="hs-features-section">

  <div className="hs-section-card">
    <div className="hs-section-content">
      <h3 className="hs-section-title">Interactive Learning</h3>
      <p>Engage with hands-on activities and digital tools that make learning fun and effective.</p>
    </div>
    <div className="hs-section-image">Image Here</div>
  </div>

  <div className="hs-section-card">
    <div className="hs-section-content">
      <h3 className="hs-section-title">Expert Instructors</h3>
      <p>Learn from industry experts and thought leaders dedicated to excellence in education.</p>
    </div>
    <div className="hs-section-image">Image Here</div>
  </div>

  <div className="hs-section-card">
    <div className="hs-section-content">
      <h3 className="hs-section-title">Global Community</h3>
      <p>Join a network of learners from around the world and collaborate on projects and ideas.</p>
    </div>
    <div className="hs-section-image">Image Here</div>
  </div>
</div>


      {/* Integrate AboutUs component between the Features and Footer */}
      <AboutUs isDarkMode={false} />

      {/* Footer Section */}
      <footer className="hs-footer">
        <div className="hs-footer-nav">
          <h3 className="hs-footer-heading">
            <FontAwesomeIcon icon={faHome} /> Quick Links
          </h3>
          <ul className="hs-footer-list">
            <li>
              <FontAwesomeIcon icon={faHome} /> <a href="#">Home</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faInfoCircle} /> <a href="#">About</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faProjectDiagram} /> <a href="#">Projects</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} /> <a href="#">Contact</a>
            </li>
          </ul>
        </div>
        <div className="hs-social-links">
          <h3 className="hs-footer-heading">
            <FontAwesomeIcon icon={faFacebook} /> Follow Us
          </h3>
          <ul className="hs-footer-list">
            <li>
              <FontAwesomeIcon icon={faFacebook} /> <a href="#">Facebook</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faTwitter} /> <a href="#">Twitter</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faLinkedin} /> <a href="#">LinkedIn</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faInstagram} /> <a href="#">Instagram</a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default HeroSection;