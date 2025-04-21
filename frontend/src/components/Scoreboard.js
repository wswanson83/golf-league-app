import React, { useEffect, useState } from 'react';

const Scoreboard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [holeScores, setHoleScores] = useState([]);
  const [totalScores, setTotalScores] = useState([]);
  const [showAdjusted, setShowAdjusted] = useState(true);
  const [roundInfo, setRoundInfo] = useState(null);

  // Fetch tournament list
  useEffect(() => {
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => setTournaments(data))
      .catch(err => console.error('❌ Error loading tournaments:', err));
  }, []);

  // Fetch scores for selected date
  useEffect(() => {
    if (!selectedDate) return;

    const type = showAdjusted ? 'adjusted' : 'actual';
    const formattedDate = selectedDate.split('T')[0]; // ✅ Fix for MySQL DATE format

    const fetchScores = async () => {
      try {
        console.log(`📡 Fetching hole scores from /api/scores/${type}/${formattedDate}`);
        const holeRes = await fetch(`/api/scores/${type}/${formattedDate}`);
        const holeData = await holeRes.json();
        setHoleScores(holeData);
        console.log('🎯 Hole scores:', holeData);

        if (holeData.length > 0) {
          const sample = holeData[0];
          const courseLabel = sample.back_nine_course
            ? `${sample.front_nine_club} - ${sample.front_nine_course} / ${sample.back_nine_club} - ${sample.back_nine_course}`
            : `${sample.front_nine_club} - ${sample.front_nine_course}`;
          setRoundInfo({
            date: sample.round_date,
            course: courseLabel
          });
        } else {
          setRoundInfo(null);
        }

        console.log(`📡 Fetching totals from /api/scores/${type}/totals/${formattedDate}`);
        const totalRes = await fetch(`/api/scores/${type}/totals/${formattedDate}`);
        const totalData = await totalRes.json();
        setTotalScores(totalData);
        console.log('🎯 Totals:', totalData);
      } catch (err) {
        console.error('❌ Error loading scores:', err);
      }
    };

    fetchScores();
  }, [selectedDate, showAdjusted]);

  // Merge scores with totals
  const mergedScores = Array.isArray(holeScores)
    ? holeScores.map(player => {
        const total = totalScores.find(p => p.player_id === player.player_id);
        return {
          ...player,
          total: showAdjusted
            ? total?.adjusted_total_score ?? player.adjusted_total_score
            : total?.actual_total_score ?? player.actual_total_score
        };
      }).sort((a, b) => a.total - b.total)
    : [];

  const holeCount = mergedScores[0]?.holes_played === '18' ? 18 : 9;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Scoreboard</h2>

      <label>Select Tournament Date: </label>
      <select
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      >
        <option value="">-- Select --</option>
        {tournaments.map(t => (
          <option key={t.tournament_id} value={t.start_date}>
            {new Date(t.start_date).toLocaleDateString()} – {t.tournament_name}
          </option>
        ))}
      </select>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => setShowAdjusted(prev => !prev)}>
          Show {showAdjusted ? 'Actual' : 'Adjusted'} Scores
        </button>
      </div>

      {roundInfo && (
        <div style={{ marginTop: '1rem' }}>
          <h3>{roundInfo.course}</h3>
          <p><strong>Date:</strong> {new Date(roundInfo.date).toLocaleDateString()}</p>
        </div>
      )}

      {mergedScores.length > 0 && (
        <table border="1" cellPadding="6" style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>
          <thead>
            <tr>
              <th>Player</th>
              <th>Group</th>
              {[...Array(holeCount)].map((_, i) => (
                <th key={i}>H{i + 1}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {mergedScores.map(player => (
              <tr key={player.player_id}>
                <td>{player.first_name} {player.last_name}</td>
                <td>{player.handicap_group ?? '–'}</td>
                {[...Array(holeCount)].map((_, i) => (
                  <td key={i}>
                    {showAdjusted
                      ? player[`adjusted_hole_${i + 1}`]
                      : player[`hole_${i + 1}`]
                    }
                  </td>
                ))}
                <td><strong>{player.total}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Scoreboard;
