import React, { useEffect, useState } from 'react';
import { getFeed } from '../api.js';

const API = 'http://localhost:3000';

export default function FollowerHome() {
  const [feed, setFeed] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getFeed().then(setFeed).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1>Mi Feed</h1>
      {error && <p className="error">{error}</p>}
      {feed.length === 0 && <div className="card"><p>No hay publicaciones. ¡Dona a un creador para ver su contenido!</p></div>}
      {feed.map(post => (
        <div key={post.id} className="card">
          <div className="flex" style={{ marginBottom: 8 }}>
            {post.creator?.CreatorProfile?.profilePic && <img src={`${API}/uploads/${post.creator.CreatorProfile.profilePic}`} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />}
            <strong>{post.creator?.CreatorProfile?.displayName || post.creator?.username}</strong>
          </div>
          <p>{post.text}</p>
          {post.image && (
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <img src={`${API}/uploads/${post.image}`} alt="post" style={{ width: '100%', maxWidth: 480, height: 300, objectFit: 'cover', borderRadius: 6 }} />
            </div>
          )}
          <small>{new Date(post.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
