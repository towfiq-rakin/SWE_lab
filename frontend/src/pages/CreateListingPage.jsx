import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createListing, getErrorMessage } from "../api/client";

const initialForm = {
  title: "",
  description: "",
  start_price: "",
  image_url: "",
  category: "",
};

export default function CreateListingPage({ currentUser }) {
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <section className="state-card">
        <h2>Authentication required</h2>
        <p>Sign in to publish and manage your listings.</p>
        <Link className="button button-primary" to="/login">
          Log in
        </Link>
      </section>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      const listing = await createListing(formData);
      navigate(`/listing/${listing.id}`);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-card hero-card-tight">
        <div>
          <p className="eyebrow">Seller workflow</p>
          <h2>Create a new listing</h2>
          <p>Publish your item with rich details so bidders can act with confidence.</p>
        </div>
        <Link className="button button-secondary" to="/">
          Back to listings
        </Link>
      </section>

      <section className="panel panel-form">
        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              name="title"
              onChange={handleChange}
              placeholder="Vintage camera, sketchbook set, rare vinyl..."
              required
              type="text"
              value={formData.title}
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              name="description"
              onChange={handleChange}
              placeholder="Describe condition, provenance, standout features, and shipping notes."
              required
              rows="6"
              value={formData.description}
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Starting bid</span>
              <input
                min="0"
                name="start_price"
                onChange={handleChange}
                placeholder="0.00"
                required
                step="0.01"
                type="number"
                value={formData.start_price}
              />
            </label>

            <label className="field">
              <span>Category</span>
              <input
                name="category"
                onChange={handleChange}
                placeholder="Art, tech, books, decor..."
                type="text"
                value={formData.category}
              />
            </label>
          </div>

          <label className="field">
            <span>Image URL</span>
            <input
              name="image_url"
              onChange={handleChange}
              placeholder="https://example.com/listing-image.jpg"
              type="url"
              value={formData.image_url}
            />
          </label>

          {error ? <div className="notice-banner notice-banner-error">{error}</div> : null}

          <button className="button button-primary" disabled={submitting} type="submit">
            {submitting ? "Creating listing..." : "Create listing"}
          </button>
        </form>
      </section>
    </div>
  );
}
