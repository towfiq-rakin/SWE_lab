import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchWatchlist, getErrorMessage } from "../api/client";
import ErrorState from "../components/ErrorState";
import ListingGrid from "../components/ListingGrid";
import LoadingState from "../components/LoadingState";

export default function WatchlistPage({ currentUser }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(Boolean(currentUser));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    let active = true;

    async function loadWatchlist() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchWatchlist();
        if (active) {
          setListings(data);
        }
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadWatchlist();

    return () => {
      active = false;
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className="state-card">
        <h2>Sign in to see your watchlist</h2>
        <p>Keep track of listings you plan to bid on.</p>
        <Link className="button button-primary" to="/login">
          Log in
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <LoadingState
        title="Loading watchlist"
        message="Loading your saved auctions."
      />
    );
  }

  if (error) {
    return <ErrorState title="Unable to load watchlist" message={error} />;
  }

  return (
    <div className="page-stack">
      <section className="hero-card hero-card-tight">
        <div>
          <p className="eyebrow">Personal shortlist</p>
          <h2>Your saved listings</h2>
          <p>Quickly return to items you have marked for later.</p>
        </div>
      </section>

      {listings.length ? (
        <ListingGrid listings={listings} />
      ) : (
        <section className="state-card">
          <h2>Your watchlist is empty</h2>
          <p>Open a listing and save it to see it here.</p>
        </section>
      )}
    </div>
  );
}
