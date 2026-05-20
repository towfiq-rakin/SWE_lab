export default function ErrorState({ title = "Something went wrong", message }) {
  return (
    <section className="state-card state-card-error">
      <span className="state-icon">!</span>
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
