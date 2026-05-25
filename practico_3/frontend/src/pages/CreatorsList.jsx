import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCreators, searchCreators } from '../api.js';

const API = 'http://localhost:3000';

export default function CreatorsList() {
  const [creators, setCreators] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => { getCreators().then(setCreators); }, []);

  async function handleSearch(e) {
    e.preventDefault();
    const results = await searchCreators(query);
    setCreators(results);
  }

  async function resetSearch() {
    setQuery('');
    const data = await getCreators();
    setCreators(data);
  }

  return (
    <div>
      <h1>Creadores</h1>
      <div className="card">
        <form onSubmit={handleSearch} className="flex">
          <input placeholder="Buscar creador..." value={query} onChange={e => setQuery(e.target.value)} style={{ margin: 0 }} />
          <button type="submit">Buscar</button>
          <button type="button" className="secondary" onClick={resetSearch}>Ver todos</button>
        </form>
      </div>
      <div className="grid">
        {creators.map(c => (
          <Link to={`/creators/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
              {c.CreatorProfile?.profilePic
                ? <img src={`${API}/uploads/${c.CreatorProfile.profilePic}`} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ddd', margin: '0 auto' }} />
              }
              <p style={{ marginTop: 8, fontWeight: 'bold' }}>{c.CreatorProfile?.displayName || c.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
