import { useState } from "react";
import { NavLink } from "react-router-dom";
import '../styles/App.css'

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav-root" role="banner">
      <div className="nav-inner">
        <div className="nav-brand">
          <span className="logo">🛠️ Construction Cart</span>
        </div>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((s) => !s)}
        >
          {open ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`} role="navigation" aria-label="Primary">
          <NavLink
            to="/"
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            onClick={() => setOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => "nav-link nav-cta" + (isActive ? " active" : "")}
            onClick={() => setOpen(false)}
          >
            Settings
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
