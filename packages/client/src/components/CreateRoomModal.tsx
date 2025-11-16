import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { generateId, TIMER } from '@planning-poker/shared';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [timerDuration, setTimerDuration] = useState<number>(TIMER.DEFAULT_DURATION);
  const [enableTimer, setEnableTimer] = useState(true);

  // Auto-fill user name if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Debug: log the user object to see available claims
      console.log('Auth0 User Object:', user);
      
      // Try to get username from custom claim first, then fallback to standard claims
      const namespace = 'https://planning-poker.app';
      const customUsername = (user as any)[`${namespace}/username`];
      console.log('Custom username claim:', customUsername);
      
      const displayName = customUsername || (user as any).username || user.nickname || user.name || user.email?.split('@')[0] || user.email || '';
      setUserName(displayName);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      const userId = isAuthenticated && user?.sub ? user.sub : generateId();
      const finalUserName = userName.trim();
      const avatarUrl = user?.picture || undefined;
      
      localStorage.setItem('planningPokerUser', JSON.stringify({
        id: userId,
        name: finalUserName,
        avatarUrl,
        roomPassword: isPasswordProtected ? password : undefined
      }));

      const room = await apiClient.createRoom({
        name: 'Planning Session',
        password: isPasswordProtected ? password : undefined,
        timerDuration: enableTimer ? timerDuration : 0,
        owner: {
          id: userId,
          name: finalUserName,
          avatarUrl,
          isSpectator: false
        }
      });
      
      // Close the modal before navigating
      onClose();
      navigate(`/room/${room.id}`);
    } catch (error) {
      console.error('Create room error:', error);
      toast.error('Failed to create room');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Room</h2>
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="passwordProtected"
              checked={isPasswordProtected}
              onChange={(e) => setIsPasswordProtected(e.target.checked)}
              disabled={isLoading}
              className="rounded"
            />
            <label htmlFor="passwordProtected" className="text-sm font-medium">
              Password protect this room
            </label>
          </div>

          {isPasswordProtected && (
            <div>
              <label className="block text-sm font-medium mb-1">Room Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                minLength={4}
                maxLength={50}
                required={isPasswordProtected}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                id="enableTimer"
                checked={enableTimer}
                onChange={(e) => setEnableTimer(e.target.checked)}
                disabled={isLoading}
                className="rounded"
              />
              <label htmlFor="enableTimer" className="text-sm font-medium">
                Enable voting timer by default
              </label>
            </div>

            {enableTimer && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Default Timer Duration: {Math.floor(timerDuration / 60)}:{(timerDuration % 60).toString().padStart(2, '0')}
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {TIMER.PRESET_DURATIONS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setTimerDuration(preset.value)}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        timerDuration === preset.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={TIMER.MIN_DURATION}
                  max={TIMER.MAX_DURATION}
                  step={30}
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            )}
          </div>

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
              disabled={isLoading || !userName.trim() || (isPasswordProtected && !password.trim())}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateRoomModal;
