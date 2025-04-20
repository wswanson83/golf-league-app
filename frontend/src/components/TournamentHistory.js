import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // ✅ import Link from react-router-dom

const TournamentHistory = () => {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => {
        console.log('🎯 API tournaments:', data);
        setTournaments(data);
      });
  }, []);
  

  return (
    <div>
      <h2>Tournament History</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Date</th>
            <th>Course(s)</th>
            <th>Holes</th>
            <th>Tournament Name</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map(t => (
            <tr key={t.tournament_id}>
              <td>{new Date(t.start_date).toLocaleDateString()}</td>
              <td>
                {t.front_club} - {t.front_course}
                {t.holes_played === '18' && t.back_club
                  ? ` / ${t.back_club} - ${t.back_course}`
                  : ''}
              </td>
              <td>{t.holes_played}</td>
              <td>{t.tournament_name}</td>
              <td>
                <Link to={`/edit/${t.tournament_id}`}>
                  <button>Edit</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TournamentHistory;
