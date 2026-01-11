import React, { useEffect, useState } from 'react';
import { FaStar, FaReply, FaFlag } from 'react-icons/fa';
import './Review.css';

const Reviews = ({ sellerId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar key={i} className={i <= rating ? 'star filled' : 'star'} />
            );
        }
        return stars;
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                if (sellerId) {
                    const res = await fetch(`/api/reviews/seller/${sellerId}`);
                    const data = await res.json();
                    if (mounted) setReviews(data || []);
                } else {
                    const res = await fetch('/api/reviews');
                    if (res.ok) {
                        const data = await res.json();
                        if (mounted) setReviews(data || []);
                    } else {
                        if (mounted) setReviews([]);
                    }
                }
            } catch (err) {
                if (mounted) setReviews([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();

        const onUpdated = () => { load(); };
        window.addEventListener('reviewsUpdated', onUpdated);
        return () => { mounted = false; window.removeEventListener('reviewsUpdated', onUpdated); };
    }, [sellerId]);

    const getAverageRating = () => {
        if (!reviews.length) return null;
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        return (totalRating / reviews.length).toFixed(1);
    };

    return (
        <div className="reviews">
            <div className="section-header">
                <h1 className="section-title">Customer Reviews</h1>
                <div className="reviews-summary">
                    <div className="average-rating">
                        {getAverageRating() && <span className="rating-number">{getAverageRating()}</span>}
                        <div className="rating-stars">
                            {renderStars(Math.round(Number(getAverageRating()) || 0))}
                        </div>
                        <span className="total-reviews">({reviews.length} reviews)</span>
                    </div>
                </div>
            </div>

            <div className="reviews-container">
                {loading ? <p>Loading reviews…</p> : (
                    reviews.length === 0 ? <p>No reviews yet.</p> : (
                        reviews.map((review) => (
                            <div key={review._id || review.id} className="review-card">
                                <div className="review-header">
                                    <div className="customer-info">
                                        <div className="customer-avatar">
                                            {(review.user?.name || review.user?.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="customer-details">
                                            <h4 className="customer-name">{review.user?.name || review.user?.email || 'User'}</h4>
                                            <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="review-rating">
                                        {renderStars(review.rating || 0)}
                                    </div>
                                </div>
                                <div className="review-content">
                                    {review.product && <div className="product-name">📦 {review.productName || review.product}</div>}
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                                <div className="review-actions">
                                    <button className="btn-reply"><FaReply /> Reply</button>
                                    <button className="btn-flag"><FaFlag /> Flag</button>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default Reviews;