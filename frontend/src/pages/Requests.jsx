import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { apiError } from '../apiError';
import { Loading, ErrorBox, Empty, Badge } from '../components/Status';

// LEP-10: recipient accepts or declines, sender cancels; only pending requests change
const Requests = () => {
  const { user } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${user?.token}` } };
  const [data, setData] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (!user) return;
    axiosInstance.get('/api/requests', auth)
      .then((r) => setData(r.data))
      .catch((err) => setError(apiError(err, 'Could not load requests.')))
      .finally(() => setLoading(false));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (id, action) => {
    setBusy(id);
    setError('');
    try {
      const { data: updated } = await axiosInstance.patch(`/api/requests/${id}`, { action }, auth);
      const swap = (list) => list.map((r) => (r._id === id ? { ...r, status: updated.status } : r));
      setData({ incoming: swap(data.incoming), outgoing: swap(data.outgoing) });
    } catch (err) {
      setError(apiError(err, `Could not ${action} the request.`));
    } finally {
      setBusy(null);
    }
  };

  if (!user) return <div className="text-center mt-20">Please log in.</div>;

  const row = (r, other, actions) => (
    <div key={r._id} className="bg-white p-4 mb-3 rounded shadow">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">{other?.name || 'Learner'}</h3>
        <Badge status={r.status} />
      </div>
      {r.message && <p className="text-sm text-gray-600 mt-1">"{r.message}"</p>}
      {r.status === 'pending' && (
        <div className="mt-2">
          {actions.map(([action, label, colour]) => (
            <button
              key={action}
              onClick={() => act(r._id, action)}
              disabled={busy === r._id}
              className={`mr-2 ${colour} text-white px-4 py-1 rounded disabled:opacity-50`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Partner requests</h1>
      <ErrorBox message={error} />
      {loading ? <Loading /> : (
        <>
          <h2 className="text-lg font-semibold mb-2">Sent to me</h2>
          {data.incoming.length === 0 ? <Empty>No requests yet.</Empty> :
            data.incoming.map((r) => row(r, r.from, [['accept', 'Accept', 'bg-green-600'], ['decline', 'Decline', 'bg-gray-500']]))}
          <h2 className="text-lg font-semibold mt-6 mb-2">Sent by me</h2>
          {data.outgoing.length === 0 ? <Empty>You have not sent a request. Find a partner to start.</Empty> :
            data.outgoing.map((r) => row(r, r.to, [['cancel', 'Cancel request', 'bg-red-500']]))}
        </>
      )}
    </div>
  );
};

export default Requests;
