import { useState, useEffect } from 'react';
import { getDashboardStats, getJobs } from '../api';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getJobs()])
      .then(([statsRes, jobsRes]) => {
        setStats(statsRes.data);
        setRecentJobs(jobsRes.data.slice(0, 5));
      })
      .catch((err) => {
        console.error('Error loading dashboard:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Jobs</div>
          <div className="stat-value">{stats?.totalJobs || 0}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Pending Jobs</div>
          <div className="stat-value">{stats?.pendingJobs || 0}</div>
        </div>
        <div className="stat-card info">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{stats?.activeJobs || 0}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Completed Jobs</div>
          <div className="stat-value">{stats?.completedJobs || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Operatives</div>
          <div className="stat-value">{stats?.totalOperatives || 0}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Available Operatives</div>
          <div className="stat-value">{stats?.availableOperatives || 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Jobs</h3>
          <Link to="/jobs" className="btn btn-primary btn-small">View All</Link>
        </div>
        <div className="table-container">
          {recentJobs.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Client</th>
                  <th>Location</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link to={`/jobs/${job.id}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>
                        {job.title}
                      </Link>
                    </td>
                    <td>{job.client_name || '-'}</td>
                    <td>{job.location || '-'}</td>
                    <td>{job.assigned_to_name || 'Unassigned'}</td>
                    <td>
                      <span className={`badge badge-${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${job.priority}`}>
                        {job.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No jobs yet</div>
              <Link to="/jobs" className="btn btn-primary">Create First Job</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
