import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { apiError } from '../apiError';
import { Loading, ErrorBox, Empty } from '../components/Status';

// LEP-13: moderator hides or restores a profile. The API enforces the role; this page only hides the link.
const Moderation = () => {
  const { user } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${user?.token}` } };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (user?.role !== 'moderator') return;
    axiosInstance.get('/api/moderation/users', auth)
      .then((r) => setUsers(r.data))
      .catch((err) => setError(apiError(err, 'Could not load profiles.')))
      .finally(() => setLoading(false));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (u) => {
    setBusy(u._id);
    setError('');
    try {
      const { data } = await axiosInstance.patch(`/api/moderation/users/${u._id}`, { hidden: !u.hidden }, auth);
      setUsers(users.map((x) => (x._id === u._id ? { ...x, hidden: data.hidden } : x)));
    } catch (err) {
      setError(apiError(err, 'Could not update the profile.'));
    } finally {
      setBusy(null);
    }
  };

  if (!user) return <div className="text-center mt-20">Please log in.</div>;
  if (user.role !== 'moderator') return <div className="text-center mt-20">Moderators only.</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Moderation</h1>
      <ErrorBox message={error} />
      {loading ? <Loading /> : users.length === 0 ? <Empty>No profiles to review.</Empty> : users.map((u) => (
        <div key={u._id} className={`p-4 mb-3 rounded shadow flex justify-between items-center ${u.hidden ? 'bg-gray-100' : 'bg-white'}`}>
          <div>
            <p className="font-bold">{u.name} {u.hidden && <span className="text-xs text-gray-600">(hidden)</span>}</p>
            <p className="text-sm text-gray-600">{u.email} · {u.role}</p>
            {u.bio && <p className="text-sm mt-1">{u.bio}</p>}
          </div>
          {u.role !== 'moderator' && (
            <button onClick={() => toggle(u)} disabled={busy === u._id}
              className={`${u.hidden ? 'bg-green-600' : 'bg-red-500'} text-white px-3 py-1 rounded disabled:opacity-50`}>
              {u.hidden ? 'Restore' : 'Hide'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Moderation;
