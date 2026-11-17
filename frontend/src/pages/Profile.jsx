import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { apiError } from '../apiError';

const Profile = () => {
  const { user } = useAuth(); // Access user token from context
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
    nativeLanguages: '',
    learningLanguages: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch profile data from the backend
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: response.data.name,
          email: response.data.email,
          university: response.data.university || '',
          address: response.data.address || '',
          nativeLanguages: (response.data.nativeLanguages || []).join(', '),
          learningLanguages: (response.data.learningLanguages || []).join(', '),
          bio: response.data.bio || '',
        });
      } catch (error) {
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // languages are typed as a comma separated list
      const toList = (text) => text.split(',').map((l) => l.trim()).filter((l) => l);
      await axiosInstance.put('/api/auth/profile', {
        ...formData,
        nativeLanguages: toList(formData.nativeLanguages),
        learningLanguages: toList(formData.learningLanguages),
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert(apiError(error, 'Failed to update profile. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="University"
          value={formData.university}
          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Languages I speak (e.g. English, Spanish)"
          value={formData.nativeLanguages}
          onChange={(e) => setFormData({ ...formData, nativeLanguages: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Languages I'm learning"
          value={formData.learningLanguages}
          onChange={(e) => setFormData({ ...formData, learningLanguages: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
