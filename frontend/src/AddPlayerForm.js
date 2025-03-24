import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddPlayerForm = ({ selectedPlayer }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  const [playerId, setPlayerId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (selectedPlayer) {
      setFormData({
        first_name: selectedPlayer.first_name || '',
        last_name: selectedPlayer.last_name || '',
        email: selectedPlayer.email || '',
        phone: selectedPlayer.phone_number || ''
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
          setPlayerId(response.data.playerId);
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
        <button type="submit">{playerId ? 'Save Changes' : 'Add Player'}</button>
      </form>

      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default AddPlayerForm;
