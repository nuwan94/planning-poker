import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LogOut } from 'lucide-react';

interface NavbarProps {
  user?: {
    id: string;
    name: string;
  };
  roomInfo?: {
    id: string;
    name: string;
    participantCount: number;
  };
  onLogout?: () => void;
  onLeaveRoom?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, roomInfo, onLogout, onLeaveRoom }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('planningPokerUser');
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Planning Poker';
    if (path === '/create-room') return 'Create Room';
    if (path.startsWith('/room/')) {
      return roomInfo ? roomInfo.name : 'Planning Room';
    }
    return 'Planning Poker';
  };

  const getPageContext = () => {
    const path = location.pathname;
    if (path.startsWith('/room/') && roomInfo) {
      return `Room: ${roomInfo.id} • ${roomInfo.participantCount} participants`;
    }
    return null;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo and navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-lg">Planning Poker</span>
            </button>
            
            {location.pathname !== '/' && (
              <button
                onClick={handleHomeClick}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Go to Home"
              >
                <Home className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Center section - Page title and context */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
            {getPageContext() && (
              <p className="text-sm text-gray-500 mt-1">
                {getPageContext()}
              </p>
            )}
          </div>

          {/* Right section - User info and actions */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                {/* Leave Room button - only show in room */}
                {roomInfo && onLeaveRoom && (
                  <button
                    onClick={onLeaveRoom}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg border border-red-200 transition-all duration-200 hover:shadow-md text-sm"
                    title="Leave Room"
                  >
                    Leave Room
                  </button>
                )}

                {/* User info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-700">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Online
                    </p>
                  </div>
                  
                  {/* User avatar */}
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;