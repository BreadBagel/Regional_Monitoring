const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       
  host: 'localhost',
  database: 'regional_monitoring',
  password: '1234',       
  port: 5432,
});

(async () => {
  try {
    const res = await pool.query('SELECT * FROM regions');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
})();
