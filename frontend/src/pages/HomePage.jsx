import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { fetchListings, getErrorMessage } from "../api/client";
import ErrorState from "../components/ErrorState";
import ListingGrid from "../components/ListingGrid";
import LoadingState from "../components/LoadingState";

export default function HomePage({ currentUser }) {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = searchParams.get("category");

  useEffect(() => {
    let active = true;

    async function loadListings() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchListings(category);
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

    loadListings();

    return () => {
      active = false;
    };
  }, [category]);

  if (loading) {
    return (
      <LoadingState
        title="Loading listings"
        message="Loading active auctions for the marketplace."
      />
    );
  }

  if (error) {
    return <ErrorState title="Unable to load listings" message={error} />;
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Active marketplace</p>
          <h2>
            {category
              ? `Listings in ${category === "None" ? "Uncategorized" : category}`
              : "Live auctions happening now"}
          </h2>
          <p>Browse active listings, review details, and place competitive bids in real time.</p>
        </div>
        <div className="hero-card__actions">
          <Link className="button button-primary" to={currentUser ? "/create" : "/categories"}>
            {currentUser ? "Create a listing" : "Explore categories"}
          </Link>
          {category ? (
            <Link className="button button-secondary" to="/">
              Clear category
            </Link>
          ) : null}
        </div>
      </section>

      {listings.length ? (
        <ListingGrid listings={listings} />
      ) : (
        <section className="state-card">
          <h2>No active listings</h2>
          <p>Try another category or create a new auction from the authenticated flow.</p>
        </section>
      )}
    </div>
  );
}
