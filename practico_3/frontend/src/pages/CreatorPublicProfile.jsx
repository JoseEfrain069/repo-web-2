import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCreatorProfile, getCreatorPosts, donate, toggleFavorite, addComment } from '../api.js';

const API = 'http://localhost:3000';

export default function CreatorPublicProfile() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [flanes, setFlanes] = useState(1);
  const [donateMsg, setDonateMsg] = useState('');
  const [donateError, setDonateError] = useState('');
  const [hasDonated, setHasDonated] = useState(false);
  const [favMsg, setFavMsg] = useState('');
  const [commentTexts, setCommentTexts] = useState({});
  const [commentMsg, setCommentMsg] = useState('');

  useEffect(() => {
    getCreatorProfile(id).then(setCreator);
    loadPosts();
  }, [id]);

  async function loadPosts() {
    try {
      const data = await getCreatorPosts(id);
      setPosts(data);
      setHasDonated(true);
    } catch {
      setHasDonated(false);
    }
  }

  async function handleDonate(e) {
    e.preventDefault();
    setDonateMsg(''); setDonateError('');
    try {
      const res = await donate({ creator_id: Number(id), flanes: Number(flanes) });
      setDonateMsg(res.message);
      loadPosts();
    } catch (err) {
      setDonateError(err.message);
    }
  }

  async function handleFavorite() {
    const res = await toggleFavorite(id);
    setFavMsg(res.message);
    setTimeout(() => setFavMsg(''), 2000);
  }

  async function handleComment(postId) {
    const text = commentTexts[postId] || '';
    if (!text.trim()) return;
    try {
      await addComment({ post_id: postId, text });
      setCommentTexts({ ...commentTexts, [postId]: '' });
      setCommentMsg('Comentario enviado');
      setTimeout(() => setCommentMsg(''), 2000);
    } catch (err) {
      setCommentMsg(err.message);
    }
  }

  if (!creator) return <p>Cargando...</p>;

  return (
    <div>
      {creator.CreatorProfile?.banner && <img src={`${API}/uploads/${creator.CreatorProfile.banner}`} alt="banner" className="banner" />}
      <div className="card">
        <div className="flex">
          {creator.CreatorProfile?.profilePic
            ? <img src={`${API}/uploads/${creator.CreatorProfile.profilePic}`} alt="avatar" className="avatar" style={{ marginTop: 0 }} />
            : <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ddd' }} />
          }
          <div>
            <h2>{creator.CreatorProfile?.displayName || creator.username}</h2>
            <p>{creator.CreatorProfile?.bio}</p>
          </div>
          <button className="secondary" onClick={handleFavorite} style={{ marginLeft: 'auto' }}>
            ★ Favorito
          </button>
        </div>
        {favMsg && <p className="success" style={{ marginTop: 8 }}>{favMsg}</p>}

        {creator.CreatorProfile?.goalTitle && (
          <div style={{ marginTop: 16, background: '#fff8f0', padding: 12, borderRadius: 6, borderLeft: '4px solid #8B4513' }}>
            <strong>Meta:</strong> {creator.CreatorProfile.goalTitle}
            {creator.CreatorProfile.goalDescription && <p style={{ marginTop: 4 }}>{creator.CreatorProfile.goalDescription}</p>}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <h3>Apoya a este creador 🍮</h3>
          <form onSubmit={handleDonate} className="flex">
            <input type="number" min={1} max={100} value={flanes} onChange={e => setFlanes(e.target.value)} style={{ width: 80, margin: 0 }} />
            <span>flan(es) × Bs. 10 = <strong>Bs. {flanes * 10}</strong></span>
            <button type="submit">Donar</button>
          </form>
          {donateMsg && <p className="success">{donateMsg}</p>}
          {donateError && <p className="error">{donateError}</p>}
        </div>
      </div>

      {!hasDonated && (
        <div className="card" style={{ textAlign: 'center', color: '#888' }}>
          <p>Dona para ver las publicaciones de este creador</p>
        </div>
      )}

      {hasDonated && posts.map(post => (
        <div key={post.id} className="card">
          <p>{post.text}</p>
          {post.image && (
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <img src={`${API}/uploads/${post.image}`} alt="post" style={{ width: '100%', maxWidth: 480, height: 300, objectFit: 'cover', borderRadius: 6 }} />
            </div>
          )}
          <small>{new Date(post.createdAt).toLocaleString()}</small>
          <hr />
          <div className="flex" style={{ marginTop: 8 }}>
            <input
              placeholder="Deja un comentario..."
              value={commentTexts[post.id] || ''}
              onChange={e => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })}
              style={{ margin: 0 }}
            />
            <button onClick={() => handleComment(post.id)}>Comentar</button>
          </div>
          {commentMsg && <p className="success">{commentMsg}</p>}
        </div>
      ))}
    </div>
  );
}
