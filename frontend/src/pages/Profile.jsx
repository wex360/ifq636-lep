import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { apiError } from '../apiError';

const toList = (text) => text.split(',').map((l) => l.trim()).filter(Boolean);

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', university: '', address: '', nativeLanguages: '', learningLanguages: '', bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: data.name,
          email: data.email,
          university: data.university || '',
          address: data.address || '',
          nativeLanguages: (data.nativeLanguages || []).join(', '),
          learningLanguages: (data.learningLanguages || []).join(', '),
          bio: data.bio || '',
        });
      } catch (err) {
        setError(apiError(err, 'Could not load your profile.'));
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setLoading(true);
    try {
      await axiosInstance.put('/api/auth/profile', {
        ...formData,
        nativeLanguages: toList(formData.nativeLanguages),
        learningLanguages: toList(formData.learningLanguages),
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setSaved(true);
    } catch (err) {
      setError(apiError(err, 'Could not save your profile.'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center mt-20">Please log in.</div>;

  const field = (key, placeholder, hint) => (
    <label className="block mb-4">
      <span className="text-sm font-medium">{placeholder}</span>
      <input
        type={key === 'email' ? 'email' : 'text'}
        value={formData[key]}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        className="w-full p-2 border rounded"
      />
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>
        {error && <p role="alert" className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</p>}
        {saved && <p role="status" className="mb-4 p-2 bg-green-100 text-green-700 rounded">Profile saved.</p>}
        {field('name', 'Name')}
        {field('email', 'Email')}
        {field('nativeLanguages', 'Languages I speak', 'Comma separated, up to 5, e.g. English, Spanish')}
        {field('learningLanguages', 'Languages I am learning', 'Comma separated, up to 5')}
        <label className="block mb-4">
          <span className="text-sm font-medium">About me</span>
          <textarea
            value={formData.bio}
            maxLength={280}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <span className="text-xs text-gray-500">{formData.bio.length}/280</span>
        </label>
        {field('university', 'University')}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50">
          {loading ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
