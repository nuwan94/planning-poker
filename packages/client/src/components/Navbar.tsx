import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Home, Plus, Users, Briefcase, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleHomeClick = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleMyRoomsClick = () => {
    navigate('/my-rooms');
    setIsMobileMenuOpen(false);
  };

  const handleCreateClick = () => {
    onShowCreateModal?.();
    setIsMobileMenuOpen(false);
  };

  const handleJoinClick = () => {
    onShowJoinModal?.();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo */}
          <div className="flex items-center">
            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-2 sm:space-x-3 text-slate-700 hover:text-primary-600 transition-all duration-300 group"
            >
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-2 sm:p-2.5 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl transition-all duration-300 shadow-lg shadow-primary-500/25">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-primary-800 transition-all duration-300">
                Planning Poker
              </span>
            </button>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Home Button */}
            <button
              onClick={handleHomeClick}
              className="btn-ghost p-2.5 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
              title="Go to Home"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* My Rooms - Show for authenticated users */}
            {isAuthenticated && (
              <button
                onClick={handleMyRoomsClick}
                className={`btn-ghost px-4 py-2.5 font-medium transition-all duration-200 ${
                  location.pathname === '/my-rooms' ? 'bg-primary-50 text-primary-600' : ''
                }`}
                title="My Rooms"
              >
                <Briefcase className="w-4 h-4 inline mr-2" />
                My Rooms
              </button>
            )}

            {/* Create Room */}
            <button
              onClick={handleCreateClick}
              className="btn-primary px-4 py-2.5 font-medium shadow-md hover:shadow-lg transition-all duration-200"
              title="Create Room"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create
            </button>

            {/* Join Room */}
            <button
              onClick={handleJoinClick}
              className="btn-secondary px-4 py-2.5 font-medium shadow-sm hover:shadow-md transition-all duration-200"
              title="Join Room"
            >
              <Users className="w-4 h-4 inline mr-2" />
              Join
            </button>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-300"></div>

            {/* Authentication Section */}
            {isLoading ? (
              <div className="animate-pulse bg-slate-200 h-10 w-10 rounded-full"></div>
            ) : isAuthenticated ? (
              <>
                {/* Leave Room button - only show in room */}
                {roomInfo && onLeaveRoom && (
                  <button
                    onClick={onLeaveRoom}
                    className="btn-danger px-3 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    title="Leave Room"
                  >
                    Leave Room
                  </button>
                )}
                <UserAvatarDropdown />
              </>
            ) : (
              <LoginButton />
            )}
          </div>

          {/* Mobile menu button and user avatar */}
          <div className="flex md:hidden items-center space-x-3">
            {isAuthenticated && <UserAvatarDropdown />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-2 animate-slide-down">
            {/* Home */}
            <button
              onClick={handleHomeClick}
              className="w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </button>

            {/* My Rooms - Show for authenticated users */}
            {isAuthenticated && (
              <button
                onClick={handleMyRoomsClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === '/my-rooms' 
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">My Rooms</span>
              </button>
            )}

            {/* Create Room */}
            <button
              onClick={handleCreateClick}
              className="w-full flex items-center space-x-3 px-4 py-3 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Create Room</span>
            </button>

            {/* Join Room */}
            <button
              onClick={handleJoinClick}
              className="w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
            >
              <Users className="w-5 h-5" />
              <span>Join Room</span>
            </button>

            {/* Leave Room - only in room view */}
            {roomInfo && onLeaveRoom && (
              <button
                onClick={() => {
                  onLeaveRoom();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <X className="w-5 h-5" />
                <span>Leave Room</span>
              </button>
            )}

            {/* Login button for non-authenticated users */}
            {!isAuthenticated && !isLoading && (
              <div className="pt-2 border-t border-slate-200">
                <LoginButton />
              </div>
            )}
          </div>
        )}
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