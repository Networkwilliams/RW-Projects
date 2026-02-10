import { useState, useEffect } from 'react';
import { getRiskAssessments, createRiskAssessment, updateRiskAssessment, deleteRiskAssessment, getJobs } from '../api';
import { exportRiskAssessmentsToCSV } from '../utils/exportUtils';

function RiskAssessmentModal({ assessment, jobs, onClose, onSave }) {
  const [formData, setFormData] = useState(assessment || {
    job_id: '',
    title: '',
    hazards: '',
    risks: '',
    control_measures: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{assessment ? 'Edit Risk Assessment' : 'Create New Risk Assessment'}</h3>
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
              <label className="form-label">Hazards</label>
              <textarea
                className="form-control"
                value={formData.hazards}
                onChange={(e) => setFormData({ ...formData, hazards: e.target.value })}
                placeholder="Describe potential hazards..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Risks</label>
              <textarea
                className="form-control"
                value={formData.risks}
                onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
                placeholder="Describe potential risks..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Control Measures</label>
              <textarea
                className="form-control"
                value={formData.control_measures}
                onChange={(e) => setFormData({ ...formData, control_measures: e.target.value })}
                placeholder="Describe control measures to mitigate risks..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Assessment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RiskAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);

  const loadData = () => {
    Promise.all([getRiskAssessments(), getJobs()])
      .then(([assessmentsRes, jobsRes]) => {
        setAssessments(assessmentsRes.data);
        setJobs(jobsRes.data);
      })
      .catch((err) => {
        console.error('Error loading risk assessments:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssessment = () => {
    setEditingAssessment(null);
    setShowModal(true);
  };

  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment);
    setShowModal(true);
  };

  const handleSaveAssessment = async (assessmentData) => {
    try {
      if (editingAssessment) {
        await updateRiskAssessment(editingAssessment.id, assessmentData);
      } else {
        await createRiskAssessment(assessmentData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error saving risk assessment:', err);
      alert('Failed to save risk assessment');
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (confirm('Are you sure you want to delete this risk assessment?')) {
      try {
        await deleteRiskAssessment(id);
        loadData();
      } catch (err) {
        console.error('Error deleting risk assessment:', err);
        alert('Failed to delete risk assessment');
      }
    }
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  };

  if (loading) {
    return <div className="loading">Loading risk assessments...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Risk Assessments</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary" onClick={() => exportRiskAssessmentsToCSV(assessments)}>
              📥 Export CSV
            </button>
            <button className="btn btn-primary" onClick={handleCreateAssessment}>
              + New Risk Assessment
            </button>
          </div>
        </div>
        <div className="table-container">
          {assessments.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Job</th>
                  <th>Hazards</th>
                  <th>Control Measures</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td style={{ fontWeight: 500 }}>{assessment.title}</td>
                    <td>{getJobTitle(assessment.job_id)}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {assessment.hazards || '-'}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {assessment.control_measures || '-'}
                    </td>
                    <td>{new Date(assessment.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-small" onClick={() => handleEditAssessment(assessment)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDeleteAssessment(assessment.id)}>
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
              <div className="empty-state-icon">⚠️</div>
              <div className="empty-state-text">No risk assessments found</div>
              <button className="btn btn-primary" onClick={handleCreateAssessment}>
                Create First Assessment
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <RiskAssessmentModal
          assessment={editingAssessment}
          jobs={jobs}
          onClose={() => setShowModal(false)}
          onSave={handleSaveAssessment}
        />
      )}
    </div>
  );
}

export default RiskAssessments;
