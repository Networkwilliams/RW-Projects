import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Operatives from './pages/Operatives';
import RiskAssessments from './pages/RiskAssessments';
import MethodStatements from './pages/MethodStatements';
import Users from './pages/Users';
import { getCurrentUser } from './api';

function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="RW Projects Logo" style={{ width: '100px', marginBottom: '12px' }} />
          <h1 style={{ fontSize: '20px' }}>RW Projects<br/>Job Dashboard</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}>
            📊 Dashboard
          </Link>
          <Link to="/jobs" className={`nav-item ${currentPath.startsWith('/jobs') ? 'active' : ''}`}>
            💼 Jobs
          </Link>
          <Link to="/operatives" className={`nav-item ${currentPath === '/operatives' ? 'active' : ''}`}>
            👷 Operatives
          </Link>
          <Link to="/risk-assessments" className={`nav-item ${currentPath === '/risk-assessments' ? 'active' : ''}`}>
            ⚠️ Risk Assessments
          </Link>
          <Link to="/method-statements" className={`nav-item ${currentPath === '/method-statements' ? 'active' : ''}`}>
            📋 Method Statements
          </Link>
          <Link to="/users" className={`nav-item ${currentPath === '/users' ? 'active' : ''}`}>
            👥 Users
          </Link>
          <div className="nav-item" onClick={handleLogout} style={{ marginTop: '20px' }}>
            🚪 Logout
          </div>
        </nav>
      </aside>
      <main className="main-content">
        <div className="page-header">
          <h2>Welcome Back</h2>
          <div className="user-info">
            <span>{user?.full_name}</span>
            <div className="user-avatar">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />
        } />
        <Route path="/dashboard" element={
          user ? <Layout user={user} onLogout={() => setUser(null)}><Dashboard /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/jobs" element={
          user ? <Layout user={user} onLogout={() => setUser(null)}><Jobs /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/jobs/:id" element={
          user ? <Layout user={user} onLogout={() => setUser(null)}><JobDetail /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/operatives" element={
          user ? <Layout user={user} onLogout={() => setUser(null)}><Operatives /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/risk-assessments" element={
          user ? <Layout user={user} onLogout={() => setUser(null)}><RiskAssessments /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/method-statements" element={
          user ? <Layout user={user} onLogout={() => setUser(null)}><MethodStatements /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/users" element={
          user ? <Layout user={user} onLogout={() => setUser(null)}><Users /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
