import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { Loader, Home } from 'lucide-react';

const RoomPage: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { room, currentUser, isLoading } = useRoom(roomId || '');

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
            <div>
              <h1 className="text-2xl font-bold">{room.name}</h1>
              <p className="text-gray-600">Room ID: {room.id}</p>
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
          <h2 className="text-xl font-bold mb-4">Participants ({room.participants.length})</h2>
          <div className="space-y-2">
            {room.participants.map((participant) => (
              <div
                key={participant.id}
                className={`p-3 rounded-lg ${
                  participant.id === currentUser?.id ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="font-medium">{participant.name}</div>
                {participant.id === room.ownerId && (
                  <span className="text-xs text-gray-600">(Owner)</span>
                )}
                {participant.id === currentUser?.id && (
                  <span className="text-xs text-blue-600 ml-2">(You)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
