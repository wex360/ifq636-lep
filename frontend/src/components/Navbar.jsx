import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">Language Exchange</Link>
      <div className="flex items-center">
        {user ? (
          <>
            <Link to="/partners" className="mr-4">Find partners</Link>
            <Link to="/requests" className="mr-4">Requests</Link>
            <Link to="/profile" className="mr-4">Profile</Link>
            {user.role === 'moderator' && <span className="mr-4 text-xs bg-white text-blue-700 px-2 py-1 rounded">Moderator</span>}
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
