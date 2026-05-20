import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  addComment,
  closeAuction,
  fetchListingDetail,
  getErrorMessage,
  placeBid,
  toggleWatchlist,
} from "../api/client";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import { formatCurrency, formatDate, getListingImage } from "../utils/format";

export default function ListingDetailPage({ currentUser }) {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const loadListing = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchListingDetail(listingId);
      setListing(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const runAction = async (key, action) => {
    try {
      setSubmitting(key);
      setActionError("");
      setActionSuccess("");
      const message = await action();
      setActionSuccess(message);
      await loadListing();
    } catch (submitError) {
      setActionError(getErrorMessage(submitError));
    } finally {
      setSubmitting("");
    }
  };

  const handleBidSubmit = async (event) => {
    event.preventDefault();
    await runAction("bid", async () => {
      const response = await placeBid(listing.id, bidAmount);
      setBidAmount("");
      return response.detail;
    });
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    await runAction("comment", async () => {
      const response = await addComment(listing.id, commentContent);
      setCommentContent("");
      return response.detail;
    });
  };

  const handleWatchlistToggle = async () => {
    await runAction("watchlist", async () => {
      const response = await toggleWatchlist(listing.id);
      return response.detail;
    });
  };

  const handleCloseAuction = async () => {
    await runAction("close", async () => {
      const response = await closeAuction(listing.id);
      return response.detail;
    });
  };

  if (loading) {
    return (
      <LoadingState
        title="Loading listing"
        message="Fetching the auction detail, bids, and comments."
      />
    );
  }

  if (error) {
    return <ErrorState title="Unable to load listing" message={error} />;
  }

  const userHasHighestBid =
    currentUser && listing.highest_bid && currentUser.id === listing.highest_bid.user.id;
  const userWonAuction = currentUser && listing.winner && currentUser.id === listing.winner.id;

  return (
    <div className="page-stack">
      <section className="detail-hero">
        <div className="detail-hero__media">
          <img src={getListingImage(listing.image_url)} alt={listing.title} />
        </div>

        <div className="detail-hero__content">
          <p className="eyebrow">{listing.category || "Open category"}</p>
          <h2>{listing.title}</h2>
          <p className="detail-description">{listing.description}</p>

          <div className="detail-metrics">
            <div className="metric-card">
              <span>Current price</span>
              <strong>{formatCurrency(listing.current_price)}</strong>
            </div>
            <div className="metric-card">
              <span>Total bids</span>
              <strong>{listing.bids_count}</strong>
            </div>
            <div className="metric-card">
              <span>Owner</span>
              <strong>{listing.owner.username}</strong>
            </div>
          </div>

          <div className="detail-meta">
            <span>Created {formatDate(listing.created_at)}</span>
            <span>{listing.isActive ? "Auction open" : "Auction closed"}</span>
          </div>

          {userWonAuction ? (
            <div className="notice-banner notice-banner-success">You won this auction.</div>
          ) : null}
          {!listing.isActive && !userWonAuction ? (
            <div className="notice-banner">This auction is closed.</div>
          ) : null}
          {userHasHighestBid && listing.isActive ? (
            <div className="notice-banner notice-banner-success">Your bid is currently leading.</div>
          ) : null}
          {actionError ? <div className="notice-banner notice-banner-error">{actionError}</div> : null}
          {actionSuccess ? (
            <div className="notice-banner notice-banner-success">{actionSuccess}</div>
          ) : null}

          <div className="action-row">
            {currentUser ? (
              <button
                className="button button-secondary"
                disabled={submitting === "watchlist"}
                onClick={handleWatchlistToggle}
                type="button"
              >
                {listing.is_in_watchlist ? "Remove from watchlist" : "Add to watchlist"}
              </button>
            ) : (
              <Link className="button button-secondary" to="/login">
                Log in to save
              </Link>
            )}

            {listing.user_is_owner && listing.isActive ? (
              <button
                className="button button-danger"
                disabled={submitting === "close"}
                onClick={handleCloseAuction}
                type="button"
              >
                Close auction
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Bid on this item</p>
              <h3>Offer above {formatCurrency(listing.current_price)}</h3>
            </div>
          </div>

          {currentUser && listing.isActive ? (
            <form className="stack-form" onSubmit={handleBidSubmit}>
              <label className="field">
                <span>Bid amount</span>
                <input
                  min={listing.current_price}
                  onChange={(event) => setBidAmount(event.target.value)}
                  placeholder="Enter your bid"
                  required
                  step="0.01"
                  type="number"
                  value={bidAmount}
                />
              </label>
              <button className="button button-primary" disabled={submitting === "bid"} type="submit">
                Place bid
              </button>
            </form>
          ) : (
            <p className="panel-copy">
              {listing.isActive ? (
                <>
                  Sign in to place a bid. <Link to="/login">Log in</Link>
                </>
              ) : (
                "Bidding is unavailable because this auction has been closed."
              )}
            </p>
          )}

          <div className="history-list">
            {listing.bids.length ? (
              listing.bids.map((bid) => (
                <div className="history-item" key={bid.id}>
                  <div>
                    <strong>{bid.user.username}</strong>
                    <span>{formatDate(bid.created_at)}</span>
                  </div>
                  <strong>{formatCurrency(bid.amount)}</strong>
                </div>
              ))
            ) : (
              <p className="panel-copy">No bids yet. The starting bid is still in play.</p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Conversation</p>
              <h3>Comments</h3>
            </div>
          </div>

          {currentUser ? (
            <form className="stack-form" onSubmit={handleCommentSubmit}>
              <label className="field">
                <span>Add a comment</span>
                <textarea
                  onChange={(event) => setCommentContent(event.target.value)}
                  placeholder="Ask a question or leave a note about this listing."
                  required
                  rows="4"
                  value={commentContent}
                />
              </label>
              <button
                className="button button-primary"
                disabled={submitting === "comment"}
                type="submit"
              >
                Post comment
              </button>
            </form>
          ) : (
            <p className="panel-copy">
              Want to join the discussion? <Link to="/login">Log in</Link>
            </p>
          )}

          <div className="comment-list">
            {listing.comments.length ? (
              listing.comments.map((comment) => (
                <article className="comment-card" key={comment.id}>
                  <div className="comment-card__header">
                    <strong>{comment.user.username}</strong>
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                  <p>{comment.content}</p>
                </article>
              ))
            ) : (
              <p className="panel-copy">No comments yet.</p>
            )}
          </div>
        </section>
      </div>

      <Link className="ghost-link" to="/">
        Back to listings
      </Link>
    </div>
  );
}
