import { useState, useEffect } from 'react';
import { getJobs, createJob, updateJob, deleteJob, getOperatives } from '../api';
import { Link } from 'react-router-dom';
import { exportJobsToCSV } from '../utils/exportUtils';

function JobModal({ job, operatives, onClose, onSave }) {
  const [formData, setFormData] = useState(job || {
    title: '',
    description: '',
    location: '',
    client_name: '',
    status: 'pending',
    priority: 'medium',
    required_skills: '',
    assigned_to: '',
    start_date: '',
    end_date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{job ? 'Edit Job' : 'Create New Job'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Client Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <input
                type="text"
                className="form-control"
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                placeholder="e.g., Electrical, Plumbing"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assign to Operative</label>
              <select
                className="form-select"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {operatives.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name} ({op.availability})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Job</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [operatives, setOperatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadData = () => {
    Promise.all([getJobs(), getOperatives()])
      .then(([jobsRes, operativesRes]) => {
        setJobs(jobsRes.data);
        setOperatives(operativesRes.data);
      })
      .catch((err) => {
        console.error('Error loading jobs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleSaveJob = async (jobData) => {
    try {
      if (editingJob) {
        await updateJob(editingJob.id, jobData);
      } else {
        await createJob(jobData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving job:', err);
      alert('Failed to save job');
    }
  };

  const handleDeleteJob = async (id) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        loadData();
      } catch (err) {
        console.error('Error deleting job:', err);
        alert('Failed to delete job');
      }
    }
  };

  const filteredJobs = filterStatus === 'all'
    ? jobs
    : jobs.filter(job => job.status === filterStatus);

  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Jobs Management</h3>
          <div className="flex items-center gap-2">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button className="btn btn-secondary" onClick={() => exportJobsToCSV(filteredJobs)}>
              📥 Export CSV
            </button>
            <button className="btn btn-primary" onClick={handleCreateJob}>
              + New Job
            </button>
          </div>
        </div>
        <div className="table-container">
          {filteredJobs.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Client</th>
                  <th>Location</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Start Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link to={`/jobs/${job.id}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 500 }}>
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
                    <td>{job.start_date || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-small" onClick={() => handleEditJob(job)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDeleteJob(job.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <div className="empty-state-text">No jobs found</div>
              <button className="btn btn-primary" onClick={handleCreateJob}>
                Create First Job
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <JobModal
          job={editingJob}
          operatives={operatives}
          onClose={() => setShowModal(false)}
          onSave={handleSaveJob}
        />
      )}
    </div>
  );
}

export default Jobs;
