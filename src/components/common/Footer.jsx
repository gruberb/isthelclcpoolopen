import React from "react";
import { Link } from "react-router-dom";

function Footer({ lastUpdated }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-100 py-4 px-2 shadow-md flex flex-col items-center gap-2 z-10">
      <div className="flex flex-col items-center gap-1">
        <FooterLink to="/" emoji="🏊" text="Want to go swimming?" />
        <FooterLink to="/skating" emoji="⛸️" text="Want to go skating?" />
        <FooterLink to="/libraries" emoji="📚" text="Want to read books?" />
      </div>
      {lastUpdated && (
        <div className="text-xs text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function FooterLink({ to, emoji, text }) {
  // Don't show link to current page
  const isCurrentPage = window.location.pathname === to;

  if (isCurrentPage) {
    return null;
  }

  return (
    <div className="text-sm">
      <Link to={to} className="text-blue-700 hover:underline">
        {emoji} {text} {emoji}
      </Link>
    </div>
  );
}

export default Footer;
