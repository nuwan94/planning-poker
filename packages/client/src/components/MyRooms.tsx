import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room } from '@planning-poker/shared';
import { apiClient } from '../services/apiClient';
import { Briefcase, Users, Clock, ChevronRight, Loader } from 'lucide-react';

interface MyRoomsProps {
  userId: string;
}

const MyRooms: React.FC<MyRoomsProps> = ({ userId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyRooms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const ownedRooms = await apiClient.getRoomsByOwner(userId);
        setRooms(ownedRooms);
      } catch (err) {
        console.error('Failed to fetch owned rooms:', err);
        setError('Failed to load your rooms');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchMyRooms();
    }
  }, [userId]);

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`);
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
      <div className="card p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-6 h-6 text-primary-600 animate-spin mr-2" />
          <span className="text-slate-600">Loading your rooms...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <Briefcase className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No rooms yet</h3>
        <p className="text-slate-600 text-sm">
          Create your first room to start planning with your team
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Rooms</h2>
          <p className="text-slate-600 text-sm mt-1">
            {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} you own
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => handleRoomClick(room.id)}
            className="card p-6 text-left group hover:scale-102 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 mb-1 truncate group-hover:text-primary-600 transition-colors">
                  {room.name}
                </h3>
                {room.description && (
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {room.description}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
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
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${room.isVotingActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-xs font-medium text-slate-700">
                    {room.isVotingActive ? 'Active voting' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MyRooms;
