const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // enable JSON body parsing

// Serve static files from "frontend" (sibling folder to backend)
const staticDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(staticDir));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'regional_monitoring',
  password: '1234',
  port: 5432,
});

// Regions (Level 1)
app.get('/regions', async (req, res) => {
  const result = await pool.query(`
    SELECT jsonb_build_object(
      'type','FeatureCollection',
      'features', jsonb_agg(
        jsonb_build_object(
          'type','Feature',
          'geometry', ST_AsGeoJSON(wkb_geometry)::jsonb,
          'properties', jsonb_build_object(
            'adm1_psgc', adm1_psgc,
            'adm2_psgc', adm2_psgc,
            'adm2_en', adm2_en
          )
        )
      )
    ) AS geojson
    FROM regions;
  `);
  res.json(result.rows[0].geojson);
});

// Municipalities by region (Level 2)
app.get('/municipalities/:regionId', async (req, res) => {
  const { regionId } = req.params;
  const result = await pool.query(`
    SELECT jsonb_build_object(
      'type','FeatureCollection',
      'features', COALESCE(jsonb_agg(
        jsonb_build_object(
          'type','Feature',
          'geometry', ST_AsGeoJSON(wkb_geometry)::jsonb,
          'properties', jsonb_build_object(
            'adm1_psgc', adm1_psgc,
            'adm2_psgc', adm2_psgc,
            'adm3_psgc', adm3_psgc,
            'adm3_en', adm3_en
          )
        )
      ), '[]'::jsonb)
    ) AS geojson
    FROM municipalities
    WHERE adm1_psgc = $1;
  `, [regionId]);
  res.json(result.rows[0].geojson);
});

// --- Projects CRUD ---
// Get all projects
app.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY project_id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create new project
app.post('/projects', async (req, res) => {
  try {
    const { municipality_id, municipality_name, project_name, project_cost, duration_start, duration_end, progress } = req.body;
    const result = await pool.query(
      `INSERT INTO projects (municipality_id, municipality_name, project_name, project_cost, duration_start, duration_end, progress)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [municipality_id, municipality_name, project_name, project_cost, duration_start, duration_end, progress]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
app.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { project_name, project_cost, duration_start, duration_end, progress } = req.body;
    const result = await pool.query(
      `UPDATE projects
       SET project_name=$1, project_cost=$2, duration_start=$3, duration_end=$4, progress=$5
       WHERE project_id=$6 RETURNING *`,
      [project_name, project_cost, duration_start, duration_end, progress, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE project_id=$1', [id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
