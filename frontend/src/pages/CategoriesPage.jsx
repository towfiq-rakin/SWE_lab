import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchCategories, getErrorMessage } from "../api/client";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchCategories();
        if (active) {
          setCategories(data);
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

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <LoadingState title="Loading categories" message="Collecting category data from the API." />
    );
  }

  if (error) {
    return <ErrorState title="Unable to load categories" message={error} />;
  }

  return (
    <div className="page-stack">
      <section className="hero-card hero-card-tight">
        <div>
          <p className="eyebrow">Category explorer</p>
          <h2>Browse active listings by topic</h2>
          <p>Each category routes back to the React home page with an API-backed filter.</p>
        </div>
      </section>

      <section className="category-grid">
        {categories.length ? (
          categories.map((category) => (
            <Link
              className="category-card"
              key={category.value ?? "uncategorized"}
              to={`/?category=${category.value ?? "None"}`}
            >
              <span className="category-card__count">{category.count} listings</span>
              <h3>{category.label}</h3>
              <p>View all active items in this category.</p>
            </Link>
          ))
        ) : (
          <section className="state-card">
            <h2>No categories yet</h2>
            <p>Create a listing first to see category groups here.</p>
          </section>
        )}
      </section>
    </div>
  );
}
