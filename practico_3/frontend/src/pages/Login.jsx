import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await login(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', data.id);
      navigate(data.role === 'creator' ? '/creator' : '/feed');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <label>Contraseña</label>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
      <p style={{ marginTop: 12 }}>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  );
}
