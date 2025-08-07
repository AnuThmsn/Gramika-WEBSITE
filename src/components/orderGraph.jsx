import React from 'react';
import '../App.css';
 // Use this if styling is in App.css
const reviews = [
 {
 id: 1,
 customer: 'Alice',
 comment: 'Great packaging and on-time delivery!',
 rating: 5,
 date: '2025-07-12',
 },
 {
 id: 2,
 customer: 'Bob',
 comment: 'Nice service but delivery was a bit late.',
 rating: 3,
 date: '2025-07-18',
 },
 {
 id: 3,
 customer: 'Charlie',
 comment: 'Very professional, I’ll definitely order again.',
 rating: 4,
 date: '2025-07-20',
 },
];
function OrderGraph() {
 return (
 <div className="review-container">
 <h2>괘괙괚괛궨궩궪궫궬 Customer Reviews</h2>
 {reviews.map(review => (
 <div key={review.id} className="review-card">
 <h4 className="review-customer">{review.customer}</h4>
 <p className="review-rating">Rating: {'⭐'.repeat(review.rating)}</p>
 <p className="review-comment">"{review.comment}"</p>
 <p className="review-date">Reviewed on: {review.date}</p>
 </div>
 ))}
 </div>
 );
}
export default OrderGraph; 