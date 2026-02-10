import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJob, addJobUpdate } from '../api';

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateText, setUpdateText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadJob = () => {
    getJob(id)
      .then((response) => {
        setJob(response.data);
      })
      .catch((err) => {
        console.error('Error loading job:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    setSubmitting(true);
    try {
      await addJobUpdate(id, updateText);
      setUpdateText('');
      loadJob();
    } catch (err) {
      console.error('Error adding update:', err);
      alert('Failed to add update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (!job) {
    return <div className="card">Job not found</div>;
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/jobs" style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>
          ← Back to Jobs
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{job.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`badge badge-${job.status}`}>{job.status}</span>
            <span className={`badge badge-${job.priority}`}>{job.priority}</span>
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <div>
              <strong>Client:</strong> {job.client_name || '-'}
            </div>
            <div>
              <strong>Location:</strong> {job.location || '-'}
            </div>
            <div>
              <strong>Assigned To:</strong> {job.assigned_to_name || 'Unassigned'}
            </div>
            <div>
              <strong>Created By:</strong> {job.created_by_name}
            </div>
            <div>
              <strong>Start Date:</strong> {job.start_date || '-'}
            </div>
            <div>
              <strong>End Date:</strong> {job.end_date || '-'}
            </div>
            <div>
              <strong>Required Skills:</strong> {job.required_skills || '-'}
            </div>
          </div>
          {job.description && (
            <div style={{ marginTop: '20px' }}>
              <strong>Description:</strong>
              <p style={{ marginTop: '8px', color: 'var(--dark-gray)' }}>{job.description}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Risk Assessments ({job.riskAssessments?.length || 0})</h4>
          </div>
          {job.riskAssessments?.length > 0 ? (
            <div style={{ padding: '24px' }}>
              {job.riskAssessments.map((ra) => (
                <div key={ra.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--primary-blue)' }}>{ra.title}</strong>
                  {ra.hazards && <p style={{ fontSize: '14px', marginTop: '4px' }}><strong>Hazards:</strong> {ra.hazards}</p>}
                  {ra.control_measures && <p style={{ fontSize: '14px', marginTop: '4px' }}><strong>Control Measures:</strong> {ra.control_measures}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text" style={{ fontSize: '14px' }}>No risk assessments</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Method Statements ({job.methodStatements?.length || 0})</h4>
          </div>
          {job.methodStatements?.length > 0 ? (
            <div style={{ padding: '24px' }}>
              {job.methodStatements.map((ms) => (
                <div key={ms.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--primary-blue)' }}>{ms.title}</strong>
                  {ms.description && <p style={{ fontSize: '14px', marginTop: '4px' }}>{ms.description}</p>}
                  {ms.safety_requirements && <p style={{ fontSize: '14px', marginTop: '4px' }}><strong>Safety:</strong> {ms.safety_requirements}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text" style={{ fontSize: '14px' }}>No method statements</div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h4 className="card-title">Job Updates</h4>
        </div>
        <div style={{ padding: '24px' }}>
          <form onSubmit={handleAddUpdate} style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Add a progress update..."
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                disabled={submitting}
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Update'}
            </button>
          </form>

          {job.updates?.length > 0 ? (
            <div>
              {job.updates.map((update) => (
                <div key={update.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ marginBottom: '8px' }}>{update.update_text}</p>
                  <div style={{ fontSize: '13px', color: 'var(--gray)' }}>
                    By {update.updated_by_name} • {new Date(update.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text">No updates yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
