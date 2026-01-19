import React, { useState } from 'react';
import './FeedbackForm.css';

const FeedbackForm = ({ entities, username }) => {
  const [formData, setFormData] = useState({
    target_type: 'course',
    target_id: '',
    rating: 5,
    comment: '',
    tags: [],
     username: username
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const tagOptions = ['Excellent', 'Needs Improvement', 'Helpful', 'Challenging', 'Interesting', 'Well-organized', 'Supportive'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const getFilteredTargets = () => {
    switch (formData.target_type) {
      case 'course':
        return entities.courses;
      case 'professor':
        return entities.professors;
      case 'service':
        return entities.services;
      default:
        return [];
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const feedbackData = {
      ...formData,
      username: username,   // make sure username is included
      date: new Date().toISOString()
    };

    // Submit feedback to your backend
    const response = await fetch(`https://frontend-12-test2.apps.na46r.prod.ole.redhat.com/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    if (response.ok) {
      // Send notification to Notification Service
      await fetch('https://notif-back-test2.apps.na46r.prod.ole.redhat.com/notify/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: username,
          subject: 'Feedback Received',
          message: `Hi ${username}, your feedback for ${formData.target_type} has been submitted.`
        })
      });

      setSuccessMessage('Thank you! Your feedback has been submitted successfully.');
      setFormData({
        target_type: 'course',
        target_id: '',
        rating: 5,
        comment: '',
        tags: [],
        username: username
      });

      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      throw new Error('Failed to submit feedback');
    }
  } catch (error) {
    alert('Error submitting feedback. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="feedback-form-container">
      <div className="form-header">
        <h2>Submit Your Feedback</h2>
        <p>Your opinion helps us improve the university experience for everyone</p>
      </div>

      {successMessage && (
        <div className="success-message">
          ✅ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Feedback For</label>
            <div className="entity-type-selector">
              {['course', 'professor', 'service'].map(type => (
                <button
                  key={type}
                  type="button"
                  className={`entity-type-btn ${formData.target_type === type ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, target_type: type, target_id: '' }))}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Select {formData.target_type.charAt(0).toUpperCase() + formData.target_type.slice(1)}</label>
            <select
              name="target_id"
              value={formData.target_id}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Choose one...</option>
              {getFilteredTargets().map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.code ? `(${item.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Rating</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`rating-star ${formData.rating >= star ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                >
                  ★
                </button>
              ))}
              <span className="rating-text">
                {formData.rating === 5 ? 'Excellent' :
                 formData.rating === 4 ? 'Good' :
                 formData.rating === 3 ? 'Average' :
                 formData.rating === 2 ? 'Poor' : 'Very Poor'}
              </span>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Your Feedback</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Share your detailed experience..."
              rows="4"
              required
              className="form-textarea"
            />
          </div>

          <div className="form-group full-width">
            <label>Tags (Optional)</label>
            <div className="tags-container">
              {tagOptions.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-btn ${formData.tags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;