import React, { useState } from 'react';
import { getDonationHistory } from '../api.js';

export default function DonationHistory() {
  const [filters, setFilters] = useState({ start: '', end: '', creator_name: '' });
  const [donations, setDonations] = useState(null);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    try {
      const params = {};
      if (filters.start) params.start = filters.start;
      if (filters.end) params.end = filters.end;
      if (filters.creator_name) params.creator_name = filters.creator_name;
      const data = await getDonationHistory(params);
      setDonations(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Historial de Donaciones</h1>
      <div className="card">
        <form onSubmit={handleSearch}>
          <div className="flex">
            <div style={{ flex: 1 }}>
              <label>Fecha inicio</label>
              <input type="date" value={filters.start} onChange={e => setFilters({ ...filters, start: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Fecha fin</label>
              <input type="date" value={filters.end} onChange={e => setFilters({ ...filters, end: e.target.value })} />
            </div>
          </div>
          <label>Nombre de creador</label>
          <input placeholder="Filtrar por nombre de creador..." value={filters.creator_name} onChange={e => setFilters({ ...filters, creator_name: e.target.value })} />
          {error && <p className="error">{error}</p>}
          <button type="submit">Buscar</button>
        </form>
      </div>

      {donations !== null && (
        <div className="card">
          <h2>Resultados ({donations.length})</h2>
          <hr />
          {donations.length === 0 && <p>No hay donaciones con esos filtros.</p>}
          {donations.map(d => (
            <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <strong>{d.creatorUser?.CreatorProfile?.displayName || d.creatorUser?.username}</strong>
              {' '}&rarr; <span className="tag">{d.flanes} flan(es)</span>
              {' '}(Bs. {d.flanes * 10})
              <br /><small>{new Date(d.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
