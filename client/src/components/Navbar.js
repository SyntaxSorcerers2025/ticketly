import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, Ticket, Home } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (role) => {
    switch (role) {
      case 1: return 'Student';
      case 2: return 'Teacher';
      case 3: return 'IT Coordinator';
      default: return 'User';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b border-secondary-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-secondary-900">Ticketly</span>
            </Link>
            <div className="flex space-x-4">
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Ticket className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-secondary-900">Ticketly</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-secondary-600 hover:text-primary-600">
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            
            <Link to="/tickets" className="flex items-center space-x-1 text-secondary-600 hover:text-primary-600">
              <Ticket className="h-5 w-5" />
              <span>Tickets</span>
            </Link>

            {user?.role === 3 && (
              <Link to="/admin" className="flex items-center space-x-1 text-secondary-600 hover:text-primary-600">
                <Settings className="h-5 w-5" />
                <span>Admin</span>
              </Link>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-secondary-500" />
                  <span className="text-sm text-secondary-700">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className={`status-badge ${getRoleColor(user?.role)}`}>
                    {getRoleName(user?.role)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-secondary-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
