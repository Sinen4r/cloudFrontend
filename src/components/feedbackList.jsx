import React, { useState, useEffect } from 'react';
import './FeedbackList.css';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/feedback');
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFeedbacks = () => {
    return feedbacks.filter(feedback => {
      if (filter !== 'all' && feedback.target_type !== filter) return false;
      if (minRating > 0 && feedback.rating < minRating) return false;
      return true;
    });
  };

  const getEntityName = async (id, type) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/${type}s/${id}`);
      const data = await response.json();
      return data.name || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading feedbacks...</p>
      </div>
    );
  }

  return (
    <div className="feedback-list-container">
      <div className="filters">
        <div className="filter-group">
          <label>Filter by type:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="professor">Professors</option>
            <option value="service">Services</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Minimum rating:</label>
          <select 
            value={minRating} 
            onChange={(e) => setMinRating(parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="0">Any</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
      </div>

      <div className="feedback-grid">
        {getFilteredFeedbacks().map(feedback => (
          <div key={feedback.id} className="feedback-card">
            <div className="feedback-header">
              <div className="feedback-meta">
                <span className={`entity-type ${feedback.target_type}`}>
                  {feedback.target_type.toUpperCase()}
                </span>
                <span className="feedback-date">
                  {new Date(feedback.date).toLocaleDateString()}
                </span>
              </div>
              <div className="feedback-rating">
                {renderStars(feedback.rating)}
                <span className="rating-number">{feedback.rating}.0</span>
              </div>
            </div>
            
            <div className="feedback-body">
              <p className="feedback-comment">{feedback.comment}</p>
              
              {feedback.tags && feedback.tags.length > 0 && (
                <div className="feedback-tags">
                  {feedback.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {getFilteredFeedbacks().length === 0 && (
        <div className="empty-state">
          <p>No feedback found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;