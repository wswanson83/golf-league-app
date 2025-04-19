import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const fakeLogin = () => {
    const fakeAdmin = {
      player_id: 1,
      role: 'commissioner'
    };
    localStorage.setItem('user', JSON.stringify(fakeAdmin));
    setUser(fakeAdmin);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user || (user.role !== 'commissioner' && user.role !== 'moderator')) {
    return (
      <div>
        <h2>Access denied. This page is for admins only.</h2>
        <button onClick={fakeLogin}>Log in as fake admin</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>This is your admin-only screen.</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

export default AdminDashboard;
