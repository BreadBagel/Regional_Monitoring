const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all regions
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT id, name, ST_AsGeoJSON(boundary) as boundary, metadata FROM regions');
  res.json(result.rows);
});

// Get region by ID
router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM regions WHERE id=$1', [req.params.id]);
  res.json(result.rows[0]);
});

module.exports = router;
