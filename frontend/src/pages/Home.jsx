import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-green-600">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-6">Welcome to Project Manager</h1>
          <p className="text-xl mb-8">Manage your projects and track payments efficiently</p>
          {!token ? (
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-100"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 