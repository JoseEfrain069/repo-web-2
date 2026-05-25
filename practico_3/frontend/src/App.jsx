import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import CreatorDashboard from './pages/CreatorDashboard.jsx';
import CreatorProfile from './pages/CreatorProfile.jsx';
import CreatorReport from './pages/CreatorReport.jsx';
import FollowerHome from './pages/FollowerHome.jsx';
import CreatorsList from './pages/CreatorsList.jsx';
import CreatorPublicProfile from './pages/CreatorPublicProfile.jsx';
import Favorites from './pages/Favorites.jsx';
import DonationHistory from './pages/DonationHistory.jsx';

function Nav() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  function logout() {
    localStorage.clear();
    navigate('/login');
  }

  if (!role) return (
    <nav>
      <span style={{ fontWeight: 'bold', fontSize: 20 }}>🍮 OnlyFlans</span>
      <Link to="/login">Iniciar sesión</Link>
      <Link to="/register">Registrarse</Link>
    </nav>
  );

  return (
    <nav>
      <span style={{ fontWeight: 'bold', fontSize: 20 }}>🍮 OnlyFlans</span>
      {role === 'creator' && <>
        <Link to="/creator">Mis posts</Link>
        <Link to="/creator/profile">Mi perfil</Link>
        <Link to="/creator/report">Reporte</Link>
      </>}
      {role === 'follower' && <>
        <Link to="/feed">Feed</Link>
        <Link to="/creators">Creadores</Link>
        <Link to="/favorites">Favoritos</Link>
        <Link to="/donations">Mis donaciones</Link>
      </>}
      <span style={{ marginLeft: 'auto' }}>Hola, {username}</span>
      <button onClick={logout} className="secondary" style={{ padding: '6px 12px' }}>Salir</button>
    </nav>
  );
}

function PrivateRoute({ children, role }) {
  const userRole = localStorage.getItem('role');
  if (!userRole) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to={localStorage.getItem('role') === 'creator' ? '/creator' : '/feed'} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas de creador */}
          <Route path="/creator" element={<PrivateRoute role="creator"><CreatorDashboard /></PrivateRoute>} />
          <Route path="/creator/profile" element={<PrivateRoute role="creator"><CreatorProfile /></PrivateRoute>} />
          <Route path="/creator/report" element={<PrivateRoute role="creator"><CreatorReport /></PrivateRoute>} />

          {/* Rutas de seguidor */}
          <Route path="/feed" element={<PrivateRoute role="follower"><FollowerHome /></PrivateRoute>} />
          <Route path="/creators" element={<PrivateRoute role="follower"><CreatorsList /></PrivateRoute>} />
          <Route path="/creators/:id" element={<PrivateRoute role="follower"><CreatorPublicProfile /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute role="follower"><Favorites /></PrivateRoute>} />
          <Route path="/donations" element={<PrivateRoute role="follower"><DonationHistory /></PrivateRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
