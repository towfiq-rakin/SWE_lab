import { Link } from "react-router-dom";

import { formatCurrency, formatDate, getListingImage } from "../utils/format";

export default function ListingCard({ listing }) {
  return (
    <article className="listing-card">
      <div className="listing-card__media">
        <img src={getListingImage(listing.image_url)} alt={listing.title} />
        <span className={`status-chip${listing.isActive ? "" : " status-chip-muted"}`}>
          {listing.isActive ? "Active" : "Closed"}
        </span>
      </div>

      <div className="listing-card__body">
        <div className="listing-card__header">
          <div>
            <p className="listing-card__meta">
              {listing.category || "Open category"} · by {listing.owner.username}
            </p>
            <h3>{listing.title}</h3>
          </div>
          {listing.is_in_watchlist ? <span className="bookmark-chip">Saved</span> : null}
        </div>

        <p className="listing-card__description">{listing.description}</p>

        <div className="listing-card__footer">
          <div>
            <p className="price-caption">Current price</p>
            <strong>{formatCurrency(listing.current_price)}</strong>
          </div>
          <div className="listing-card__stats">
            <span>{listing.bids_count} bids</span>
            <span>{formatDate(listing.created_at)}</span>
          </div>
        </div>

        <Link className="button button-primary" to={`/listing/${listing.id}`}>
          View listing
        </Link>
      </div>
    </article>
  );
}
