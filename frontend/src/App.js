import React, { useState } from 'react';
import AddPlayerForm from './AddPlayerForm';
import PlayersList from './PlayersList';

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <header style={{ marginBottom: '2rem' }}>
        <img src="/logo.png" alt="League Logo" style={{ width: '100px', marginBottom: '0.5rem' }} />
        <h1 style={{ margin: 0 }}>Klein Creek Tuesday League</h1>
      </header>

      <PlayersList onPlayerSelect={setSelectedPlayer} />
      <AddPlayerForm selectedPlayer={selectedPlayer} />
    </div>
  );
}

export default App;
