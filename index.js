// index.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (allows your frontend to communicate with backend)
app.use(cors());

// Enable JSON parsing
app.use(express.json());

// Set up MySQL database connection clearly using .env variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test MySQL connection clearly
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected successfully to your MySQL database!');
  }
});

// Simple test route clearly
app.get('/', (req, res) => {
  res.send('🏌️‍♂️ Golf League API connected to MySQL!');
});

// Start your server

// add new player
app.post('/players', (req, res) => {
  const { first_name, last_name, email, phone } = req.body;

  const sql = 'INSERT INTO Players (first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?)';
  const values = [first_name, last_name, email, phone];

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error adding player:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Player added successfully', playerId: results.insertId });
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

app.listen(PORT, () => {
  console.log(`🚀 Server running clearly on port ${PORT}`);
});
// Example route to clearly test database interaction
app.get('/players', (req, res) => {
  db.query('SELECT * FROM Players ORDER BY last_name, first_name' , (error, results) => {
    if (error) {
      res.status(500).send('Database error');
    } else {
      res.json(results);
    }
  });
});
app.get('/players', (req, res) => {
  const sql = 'SELECT * FROM Players ORDER BY last_name, first_name';

  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error fetching players:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});
