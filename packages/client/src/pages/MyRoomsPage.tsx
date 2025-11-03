import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room } from '@planning-poker/shared';
import { apiClient } from '../services/apiClient';
import { Users, Clock, ChevronRight, Loader, Trash2, X, AlertTriangle, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const MyRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const savedUser = localStorage.getItem('planningPokerUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUserId(userData.id);
    } else {
      // If no user found, redirect to home
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchMyRooms = async () => {
      if (!currentUserId) return;

      try {
        setIsLoading(true);
        setError(null);
        const ownedRooms = await apiClient.getRoomsByOwner(currentUserId);
        setRooms(ownedRooms);
      } catch (err) {
        console.error('Failed to fetch owned rooms:', err);
        setError('Failed to load your rooms');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUserId) {
      fetchMyRooms();
    }
  }, [currentUserId]);

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation(); // Prevent room card click
    setRoomToDelete(room);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;

    try {
      setDeletingRoomId(roomToDelete.id);
      await apiClient.deleteRoom(roomToDelete.id);
      
      // Remove room from state
      setRooms(rooms.filter(r => r.id !== roomToDelete.id));
      
      toast.success(`Room "${roomToDelete.name}" deleted successfully`);
      setRoomToDelete(null);
    } catch (err) {
      console.error('Failed to delete room:', err);
      toast.error('Failed to delete room. Please try again.');
    } finally {
      setDeletingRoomId(null);
    }
  };

  const handleCancelDelete = () => {
    setRoomToDelete(null);
  };

  const copyRoomUrl = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation(); // Prevent room card click
    
    const roomUrl = `${window.location.origin}/room/${roomId}`;
    
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopiedRoomId(roomId);
      toast.success('Room link copied to clipboard!');
      setTimeout(() => setCopiedRoomId(null), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = roomUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedRoomId(roomId);
      toast.success('Room link copied to clipboard!');
      setTimeout(() => setCopiedRoomId(null), 2000);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card p-8">
            <div className="flex items-center justify-center">
              <Loader className="w-6 h-6 text-primary-600 animate-spin mr-2" />
              <span className="text-slate-600">Loading your rooms...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="card p-8">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <div className="card p-12 text-center">
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">No rooms yet</h3>
            <p className="text-slate-600">
              You haven't created any rooms yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
            <div
              key={room.id}
              className="card p-6 group hover:scale-102 hover:shadow-xl transition-all duration-200 relative"
            >
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={(e) => copyRoomUrl(e, room.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      copiedRoomId === room.id
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    title="Copy room link"
                  >
                    {copiedRoomId === room.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, room)}
                    disabled={deletingRoomId === room.id}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete room"
                  >
                    {deletingRoomId === room.id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Room content - clickable */}
                <div
                  onClick={() => handleRoomClick(room.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4 pr-10">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
                        {room.name}
                      </h3>
                      {room.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {room.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-3" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1.5" />
                      <span>{room.participants.length} {room.participants.length === 1 ? 'member' : 'members'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      <span>{formatDate(room.createdAt)}</span>
                    </div>
                  </div>

                  {room.currentStory && (
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${room.isVotingActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                          <span className="text-sm font-medium text-slate-700">
                            {room.isVotingActive ? 'Active voting' : 'Inactive'}
                          </span>
                        </div>
                        {room.storyHistory && room.storyHistory.length > 0 && (
                          <span className="text-xs text-slate-500">
                            {room.storyHistory.length} completed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            </div>
          ))}
        </div>
        )}

        {/* Delete Confirmation Modal */}
        {roomToDelete && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Room?</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Are you sure you want to delete <span className="font-semibold">"{roomToDelete.name}"</span>?
                  </p>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    <strong>Warning:</strong> This will permanently delete the room and all associated stories. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleCancelDelete}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancelDelete}
                  disabled={deletingRoomId !== null}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingRoomId !== null}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingRoomId !== null ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Room
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoomsPage;
