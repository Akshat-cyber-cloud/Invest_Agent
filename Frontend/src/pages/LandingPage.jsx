import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Mascot is removed for a professional corporate layout.

// Rocket Illustration Component
const RocketSVG = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
    {/* Flame exhaust trail */}
    <path d="M45 155 Q20 185 8 192 Q35 172 55 162" fill="none" stroke="#000" strokeWidth="4.5" strokeLinecap="round" />
    
    {/* Flames */}
    <path d="M50 150 Q15 185 -5 195 Q25 172 45 158 Q60 172 80 195 Q65 172 60 150 Z" fill="#ff9e22" stroke="#000" strokeWidth="4.5" strokeLinejoin="round" />
    <path d="M52 152 Q28 175 12 182 Q32 168 48 156 Q55 168 68 182 Q58 168 56 152 Z" fill="#ffcc00" stroke="#000" strokeWidth="2.5" />
    
    {/* Rocket Fuselage */}
    <path d="M55 145 L135 65 C155 45, 170 30, 185 15 C170 30, 155 45, 135 65 L55 145 Z" fill="#ffffff" stroke="#000" strokeWidth="4.5" strokeLinejoin="round" />
    
    {/* Nose cone */}
    <path d="M135 65 C150 50, 165 35, 185 15 C170 30, 155 45, 135 65 Z" fill="#ff5e97" stroke="#000" strokeWidth="4.5" strokeLinejoin="round" />
    
    {/* Wings */}
    {/* Left fin */}
    <path d="M55 140 C30 150, 15 135, 25 110 C32 122, 42 130, 55 140 Z" fill="#5d6eff" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
    {/* Right fin */}
    <path d="M140 55 C150 30, 135 15, 110 25 C122 32, 130 42, 140 55 Z" fill="#5d6eff" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
    
    {/* Center stripes / accents */}
    <path d="M95 105 L105 95" stroke="#000" strokeWidth="4" />
    
    {/* Windows */}
    <circle cx="95" cy="105" r="15" fill="#e0f2fe" stroke="#000" strokeWidth="4" />
    <circle cx="95" cy="105" r="11" fill="#bae6fd" />
    <path d="M90 100 A8 8 0 0 1 103 103" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    
    <circle cx="125" cy="75" r="10" fill="#e0f2fe" stroke="#000" strokeWidth="4" />
    <circle cx="125" cy="75" r="7" fill="#bae6fd" />
    <path d="M122 72 A5 5 0 0 1 130 74" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Pencil Illustration Component
const PencilSVG = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
    {/* Squiggly line */}
    <path d="M30 155 Q80 120 120 160 T180 80" fill="none" stroke="#ff9e22" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" />
    
    {/* Tilted Pencil */}
    <g transform="rotate(-30 100 100)">
      {/* Eraser */}
      <path d="M165 95 C165 82, 152 70, 135 70 L125 70 L125 120 L135 120 C152 120, 165 108, 165 95 Z" fill="#ff5e97" stroke="#000" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M150 78 A15 15 0 0 1 158 95" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

      {/* Metal band */}
      <rect x="105" y="70" width="20" height="50" fill="#cbd5e1" stroke="#000" strokeWidth="4.5" strokeLinejoin="round" />
      <line x1="115" y1="70" x2="115" y2="120" stroke="#000" strokeWidth="3" />
      
      {/* Body */}
      <rect x="45" y="70" width="60" height="50" fill="#ffcc00" stroke="#000" strokeWidth="4.5" strokeLinejoin="round" />
      <line x1="45" y1="86" x2="105" y2="86" stroke="#000" strokeWidth="3.5" />
      <line x1="45" y1="104" x2="105" y2="104" stroke="#000" strokeWidth="3.5" />
      
      {/* Wood collar */}
      <path d="M45 70 L15 95 L45 120 Z" fill="#fed7aa" stroke="#000" strokeWidth="4.5" strokeLinejoin="round" />
      
      {/* Pencil tip */}
      <path d="M25 87 L15 95 L25 103 Z" fill="#000" stroke="#000" strokeWidth="2" />
    </g>
  </svg>
);

// Circular Rotating Green Stamp SVG
const GreenStampSVG = () => (
  <svg viewBox="0 0 150 150" className="clario-stamp-svg" style={{ overflow: 'visible' }}>
    <defs>
      {/* Circle path for the text to wrap around */}
      <path
        id="textCircle"
        d="M 75, 75 m -52, 0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0"
      />
    </defs>
    
    {/* Outer circle with thick border */}
    <circle cx="75" cy="75" r="70" fill="#22c55e" stroke="#000" strokeWidth="4.5" />
    <circle cx="75" cy="75" r="62" fill="none" stroke="#000" strokeWidth="2.5" strokeDasharray="6 4" />
    
    {/* Central area */}
    <circle cx="75" cy="75" r="36" fill="#15803d" stroke="#000" strokeWidth="3.5" />
    
    {/* Circular text */}
    <text fill="#000" fontSize="10.5" fontWeight="900" letterSpacing="1.8">
      <textPath href="#textCircle" startOffset="0%">
        LET'S CHANGE THE FUTURE • BY LEARNING WITH US • 
      </textPath>
    </text>
  </svg>
);

function LandingPage() {
  return (
    <div className="clario-landing">
      <div className="clario-frame">
        {/* TOP NAVBAR (Neobrutalist styled, inside the frame) */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          borderBottom: '3px solid #000',
          paddingBottom: '20px',
          zIndex: 10
        }}>
          {/* Logo with Mascot */}
          <div className="clario-logo-footer" style={{ fontSize: '26px' }}>
            <span className="clario-yellow">CLARIO</span>
          </div>
          
          {/* Nav Links */}
          <ul className="nav-links-neobrutalist" style={{
            display: 'flex',
            gap: '30px',
            listStyle: 'none',
            fontWeight: 800,
            fontSize: '16px',
            alignItems: 'center',
            margin: 0,
            padding: 0
          }}>
            <li><Link to="/" style={{ color: '#000', textDecoration: 'none' }}>Home</Link></li>
            <li><Link to="/dashboard" style={{ color: '#000', textDecoration: 'none' }}>Dashboard</Link></li>
          </ul>
          
          {/* Nav CTA */}
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="clario-cta-btn" style={{ padding: '8px 20px', fontSize: '15px', borderRadius: '8px', boxShadow: '3px 3px 0px #000' }}>
              Try Clario
            </button>
          </Link>
        </nav>

        {/* HERO CONTENT */}
        <div className="clario-hero">
          <div className="clario-title-group">
            <h1 className="clario-title">
              <span className="clario-title-unlock">Let's Unlock</span>
              <span className="clario-title-potential">Your Potential</span>
              <span className="clario-title-brand-group">
                <span className="clario-title-with">With</span>
                <span className="clario-title-brand">CLARIO</span>
              </span>
            </h1>
          </div>

          <p className="clario-desc">
            Clario orchestrates multi-agent financial intelligence to audit stock health, calculate sentiment trends, and assess risks instantly.
          </p>

          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="clario-cta-btn">
              Unlock Now
            </button>
          </Link>
        </div>

        {/* FLOATING VECTOR ELEMENTS */}
        <div className="clario-rocket-container">
          <RocketSVG />
        </div>

        <div className="clario-pencil-container">
          <PencilSVG />
        </div>

        {/* Rotating Circular Stamp with Center Link Arrow */}
        <div className="clario-stamp-container">
          <GreenStampSVG />
          <Link to="/dashboard" className="clario-stamp-arrow" aria-label="Go to Dashboard">
            <ArrowRight size={26} style={{ transform: 'rotate(-45deg)' }} strokeWidth={3.5} />
          </Link>
        </div>

        {/* FOOTER */}
        <footer className="clario-footer">
          <div className="clario-logo-footer">
            <span className="clario-yellow">CLARIO</span>
          </div>

          <div className="clario-copyright">
            Copyright @Emoon 2022 All Right Reserved
          </div>

          <div className="clario-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="clario-social-icon" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="clario-social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="clario-social-icon" aria-label="Twitter">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="clario-social-icon" aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
