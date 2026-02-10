import { useState, useEffect } from 'react';
import { getOperatives, createOperative, updateOperative, deleteOperative } from '../api';
import { exportOperativesToCSV } from '../utils/exportUtils';

function OperativeModal({ operative, onClose, onSave }) {
  const [formData, setFormData] = useState(operative || {
    name: '',
    email: '',
    phone: '',
    skills: '',
    location: '',
    availability: 'available'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{operative ? 'Edit Operative' : 'Create New Operative'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Skills</label>
              <input
                type="text"
                className="form-control"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., Electrical, Plumbing, HVAC"
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
              <label className="form-label">Availability</label>
              <select
                className="form-select"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="on_job">On Job</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Operative</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Operatives() {
  const [operatives, setOperatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOperative, setEditingOperative] = useState(null);

  const loadOperatives = () => {
    getOperatives()
      .then((response) => {
        setOperatives(response.data);
      })
      .catch((err) => {
        console.error('Error loading operatives:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOperatives();
  }, []);

  const handleCreateOperative = () => {
    setEditingOperative(null);
    setShowModal(true);
  };

  const handleEditOperative = (operative) => {
    setEditingOperative(operative);
    setShowModal(true);
  };

  const handleSaveOperative = async (operativeData) => {
    try {
      if (editingOperative) {
        await updateOperative(editingOperative.id, operativeData);
      } else {
        await createOperative(operativeData);
      }
      setShowModal(false);
      loadOperatives();
    } catch (err) {
      console.error('Error saving operative:', err);
      alert('Failed to save operative');
    }
  };

  const handleDeleteOperative = async (id) => {
    if (confirm('Are you sure you want to delete this operative?')) {
      try {
        await deleteOperative(id);
        loadOperatives();
      } catch (err) {
        console.error('Error deleting operative:', err);
        alert('Failed to delete operative');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading operatives...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Operatives Management</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary" onClick={() => exportOperativesToCSV(operatives)}>
              📥 Export CSV
            </button>
            <button className="btn btn-primary" onClick={handleCreateOperative}>
              + New Operative
            </button>
          </div>
        </div>
        <div className="table-container">
          {operatives.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Skills</th>
                  <th>Location</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {operatives.map((operative) => (
                  <tr key={operative.id}>
                    <td style={{ fontWeight: 500 }}>{operative.name}</td>
                    <td>{operative.email || '-'}</td>
                    <td>{operative.phone || '-'}</td>
                    <td>{operative.skills || '-'}</td>
                    <td>{operative.location || '-'}</td>
                    <td>
                      <span className={`badge badge-${operative.availability === 'available' ? 'available' : 'unavailable'}`}>
                        {operative.availability}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-small" onClick={() => handleEditOperative(operative)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-small" onClick={() => handleDeleteOperative(operative.id)}>
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
              <div className="empty-state-icon">👷</div>
              <div className="empty-state-text">No operatives found</div>
              <button className="btn btn-primary" onClick={handleCreateOperative}>
                Add First Operative
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <OperativeModal
          operative={editingOperative}
          onClose={() => setShowModal(false)}
          onSave={handleSaveOperative}
        />
      )}
    </div>
  );
}

export default Operatives;
