const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

module.exports = (req, res, next) => {
  const playerId = req.user.player_id;

  const query = 'SELECT role FROM admins WHERE player_id = ?';

  db.query(query, [playerId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (results.length === 0) {
      return res.status(403).json({ message: 'Access denied: Admins only.' });
    }

    // User is confirmed admin; attach role to req.user for later use
    req.user.role = results[0].role;

    next();
  });
};
