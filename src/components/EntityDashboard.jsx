import React, { useState, useEffect } from 'react';
import './EntityDashboard.css';

const EntityDashboard = ({ entities }) => {
  const [stats, setStats] = useState({
    courses: {},
    professors: {},
    services: {}
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`https://frontend-12-test2.apps.na46r.prod.ole.redhat.com/api/feedback/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const renderStatCard = (title, data, type) => {
    const items = type === 'course' ? entities.courses :
                  type === 'professor' ? entities.professors :
                  entities.services;

    return (
      <div className="stat-card">
        <h3>{title}</h3>
        <div className="stat-list">
          {items.map(item => {
            const stat = data[item.id] || { average: 0, count: 0 };
            return (
              <div key={item.id} className="stat-item">
                <div className="stat-header">
                  <span className="stat-name">{item.name}</span>
                  <span className="stat-rating">
                    {stat.average.toFixed(1)} ★ ({stat.count})
                  </span>
                </div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill"
                    style={{ width: `${(stat.average / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>University Feedback Dashboard</h2>
        <p>Real-time insights from student feedback</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-summary">
          <div className="summary-card">
            <h4>Total Feedbacks</h4>
            <p className="summary-number">
              {Object.values(stats).reduce((total, category) => {
                return total + Object.values(category).reduce((sum, stat) => sum + stat.count, 0);
              }, 0)}
            </p>
          </div>
          <div className="summary-card">
            <h4>Avg. Course Rating</h4>
            <p className="summary-number">
              {Object.keys(stats.courses).length > 0
                ? (Object.values(stats.courses).reduce((sum, stat) => sum + stat.average, 0) / Object.keys(stats.courses).length).toFixed(1)
                : '0.0'}
            </p>
          </div>
          <div className="summary-card">
            <h4>Avg. Professor Rating</h4>
            <p className="summary-number">
              {Object.keys(stats.professors).length > 0
                ? (Object.values(stats.professors).reduce((sum, stat) => sum + stat.average, 0) / Object.keys(stats.professors).length).toFixed(1)
                : '0.0'}
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          {renderStatCard('Courses', stats.courses, 'course')}
          {renderStatCard('Professors', stats.professors, 'professor')}
          {renderStatCard('Services', stats.services, 'service')}
        </div>
      </div>
    </div>
  );
};

export default EntityDashboard;