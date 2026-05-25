import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api.js';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'follower' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Registrarse</h1>
      <form onSubmit={handleSubmit}>
        <label>Usuario</label>
        <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <label>Contraseña</label>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <label>Rol</label>
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="follower">Seguidor</option>
          <option value="creator">Creador</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button type="submit">Registrarse</button>
      </form>
      <p style={{ marginTop: 12 }}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}
