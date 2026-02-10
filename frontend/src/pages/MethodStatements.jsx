import { useState, useEffect } from 'react';
import { getMethodStatements, createMethodStatement, updateMethodStatement, deleteMethodStatement, getJobs } from '../api';

function MethodStatementModal({ statement, jobs, onClose, onSave }) {
  const [formData, setFormData] = useState(statement || {
    job_id: '',
    title: '',
    description: '',
    steps: '',
    equipment_required: '',
    safety_requirements: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{statement ? 'Edit Method Statement' : 'Create New Method Statement'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Job *</label>
              <select
                className="form-select"
                value={formData.job_id}
                onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
                required
              >
                <option value="">Select a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
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
                placeholder="Brief description of the work method..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Steps</label>
              <textarea
                className="form-control"
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                placeholder="Step-by-step procedure..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Equipment Required</label>
              <textarea
                className="form-control"
                value={formData.equipment_required}
                onChange={(e) => setFormData({ ...formData, equipment_required: e.target.value })}
                placeholder="List of required equipment and tools..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Safety Requirements</label>
              <textarea
                className="form-control"
                value={formData.safety_requirements}
                onChange={(e) => setFormData({ ...formData, safety_requirements: e.target.value })}
                placeholder="Safety measures and PPE requirements..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Statement</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MethodStatements() {
  const [statements, setStatements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStatement, setEditingStatement] = useState(null);

  const loadData = () => {
    Promise.all([getMethodStatements(), getJobs()])
      .then(([statementsRes, jobsRes]) => {
        setStatements(statementsRes.data);
        setJobs(jobsRes.data);
      })
      .catch((err) => {
        console.error('Error loading method statements:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateStatement = () => {
    setEditingStatement(null);
    setShowModal(true);
  };

  const handleEditStatement = (statement) => {
    setEditingStatement(statement);
    setShowModal(true);
  };

  const handleSaveStatement = async (statementData) => {
    try {
      if (editingStatement) {
        await updateMethodStatement(editingStatement.id, statementData);
      } else {
        await createMethodStatement(statementData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving method statement:', err);
      alert('Failed to save method statement');
    }
  };

  const handleDeleteStatement = async (id) => {
    if (confirm('Are you sure you want to delete this method statement?')) {
      try {
        await deleteMethodStatement(id);
        loadData();
      } catch (err) {
        console.error('Error deleting method statement:', err);
        alert('Failed to delete method statement');
      }
    }
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  };

  if (loading) {
    return <div className="loading">Loading method statements...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Method Statements</h3>
          <button className="btn btn-primary" onClick={handleCreateStatement}>
            + New Method Statement
          </button>
        </div>
        <div className="table-container">
          {statements.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Job</th>
                  <th>Description</th>
                  <th>Safety Requirements</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {statements.map((statement) => (
                  <tr key={statement.id}>
                    <td style={{ fontWeight: 500 }}>{statement.title}</td>
                    <td>{getJobTitle(statement.job_id)}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {statement.description || '-'}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {statement.safety_requirements || '-'}
                    </td>
                    <td>{new Date(statement.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-small" onClick={() => handleEditStatement(statement)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDeleteStatement(statement.id)}>
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
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No method statements found</div>
              <button className="btn btn-primary" onClick={handleCreateStatement}>
                Create First Statement
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <MethodStatementModal
          statement={editingStatement}
          jobs={jobs}
          onClose={() => setShowModal(false)}
          onSave={handleSaveStatement}
        />
      )}
    </div>
  );
}

export default MethodStatements;
