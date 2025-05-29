// src/components/Signup.jsx
import React, { useState } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';

const SignUp = ({ onClose, switchToLogin }) => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://online-phone-shop-website.onrender.com/api/register', form);
      if (res.status === 201) {
        alert('Registration successful! Please log in.');
        switchToLogin(); // Switch to login modal
      } else {
        throw new Error('Unexpected response');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
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

      <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
          className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Register
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
