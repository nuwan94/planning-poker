import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { generateId } from '@planning-poker/shared';
import { useLayoutContext } from '../components/Layout';

import RoomInfo from '../components/RoomInfo';
import ParticipantsList from '../components/ParticipantsList';
import VotingPanel from '../components/VotingPanel';
import StoryControls from '../components/StoryControls';
import VotingResults from '../components/VotingResults';
import { AlertCircle, Loader } from 'lucide-react';

const RoomPage: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  
  // Try to get layout context, but don't fail if it's not available
  let setRoomInfo: ((roomInfo: any) => void) | null = null;
  let setLeaveRoomHandler: ((handler: (() => void) | null) => void) | null = null;
  try {
    const layoutContext = useLayoutContext();
    setRoomInfo = layoutContext.setRoomInfo;
    setLeaveRoomHandler = layoutContext.setLeaveRoomHandler;
  } catch (error) {
    // Layout context not available - that's okay
  }

  const {
    room,
    currentUser,
    isLoading,
    votes,
    hasVoted,
    currentVote,

    actions
  } = useRoom(roomId || '');

  // Derived values
  const currentStory = room?.currentStory;

  const handleLeaveRoom = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Update room info in navbar when room data changes
  useEffect(() => {
    if (setRoomInfo) {
      if (room) {
        setRoomInfo({
          id: room.id,
          name: room.name,
          participantCount: room.participants.length
        });
      } else {
        setRoomInfo(null);
      }
    }

    // Set leave room handler
    if (setLeaveRoomHandler) {
      setLeaveRoomHandler(handleLeaveRoom);
    }

    // Cleanup when component unmounts
    return () => {
      if (setRoomInfo) {
        setRoomInfo(null);
      }
      if (setLeaveRoomHandler) {
        setLeaveRoomHandler(null);
      }
    };
  }, [room, setRoomInfo, setLeaveRoomHandler, handleLeaveRoom]);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    // Auto-join with stored user data if available
    const storedUser = localStorage.getItem('planningPokerUser');
    if (storedUser && !hasJoined) {
      const userData = JSON.parse(storedUser);
      setUserName(userData.name);
      setHasJoined(true); // User data exists, so we can proceed
    }
  }, [roomId, navigate, hasJoined]);

  const handleJoinRoom = async (name: string) => {
    if (!name.trim() || !roomId) return;

    setIsJoining(true);
    try {
      // Store user data in the same format as HomePage
      const userData = {
        name: name.trim(),
        id: generateId()
      };
      localStorage.setItem('planningPokerUser', JSON.stringify(userData));
      setHasJoined(true);
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      setIsJoining(false);
    }
  };

  // Show join form if user hasn't joined yet
  if (!hasJoined && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Join Planning Poker Room
          </h1>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleJoinRoom(userName);
          }}>
            <div className="mb-6">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input w-full"
                placeholder="Enter your name"
                required
                disabled={isJoining}
              />
            </div>
            
            <button
              type="submit"
              disabled={!userName.trim() || isJoining}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Room'
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (!room && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-6">The room you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Show room not found
  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-6">
            The room you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === room.ownerId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">

        {/* Main Layout with improved grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Left Column - Room Info & Participants */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4">
                <h3 className="text-white font-semibold text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Room Information
                </h3>
                <p className="text-indigo-100 text-sm">Share room details</p>
              </div>
              <div className="p-6">
                <RoomInfo room={room} />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                <h3 className="text-white font-semibold text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Participants ({room.participants.length})
                </h3>
                <p className="text-green-100 text-sm">Team members in this room</p>
              </div>
              <div className="p-6">
                <ParticipantsList
                  participants={room.participants}
                  votes={votes}
                  isVotingActive={room.isVotingActive}
                  areVotesRevealed={currentStory?.isRevealed || false}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Story Controls - Only for room owner */}
            {isOwner && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
                  <h3 className="text-white font-semibold text-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Room Controls
                  </h3>
                </div>
                <div className="p-6">
                  <StoryControls
                    currentStory={currentStory}
                    isVotingActive={room.isVotingActive}
                    areVotesRevealed={currentStory?.isRevealed || false}
                    canRevealVotes={room.isVotingActive && !currentStory?.isRevealed}
                    isRoomOwner={currentUser?.id === room.ownerId}
                    onStartVoting={actions.startVoting}
                    onRevealVotes={actions.revealVotes}
                    onClearVotes={actions.clearVotes}
                    onUpdateStory={actions.updateStory}
                  />
                </div>
              </div>
            )}

            {/* Current Story Display */}
            {currentStory && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {currentStory.title}
                  </h2>
                  {currentStory.description && (
                    <p className="text-blue-100 text-lg">
                      {currentStory.description}
                    </p>
                  )}
                </div>
                <div className="p-6">
                  {currentStory.acceptanceCriteria && currentStory.acceptanceCriteria.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Acceptance Criteria
                      </h3>
                      <div className="space-y-2">
                        {currentStory.acceptanceCriteria.map((criteria, index) => (
                          <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <p className="text-gray-700 leading-relaxed">
                              {criteria}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentStory.finalEstimate && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-green-800 font-semibold text-lg">
                          Final Estimate: <span className="text-2xl font-bold">{currentStory.finalEstimate}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Voting Panel */}
            {room.isVotingActive && currentUser && !currentUser.isSpectator && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
                  <h3 className="text-white font-semibold text-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-10 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
                    </svg>
                    Cast Your Vote
                  </h3>
                  <p className="text-purple-100 text-sm">Select your story point estimate</p>
                </div>
                <div className="p-6">
                  <VotingPanel
                    selectedDeck="fibonacci"
                    currentVote={currentVote}
                    hasVoted={hasVoted}
                    isVotingActive={room.isVotingActive}
                    onVote={actions.submitVote}
                  />
                </div>
              </div>
            )}

            {/* Voting Results */}
            {currentStory?.isRevealed && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4">
                  <h3 className="text-white font-semibold text-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Voting Results
                  </h3>
                  <p className="text-amber-100 text-sm">Team estimation results</p>
                </div>
                <div className="p-6">
                  <VotingResults
                    votes={currentStory?.votes || []}
                    participants={room.participants}
                    isRevealed={currentStory.isRevealed}
                  />
                </div>
              </div>
            )}

            {/* No Story State */}
            {!currentStory && (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No Active Story
                </h3>
                <p className="text-gray-600 mb-4">
                  {isOwner 
                    ? "Create a story to start the planning session."
                    : "Waiting for the room owner to create a story."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;