import ListingCard from "./ListingCard";

export default function ListingGrid({ listings }) {
  return (
    <section className="listing-grid">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </section>
  );
}
