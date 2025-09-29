import React from 'react';
import { FaStar, FaReply, FaFlag } from 'react-icons/fa'; // Import the icons
import './Review.css';

const Reviews = () => {
    const reviews = [
        {
            id: '1',
            customerName: 'Rahul Sharma',
            rating: 5,
            comment: 'Excellent quality milk! Fresh and pure. Will order again.',
            product: 'Fresh Milk',
            date: '2024-01-15'
        },
        {
            id: '2',
            customerName: 'Priya Singh',
            rating: 4,
            comment: 'Good quality chicken, properly cleaned and fresh.',
            product: 'Organic Chicken',
            date: '2024-01-14'
        },
        {
            id: '3',
            customerName: 'Amit Kumar',
            rating: 5,
            comment: 'Best chocolates in town! Kids loved them.',
            product: 'Premium Chocolates',
            date: '2024-01-13'
        },
        {
            id: '4',
            customerName: 'Sunita Devi',
            rating: 3,
            comment: 'Eggs were okay, but delivery was a bit delayed.',
            product: 'Farm Eggs',
            date: '2024-01-12'
        }
    ];

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar key={i} className={i <= rating ? 'star filled' : 'star'} />
            );
        }
        return stars;
    };

    const getAverageRating = () => {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return (totalRating / reviews.length).toFixed(1);
    };

    return (
        <div className="reviews">
            <div className="section-header">
                <h1 className="section-title">Customer Reviews</h1>
                <div className="reviews-summary">
                    <div className="average-rating">
                        <span className="rating-number">{getAverageRating()}</span>
                        <div className="rating-stars">
                            {renderStars(Math.round(Number(getAverageRating())))}
                        </div>
                        <span className="total-reviews">({reviews.length} reviews)</span>
                    </div>
                </div>
            </div>

            <div className="reviews-container">
                {reviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <div className="customer-info">
                                <div className="customer-avatar">
                                    {review.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div className="customer-details">
                                    <h4 className="customer-name">{review.customerName}</h4>
                                    <span className="review-date">{review.date}</span>
                                </div>
                            </div>
                            <div className="review-rating">
                                {renderStars(review.rating)}
                            </div>
                        </div>
                        
                        <div className="review-content">
                            <div className="product-name">📦 {review.product}</div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                        
                        <div className="review-actions">
                            <button className="btn-reply">
                                <FaReply /> Reply
                            </button>
                            <button className="btn-flag">
                                <FaFlag /> Flag
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews;