const BASE = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers(isFormData = false) {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (!isFormData) h['Content-Type'] = 'application/json';
  return h;
}

export async function request(method, path, body = null, isFormData = false) {
  const options = { method, headers: headers(isFormData) };
  if (body) options.body = isFormData ? body : JSON.stringify(body);
  const res = await fetch(BASE + path, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

// Auth
export const register = (body) => request('POST', '/auth/register', body);
export const login = (body) => request('POST', '/auth/login', body);

// Creators (public)
export const getCreators = () => request('GET', '/creators');
export const getCreatorProfile = (id) => request('GET', `/creators/${id}`);

// Creator (authenticated)
export const saveProfile = (formData) => request('POST', '/creators/profile', formData, true);
export const getMyPosts = () => request('GET', '/creators/me/posts');
export const createPost = (formData) => request('POST', '/creators/posts', formData, true);
export const getReport = (start, end) => request('GET', `/creators/me/report?start=${start}&end=${end}`);

// Follower
export const searchCreators = (q) => request('GET', `/followers/search?q=${q}`);
export const donate = (body) => request('POST', '/followers/donate', body);
export const getCreatorPosts = (id) => request('GET', `/followers/creator/${id}/posts`);
export const addComment = (body) => request('POST', '/followers/comments', body);
export const toggleFavorite = (creatorId) => request('POST', `/followers/favorites/${creatorId}`);
export const getFavorites = () => request('GET', '/followers/favorites');
export const getFeed = () => request('GET', '/followers/feed');
export const getDonationHistory = (params) => {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/followers/donations?${q}`);
};
