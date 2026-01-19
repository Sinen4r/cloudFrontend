import React, { useState, useEffect } from 'react';
import './App.css';
import FeedbackForm from './components/feedbackForm';
import FeedbackList from './components/feedbackList';
import EntityDashboard from './components/EntityDashboard';
import Header from './components/Header';

const AUTH_API_URL = 'https://auth-backend-test2.apps.na46r.prod.ole.redhat.com/api';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('submit');
  const [entities, setEntities] = useState({
    majors: [],
    minors: [],
    courses: [],
    professors: [],
    services: []
  });

  useEffect(() => {
    // Check if user is already logged in with a valid token
    const token = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('email');
    
    if (token && savedEmail) {
      // Verify token is still valid by making a test request
      verifyToken(token, savedEmail);
    }
  }, []);

  const verifyToken = async (token, email) => {
    try {
      // Try to fetch entities to verify token is valid
      const response = await fetch(`https://frontend-12-test2.apps.na46r.prod.ole.redhat.com/api/majors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Token is valid, restore session
        setIsAuthenticated(true);
        setUsername(email);
        setCurrentPage('app');
      } else {
        // Token is invalid, clear storage
        clearAuth();
      }
    } catch (error) {
      // Network error or invalid token, clear storage
      console.error('Token verification failed:', error);
      clearAuth();
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntities();
    }
  }, [isAuthenticated]);

  const fetchEntities = async () => {
    try {
      const [majorsRes, minorsRes, coursesRes, professorsRes] = await Promise.all([
        fetch(`https://frontend-12-test2.apps.na46r.prod.ole.redhat.com/api/majors`),
        fetch(`https://frontend-12-test2.apps.na46r.prod.ole.redhat.com/api/minors`),
        fetch(`https://frontend-12-test2.apps.na46r.prod.ole.redhat.com/api/courses`),
        fetch(`https://frontend-12-test2.apps.na46r.prod.ole.redhat.com/api/professors`)
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

  // Login Page
  const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const response = await fetch(`${AUTH_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('email', data.user.email);
          localStorage.setItem('role', data.user.role);
          localStorage.setItem('userId', data.user.id);
          setUsername(data.user.email);
          setIsAuthenticated(true);
          setCurrentPage('app');
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={authStyles.container}>
        <div style={authStyles.card}>
          <h2 style={authStyles.title}>University Feedback System</h2>
          <h3 style={authStyles.subtitle}>Login</h3>
          <form onSubmit={handleSubmit} style={authStyles.form}>
            {error && <div style={authStyles.error}>{error}</div>}
            
            <div style={authStyles.inputGroup}>
              <label style={authStyles.label}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={authStyles.input}
                placeholder="Enter your email"
              />
            </div>

            <div style={authStyles.inputGroup}>
              <label style={authStyles.label}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={authStyles.input}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" disabled={loading} style={authStyles.button}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p style={authStyles.link}>
              Don't have an account?{' '}
              <span onClick={() => setCurrentPage('signup')} style={authStyles.linkText}>
                Sign up
              </span>
            </p>
          </form>
        </div>
      </div>
    );
  };

  // Signup Page
  const SignupPage = () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${AUTH_API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: 'student'
          })
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess('Account created! Redirecting to login...');
          setTimeout(() => setCurrentPage('login'), 2000);
        } else {
          setError(data.error || 'Signup failed');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={authStyles.container}>
        <div style={authStyles.card}>
          <h2 style={authStyles.title}>University Feedback System</h2>
          <h3 style={authStyles.subtitle}>Sign Up</h3>
          <form onSubmit={handleSubmit} style={authStyles.form}>
            {error && <div style={authStyles.error}>{error}</div>}
            {success && <div style={authStyles.success}>{success}</div>}
            
            <div style={authStyles.inputGroup}>
              <label style={authStyles.label}>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                style={authStyles.input}
                placeholder="Choose a username"
              />
            </div>

            <div style={authStyles.inputGroup}>
              <label style={authStyles.label}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={authStyles.input}
                placeholder="Enter your email"
              />
            </div>

            <div style={authStyles.inputGroup}>
              <label style={authStyles.label}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={authStyles.input}
                placeholder="Create a password"
              />
            </div>

            <div style={authStyles.inputGroup}>
              <label style={authStyles.label}>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                style={authStyles.input}
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" disabled={loading} style={authStyles.buttonGreen}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <p style={authStyles.link}>
              Already have an account?{' '}
              <span onClick={() => setCurrentPage('login')} style={authStyles.linkText}>
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    );
  };

  // Main App (after authentication)
  const MainApp = () => {
    const handleLogout = () => {
      clearAuth();
    };

    return (
      <div className="App">
        <Header username={username} onLogout={handleLogout} />
        
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
            <FeedbackForm entities={entities} username={username} />
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
  };

  // Display appropriate page
  if (currentPage === 'login') return <LoginPage />;
  if (currentPage === 'signup') return <SignupPage />;
  if (currentPage === 'app' && isAuthenticated) return <MainApp />;
  
  return <LoginPage />;
}

// Styles for authentication pages
const authStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
    color: '#333',
    fontSize: '24px'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#555',
    fontSize: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    outline: 'none'
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buttonGreen: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center'
  },
  success: {
    padding: '12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center'
  },
  link: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666'
  },
  linkText: {
    color: '#007bff',
    cursor: 'pointer',
    fontWeight: '500',
    textDecoration: 'underline'
  }
};

export default App;