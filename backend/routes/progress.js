const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all progress reports
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM progress_reports');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching progress reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get progress report by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM progress_reports WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new progress report
router.post('/', async (req, res) => {
  const { project_id, report_date, milestone, completion_rate, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO progress_reports (project_id, report_date, milestone, completion_rate, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [project_id, report_date, milestone, completion_rate, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update progress report
router.put('/:id', async (req, res) => {
  const { milestone, completion_rate, notes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE progress_reports SET milestone=$1, completion_rate=$2, notes=$3 WHERE id=$4 RETURNING *',
      [milestone, completion_rate, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete progress report
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM progress_reports WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
