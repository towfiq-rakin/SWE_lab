import { NavLink, useNavigate } from "react-router-dom";

import { logoutUser } from "../api/client";

function navClassName({ isActive }) {
  return `nav-link${isActive ? " nav-link-active" : ""}`;
}

export default function Navbar({ currentUser, onLoggedOut }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      onLoggedOut();
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

        <nav className="site-nav">
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

        <div className="session-panel">
          <span className="session-pill">
            {currentUser ? `Signed in as ${currentUser.username}` : "Browsing as guest"}
          </span>
          <div className="session-links">
            {currentUser ? (
              <button className="button button-secondary" onClick={handleLogout} type="button">
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
    </header>
  );
}
