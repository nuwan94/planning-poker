import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { useSocket } from '../contexts/SocketContext';
import { Story, Vote, SOCKET_EVENTS, CARD_DECKS } from '@planning-poker/shared';
import { Loader, Home, Edit2, Check, X, Crown } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import StoryControls from '../components/StoryControls';
import VotingPanel from '../components/VotingPanel';
import VotingResults from '../components/VotingResults';
import StoryHistory from '../components/StoryHistory';

const RoomPage: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { room, currentUser, isLoading } = useRoom(roomId || '');
  const { socket } = useSocket();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  
  // Story and voting state
  const [currentStory, setCurrentStory] = useState<Story | undefined>(room?.currentStory);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [areVotesRevealed, setAreVotesRevealed] = useState(false);

  // Debug: Log room data to verify avatarUrl is present
  useEffect(() => {
    if (room) {
      console.log('Room participants with avatars:', room.participants.map(p => ({
        name: p.name,
        hasAvatar: !!p.avatarUrl,
        avatarUrl: p.avatarUrl
      })));
      
      // Update current story when room changes
      if (room.currentStory) {
        console.log('[RoomPage] Current story found:', room.currentStory);
        setCurrentStory(room.currentStory);
        setVotes(room.currentStory.votes || []);
        setAreVotesRevealed(room.currentStory.isRevealed || false);
        // Set voting active if there's a story and votes aren't revealed
        setIsVotingActive(!room.currentStory.isRevealed);
        console.log('[RoomPage] Voting active:', !room.currentStory.isRevealed);
      } else {
        console.log('[RoomPage] No current story');
        setCurrentStory(undefined);
        setVotes([]);
        setIsVotingActive(false);
        setAreVotesRevealed(false);
      }
    }
  }, [room]);

  // Socket handlers for story events
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleVotingStarted = (story: Story) => {
      console.log('[RoomPage] Voting started for story:', story);
      setCurrentStory(story);
      setVotes(story.votes || []);
      setIsVotingActive(true);
      setAreVotesRevealed(false);
      toast.success(`Voting started for: ${story.title}`);
    };

    const handleVoteSubmitted = (updatedStory: Story) => {
      console.log('[RoomPage] Vote submitted, updated story:', updatedStory);
      setVotes(updatedStory.votes || []);
    };

    const handleVotesRevealed = (story: Story) => {
      console.log('[RoomPage] Votes revealed:', story);
      setVotes(story.votes || []);
      setAreVotesRevealed(true);
      toast.success('Votes revealed!');
    };

    const handleVotesCleared = (story: Story) => {
      console.log('[RoomPage] Votes cleared (Revote):', story);
      setCurrentStory(story); // Update story to clear final estimate
      setVotes([]);
      setAreVotesRevealed(false);
      setIsVotingActive(true);
      toast.success('Ready to revote!');
    };

    const handleStoryUpdated = (story: Story) => {
      console.log('[RoomPage] Story updated:', story);
      setCurrentStory(story);
      // Also update votes if they exist in the updated story
      if (story.votes) {
        setVotes(story.votes);
      } else {
        setVotes([]);
      }
      // Update revealed state if it changed
      if (story.isRevealed !== undefined) {
        setAreVotesRevealed(story.isRevealed);
      }
    };

    const handleFinalEstimateSet = (story: Story) => {
      console.log('[RoomPage] Final estimate set:', story);
      setCurrentStory(story);
      toast.success(`Final estimate set: ${story.finalEstimate}`);
    };

    const handleRoomUpdated = () => {
      console.log('[RoomPage] Room updated event received, room data will be refreshed automatically');
      // The useRoom hook already handles ROOM_UPDATED and updates the room state
      // This handler is just for logging purposes
    };

    socket.on(SOCKET_EVENTS.VOTING_STARTED, handleVotingStarted);
    socket.on(SOCKET_EVENTS.VOTE_SUBMITTED, handleVoteSubmitted);
    socket.on(SOCKET_EVENTS.VOTES_REVEALED, handleVotesRevealed);
    socket.on(SOCKET_EVENTS.VOTES_CLEARED, handleVotesCleared);
    socket.on(SOCKET_EVENTS.STORY_UPDATED, handleStoryUpdated);
    socket.on(SOCKET_EVENTS.FINAL_ESTIMATE_SET, handleFinalEstimateSet);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.VOTING_STARTED, handleVotingStarted);
      socket.off(SOCKET_EVENTS.VOTE_SUBMITTED, handleVoteSubmitted);
      socket.off(SOCKET_EVENTS.VOTES_REVEALED, handleVotesRevealed);
      socket.off(SOCKET_EVENTS.VOTES_CLEARED, handleVotesCleared);
      socket.off(SOCKET_EVENTS.STORY_UPDATED, handleStoryUpdated);
      socket.off(SOCKET_EVENTS.FINAL_ESTIMATE_SET, handleFinalEstimateSet);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    };
  }, [socket, roomId]);

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

  const handleUpdateCardDeck = async (deckId: string) => {
    if (!room) return;

    console.log('[RoomPage] Updating card deck:', deckId);
    setIsSaving(true);
    try {
      const updatedRoom = await apiClient.updateRoom(room.id, { cardDeckId: deckId });
      console.log('[RoomPage] Card deck updated:', updatedRoom);
      const deckName = Object.values(CARD_DECKS).find(d => d.id === deckId)?.name || deckId;
      toast.success(`Card deck changed to ${deckName}`);
      setIsEditingDeck(false);
      // The room will be updated via socket broadcast from server
    } catch (error) {
      console.error('[RoomPage] Failed to update card deck:', error);
      toast.error('Failed to update card deck');
    } finally {
      setIsSaving(false);
    }
  };

  // Story handlers
  const handleStartVoting = async (story: Story) => {
    if (!socket || !roomId) return;
    
    try {
      // Create story via API
      const createdStory = await apiClient.createStory({
        title: story.title,
        description: story.description,
        roomId
      });
      
      // Start voting via socket
      socket.emit(SOCKET_EVENTS.VOTING_STARTED, roomId, createdStory.id);
    } catch (error) {
      console.error('Failed to start voting:', error);
      toast.error('Failed to start voting');
    }
  };

  const handleRevealVotes = () => {
    if (!socket || !currentStory || !roomId) return;
    console.log('[RoomPage] Revealing votes for story:', currentStory.id, 'in room:', roomId);
    socket.emit(SOCKET_EVENTS.VOTES_REVEALED, roomId, currentStory.id);
  };

  const handleClearVotes = () => {
    if (!socket || !currentStory || !roomId) return;
    console.log('[RoomPage] Clearing votes for story:', currentStory.id, 'in room:', roomId);
    socket.emit(SOCKET_EVENTS.VOTES_CLEARED, roomId, currentStory.id);
  };

  const handleUpdateStory = async (storyUpdate: Partial<Story>) => {
    if (!currentStory) return;
    
    try {
      const updatedStory = await apiClient.updateStory(currentStory.id, storyUpdate);
      if (socket && updatedStory) {
        // Emit the complete updated story to all participants
        socket.emit(SOCKET_EVENTS.STORY_UPDATED, currentStory.id, storyUpdate);
        // Update local state immediately for owner
        setCurrentStory(updatedStory);
      }
      toast.success('Story updated');
    } catch (error) {
      console.error('Failed to update story:', error);
      toast.error('Failed to update story');
    }
  };

  const handleVote = (value: string) => {
    if (!socket || !currentStory || !currentUser) return;
    
    const vote: Vote = {
      userId: currentUser.id,
      value,
      submittedAt: new Date()
    };
    
    socket.emit(SOCKET_EVENTS.VOTE_SUBMITTED, currentStory.id, vote);
  };

  const handleSetFinalEstimate = (estimate: string) => {
    if (!socket || !currentStory || !roomId) return;
    console.log('[RoomPage] Setting final estimate:', estimate, 'for story:', currentStory.id);
    socket.emit(SOCKET_EVENTS.FINAL_ESTIMATE_SET, roomId, currentStory.id, estimate);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none px-2 py-1 w-full md:w-auto"
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
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-colors"
                    title="Save"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
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
              <div className="flex items-center gap-4 mt-2">
                <p className="text-slate-600 text-sm">Room ID: <span className="font-mono font-semibold">{room.id}</span></p>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-sm">Deck:</span>
                    {isEditingDeck ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={room.cardDeckId || 'fibonacci'}
                          onChange={(e) => handleUpdateCardDeck(e.target.value)}
                          disabled={isSaving}
                          className="text-sm border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
                        >
                          {Object.values(CARD_DECKS).map((deck) => (
                            <option key={deck.id} value={deck.id}>
                              {deck.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setIsEditingDeck(false)}
                          disabled={isSaving}
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingDeck(true)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        title="Change deck"
                      >
                        {Object.values(CARD_DECKS).find(d => d.id === (room.cardDeckId || 'fibonacci'))?.name || 'Fibonacci'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Leave Room
            </button>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Story & Voting (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Story Controls */}
            <StoryControls
              currentStory={currentStory}
              isVotingActive={isVotingActive}
              areVotesRevealed={areVotesRevealed}
              canRevealVotes={votes.length > 0 && !areVotesRevealed}
              isRoomOwner={isOwner || false}
              onStartVoting={handleStartVoting}
              onRevealVotes={handleRevealVotes}
              onClearVotes={handleClearVotes}
              onUpdateStory={handleUpdateStory}
            />
            
            {/* Voting Results */}
            {areVotesRevealed && votes.length > 0 && (
              <VotingResults
                votes={votes}
                participants={room.participants}
                isRevealed={areVotesRevealed}
                isRoomOwner={isOwner || false}
                finalEstimate={currentStory?.finalEstimate}
                cardDeckId={room.cardDeckId}
                onSetFinalEstimate={handleSetFinalEstimate}
              />
            )}

            {/* Story History */}
            {room.storyHistory && room.storyHistory.length > 0 && (
              <StoryHistory stories={room.storyHistory} />
            )}
          </div>

          {/* Right Column - Participants & Voting Panel (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Participants Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Team</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {room.participants.length} {room.participants.length === 1 ? 'person' : 'people'}
                </span>
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

            {/* Voting Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {currentStory ? (
                <VotingPanel
                  selectedDeck={room.cardDeckId || 'fibonacci'}
                  currentVote={votes.find(v => v.userId === currentUser?.id)?.value || null}
                  hasVoted={votes.some(v => v.userId === currentUser?.id)}
                  isVotingActive={isVotingActive && !areVotesRevealed}
                  onVote={handleVote}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">Waiting for story...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
