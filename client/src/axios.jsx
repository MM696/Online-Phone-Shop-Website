import axios from 'axios';

const API_BASE =
  import.meta.env.PROD
    ? '/api' // relative path for production (same domain)
    : 'http://localhost:5000/api'; // full URL for local dev

export default axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});
