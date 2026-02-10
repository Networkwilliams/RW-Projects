require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============= AUTH ROUTES =============

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, full_name, role FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= USER ROUTES =============

// Get all users
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, full_name, role, created_at FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
app.post('/api/users', authenticateToken, (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
      INSERT INTO users (username, password, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run(username, hashedPassword, full_name, role || 'admin');

    res.status(201).json({ id: result.lastInsertRowid, username, full_name, role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= OPERATIVE ROUTES =============

// Get all operatives
app.get('/api/operatives', authenticateToken, (req, res) => {
  try {
    const operatives = db.prepare('SELECT * FROM operatives ORDER BY name').all();
    res.json(operatives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single operative
app.get('/api/operatives/:id', authenticateToken, (req, res) => {
  try {
    const operative = db.prepare('SELECT * FROM operatives WHERE id = ?').get(req.params.id);
    if (!operative) {
      return res.status(404).json({ error: 'Operative not found' });
    }
    res.json(operative);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create operative
app.post('/api/operatives', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, skills, location, availability } = req.body;

    const result = db.prepare(`
      INSERT INTO operatives (name, email, phone, skills, location, availability)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, phone, skills, location, availability || 'available');

    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update operative
app.put('/api/operatives/:id', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, skills, location, availability } = req.body;

    db.prepare(`
      UPDATE operatives
      SET name = ?, email = ?, phone = ?, skills = ?, location = ?, availability = ?
      WHERE id = ?
    `).run(name, email, phone, skills, location, availability, req.params.id);

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete operative
app.delete('/api/operatives/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM operatives WHERE id = ?').run(req.params.id);
    res.json({ message: 'Operative deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= JOB ROUTES =============

// Get all jobs
app.get('/api/jobs', authenticateToken, (req, res) => {
  try {
    const jobs = db.prepare(`
      SELECT j.*, u.full_name as created_by_name, o.name as assigned_to_name
      FROM jobs j
      LEFT JOIN users u ON j.created_by = u.id
      LEFT JOIN operatives o ON j.assigned_to = o.id
      ORDER BY j.created_at DESC
    `).all();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job
app.get('/api/jobs/:id', authenticateToken, (req, res) => {
  try {
    const job = db.prepare(`
      SELECT j.*, u.full_name as created_by_name, o.name as assigned_to_name
      FROM jobs j
      LEFT JOIN users u ON j.created_by = u.id
      LEFT JOIN operatives o ON j.assigned_to = o.id
      WHERE j.id = ?
    `).get(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get risk assessments
    const riskAssessments = db.prepare('SELECT * FROM risk_assessments WHERE job_id = ?').all(req.params.id);

    // Get method statements
    const methodStatements = db.prepare('SELECT * FROM method_statements WHERE job_id = ?').all(req.params.id);

    // Get job updates
    const updates = db.prepare(`
      SELECT ju.*, u.full_name as updated_by_name
      FROM job_updates ju
      LEFT JOIN users u ON ju.updated_by = u.id
      WHERE ju.job_id = ?
      ORDER BY ju.created_at DESC
    `).all(req.params.id);

    res.json({ ...job, riskAssessments, methodStatements, updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create job
app.post('/api/jobs', authenticateToken, (req, res) => {
  try {
    const { title, description, location, client_name, status, priority, required_skills, assigned_to, start_date, end_date } = req.body;

    const result = db.prepare(`
      INSERT INTO jobs (title, description, location, client_name, status, priority, required_skills, created_by, assigned_to, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, location, client_name, status || 'pending', priority || 'medium', required_skills, req.user.id, assigned_to || null, start_date || null, end_date || null);

    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update job
app.put('/api/jobs/:id', authenticateToken, (req, res) => {
  try {
    const { title, description, location, client_name, status, priority, required_skills, assigned_to, start_date, end_date } = req.body;

    db.prepare(`
      UPDATE jobs
      SET title = ?, description = ?, location = ?, client_name = ?, status = ?, priority = ?, required_skills = ?, assigned_to = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, location, client_name, status, priority, required_skills, assigned_to || null, start_date || null, end_date || null, req.params.id);

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete job
app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add job update
app.post('/api/jobs/:id/updates', authenticateToken, (req, res) => {
  try {
    const { update_text } = req.body;

    const result = db.prepare(`
      INSERT INTO job_updates (job_id, update_text, updated_by)
      VALUES (?, ?, ?)
    `).run(req.params.id, update_text, req.user.id);

    res.status(201).json({ id: result.lastInsertRowid, job_id: req.params.id, update_text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= RISK ASSESSMENT ROUTES =============

// Get all risk assessments
app.get('/api/risk-assessments', authenticateToken, (req, res) => {
  try {
    const assessments = db.prepare('SELECT * FROM risk_assessments ORDER BY created_at DESC').all();
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get risk assessments for a job
app.get('/api/jobs/:id/risk-assessments', authenticateToken, (req, res) => {
  try {
    const assessments = db.prepare('SELECT * FROM risk_assessments WHERE job_id = ?').all(req.params.id);
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create risk assessment
app.post('/api/risk-assessments', authenticateToken, (req, res) => {
  try {
    const { job_id, title, hazards, risks, control_measures } = req.body;

    const result = db.prepare(`
      INSERT INTO risk_assessments (job_id, title, hazards, risks, control_measures, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(job_id, title, hazards, risks, control_measures, req.user.id);

    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update risk assessment
app.put('/api/risk-assessments/:id', authenticateToken, (req, res) => {
  try {
    const { title, hazards, risks, control_measures } = req.body;

    db.prepare(`
      UPDATE risk_assessments
      SET title = ?, hazards = ?, risks = ?, control_measures = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, hazards, risks, control_measures, req.params.id);

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete risk assessment
app.delete('/api/risk-assessments/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM risk_assessments WHERE id = ?').run(req.params.id);
    res.json({ message: 'Risk assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= METHOD STATEMENT ROUTES =============

// Get all method statements
app.get('/api/method-statements', authenticateToken, (req, res) => {
  try {
    const statements = db.prepare('SELECT * FROM method_statements ORDER BY created_at DESC').all();
    res.json(statements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get method statements for a job
app.get('/api/jobs/:id/method-statements', authenticateToken, (req, res) => {
  try {
    const statements = db.prepare('SELECT * FROM method_statements WHERE job_id = ?').all(req.params.id);
    res.json(statements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create method statement
app.post('/api/method-statements', authenticateToken, (req, res) => {
  try {
    const { job_id, title, description, steps, equipment_required, safety_requirements } = req.body;

    const result = db.prepare(`
      INSERT INTO method_statements (job_id, title, description, steps, equipment_required, safety_requirements, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(job_id, title, description, steps, equipment_required, safety_requirements, req.user.id);

    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update method statement
app.put('/api/method-statements/:id', authenticateToken, (req, res) => {
  try {
    const { title, description, steps, equipment_required, safety_requirements } = req.body;

    db.prepare(`
      UPDATE method_statements
      SET title = ?, description = ?, steps = ?, equipment_required = ?, safety_requirements = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, steps, equipment_required, safety_requirements, req.params.id);

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete method statement
app.delete('/api/method-statements/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM method_statements WHERE id = ?').run(req.params.id);
    res.json({ message: 'Method statement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= DASHBOARD STATS =============

app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  try {
    const totalJobs = db.prepare('SELECT COUNT(*) as count FROM jobs').get().count;
    const activeJobs = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE status = "in_progress"').get().count;
    const pendingJobs = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE status = "pending"').get().count;
    const completedJobs = db.prepare('SELECT COUNT(*) as count FROM jobs WHERE status = "completed"').get().count;
    const totalOperatives = db.prepare('SELECT COUNT(*) as count FROM operatives').get().count;
    const availableOperatives = db.prepare('SELECT COUNT(*) as count FROM operatives WHERE availability = "available"').get().count;

    res.json({
      totalJobs,
      activeJobs,
      pendingJobs,
      completedJobs,
      totalOperatives,
      availableOperatives
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
