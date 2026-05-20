export default function LoadingState({ title = "Loading", message = "Please wait..." }) {
  return (
    <section className="state-card">
      <div className="loading-orb" />
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
