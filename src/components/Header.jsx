import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [stats, setStats] = useState({
    averageRating: 4.2,
    feedbackCount: 0,
    loading: true
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch feedback data
      const feedbackResponse = await fetch('http://localhost:5000/api/feedback');
      const feedbacks = await feedbackResponse.json();
      
      // Calculate statistics
      if (feedbacks.length > 0) {
        const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
        const averageRating = totalRating / feedbacks.length;
        
        setStats({
          averageRating: parseFloat(averageRating.toFixed(1)),
          feedbackCount: feedbacks.length,
          loading: false
        });
      } else {
        setStats({
          averageRating: 0,
          feedbackCount: 0,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>🎓 University Feedback Hub</h1>
          <p className="subtitle">Share your experience, shape our university</p>
        </div>
        
        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">
              {stats.loading ? '...' : stats.averageRating}
            </span>
            <span className="stat-label">Avg. Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {stats.loading ? '...' : formatNumber(stats.feedbackCount)}
            </span>
            <span className="stat-label">Feedbacks</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;