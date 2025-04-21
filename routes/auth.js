const express = require('express');
const router = express.Router();
const authController = require('../middleware/authController');
const mysql = require('mysql2');
require('dotenv').config();

// Existing login route
router.post('/login', authController.login);

// Set up DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Get all courses for the dropdown
router.get('/courses', (req, res) => {
  db.query(
    'SELECT course_id, club_name, course FROM courses ORDER BY club_name, course',
    (err, results) => {
      if (err) {
        console.error('❌ Error fetching courses:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(results);
    }
  );
});

// Save a new tournament
router.post('/tournaments', (req, res) => {
  const {
    front_nine_course_id,
    back_nine_course_id,
    start_date,
    end_date,
    tournament_name,
    holes_played
  } = req.body;

  const sql = `
    INSERT INTO tournaments 
    (tournament_name, start_date, end_date, front_nine_course_id, back_nine_course_id, holes_played)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    tournament_name,
    start_date,
    end_date,
    front_nine_course_id,
    back_nine_course_id,
    String(holes_played)
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error inserting tournament:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ message: 'Tournament added', tournament_id: result.insertId });
  });
});

// Add initial handicap for a player
router.post('/handicaps', (req, res) => {
  const { player_id, handicap } = req.body;
  const effective_date = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD

  const sql = `
    INSERT INTO custom_player_handicaps (player_id, handicap, effective_date)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [player_id, handicap, effective_date], (err, result) => {
    if (err) {
      console.error('❌ Error inserting handicap:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ message: 'Initial handicap set' });
  });
});


// Get all tournaments (history view)
router.get('/tournaments', (req, res) => {
  const sql = `
    SELECT t.*, 
      c1.club_name AS front_club, c1.course AS front_course,
      c2.club_name AS back_club, c2.course AS back_course
    FROM tournaments t
    LEFT JOIN courses c1 ON t.front_nine_course_id = c1.course_id
    LEFT JOIN courses c2 ON t.back_nine_course_id = c2.course_id
    ORDER BY t.start_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching tournaments:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});
router.put('/tournaments/:id', (req, res) => {
    const id = req.params.id;
    const {
      tournament_name,
      start_date,
      end_date,
      front_nine_course_id,
      back_nine_course_id,
      holes_played
    } = req.body;
  
    const sql = `
      UPDATE tournaments
      SET tournament_name = ?, start_date = ?, end_date = ?, front_nine_course_id = ?, back_nine_course_id = ?, holes_played = ?
      WHERE tournament_id = ?
    `;
  
    const values = [
      tournament_name,
      start_date,
      end_date,
      front_nine_course_id,
      back_nine_course_id || null,
      String(holes_played),
      id
    ];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('❌ Error updating tournament:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json({ message: 'Tournament updated' });
    });
  });

// ✅ Submit scores for a player
router.post('/scores', (req, res) => {
    const {
      player_id,
      tournament_id,
      scores
    } = req.body;
  
    const scoreFields = scores.map((_, i) => `hole_${i + 1}`).join(', ');
    const placeholders = scores.map(() => '?').join(', ');
  
    // First fetch tournament details
    const tournamentQuery = `SELECT * FROM tournaments WHERE tournament_id = ?`;
    db.query(tournamentQuery, [tournament_id], (err, results) => {
      if (err || results.length === 0) {
        console.error('❌ Could not fetch tournament:', err);
        return res.status(500).json({ message: 'Failed to fetch tournament details' });
      }
  
      const tournament = results[0];
      const { front_nine_course_id, back_nine_course_id, holes_played, start_date } = tournament;
  
      const values = [
        player_id,
        tournament_id,
        front_nine_course_id,
        back_nine_course_id || null,
        start_date,
        holes_played,
        1, // starting_hole (defaulted to 1),
        ...scores
      ];
  
      const sql = `
        INSERT INTO scores (
          player_id, tournament_id, front_nine_course_id, back_nine_course_id, round_date, holes_played, starting_hole,
          ${scoreFields}
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ${placeholders})
      `;
  
      db.query(sql, values, (err, result) => {
        if (err) {
          console.error('❌ Error saving scores:', err);
          return res.status(500).json({ message: 'Database error' });
        }
  
        res.status(201).json({ message: 'Scores submitted successfully' });
      });
    });
  });
  

  // Get all players
  router.get('/players', (req, res) => {
    const sql = `
      SELECT p.player_id, p.first_name, p.last_name, p.email, p.phone_number, h.handicap
      FROM players p
      LEFT JOIN (
        SELECT player_id, handicap
        FROM custom_player_handicaps h1
        WHERE effective_date = (
          SELECT MAX(effective_date)
          FROM custom_player_handicaps h2
          WHERE h2.player_id = h1.player_id
        )
      ) h ON p.player_id = h.player_id
      ORDER BY p.last_name, p.first_name
    `;
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Error fetching players:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(results);
    });
  });
  
  
  // Get single tournament by ID
router.get('/tournaments/:id', (req, res) => {
    const sql = `
      SELECT t.*, 
        c1.club_name AS front_club, c1.course AS front_course,
        c2.club_name AS back_club, c2.course AS back_course
      FROM tournaments t
      LEFT JOIN courses c1 ON t.front_nine_course_id = c1.course_id
      LEFT JOIN courses c2 ON t.back_nine_course_id = c2.course_id
      WHERE t.tournament_id = ?
    `;
  
    db.query(sql, [req.params.id], (err, results) => {
      if (err) {
        console.error('❌ Error fetching tournament:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(results[0]);
    });
  });
  
 // Get full course details by course_id
router.get('/course-details/:id', (req, res) => {
    const sql = `
      SELECT 
        course_id, club_name, course,
        hole_1_par, hole_2_par, hole_3_par, hole_4_par, hole_5_par, hole_6_par, hole_7_par, hole_8_par, hole_9_par,
        hole_1_handicap, hole_2_handicap, hole_3_handicap, hole_4_handicap, hole_5_handicap, hole_6_handicap, hole_7_handicap, hole_8_handicap, hole_9_handicap
      FROM courses
      WHERE course_id = ?
    `;
  
    db.query(sql, [req.params.id], (err, results) => {
      if (err) {
        console.error('❌ Error fetching course details:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(results[0]);
    });
  });
// ✅ Adjusted Scores (totals + hole-by-hole + handicap group)
router.get('/scores/adjusted/:date', async (req, res) => {
  const date = req.params.date;

  const sql = `
    SELECT *
    FROM adjustedscores
    WHERE round_date = ?
  `;

  try {
    const [results] = await db.promise().query(sql, [date]);
    res.json(results);
  } catch (err) {
    console.error('❌ Error fetching adjusted scores:', err);
    res.status(500).json({ message: 'Database error' });
  }
});
// ✅ Totals only for adjusted scores
router.get('/scores/adjusted/totals/:date', (req, res) => {
  const date = req.params.date;

  const sql = `
    SELECT player_id, adjusted_total_score
    FROM adjustedscorestotals
    WHERE round_date = ?
  `;

  db.query(sql, [date], (err, results) => {
    if (err) {
      console.error('❌ Error fetching adjusted totals:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});
// ✅ Full hole-by-hole actual scores (with actual_total_score only if not already present)
router.get('/scores/actual/:date', async (req, res) => {
  const date = req.params.date;

  const sql = `
    SELECT 
      s.score_id,
      s.player_id,
      s.round_date,
      s.holes_played,
      s.hole_1, s.hole_2, s.hole_3, s.hole_4, s.hole_5, s.hole_6, s.hole_7, s.hole_8, s.hole_9,
      s.hole_10, s.hole_11, s.hole_12, s.hole_13, s.hole_14, s.hole_15, s.hole_16, s.hole_17, s.hole_18,
      p.first_name, 
      p.last_name, 
      CAST (h.handicap AS UNSIGNED) AS handicap_group,
      c1.club_name AS front_nine_club, 
      c1.course AS front_nine_course,
      c2.club_name AS back_nine_club, 
      c2.course AS back_nine_course,
      (
        COALESCE(s.hole_1, 0) + COALESCE(s.hole_2, 0) + COALESCE(s.hole_3, 0) +
        COALESCE(s.hole_4, 0) + COALESCE(s.hole_5, 0) + COALESCE(s.hole_6, 0) +
        COALESCE(s.hole_7, 0) + COALESCE(s.hole_8, 0) + COALESCE(s.hole_9, 0) +
        COALESCE(s.hole_10, 0) + COALESCE(s.hole_11, 0) + COALESCE(s.hole_12, 0) +
        COALESCE(s.hole_13, 0) + COALESCE(s.hole_14, 0) + COALESCE(s.hole_15, 0) +
        COALESCE(s.hole_16, 0) + COALESCE(s.hole_17, 0) + COALESCE(s.hole_18, 0)
      ) AS actual_total_score
    FROM scores s
    JOIN players p ON s.player_id = p.player_id
    LEFT JOIN custom_player_handicaps h 
      ON h.player_id = s.player_id
      AND h.effective_date = (
        SELECT MAX(effective_date)
        FROM custom_player_handicaps
        WHERE player_id = s.player_id AND effective_date <= s.round_date
      )
    LEFT JOIN courses c1 ON s.front_nine_course_id = c1.course_id
    LEFT JOIN courses c2 ON s.back_nine_course_id = c2.course_id
    WHERE s.round_date = ?
  `;

  try {
    const [results] = await db.promise().query(sql, [date]);
    res.json(results);
  } catch (err) {
    console.error('❌ Error fetching actual scores:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// ✅ Totals only for actual scores
router.get('/scores/actual/totals/:date', (req, res) => {
  const date = req.params.date;

  const sql = `
    SELECT player_id, 
      (
        COALESCE(hole_1, 0) + COALESCE(hole_2, 0) + COALESCE(hole_3, 0) +
        COALESCE(hole_4, 0) + COALESCE(hole_5, 0) + COALESCE(hole_6, 0) +
        COALESCE(hole_7, 0) + COALESCE(hole_8, 0) + COALESCE(hole_9, 0) +
        COALESCE(hole_10, 0) + COALESCE(hole_11, 0) + COALESCE(hole_12, 0) +
        COALESCE(hole_13, 0) + COALESCE(hole_14, 0) + COALESCE(hole_15, 0) +
        COALESCE(hole_16, 0) + COALESCE(hole_17, 0) + COALESCE(hole_18, 0)
      ) AS actual_total_score
    FROM scores
    WHERE round_date = ?
  `;

  db.query(sql, [date], (err, results) => {
    if (err) {
      console.error('❌ Error fetching actual totals:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});


module.exports = router;
