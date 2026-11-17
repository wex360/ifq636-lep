import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { apiError } from '../apiError';
import { Loading, ErrorBox, Empty, Badge } from '../components/Status';

// LEP-8 search by language, LEP-9 send a partner request
const FindPartners = () => {
  const { user } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${user?.token}` } };
  const [language, setLanguage] = useState('');
  const [partners, setPartners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});
  const [sending, setSending] = useState(null);
  const [rowError, setRowError] = useState({});

  const load = async (lang) => {
    setLoading(true);
    setError('');
    try {
      const [p, r] = await Promise.all([
        axiosInstance.get('/api/partners', { ...auth, params: { language: lang } }),
        axiosInstance.get('/api/requests', auth),
      ]);
      setPartners(p.data);
      setRequests([...r.data.incoming, ...r.data.outgoing]);
    } catch (err) {
      setError(apiError(err, 'Could not load learners.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load('');
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // The open or accepted request between me and this learner, either direction
  const statusWith = (id) => requests.find((r) =>
    ['pending', 'accepted'].includes(r.status) &&
    [r.from?._id || r.from, r.to?._id || r.to].includes(id))?.status;

  const send = async (to) => {
    setSending(to);
    setRowError({ ...rowError, [to]: '' });
    try {
      const { data } = await axiosInstance.post('/api/requests', { to, message: drafts[to] || '' }, auth);
      setRequests([...requests, data]);
    } catch (err) {
      setRowError({ ...rowError, [to]: apiError(err, 'Could not send the request.') });
    } finally {
      setSending(null);
    }
  };

  if (!user) return <div className="text-center mt-20">Please log in.</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Find a language partner</h1>
      <form onSubmit={(e) => { e.preventDefault(); load(language); }} className="flex mb-6">
        <input
          type="text"
          placeholder="Language they speak, e.g. Spanish"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="flex-1 p-2 border rounded-l"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded-r">Search</button>
      </form>
      <ErrorBox message={error} />
      {loading ? <Loading /> : partners.length === 0 ? (
        <Empty>{language ? `No learners speak ${language} yet. Try another language.` : 'No other learners yet.'}</Empty>
      ) : partners.map((p) => {
        const status = statusWith(p._id);
        return (
          <div key={p._id} className="bg-white p-4 mb-4 rounded shadow">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">{p.name}</h2>
              {status && <Badge status={status} />}
            </div>
            <p className="text-sm">Speaks: {p.nativeLanguages.join(', ') || 'not set'}</p>
            <p className="text-sm">Learning: {p.learningLanguages.join(', ') || 'not set'}</p>
            {p.bio && <p className="text-sm text-gray-600 mt-1">{p.bio}</p>}
            {!status && (
              <div className="mt-3 flex">
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Optional message"
                  value={drafts[p._id] || ''}
                  onChange={(e) => setDrafts({ ...drafts, [p._id]: e.target.value })}
                  className="flex-1 p-2 border rounded-l text-sm"
                />
                <button
                  onClick={() => send(p._id)}
                  disabled={sending === p._id}
                  className="bg-green-600 text-white px-4 rounded-r disabled:opacity-50"
                >
                  {sending === p._id ? 'Sending...' : 'Send request'}
                </button>
              </div>
            )}
            {rowError[p._id] && <p role="alert" className="mt-2 text-sm text-red-700">{rowError[p._id]}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default FindPartners;
