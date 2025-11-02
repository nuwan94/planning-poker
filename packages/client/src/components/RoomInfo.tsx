import React, { useState } from 'react';
import { Room } from '@planning-poker/shared';
import { Copy, Share2, Check, Users, Clock, UserPlus } from 'lucide-react';

interface RoomInfoProps {
  room: Room;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ room }) => {
  const [copied, setCopied] = useState(false);

  const roomUrl = `${window.location.origin}/room/${room.id}`;

  const copyRoomUrl = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = roomUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareRoom = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Planning Poker: ${room.name}`,
          text: `You're invited to join a planning poker session: ${room.name}`,
          url: roomUrl,
        });
      } catch (error) {
        // User cancelled or sharing failed, fallback to copy
        copyRoomUrl();
      }
    } else {
      // Fallback to copy for browsers that don't support Web Share API
      copyRoomUrl();
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {room.name}
          </h2>
          <p className="text-gray-600 text-sm">
            Room ID: {room.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyRoomUrl}
            className="btn btn-outline btn-sm flex items-center gap-2"
            title="Copy room URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
          <button
            onClick={shareRoom}
            className="btn btn-primary btn-sm flex items-center gap-2"
            title="Share room"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-lg font-semibold text-gray-800">
              {room.participants.length}
            </span>
          </div>
          <p className="text-xs text-gray-600">Participants</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <UserPlus className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-lg font-semibold text-gray-800">
              {room.currentStory ? 1 : 0}
            </span>
          </div>
          <p className="text-xs text-gray-600">Stories</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-xs font-medium text-gray-800">
              {formatDate(room.createdAt.toString())}
            </span>
          </div>
          <p className="text-xs text-gray-600">Created</p>
        </div>
      </div>

      {/* Current Story Indicator */}
      {room.currentStory && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <span className="font-medium">Current Story:</span>{' '}
            {room.currentStory.title}
          </p>
        </div>
      )}

      {/* Voting Status */}
      {room.isVotingActive && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium text-center">
            🗳️ Voting is currently active
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomInfo;