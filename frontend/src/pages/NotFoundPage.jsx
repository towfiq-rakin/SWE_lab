import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="state-card">
      <h2>Page not found</h2>
      <p>The React router could not match this route.</p>
      <Link className="button button-primary" to="/">
        Return home
      </Link>
    </section>
  );
}
