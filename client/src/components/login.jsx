// src/components/Login.jsx
import React, { useState } from 'react';
import axios from '../axios';

const Login = ({ onClose, setUser }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://phone-shopping-app.onrender.com/login', form);
      if (res.status === 200) {
        alert('Login successful!');
        setUser(res.data.user);
        onClose();
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="w-full relative">
      {/* Close (X) button top-right */}
      <button
        onClick={onClose}
        className="absolute top-0 right-0 mt-2 mr-2 text-2xl font-bold text-gray-600 hover:text-gray-900"
        aria-label="Close"
        type="button"
      >
        ×
      </button>

      <h2 className="text-2xl font-semibold mb-4 text-center">Log In</h2>
      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;
