import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Home, Plus, Users } from 'lucide-react';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';
import LoginButton from './LoginButton';
import UserAvatarDropdown from './UserAvatarDropdown';

interface NavbarProps {
  roomInfo?: {
    id: string;
    name: string;
    participantCount: number;
  };
  onLeaveRoom?: () => void;
  onShowCreateModal?: () => void;
  onShowJoinModal?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ roomInfo, onLeaveRoom, onShowCreateModal, onShowJoinModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth0();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left section - Logo and navigation */}
          <div className="flex items-center space-x-6">
            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-3 text-slate-700 hover:text-primary-600 transition-all duration-300 group"
            >
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-2.5 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl transition-all duration-300 shadow-lg shadow-primary-500/25">
                <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-primary-800 transition-all duration-300">
                Planning Poker
              </span>
            </button>
            
            {location.pathname !== '/' && (
              <div className="hidden sm:block h-6 w-px bg-slate-300"></div>
            )}
            
            {location.pathname !== '/' && (
              <button
                onClick={handleHomeClick}
                className="btn-ghost p-2.5 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                title="Go to Home"
              >
                <Home className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Right section - Actions and user info */}
          <div className="flex items-center space-x-4">
            {/* Action buttons - always visible */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onShowCreateModal}
                className="btn-primary px-4 py-2.5 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                title="Create Room"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Create</span>
              </button>
              <button
                onClick={onShowJoinModal}
                className="btn-secondary px-4 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                title="Join Room"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Join</span>
              </button>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-slate-300"></div>

            {/* Authentication Section */}
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse bg-slate-200 h-10 w-10 rounded-full"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Leave Room button - only show in room */}
                {roomInfo && onLeaveRoom && (
                  <button
                    onClick={onLeaveRoom}
                    className="btn-danger px-3 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    title="Leave Room"
                  >
                    <span className="hidden sm:inline">Leave Room</span>
                    <span className="sm:hidden">Leave</span>
                  </button>
                )}

                {/* User Avatar Dropdown */}
                <UserAvatarDropdown />
              </div>
            ) : (
              <div className="pl-2">
                <LoginButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavbarWithModals: React.FC<NavbarProps> = (props) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  return (
    <>
      <Navbar 
        {...props} 
        onShowCreateModal={() => setShowCreateModal(true)}
        onShowJoinModal={() => setShowJoinModal(true)}
      />
      
      {/* Modals rendered at body level */}
      {showCreateModal && (
        <CreateRoomModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
        />
      )}
      {showJoinModal && (
        <JoinRoomModal 
          isOpen={showJoinModal} 
          onClose={() => setShowJoinModal(false)} 
        />
      )}
    </>
  );
};

export default NavbarWithModals;