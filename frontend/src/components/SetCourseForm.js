import React, { useState, useEffect } from 'react';

const SetCourseForm = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [roundDate, setRoundDate] = useState('');

  useEffect(() => {
    fetch('/api/courses') // assumes you have GET /api/courses route
      .then(res => res.json())
      .then(data => setCourses(data));

    // Set next Tuesday by default
    const today = new Date();
    const tuesday = new Date(today.setDate(today.getDate() + ((2 - today.getDay() + 7) % 7)));
    setRoundDate(tuesday.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        front_nine_course_id: selectedCourse,
        back_nine_course_id: null, // we’re only using 9 holes
        start_date: roundDate,
        end_date: roundDate,
        tournament_name: 'Weekly 9-Hole Round',
        holes_played: 9
      })
    });

    const data = await res.json();
    alert(data.message || 'Tournament saved!');
  };

  return (
    <div>
      <h2>Set Course for 9-Hole Round</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Course:
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required>
            <option value="">-- Select --</option>
            {courses.map(c => (
              <option key={c.course_id} value={c.course_id}>
                {c.club_name} - {c.course}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Round Date:
          <input type="date" value={roundDate} onChange={e => setRoundDate(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Save Round</button>
      </form>
    </div>
  );
};

export default SetCourseForm;
