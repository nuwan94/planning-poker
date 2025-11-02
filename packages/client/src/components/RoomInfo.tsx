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
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {room.name}
          </h2>
          <div className="flex items-center bg-indigo-50 rounded-lg px-3 py-2">
            <span className="text-indigo-700 text-sm font-medium mr-2">Room ID:</span>
            <p className="text-indigo-800 text-lg font-mono font-bold">
              {room.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyRoomUrl}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md flex items-center gap-2"
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
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md flex items-center gap-2"
            title="Share room"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
        <div className="text-center bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-blue-800">
              {room.participants.length}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-700">Participants</p>
        </div>
        
        <div className="text-center bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <UserPlus className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-2xl font-bold text-purple-800">
              {room.currentStory ? 1 : 0}
            </span>
          </div>
          <p className="text-sm font-medium text-purple-700">Stories</p>
        </div>
        
        <div className="text-center bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-green-600 mr-2" />
          </div>
          <div>
            <p className="text-xs font-medium text-green-800">
              {formatDate(room.createdAt.toString())}
            </p>
            <p className="text-sm font-medium text-green-700 mt-1">Created</p>
          </div>
        </div>
      </div>

      {/* Current Story Indicator */}
      {room.currentStory && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
          <p className="text-blue-800 font-medium flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold">Current Story:</span>{' '}
            <span className="ml-1">{room.currentStory.title}</span>
          </p>
        </div>
      )}

      {/* Voting Status */}
      {room.isVotingActive && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
          <p className="text-green-800 font-medium text-center flex items-center justify-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Voting is currently active
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomInfo;