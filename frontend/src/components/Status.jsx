// Shared page states: loading, error, empty and request status badges.
export const Loading = () => <p role="status" className="text-gray-500">Loading...</p>;

export const ErrorBox = ({ message }) =>
  message ? <p role="alert" className="mb-4 p-2 bg-red-100 text-red-700 rounded">{message}</p> : null;

export const Empty = ({ children }) => <p className="p-4 bg-gray-50 border border-dashed rounded text-gray-600">{children}</p>;

const BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-gray-200 text-gray-700',
  cancelled: 'bg-gray-200 text-gray-700',
  booked: 'bg-green-100 text-green-800',
};

export const Badge = ({ status }) => (
  <span className={`text-xs px-2 py-1 rounded ${BADGE[status] || 'bg-gray-100'}`}>{status}</span>
);
