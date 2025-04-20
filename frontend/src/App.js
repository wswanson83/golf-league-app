import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import SetCourseForm from './components/SetCourseForm';
import TournamentHistory from './components/TournamentHistory';
import EditTournament from './components/EditTournament';
import ScoreEntryForm from './components/ScoreEntryForm';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/set-course" element={<SetCourseForm />} /> {/* ✅ NEW */}
        <Route path="/history" element={<TournamentHistory />} />
        <Route path="/edit/:id" element={<EditTournament />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/score-entry" element={<ScoreEntryForm />} />
      </Routes>
    </Router>
  );
}

export default App;
