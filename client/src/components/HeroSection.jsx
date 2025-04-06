import React, { useEffect, useRef } from "react";
import Typed from "typed.js";
import "./styles/HeroSection.css"; // Import the CSS file for styling
import sdgIcon from "../icons/sdg4-icon.png"; // Path to the SDG 4 icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import sdg4Icon from "../icons/sdg4-icon2.png";
import expGif from "../icons/exp.gif";
import assessGif from "../icons/assess.gif";
import discGif from "../icons/disc.gif";
import aiGif from "../icons/ai.gif";
import aimsGif from '../icons/aims.gif';
import visionGif from '../icons/vision.gif';
import missionGif from '../icons/mission.gif';

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
      <div id="avm-section" className="avm-container">
  {/* Aims Card */}
  <div className="avm-card">
    <div className="avm-gif-container">
      <img 
        src={aimsGif} 
        alt="Aims icon" 
        className="avm-gif"
        style={{
          width: '220px',         // Control GIF size relative to container
          height: '220px',        // Maintain aspect ratio
          objectFit: 'cover',    // 'cover' fills circle, 'contain' shows full GIF
          objectPosition: 'center', // Adjust if needed ('top', 'left', etc.)
          borderRadius: '50%',   // Ensure circular shape
          transform: 'translateY(0px)' // Fine-tune vertical position
        }}
      />
    </div>
    <div className="avm-content">
      <h2 className="avm-title">Our Aims</h2>
      <p className="avm-description">Providing access to quality education for all, promoting lifelong learning, and reducing educational inequalities.</p>
    </div>
  </div>

  {/* Vision Card */}
  <div className="avm-card">
    <div className="avm-gif-container">
      <img 
        src={visionGif} 
        alt="Vision icon" 
        className="avm-gif"
        style={{
          width: '170px',
          height: '170px',
          objectFit: 'contain',
          objectPosition: 'top center',
          borderRadius: '50%',
          transform: 'scale(1.1)' // Zoom in slightly
        }}
      />
    </div>
    <div className="avm-content">
      <h2 className="avm-title">Our Vision</h2>
      <p className="avm-description">To create a world where every individual has the opportunity to learn, grow, and achieve their fullest potential.</p>
    </div>
  </div>

  {/* Mission Card */}
  <div className="avm-card">
    <div className="avm-gif-container">
      <img 
        src={missionGif} 
        alt="Mission icon" 
        className="avm-gif"
        style={{
          width: '150px',
          height: '150px',
          objectFit: 'cover',
          objectPosition: 'center 30%', // Adjust vertical focus
          borderRadius: '50%',
          filter: 'brightness(1.05)',
          transform: 'translateY(3px)' // Slight enhancement
        }}
      />
    </div>
    <div className="avm-content">
      <h2 className="avm-title">Our Mission</h2>
      <p className="avm-description">Empowering students and educators with resources, support, and technology to advance education globally.</p>
    </div>
  </div>
</div>

{/* Features Section */}
<section id="ai-features" className="ai-features-section">
      <h2 className="ai-section-heading">Our AI-Powered Features</h2>
      
      {/* Feature 1 */}
      <div className="ai-feature-row">
        <div className="ai-feature-content">
          <h3 className="ai-feature-title">AI-Powered Learning & Evaluation</h3>
          <ul className="ai-feature-list">
            <li>AI-generated questions tailored to your level</li>
            <li>Multi-parameter evaluation system</li>
            <li>Instant AI feedback with explanations</li>
            <li>Comprehensive self-evaluation panel</li>
          </ul>
        </div>
        <div className="ai-feature-media">
          <img 
             src={aiGif} 
             alt="User experience" 
             loading="lazy"
             onError={(e) => {
               e.target.onerror = null; 
               e.target.src = 'https://media.giphy.com/media/3o7TKsQ8XfDQsHJuUM/giphy.gif';
             }}
             style={{
               marginTop:"10px",
               width: "80%",
               height: "65vh",
           
               transform: "scaleX(-1)"
             }} 
          />
        </div>
      </div>

      {/* Feature 2 */}
      <div className="ai-feature-row reverse">
        <div className="ai-feature-content">
          <h3 className="ai-feature-title">Interactive & Adaptive Learning</h3>
          <ul className="ai-feature-list">
            <li>24/7 AI chatbot tutor</li>
            <li>Community discussion pages</li>
            <li>Adaptive learning paths</li>
          </ul>
        </div>
        <div className="ai-feature-media">
          <img 
             src={discGif} 
             alt="User experience" 
             loading="lazy"
             onError={(e) => {
               e.target.onerror = null; 
               e.target.src = 'https://media.giphy.com/media/3o7TKsQ8XfDQsHJuUM/giphy.gif';
             }}
             style={{
               marginTop:"10px",
               width: "80%",
               height: "65vh",
           
               transform: "scaleX(-1)"
             }} 
          />
        </div>
      </div>

      {/* Feature 3 */}
      <div className="ai-feature-row">
        <div className="ai-feature-content">
          <h3 className="ai-feature-title">Seamless Assessment & Tracking</h3>
          <ul className="ai-feature-list">
            <li>One-click test access</li>
            <li>Detailed performance tracking</li>
          </ul>
        </div>
        <div className="ai-feature-media">
          <img 
  src={assessGif} 
  alt="User experience" 
  loading="lazy"
  onError={(e) => {
    e.target.onerror = null; 
    e.target.src = 'https://media.giphy.com/media/3o7TKsQ8XfDQsHJuUM/giphy.gif';
  }}
  style={{
    marginTop:"30px",
    width: "90%",
    height: "70vh",

    transform: "scaleX(-1)"
  }} 
          />
        </div>
      </div>

      {/* Feature 4 */}
      <div className="ai-feature-row reverse">
        <div className="ai-feature-content">
          <h3 className="ai-feature-title">User Experience & Community</h3>
          <ul className="ai-feature-list">
            <li>Intuitive, beautiful UI/UX</li>
            <li>Transparent donation system</li>
          </ul>
        </div>
        <div className="ai-feature-media">
        <img 
  src={expGif} 
  alt="User experience" 
  loading="lazy"
  onError={(e) => {
    e.target.onerror = null; 
    e.target.src = 'https://media.giphy.com/media/3o7TKsQ8XfDQsHJuUM/giphy.gif';
  }}
  style={{
    marginTop:"180px",
    width: "100%",
    height: "90vh",

    transform: "scaleX(-1)"
  }} 
/>

        </div>
      </div>
    </section>

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