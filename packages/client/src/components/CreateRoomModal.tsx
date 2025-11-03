import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { X, Plus, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateId } from '@planning-poker/shared';
import toast from 'react-hot-toast';
import LoginButton from './LoginButton';
import { apiClient } from '../services/apiClient';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to continue');
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

      // Create room directly with default name
      const owner = {
        id: user?.sub || generateId(),
        name: user?.name || user?.email || 'Unknown User',
        isSpectator: false
      };

      const room = await apiClient.createRoom({
        name: `Planning Session - ${new Date().toLocaleDateString()}`,
        description: 'Created from quick start',
        owner
      });
      
      toast.success('Room created successfully!');
      navigate(`/room/${room.id}`);
      onClose();
    } catch (error) {
      toast.error('Failed to create room. Please try again.');
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
        <div className="gradient-primary p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Room</h2>
                <p className="text-white/80 text-sm">Start a new planning session</p>
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
                Please log in to create planning poker rooms
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
              <div className="text-center">
                <p className="text-slate-700 mb-4">
                  Welcome, <strong>{user?.name || user?.email}</strong>!
                </p>
                <p className="text-sm text-slate-600">
                  Click below to create a new planning session instantly.
                </p>
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
                  disabled={isLoading}
                  className="btn-primary flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Room
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

export default CreateRoomModal;