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
    <nav className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Project Manager
        </Link>
        <div className="space-x-4">
          {!token ? (
            <>
              <Link to="/login" className="hover:text-teal-200 transition duration-200">Login</Link>
              <Link to="/register" className="bg-white text-teal-600 px-6 py-2 rounded-full hover:bg-teal-100 transition duration-200 font-medium">
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-white text-teal-600 px-6 py-2 rounded-full hover:bg-teal-100 transition duration-200 font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
} 