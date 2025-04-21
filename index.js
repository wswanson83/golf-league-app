require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing BEFORE defining routes
app.use(cors());
app.use(express.json());

// Set up MySQL connection
console.log('🌱 DB selected:', process.env.DB_NAME);
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected successfully to your MySQL database!');
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('🏌️‍♂️ Golf League API connected to MySQL!');
});

// Mount API routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


// add new player
app.post('/players', (req, res) => {
  const { first_name, last_name, email, phone, handicap } = req.body;

  const sql = 'INSERT INTO Players (first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?)';
  const values = [first_name, last_name, email, phone];

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error adding player:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const newPlayerId = results.insertId;

    // ✅ Insert handicap into custom_player_handicaps
    const handicapSql = 'INSERT INTO custom_player_handicaps (player_id, handicap, effective_date) VALUES (?, ?, CURDATE())';
    const handicapValues = [newPlayerId, handicap];

    db.query(handicapSql, handicapValues, (err2) => {
      if (err2) {
        console.error('Error adding handicap:', err2);
        return res.status(500).json({ error: 'Failed to insert handicap' });
      }

      res.status(201).json({ message: 'Player added successfully', playerId: newPlayerId });
    });
  });
});


app.put('/players/:id', (req, res) => {
  const playerId = req.params.id;
  const { first_name, last_name, email, phone } = req.body;

  const sql = `
    UPDATE Players
    SET first_name = ?, last_name = ?, email = ?, phone_number = ?
    WHERE player_id = ?
  `;

  const values = [first_name, last_name, email, phone, playerId];

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error updating player:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Player updated successfully' });
  });
});


// Example route to clearly test database interaction
app.get('/players', (req, res) => {
  const sql = `
  SELECT p.player_id, p.first_name, p.last_name, p.email, p.phone_number,
         c.handicap
  FROM Players p
  LEFT JOIN (
    SELECT player_id, handicap
    FROM custom_player_handicaps h1
    WHERE effective_date = (
      SELECT MAX(effective_date)
      FROM custom_player_handicaps h2
      WHERE h1.player_id = h2.player_id
    )
  ) c ON p.player_id = c.player_id
  ORDER BY p.last_name, p.first_name
`;


  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error fetching players:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

