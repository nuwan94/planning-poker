import React, { useState } from 'react';
import { Room } from '@planning-poker/shared';
import { Copy, Share2, Check, Users, Clock, UserPlus, Lock } from 'lucide-react';

interface RoomInfoProps {
  room: Room;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ room }) => {
  const [copied, setCopied] = useState(false);

  const roomUrl = `${window.location.origin}/#/room/${room.id}`;

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
    <div className="space-y-6">
      {/* Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {room.name}
            {room.isPasswordProtected && (
              <Lock className="w-5 h-5 text-amber-600" />
            )}
          </h2>
          <div className="inline-flex items-center bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl px-4 py-2 border border-primary-200">
            <span className="text-primary-700 text-sm font-medium mr-2">Room ID:</span>
            <p className="text-primary-800 text-lg font-mono font-bold">
              {room.id}
            </p>
            {room.isPasswordProtected && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <Lock className="w-3 h-3 mr-1" />
                Protected
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={copyRoomUrl}
            className={`btn-secondary btn-sm transition-all duration-200 ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}`}
            title="Copy room URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
          <button
            onClick={shareRoom}
            className="btn-primary btn-sm"
            title="Share room"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Room Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-6 text-center group hover:scale-105 transition-transform duration-200">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {room.participants.length}
          </div>
          <p className="text-sm font-medium text-slate-600">Participants</p>
        </div>
        
        <div className="card p-6 text-center group hover:scale-105 transition-transform duration-200">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {room.currentStory ? 1 : 0}
          </div>
          <p className="text-sm font-medium text-slate-600">Active Stories</p>
        </div>
        
        <div className="card p-6 text-center group hover:scale-105 transition-transform duration-200">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs font-medium text-slate-700 mb-1">
            {formatDate(room.createdAt.toString())}
          </div>
          <p className="text-sm font-medium text-slate-600">Created</p>
        </div>
      </div>

      {/* Current Story Status */}
      {room.currentStory && (
        <div className="card-elevated p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-primary-900 font-semibold text-lg">Current Story</p>
              <p className="text-primary-800 text-sm mt-1">{room.currentStory.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Voting Status */}
      {room.isVotingActive && (
        <div className="card-elevated p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-900 font-semibold text-lg">Voting Active</p>
              <p className="text-emerald-800 text-sm mt-1">Team members are currently voting</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomInfo;