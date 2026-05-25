import React, { useEffect, useState } from 'react';
import { getCreatorProfile, saveProfile } from '../api.js';

const API = 'http://localhost:3000';

export default function CreatorProfile() {
  const userId = localStorage.getItem('userId');
  const [form, setForm] = useState({ displayName: '', bio: '', goalTitle: '', goalDescription: '' });
  const [profilePic, setProfilePic] = useState(null);
  const [banner, setBanner] = useState(null);
  const [existing, setExisting] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getCreatorProfile(userId).then(data => {
      setExisting(data);
      const cp = data.CreatorProfile;
      setForm({
        displayName: cp?.displayName || '',
        bio: cp?.bio || '',
        goalTitle: cp?.goalTitle || '',
        goalDescription: cp?.goalDescription || '',
      });
    }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(''); setError('');
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (profilePic) formData.append('profile_pic', profilePic);
    if (banner) formData.append('banner', banner);
    try {
      await saveProfile(formData);
      setMsg('Perfil guardado');
      getCreatorProfile(userId).then(setExisting);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Mi Perfil</h1>
      {existing?.CreatorProfile?.banner && (
        <img src={`${API}/uploads/${existing.CreatorProfile.banner}`} alt="banner" className="banner" />
      )}
      <div className="card">
        {existing?.CreatorProfile?.profilePic && (
          <img src={`${API}/uploads/${existing.CreatorProfile.profilePic}`} alt="avatar" className="avatar" />
        )}
        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <label>Nombre público</label>
          <input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required />
          <label>Biografía</label>
          <textarea rows={2} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          <label>Foto de perfil</label>
          <input type="file" accept="image/*" onChange={e => setProfilePic(e.target.files[0])} style={{ border: 'none', padding: 0 }} />
          <label>Banner</label>
          <input type="file" accept="image/*" onChange={e => setBanner(e.target.files[0])} style={{ border: 'none', padding: 0 }} />
          <h3 style={{ marginTop: 16 }}>Meta de apoyo</h3>
          <label>Título de la meta</label>
          <input value={form.goalTitle} onChange={e => setForm({ ...form, goalTitle: e.target.value })} placeholder="Ej: Ayúdame a crear más contenido" />
          <label>Descripción de la meta</label>
          <textarea rows={2} value={form.goalDescription} onChange={e => setForm({ ...form, goalDescription: e.target.value })} />
          {msg && <p className="success">{msg}</p>}
          {error && <p className="error">{error}</p>}
          <button type="submit">Guardar perfil</button>
        </form>
      </div>
    </div>
  );
}
