import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { X, Users, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateId } from '@planning-poker/shared';
import toast from 'react-hot-toast';
import LoginButton from './LoginButton';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to continue');
      return;
    }

    if (!roomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }

    setIsLoading(true);

    try {
      // Store user data in localStorage for the session
      if (user) {
        localStorage.setItem('planningPokerUser', JSON.stringify({
          name: user.name || user.email || 'Unknown User',
          id: user.sub || generateId(),
          email: user.email
        }));
      }
      
      // Navigate to room
      navigate(`/room/${roomId.trim().toUpperCase()}`);
      onClose();
    } catch (error) {
      toast.error('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="card-elevated max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gradient-success p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Join Room</h2>
                <p className="text-white/80 text-sm">Enter an existing planning session</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-ghost p-2 text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {!isAuthenticated ? (
            <div className="text-center space-y-4">
              <p className="text-slate-600">
                Please log in to join planning poker rooms
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <div className="flex-1">
                  <LoginButton />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-slate-700 mb-2">
                  Welcome, <strong>{user?.name || user?.email}</strong>!
                </p>
                <p className="text-sm text-slate-600">
                  Enter the room ID to join a planning session
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="joinRoomId" className="label">
                  Room ID
                </label>
                <input
                  id="joinRoomId"
                  type="text"
                  className="input"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter room ID (e.g., A3B9K2)"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !roomId.trim()}
                  className="btn-success flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Room
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JoinRoomModal;