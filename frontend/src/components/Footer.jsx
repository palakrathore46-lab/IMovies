// src/components/Footer.jsx - Simple footer component
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-secondary py-4 mt-auto border-top border-secondary border-opacity-25">
      <div className="container text-center">
        <p className="mb-1 text-light fw-semibold">
          🎬 <span className="text-warning">I</span>Movies - Online Movie Ticket Booking Platform
        </p>
        <p className="small mb-0 text-muted">
          Final Year CS Course Project &bull; Built with MERN Stack (React, Express, Node.js, MongoDB)
        </p>
      </div>
    </footer>
  );
};

export default Footer;
