import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-teal-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Project Manager</Link>
        <div className="space-x-4">
          {!token ? (
            <>
              <Link to="/login" className="hover:text-teal-200">Login</Link>
              <Link to="/register" className="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-100">
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-100"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
} 