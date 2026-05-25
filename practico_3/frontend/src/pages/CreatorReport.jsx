import React, { useState } from 'react';
import { getReport } from '../api.js';

export default function CreatorReport() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await getReport(start, end);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Reporte de Ingresos</h1>
      <div className="card">
        <form onSubmit={handleSearch} className="flex">
          <div style={{ flex: 1 }}>
            <label>Fecha inicio</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <label>Fecha fin</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} required />
          </div>
          <button type="submit" style={{ alignSelf: 'flex-end', marginBottom: 12 }}>Buscar</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      {result && (
        <div className="card">
          <h2>Total: {result.total_flanes} 🍮 flanes</h2>
          <hr />
          {result.donations.length === 0 && <p>No hay donaciones en ese periodo.</p>}
          {result.donations.map(d => (
            <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <strong>{d.follower?.username}</strong> donó <span className="tag">{d.flanes} flan(es)</span>
              <br /><small>{new Date(d.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
