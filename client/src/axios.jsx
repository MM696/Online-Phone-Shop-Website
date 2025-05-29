import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default axios.create({
  baseURL: API_BASE,
  withCredentials: true, // optional
});
