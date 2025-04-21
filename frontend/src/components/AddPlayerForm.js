import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddPlayerForm = ({ selectedPlayer }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    handicap: ''
  });
 

  const [playerId, setPlayerId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (selectedPlayer) {
      setFormData({
        first_name: selectedPlayer.first_name || '',
        last_name: selectedPlayer.last_name || '',
        email: selectedPlayer.email || '',
        phone: selectedPlayer.phone_number || '',
        handicap: selectedPlayer.handicap || ''
      });
   
      setPlayerId(selectedPlayer.player_id);
      setSuccessMessage('');
    }
  }, [selectedPlayer]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = playerId
      ? `http://localhost:5000/players/${playerId}`
      : 'http://localhost:5000/players';
    const method = playerId ? 'put' : 'post';

    axios[method](url, formData)
      .then(response => {
        setSuccessMessage(playerId ? 'Player info updated!' : 'Player added successfully!');
        if (!playerId) {
          const newId = response.data.playerId;
          setPlayerId(newId);

        }
        
      })
      .catch(error => {
        console.error('Error saving player:', error);
        setSuccessMessage('There was an error saving your info.');
      });
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>{playerId ? 'Edit Player Info' : 'Add New Player'}</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <input
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <select
  name="handicap"
  value={formData.handicap}
  onChange={handleChange}
  required
>
  <option value="">H'Cap Group Selection *</option>
  <option value="0">0: 3 Over Par (or Better)</option>
  <option value="1">1: 4 to 6 Over Par</option>
  <option value="2">2: 7 to 9 Over Par</option>
  <option value="3">3: 10 to 13 Over Par</option>
  <option value="4">4: 14 to 17 Over Par</option>
  <option value="5">5: 18+ Over Par</option>
</select>
<p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
  *Group is subject to change in the future.
</p>

        <button type="submit">{playerId ? 'Save Changes' : 'Add Player'}</button>
      </form>

      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default AddPlayerForm;
