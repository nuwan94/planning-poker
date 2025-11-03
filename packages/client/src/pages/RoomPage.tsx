import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { Loader, Home, Edit2, Check, X, Crown } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';

const RoomPage: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { room, currentUser, isLoading } = useRoom(roomId || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Debug: Log room data to verify avatarUrl is present
  React.useEffect(() => {
    if (room) {
      console.log('Room participants with avatars:', room.participants.map(p => ({
        name: p.name,
        hasAvatar: !!p.avatarUrl,
        avatarUrl: p.avatarUrl
      })));
    }
  }, [room]);

  const isOwner = room && currentUser && room.ownerId === currentUser.id;

  const handleStartEdit = () => {
    if (room) {
      setNewRoomName(room.name);
      setIsEditingName(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNewRoomName('');
  };

    const handleSaveRoomName = async () => {
    if (!room || !newRoomName.trim()) return;

    setIsSaving(true);
    try {
      await apiClient.updateRoom(room.id, { name: newRoomName.trim() });
      toast.success('Room name updated');
      setIsEditingName(false);
      // The room will be updated via socket broadcast from server
    } catch (error) {
      console.error('Failed to update room name:', error);
      toast.error('Failed to update room name');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Room Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none px-2 py-1"
                    autoFocus
                    disabled={isSaving}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRoomName();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <button
                    onClick={handleSaveRoomName}
                    disabled={isSaving}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                    title="Save"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{room.name}</h1>
                  {isOwner && (
                    <button
                      onClick={handleStartEdit}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Rename room"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-gray-600 mt-1">Room ID: {room.id}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Home className="w-4 h-4" />
              Leave Room
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Participants</h2>
            <span className="text-sm text-gray-600">{room.participants.length} {room.participants.length === 1 ? 'person' : 'people'}</span>
          </div>
          
          {/* Avatar Group */}
          <div className="flex flex-wrap gap-3">
            {room.participants.map((participant) => {
              const isCurrentUser = participant.id === currentUser?.id;
              const isOwner = participant.id === room.ownerId;
              
              let tooltipText = participant.name;
              if (isOwner && isCurrentUser) {
                tooltipText += ' (Owner, You)';
              } else if (isOwner) {
                tooltipText += ' (Owner)';
              } else if (isCurrentUser) {
                tooltipText += ' (You)';
              }
              
              // Border colors
              let borderColor = 'ring-gray-300'; // default
              if (isOwner) {
                borderColor = 'ring-yellow-400'; // gold for owner
              } else if (isCurrentUser) {
                borderColor = 'ring-blue-500'; // blue for current user
              }
              
              return (
                <div
                  key={participant.id}
                  className="group relative"
                  title={tooltipText}
                >
                  <div className={`ring-2 ${borderColor} rounded-full transition-all duration-200 hover:scale-110 relative`}>
                    <Avatar 
                      name={participant.name}
                      avatarUrl={participant.avatarUrl}
                      size="lg"
                    />
                    
                    {/* Crown badge for owner */}
                    {isOwner && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 ring-2 ring-white shadow-lg">
                        <Crown className="w-3 h-3 text-yellow-900" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium">{participant.name}</div>
                    {(isOwner || isCurrentUser) && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isOwner && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-[10px]">
                            👑 Owner
                          </span>
                        )}
                        {isCurrentUser && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px]">
                            You
                          </span>
                        )}
                      </div>
                    )}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
