import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites } from '../api.js';

const API = 'http://localhost:3000';

export default function Favorites() {
  const [favs, setFavs] = useState([]);

  useEffect(() => { getFavorites().then(setFavs); }, []);

  return (
    <div>
      <h1>Creadores Favoritos</h1>
      {favs.length === 0 && <div className="card"><p>No tienes favoritos aún. ¡Entra al perfil de un creador y márcalo como favorito!</p></div>}
      <div className="grid">
        {favs.map(fav => (
          <Link to={`/creators/${fav.creatorUser?.id}`} key={fav.creatorId} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
              {fav.creatorUser?.CreatorProfile?.profilePic
                ? <img src={`${API}/uploads/${fav.creatorUser.CreatorProfile.profilePic}`} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ddd', margin: '0 auto' }} />
              }
              <p style={{ marginTop: 8, fontWeight: 'bold' }}>{fav.creatorUser?.CreatorProfile?.displayName || fav.creatorUser?.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
