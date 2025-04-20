const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

exports.login = (req, res) => {
  const { email, password } = req.body;

  const query = `
    SELECT u.player_id, u.password_hash, a.role
    FROM userlogins u
    JOIN players p ON u.player_id = p.player_id
    LEFT JOIN admins a ON u.player_id = a.player_id
    WHERE p.email = ?
  `;

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ FIXED — extract the values from the result row
    const player_id = user.player_id;
    const role = user.role;

    const token = jwt.sign({ player_id, role }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token, role });
  });
};
