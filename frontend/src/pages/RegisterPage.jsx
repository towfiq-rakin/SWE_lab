import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getErrorMessage, registerUser } from "../api/client";

const initialForm = {
  username: "",
  email: "",
  password: "",
  confirmation: "",
};

export default function RegisterPage({ currentUser, onAuthSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

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
      const payload = await registerUser(formData);
      onAuthSuccess(payload);
      navigate("/");
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
          <p className="eyebrow">Account creation</p>
          <h2>Create your account</h2>
          <p>Join Auction studio to bid, sell, and manage your watchlist.</p>
        </div>
      </section>

      <section className="panel panel-form auth-panel">
        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              autoComplete="username"
              name="username"
              onChange={handleChange}
              required
              type="text"
              value={formData.username}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={handleChange}
              required
              type="email"
              value={formData.email}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              autoComplete="new-password"
              name="password"
              onChange={handleChange}
              required
              type="password"
              value={formData.password}
            />
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
              autoComplete="new-password"
              name="confirmation"
              onChange={handleChange}
              required
              type="password"
              value={formData.confirmation}
            />
          </label>

          {error ? <div className="notice-banner notice-banner-error">{error}</div> : null}

          <button className="button button-primary" disabled={submitting} type="submit">
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-copy">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </div>
  );
}
