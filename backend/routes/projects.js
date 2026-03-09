const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new project
router.post('/', async (req, res) => {
  const { region_id, name, contractor, budget, utilization, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (region_id, name, contractor, budget, utilization, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [region_id, name, contractor, budget, utilization, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  const { name, contractor, budget, utilization, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE projects SET name=$1, contractor=$2, budget=$3, utilization=$4, status=$5 WHERE id=$6 RETURNING *',
      [name, contractor, budget, utilization, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM projects WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
