import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { fetchCurrentUser } from "./api/client";
import ErrorState from "./components/ErrorState";
import LoadingState from "./components/LoadingState";
import Navbar from "./components/Navbar";
import CategoriesPage from "./pages/CategoriesPage";
import CreateListingPage from "./pages/CreateListingPage";
import HomePage from "./pages/HomePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import WatchlistPage from "./pages/WatchlistPage";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState("");

  const loadCurrentUser = async () => {
    try {
      setUserError("");
      const user = await fetchCurrentUser();
      setCurrentUser(user.authenticated ? user : null);
    } catch (error) {
      setUserError(error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const handleAuthSuccess = (userPayload) => {
    setCurrentUser({
      authenticated: true,
      id: userPayload.id,
      username: userPayload.username,
      email: userPayload.email,
    });
  };

  const handleLoggedOut = () => {
    setCurrentUser(null);
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <Navbar currentUser={currentUser} onLoggedOut={handleLoggedOut} />
      <main className="page-shell">
        {loadingUser ? (
          <LoadingState title="Checking session" message="Preparing your account experience..." />
        ) : userError ? (
          <ErrorState title="Unable to load session" message={userError} />
        ) : (
          <Routes>
            <Route path="/" element={<HomePage currentUser={currentUser} />} />
            <Route
              path="/listing/:listingId"
              element={<ListingDetailPage currentUser={currentUser} />}
            />
            <Route
              path="/create"
              element={<CreateListingPage currentUser={currentUser} />}
            />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route
              path="/watchlist"
              element={<WatchlistPage currentUser={currentUser} />}
            />
            <Route
              path="/login"
              element={
                <LoginPage currentUser={currentUser} onAuthSuccess={handleAuthSuccess} />
              }
            />
            <Route
              path="/register"
              element={
                <RegisterPage currentUser={currentUser} onAuthSuccess={handleAuthSuccess} />
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </main>
    </div>
  );
}
