import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PlayersList = ({ onPlayerSelect }) => {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/players')
      .then(response => {
        setPlayers(response.data);
      })
      .catch(error => {
        console.error('Error fetching players:', error);
      });
  }, []);

  const filteredPlayers = players.filter(player =>
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Player Lookup</h2>

      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          padding: '0.5rem',
          marginBottom: '1rem',
          width: '100%',
          maxWidth: '300px'
        }}
      />

      {searchTerm ? (
  filteredPlayers.length > 0 ? (
    <>
      <p style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>
        Click a player to update their info below.
      </p>
      {filteredPlayers.map(player => (
        <div
          key={player.player_id}
          onClick={() => onPlayerSelect(player)}
          style={{
            padding: '0.5rem 0',
            borderBottom: '1px solid #ccc',
            textAlign: 'left',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9'
          }}
        >
          <strong>{player.first_name} {player.last_name}</strong><br />
          {player.email} {player.phone_number && `(${player.phone_number})`}
        </div>
      ))}
    </>
  ) : (
    <p>No matching players found.</p>
  )
) : null}

    </div>
  );
};

export default PlayersList;
