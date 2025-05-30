import axios from 'axios';

const API_BASE =
  import.meta.env.PROD
    ? '' // In production, use relative URLs (same domain)
    : 'http://localhost:5000'; // Local dev

export default axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});
