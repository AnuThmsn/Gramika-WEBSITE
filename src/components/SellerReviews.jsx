import React, { useEffect, useState } from 'react';

export default function SellerReviews({ sellerId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    setLoading(true);
    fetch(`/api/reviews/seller/${sellerId}`)
      .then(r => r.json())
      .then(data => setReviews(data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [sellerId]);

  if (!sellerId) return null;

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="seller-reviews">
      <h3>Seller Reviews {avg ? <small>· {avg} / 5</small> : null}</h3>
      {loading ? (
        <p>Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div>
          {reviews.map(r => (
            <div key={r._id} className="review-item">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{r.user?.name || r.user?.email || 'User'}</strong>
                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div>Rating: {r.rating} / 5</div>
              {r.comment && <p>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
