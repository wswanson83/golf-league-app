import React, { useEffect, useState } from 'react';

const ScoreEntryForm = () => {
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [tournamentDetails, setTournamentDetails] = useState(null);
  const [frontNineDetails, setFrontNineDetails] = useState(null);
  const [backNineDetails, setBackNineDetails] = useState(null);
  const [scores, setScores] = useState({});

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(setPlayers);

    fetch('/api/tournaments')
      .then(res => res.json())
      .then(setTournaments);
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      fetch(`/api/tournaments/${selectedTournamentId}`)
        .then(res => res.json())
        .then(data => {
          setTournamentDetails(data);
          if (data.front_nine_course_id) {
            fetch(`/api/course-details/${data.front_nine_course_id}`)
              .then(res => res.json())
              .then(setFrontNineDetails);
          }
          if (data.back_nine_course_id) {
            fetch(`/api/course-details/${data.back_nine_course_id}`)
              .then(res => res.json())
              .then(setBackNineDetails);
          }
        });
    }
  }, [selectedTournamentId]);

  const handleScoreChange = (holeNum, value) => {
    setScores({ ...scores, [holeNum]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const holeCount = parseInt(tournamentDetails.holes_played);
    const orderedScores = Array.from({ length: holeCount }, (_, i) => parseInt(scores[`hole_${i + 1}`]) || 0);
    const total = orderedScores.reduce((sum, s) => sum + s, 0);

    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_id: selectedPlayer,
        tournament_id: selectedTournamentId,
        scores: orderedScores,
        total_score: total
      })
    });

    const result = await response.json();
    alert(result.message);
  };

  const renderHoleInputs = (details, offset = 0) => {
    if (!details) return null;

    return Array.from({ length: 9 }, (_, i) => {
      const holeNum = offset + i + 1;
      return (
        <div key={holeNum} style={{ marginBottom: '10px' }}>
          <label>
            Hole {holeNum} (Par: {details[`hole_${i + 1}_par`]}, HDCP: {details[`hole_${i + 1}_handicap`]}):
            <input
              type="number"
              min="1"
              onChange={(e) => handleScoreChange(`hole_${holeNum}`, e.target.value)}
              value={scores[`hole_${holeNum}`] || ''}
              required
            />
          </label>
        </div>
      );
    });
  };

  // ✅ Assemble hole data for totals
  const holeData = [];

  if (frontNineDetails) {
    for (let i = 1; i <= 9; i++) {
      holeData.push({
        par: frontNineDetails[`hole_${i}_par`],
        handicap: frontNineDetails[`hole_${i}_handicap`]
      });
    }
  }

  if (tournamentDetails?.holes_played === '18' && backNineDetails) {
    for (let i = 1; i <= 9; i++) {
      holeData.push({
        par: backNineDetails[`hole_${i}_par`],
        handicap: backNineDetails[`hole_${i}_handicap`]
      });
    }
  }

  return (
    <div>
      <h2>Enter Scores</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Player:</label>
          <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} required>
            <option value="">--Select Player--</option>
            {players.map(p => (
              <option key={p.player_id} value={p.player_id}>
                {p.last_name}, {p.first_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Tournament Date:</label>
          <select value={selectedTournamentId} onChange={e => setSelectedTournamentId(e.target.value)} required>
            <option value="">--Select Tournament--</option>
            {tournaments.map(t => (
              <option key={t.tournament_id} value={t.tournament_id}>
                {new Date(t.start_date).toLocaleDateString()} – {t.tournament_name}
              </option>
            ))}
          </select>
        </div>

        {tournamentDetails && (
          <div style={{ marginTop: '20px' }}>
            <p><strong>Tournament:</strong> {tournamentDetails.tournament_name}</p>
            <p><strong>Course(s):</strong> {tournamentDetails.front_club} - {tournamentDetails.front_course}
              {tournamentDetails.holes_played === '18' && tournamentDetails.back_club ? ` / ${tournamentDetails.back_club} - ${tournamentDetails.back_course}` : ''}
            </p>
            <p><strong>Holes:</strong> {tournamentDetails.holes_played}</p>

            {renderHoleInputs(frontNineDetails)}
            {tournamentDetails.holes_played === '18' && renderHoleInputs(backNineDetails, 9)}
          </div>
        )}

        {/* ✅ Totals */}
        {holeData.length > 0 && (
          <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
            <p>Total Par: {holeData.reduce((sum, h) => sum + h.par, 0)}</p>
            <p>Your Total Score: {Object.values(scores).reduce((sum, val) => sum + (parseInt(val) || 0), 0)}</p>
          </div>
        )}

        <button type="submit">Submit Scores</button>
      </form>
    </div>
  );
};

export default ScoreEntryForm;
