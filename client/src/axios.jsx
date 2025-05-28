// src/axios.js
import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: false, // set to true if using cookies/sessions
});
