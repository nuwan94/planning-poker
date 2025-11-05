import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { generateId } from '@planning-poker/shared';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [isRoomPasswordProtected, setIsRoomPasswordProtected] = useState(false);

  // Auto-fill user name if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Try to get username from custom claim first, then fallback to standard claims
      const namespace = 'https://planning-poker.app';
      const customUsername = (user as any)[`${namespace}/username`];
      const displayName = customUsername || (user as any).username || user.nickname || user.name || user.email?.split('@')[0] || user.email || '';
      setUserName(displayName);
    }
  }, [isAuthenticated, user]);

  // Check if room is password protected when roomId changes
  useEffect(() => {
    const checkRoomPasswordProtection = async () => {
      if (roomId.length === 6) {
        try {
          const room = await apiClient.getRoom(roomId.toUpperCase());
          setIsRoomPasswordProtected(room?.isPasswordProtected || false);
        } catch (error) {
          // Room doesn't exist or error, reset password protection
          setIsRoomPasswordProtected(false);
        }
      } else {
        setIsRoomPasswordProtected(false);
      }
    };

    checkRoomPasswordProtection();
  }, [roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!roomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }

    setIsLoading(true);

    try {
      const userId = isAuthenticated && user?.sub ? user.sub : generateId();
      const finalUserName = userName.trim();
      const finalRoomId = roomId.trim().toUpperCase();
      const avatarUrl = user?.picture || undefined;
      
      localStorage.setItem('planningPokerUser', JSON.stringify({
        id: userId,
        name: finalUserName,
        avatarUrl,
        roomPassword: isRoomPasswordProtected ? password : undefined
      }));

      window.location.href = `/room/${finalRoomId}`;
    } catch (error) {
      console.error('Join room error:', error);
      toast.error('Failed to join room');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Join Room</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Your Name {isAuthenticated && <span className="text-xs text-gray-500">(from your account)</span>}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              required
              disabled={isLoading || isAuthenticated}
              autoFocus={!isAuthenticated}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Room ID</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg uppercase"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              maxLength={6}
              required
              disabled={isLoading}
              autoFocus={isAuthenticated}
            />
          </div>

          {isRoomPasswordProtected && (
            <div>
              <label className="block text-sm font-medium mb-1">Room Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                required={isRoomPasswordProtected}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !userName.trim() || !roomId.trim() || (isRoomPasswordProtected && !password.trim())}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default JoinRoomModal;
