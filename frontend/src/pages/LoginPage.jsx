import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getErrorMessage, loginUser } from "../api/client";

export default function LoginPage({ currentUser, onAuthSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
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
      const payload = await loginUser(formData);
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
          <p className="eyebrow">Session authentication</p>
          <h2>Log in to your account</h2>
          <p>Access your watchlist, bidding history, and seller tools.</p>
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
            <span>Password</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={handleChange}
              required
              type="password"
              value={formData.password}
            />
          </label>

          {error ? <div className="notice-banner notice-banner-error">{error}</div> : null}

          <button className="button button-primary" disabled={submitting} type="submit">
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="auth-copy">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
}
