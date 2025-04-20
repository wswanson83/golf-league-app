import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Load course options
    fetch('/api/courses')
      .then(res => res.json())
      .then(setCourses);

    // Load tournament data
    fetch(`/api/tournaments`)
      .then(res => res.json())
      .then(data => {
        const t = data.find(t => t.tournament_id === parseInt(id));
        console.log('🎯 Tournament found:', t);
        setTournament(t);
      });
      
  }, [id]);

  const handleChange = (field, value) => {
    setTournament(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🟡 Submitting updated tournament...', tournament);
  
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_name: tournament.tournament_name,
          start_date: tournament.start_date,
          end_date: tournament.end_date,
          front_nine_course_id: tournament.front_nine_course_id,
          back_nine_course_id: tournament.back_nine_course_id || null,
          holes_played: String(tournament.holes_played)
        })
      });
  
      const data = await res.json();
      console.log('✅ Server response:', data);
      alert(data.message || 'Tournament updated!');
      navigate('/history');
    } catch (err) {
      console.error('❌ Error saving tournament:', err);
      alert('Something went wrong while saving.');
    }
  };
  

  if (!tournament) return <div>Loading...</div>;

  return (
    <div>
      <h2>Edit Tournament</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            value={tournament.tournament_name}
            onChange={e => handleChange('tournament_name', e.target.value)}
          />
        </label>
        <br />
        <label>
          Date:
          <input
            type="date"
            value={tournament.start_date}
            onChange={e => {
              handleChange('start_date', e.target.value);
              handleChange('end_date', e.target.value);
            }}
          />
        </label>
        <br />
        <label>
          Holes:
          <select
            value={tournament.holes_played}
            onChange={e => handleChange('holes_played', e.target.value)}
          >
            <option value="9">9</option>
            <option value="18">18</option>
          </select>
        </label>
        <br />
        <label>
          Front 9:
          <select
            value={tournament.front_nine_course_id}
            onChange={e => handleChange('front_nine_course_id', e.target.value)}
          >
            <option value="">-- Select --</option>
            {courses.map(c => (
              <option key={c.course_id} value={c.course_id}>
                {c.club_name} - {c.course}
              </option>
            ))}
          </select>
        </label>
        <br />
        {tournament.holes_played === '18' && (
          <>
            <label>
              Back 9:
              <select
                value={tournament.back_nine_course_id || ''}
                onChange={e => handleChange('back_nine_course_id', e.target.value)}
              >
                <option value="">-- Select --</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.club_name} - {c.course}
                  </option>
                ))}
              </select>
            </label>
            <br />
          </>
        )}
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditTournament;
