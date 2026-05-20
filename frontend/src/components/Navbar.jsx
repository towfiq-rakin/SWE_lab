import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { logoutUser } from "../api/client";

function navClassName({ isActive }) {
  return `nav-link${isActive ? " nav-link-active" : ""}`;
}

export default function Navbar({ currentUser, onLoggedOut, theme, onThemeToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      onLoggedOut();
      setIsMobileMenuOpen(false);
      navigate("/");
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="brand-block">
          <NavLink className="brand-mark" to="/">
            <span className="brand-mark__pulse" />
            <span className="brand-mark__text">AS</span>
          </NavLink>
          <div>
            <p className="eyebrow">Live marketplace</p>
            <h1 className="brand-title">Auction studio</h1>
          </div>
        </div>

        <nav className="site-nav desktop-only">
          <NavLink className={navClassName} to="/">
            Listings
          </NavLink>
          <NavLink className={navClassName} to="/categories">
            Categories
          </NavLink>
          {currentUser ? (
            <>
              <NavLink className={navClassName} to="/create">
                Create
              </NavLink>
              <NavLink className={navClassName} to="/watchlist">
                Watchlist
              </NavLink>
            </>
          ) : null}
        </nav>

        <div className="header-actions">
          <button
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="theme-toggle"
            onClick={onThemeToggle}
            type="button"
          >
            {theme === "light" ? <Moon size={18} strokeWidth={2.2} /> : <Sun size={18} strokeWidth={2.2} />}
          </button>

          <button
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="mobile-menu-toggle mobile-only"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            type="button"
          >
            {isMobileMenuOpen ? <X size={18} strokeWidth={2.2} /> : <Menu size={18} strokeWidth={2.2} />}
          </button>
        </div>

        <div className="session-panel desktop-only">
          <span className="session-pill">
            {currentUser ? `Signed in as ${currentUser.username}` : "Browsing as guest"}
          </span>
          <div className="session-links">
            {currentUser ? (
              <button className="button button-danger" onClick={handleLogout} type="button">
                Log out
              </button>
            ) : (
              <>
                <NavLink className="ghost-link" to="/login">
                  Log in
                </NavLink>
                <NavLink className="button button-secondary" to="/register">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        aria-label="Close menu backdrop"
        className={`mobile-drawer-backdrop${isMobileMenuOpen ? " mobile-drawer-backdrop-open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
        tabIndex={isMobileMenuOpen ? 0 : -1}
        type="button"
      />

      <aside className={`mobile-drawer${isMobileMenuOpen ? " mobile-drawer-open" : ""}`}>
        <div className="mobile-drawer__header">
          <span className="session-pill">
            {currentUser ? `Signed in as ${currentUser.username}` : "Browsing as guest"}
          </span>
        </div>

        <nav className="mobile-drawer__nav">
          <NavLink className={({ isActive }) => `${navClassName({ isActive })} mobile-drawer__link`} to="/">
            Listings
          </NavLink>
          <NavLink
            className={({ isActive }) => `${navClassName({ isActive })} mobile-drawer__link`}
            to="/categories"
          >
            Categories
          </NavLink>
          {currentUser ? (
            <>
              <NavLink
                className={({ isActive }) => `${navClassName({ isActive })} mobile-drawer__link`}
                to="/create"
              >
                Create
              </NavLink>
              <NavLink
                className={({ isActive }) => `${navClassName({ isActive })} mobile-drawer__link`}
                to="/watchlist"
              >
                Watchlist
              </NavLink>
            </>
          ) : null}
        </nav>

        <div className="mobile-drawer__actions">
          {currentUser ? (
            <button className="button button-danger" onClick={handleLogout} type="button">
              Log out
            </button>
          ) : (
            <>
              <NavLink className="ghost-link" to="/login">
                Log in
              </NavLink>
              <NavLink className="button button-secondary" to="/register">
                Register
              </NavLink>
            </>
          )}
        </div>
      </aside>
    </header>
  );
}
