import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import FindPartners from './pages/FindPartners';
import Requests from './pages/Requests';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={user ? '/partners' : '/login'} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/partners" element={<FindPartners />} />
        <Route path="/requests" element={<Requests />} />
      </Routes>
    </Router>
  );
}

export default App;
