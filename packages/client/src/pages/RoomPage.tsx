import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { useSocket } from '../contexts/SocketContext';
import RoomInfo from '../components/RoomInfo';
import ParticipantsList from '../components/ParticipantsList';
import VotingPanel from '../components/VotingPanel';
import StoryControls from '../components/StoryControls';
import VotingResults from '../components/VotingResults';
import { AlertCircle, Loader } from 'lucide-react';

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const {
    room,
    currentUser,
    isLoading,
    votes,
    hasVoted,
    currentVote,
    isConnected,
    actions
  } = useRoom(roomId || '');

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    // Auto-join with stored user name if available
    const storedUserName = localStorage.getItem('planningPokerUserName');
    if (storedUserName && !hasJoined) {
      setUserName(storedUserName);
      handleJoinRoom(storedUserName);
    }
  }, [roomId, navigate, hasJoined]);

  const handleJoinRoom = async (name: string) => {
    if (!name.trim() || !roomId) return;

    setIsJoining(true);
    try {
      await joinRoom({
        id: socket?.id || `user-${Date.now()}`,
        name: name.trim(),
        isSpectator: false
      });
      localStorage.setItem('planningPokerUserName', name.trim());
      setHasJoined(true);
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };

  // Show join form if user hasn't joined yet
  if (!hasJoined && !loading) {
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
  if (loading) {
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
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Room Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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
  const currentStory = room.currentStory;
  const currentVotes = currentStory?.votes || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Planning Poker Session
          </h1>
          <button
            onClick={handleLeaveRoom}
            className="btn btn-outline btn-sm"
          >
            Leave Room
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Room Info & Participants */}
          <div className="lg:col-span-1 space-y-6">
            <RoomInfo room={room} />
            <ParticipantsList
              participants={room.participants}
              votes={currentVotes}
              isVotingActive={room.isVotingActive}
              votesRevealed={currentStory?.isRevealed || false}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Story Controls - Only for room owner */}
            {isOwner && (
              <StoryControls
                currentStory={currentStory}
                isVotingActive={room.isVotingActive}
                votesRevealed={currentStory?.isRevealed || false}
                onCreateStory={createStory}
                onUpdateStory={updateStory}
                onStartVoting={startVoting}
                onRevealVotes={revealVotes}
                onClearVotes={clearVotes}
              />
            )}

            {/* Current Story Display */}
            {currentStory && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {currentStory.title}
                </h2>
                {currentStory.description && (
                  <p className="text-gray-600 mb-4">
                    {currentStory.description}
                  </p>
                )}
                {currentStory.acceptanceCriteria && currentStory.acceptanceCriteria.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Acceptance Criteria:
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {currentStory.acceptanceCriteria.map((criteria, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentStory.finalEstimate && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      Final Estimate: {currentStory.finalEstimate}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Voting Panel */}
            {room.isVotingActive && currentUser && !currentUser.isSpectator && (
              <VotingPanel
                onVote={submitVote}
                userVote={currentVotes.find(v => v.userId === currentUser.id)?.value}
                isVotingActive={room.isVotingActive}
                votesRevealed={currentStory?.isRevealed || false}
              />
            )}

            {/* Voting Results */}
            {currentStory?.isRevealed && (
              <VotingResults
                votes={currentVotes}
                participants={room.participants}
                isRevealed={currentStory.isRevealed}
              />
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