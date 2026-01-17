import React, { useState, useEffect } from 'react';
import './App.css';
import FeedbackForm from './components/feedbackForm';
import FeedbackList from './components/feedbackList';
import EntityDashboard from './components/EntityDashboard';
import Header from './components/Header';

function App() {
  const [activeTab, setActiveTab] = useState('submit');
  const [entities, setEntities] = useState({
    majors: [],
    minors: [],
    courses: [],
    professors: [],
    services: []
  });

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const [majorsRes, minorsRes, coursesRes, professorsRes] = await Promise.all([
        fetch(`https://frontend-12-test2.apps.na46r.prod.ole.redhat.com/majors`),
        fetch(`${process.env.REACT_APP_API_URL || '/api'}/minors`),
        fetch(`${process.env.REACT_APP_API_URL || '/api'}/courses`),
        fetch(`${process.env.REACT_APP_API_URL || '/api'}/professors`)
      ]);

      const data = {
        majors: await majorsRes.json(),
        minors: await minorsRes.json(),
        courses: await coursesRes.json(),
        professors: await professorsRes.json(),
        services: [
          { id: 'lib', name: 'Library' },
          { id: 'caf', name: 'Cafeteria' },
          { id: 'sport', name: 'Sports Center' },
          { id: 'health', name: 'Health Center' },
          { id: 'it', name: 'IT Services' }
        ]
      };

      setEntities(data);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  return (
    <div className="App">
      <Header />
      
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Feedback
        </button>
        <button 
          className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Feedback
        </button>
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'submit' && (
          <FeedbackForm entities={entities} />
        )}
        {activeTab === 'view' && (
          <FeedbackList />
        )}
        {activeTab === 'dashboard' && (
          <EntityDashboard entities={entities} />
        )}
      </main>

      <footer className="footer">
        <p>University Feedback System © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;