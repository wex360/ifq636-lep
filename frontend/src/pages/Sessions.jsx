import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { apiError } from '../apiError';
import { Loading, ErrorBox, Empty, Badge } from '../components/Status';

// LEP-11 book a session with an accepted partner, LEP-12 cancel it before it starts
const Sessions = () => {
  const { user } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${user?.token}` } };
  const [sessions, setSessions] = useState([]);
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({ requestId: '', startsAt: '', durationMins: 30 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([axiosInstance.get('/api/sessions', auth), axiosInstance.get('/api/requests', auth)])
      .then(([s, r]) => {
        setSessions(s.data);
        const accepted = [
          ...r.data.incoming.filter((x) => x.status === 'accepted').map((x) => ({ id: x._id, name: x.from?.name })),
          ...r.data.outgoing.filter((x) => x.status === 'accepted').map((x) => ({ id: x._id, name: x.to?.name })),
        ];
        setPartners(accepted);
        if (accepted.length) setForm((f) => ({ ...f, requestId: accepted[0].id }));
      })
      .catch((err) => setError(apiError(err, 'Could not load sessions.')))
      .finally(() => setLoading(false));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const book = async (e) => {
    e.preventDefault();
    setError('');
    setBooked(false);
    setBusy('book');
    try {
      // send the start as an ISO string
      const startsAt = form.startsAt ? new Date(form.startsAt).toISOString() : '';
      const { data } = await axiosInstance.post('/api/sessions', { ...form, startsAt }, auth);
      const { data: all } = await axiosInstance.get('/api/sessions', auth);
      setSessions(all.length ? all : [data]);
      setBooked(true);
    } catch (err) {
      setError(apiError(err, 'Could not book the session.'));
    } finally {
      setBusy(null);
    }
  };

  const cancel = async (id) => {
    setError('');
    setBusy(id);
    try {
      const { data } = await axiosInstance.patch(`/api/sessions/${id}/cancel`, {}, auth);
      setSessions(sessions.map((s) => (s._id === id ? { ...s, status: data.status } : s)));
    } catch (err) {
      setError(apiError(err, 'Could not cancel the session.'));
    } finally {
      setBusy(null);
    }
  };

  if (!user) return <div className="text-center mt-20">Please log in.</div>;

  const other = (s) => s.participants.find((p) => String(p._id) !== String(user.id))?.name || 'Partner';

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Practice sessions</h1>
      <ErrorBox message={error} />
      {booked && <p role="status" className="mb-4 p-2 bg-green-100 text-green-700 rounded">Session booked.</p>}
      {loading ? <Loading /> : (
        <>
          {partners.length === 0 ? (
            <Empty>Book a session once a partner accepts your request.</Empty>
          ) : (
            <form onSubmit={book} className="bg-white p-4 mb-6 rounded shadow">
              <label className="block mb-3">
                <span className="text-sm font-medium">Partner</span>
                <select value={form.requestId} onChange={(e) => setForm({ ...form, requestId: e.target.value })} className="w-full p-2 border rounded">
                  {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label className="block mb-3">
                <span className="text-sm font-medium">Starts</span>
                <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="w-full p-2 border rounded" />
              </label>
              <label className="block mb-3">
                <span className="text-sm font-medium">Length</span>
                <select value={form.durationMins} onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) })} className="w-full p-2 border rounded">
                  {[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </label>
              <button type="submit" disabled={busy === 'book'} className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50">
                {busy === 'book' ? 'Booking...' : 'Book session'}
              </button>
            </form>
          )}
          <h2 className="text-lg font-semibold mb-2">My sessions</h2>
          {sessions.length === 0 ? <Empty>No sessions booked.</Empty> : sessions.map((s) => (
            <div key={s._id} className="bg-white p-4 mb-3 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-bold">{other(s)}</p>
                <p className="text-sm">{new Date(s.startsAt).toLocaleString()} for {s.durationMins} minutes</p>
              </div>
              <div className="flex items-center">
                <Badge status={s.status} />
                {s.status === 'booked' && new Date(s.startsAt) > new Date() && (
                  <button onClick={() => cancel(s._id)} disabled={busy === s._id} className="ml-3 bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Sessions;
