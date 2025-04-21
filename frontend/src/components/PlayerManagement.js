import React, { useState } from 'react';
import PlayersList from './PlayersList';
import AddPlayerForm from './AddPlayerForm';

const PlayerManagement = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column', // stack by default (mobile)
        gap: '2rem',
      }}
    >
      <div style={{ width: '100%' }}>
        <PlayersList onPlayerSelect={setSelectedPlayer} />
      </div>
      {selectedPlayer && (
        <div style={{ width: '100%' }}>
          <AddPlayerForm selectedPlayer={selectedPlayer} />
        </div>
      )}
    </div>
  );
};

export default PlayerManagement;
