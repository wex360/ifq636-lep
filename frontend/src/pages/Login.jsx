import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { apiError } from '../apiError';

const Login = () => {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const registered = useLocation().state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/profile');
    } catch (error) {
      setError(apiError(error, 'Login failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        {registered && <p role="status" className="mb-4 p-2 bg-green-100 text-green-700 rounded">Account created. Please log in.</p>}
        {error && <p role="alert" className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" disabled={busy} className="disabled:opacity-50 w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
