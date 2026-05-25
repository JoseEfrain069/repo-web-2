import React, { useEffect, useState } from 'react';
import { getMyPosts, createPost } from '../api.js';

const API = 'http://localhost:3000';

export default function CreatorDashboard() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function loadPosts() {
    try {
      const data = await getMyPosts();
      setPosts(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { loadPosts(); }, []);

  async function handlePost(e) {
    e.preventDefault();
    setMsg(''); setError('');
    const formData = new FormData();
    formData.append('text', text);
    if (image) formData.append('image', image);
    try {
      await createPost(formData);
      setText(''); setImage(null);
      setMsg('Post publicado');
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Mis Publicaciones</h1>
      <div className="card">
        <h2>Nuevo Post</h2>
        <form onSubmit={handlePost}>
          <textarea rows={3} placeholder="Escribe algo..." value={text} onChange={e => setText(e.target.value)} required />
          <label>Imagen (opcional)</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} style={{ border: 'none', padding: 0 }} />
          {msg && <p className="success">{msg}</p>}
          {error && <p className="error">{error}</p>}
          <button type="submit">Publicar</button>
        </form>
      </div>

      {posts.map(post => (
        <div key={post.id} className="card">
          <p>{post.text}</p>
          {post.image && (
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <img src={`${API}/uploads/${post.image}`} alt="post" style={{ width: '100%', maxWidth: 480, height: 300, objectFit: 'cover', borderRadius: 6 }} />
            </div>
          )}
          <small>{new Date(post.createdAt).toLocaleString()}</small>
          <hr />
          <h3>Comentarios ({post.Comments.length})</h3>
          {post.Comments.length === 0 && <small>Sin comentarios aún</small>}
          {post.Comments.map(c => (
            <div key={c.id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              <strong>{c.follower.username}:</strong> {c.text}
              <br /><small>{new Date(c.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
