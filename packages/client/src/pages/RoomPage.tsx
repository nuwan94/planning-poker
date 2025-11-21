import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useRoom } from '../hooks/useRoom';
import { useSocket } from '../contexts/SocketContext';
import { Story, Vote, SOCKET_EVENTS, CARD_DECKS, generateId, CardDeck, TimerState, TIMER } from '@planning-poker/shared';
import { Loader, Home, Edit2, Check, X, Crown, Copy, Loader2, Clock, Pause, Play, Square } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import StoryControls from '../components/StoryControls';
import VotingResults from '../components/VotingResults';
import StoryHistory from '../components/StoryHistory';
import Button from '../components/Button';

interface TimerIconButtonProps {
  timer?: TimerState;
  onStart: (duration: number) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isOwner: boolean;
}

const TimerIconButton: React.FC<TimerIconButtonProps> = ({
  timer,
  onStart,
  onPause,
  onResume,
  onStop,
  isOwner
}) => {
  const [showTimerModal, setShowTimerModal] = useState(false);

  if (!isOwner && !timer?.isActive) {
    return null; // Don't show anything for non-owners when no timer is active
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Timer Display/Icon */}
        {timer?.isActive ? (
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-mono font-medium text-slate-700">
              {Math.floor(timer.remaining / 60)}:{(timer.remaining % 60).toString().padStart(2, '0')}
            </span>
            <div className="flex items-center gap-0.5 ml-1">
              {timer.isPaused ? (
                <button
                  onClick={onResume}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                  title="Resume timer"
                >
                  <Play className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                  title="Pause timer"
                >
                  <Pause className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={onStop}
                className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="Stop timer"
              >
                <Square className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          isOwner && (
            <Button
              onClick={() => setShowTimerModal(true)}
              className="flex items-center gap-1.5"
              title="Start timer"
            >
              <Clock className="w-4 h-4" />
              Timer
            </Button>
          )
        )}
      </div>

      {/* Timer Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Start Voting Timer</h3>
              <button
                onClick={() => setShowTimerModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TimerModalContent onStart={onStart} onClose={() => setShowTimerModal(false)} />
          </div>
        </div>
      )}
    </>
  );
};

interface TimerModalContentProps {
  onStart: (duration: number) => void;
  onClose: () => void;
}

const TimerModalContent: React.FC<TimerModalContentProps> = ({ onStart, onClose }) => {
  const [customDuration, setCustomDuration] = useState('');

  const handleStartTimer = (duration: number) => {
    onStart(duration);
    onClose();
  };

  const handleCustomStart = () => {
    const duration = parseInt(customDuration);
    if (duration >= TIMER.MIN_DURATION && duration <= TIMER.MAX_DURATION) {
      handleStartTimer(duration);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset durations */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Start</h4>
        <div className="grid grid-cols-2 gap-2">
          {TIMER.PRESET_DURATIONS.map((preset: any) => (
            <button
              key={preset.value}
              onClick={() => handleStartTimer(preset.value)}
              className="px-4 py-3 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom duration */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Custom Duration</h4>
        <div className="flex gap-2">
          <input
            type="number"
            min={TIMER.MIN_DURATION}
            max={TIMER.MAX_DURATION}
            value={customDuration}
            onChange={(e) => setCustomDuration(e.target.value)}
            placeholder={`${TIMER.MIN_DURATION}-${TIMER.MAX_DURATION} seconds`}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleCustomStart}
            disabled={
              !customDuration ||
              parseInt(customDuration) < TIMER.MIN_DURATION ||
              parseInt(customDuration) > TIMER.MAX_DURATION
            }
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Start
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Enter duration in seconds ({TIMER.MIN_DURATION}-{TIMER.MAX_DURATION})
        </p>
      </div>
    </div>
  );
};

const RoomPage: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const { room, currentUser, isLoading, authRequired, roomExists, isPasswordProtected, joinRoomWithUser } = useRoom(roomId || '');
  const { socket } = useSocket();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Authentication modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Password state for auth modal
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Story and voting state
  const [currentStory, setCurrentStory] = useState<Story | undefined>(room?.currentStory);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [areVotesRevealed, setAreVotesRevealed] = useState(false);
  const [timerState, setTimerState] = useState<TimerState | undefined>(currentStory?.timer);

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

    const handleTimerUpdated = (timer: TimerState) => {
      console.log('[RoomPage] Timer updated:', timer);
      setTimerState(timer);
    };

    const handleTimerComplete = () => {
      console.log('[RoomPage] Timer completed');
      toast.success('Time\'s up!', { icon: '⏰' });
    };

    socket.on(SOCKET_EVENTS.VOTING_STARTED, handleVotingStarted);
    socket.on(SOCKET_EVENTS.VOTE_SUBMITTED, handleVoteSubmitted);
    socket.on(SOCKET_EVENTS.VOTES_REVEALED, handleVotesRevealed);
    socket.on(SOCKET_EVENTS.VOTES_CLEARED, handleVotesCleared);
    socket.on(SOCKET_EVENTS.STORY_UPDATED, handleStoryUpdated);
    socket.on(SOCKET_EVENTS.FINAL_ESTIMATE_SET, handleFinalEstimateSet);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    socket.on(SOCKET_EVENTS.TIMER_UPDATED, handleTimerUpdated);
    socket.on(SOCKET_EVENTS.TIMER_COMPLETE, handleTimerComplete);

    return () => {
      socket.off(SOCKET_EVENTS.VOTING_STARTED, handleVotingStarted);
      socket.off(SOCKET_EVENTS.VOTE_SUBMITTED, handleVoteSubmitted);
      socket.off(SOCKET_EVENTS.VOTES_REVEALED, handleVotesRevealed);
      socket.off(SOCKET_EVENTS.VOTES_CLEARED, handleVotesCleared);
      socket.off(SOCKET_EVENTS.STORY_UPDATED, handleStoryUpdated);
      socket.off(SOCKET_EVENTS.FINAL_ESTIMATE_SET, handleFinalEstimateSet);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
      socket.off(SOCKET_EVENTS.TIMER_UPDATED, handleTimerUpdated);
      socket.off(SOCKET_EVENTS.TIMER_COMPLETE, handleTimerComplete);
    };
  }, [socket, roomId]);

  // Handle authentication requirement
  useEffect(() => {
    if (authRequired) {
      setShowAuthModal(true);
      
      // Pre-fill guest name from saved user data if available
      const savedUser = localStorage.getItem('planningPokerUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData.name && !guestName) {
            setGuestName(userData.name);
          }
        } catch (error) {
          console.warn('Failed to parse saved user data:', error);
        }
      }
    }
  }, [authRequired, guestName]);

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

  const copyRoomUrl = async () => {
    if (!room) return;
    
    const roomUrl = `${window.location.origin}/#/room/${room.id}`;
    
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      toast.success('Room link copied to clipboard!');
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
      toast.success('Room link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateCardDeck = async (deckId: string) => {
    if (!room) return;

    console.log('[RoomPage] Updating card deck:', deckId);
    setIsSaving(true);
    try {
      const updatedRoom = await apiClient.updateRoom(room.id, { cardDeckId: deckId });
      console.log('[RoomPage] Card deck updated:', updatedRoom);
      const deckName = (Object.values(CARD_DECKS) as unknown as CardDeck[]).find(d => d.id === deckId)?.name || deckId;
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

  const handleRemoveUser = (userIdToRemove: string) => {
    if (!socket || !roomId || !currentUser || !isOwner) return;
    console.log('[RoomPage] Removing user:', userIdToRemove, 'from room:', roomId);
    socket.emit(SOCKET_EVENTS.REMOVE_USER, roomId, userIdToRemove, currentUser.id);
  };

  // Timer handlers
  const handleStartTimer = (duration: number) => {
    if (!socket || !roomId) return;
    console.log('[RoomPage] Starting timer:', duration, 'seconds');
    socket.emit(SOCKET_EVENTS.START_TIMER, roomId, duration);
  };

  const handlePauseTimer = () => {
    if (!socket || !roomId) return;
    console.log('[RoomPage] Pausing timer');
    socket.emit(SOCKET_EVENTS.PAUSE_TIMER, roomId);
  };

  const handleResumeTimer = () => {
    if (!socket || !roomId) return;
    console.log('[RoomPage] Resuming timer');
    socket.emit(SOCKET_EVENTS.RESUME_TIMER, roomId);
  };

  const handleStopTimer = () => {
    if (!socket || !roomId) return;
    console.log('[RoomPage] Stopping timer');
    socket.emit(SOCKET_EVENTS.STOP_TIMER, roomId);
  };

  // Authentication handlers
  const handleJoinAsAuthenticated = async () => {
    if (!isAuthenticated || !user || !joinRoomWithUser) return;

    // Check if password is required for authenticated users too
    if (isPasswordProtected) {
      // For authenticated users, we still need password for protected rooms
      // The password should be entered in the modal
      if (!password.trim()) {
        setPasswordError('Password is required for this room');
        return;
      }
    }

    setIsJoining(true);
    setPasswordError(''); // Clear any previous error
    
    try {
      // Try to get username from custom claim first, then fallback to standard claims
      const namespace = 'https://planning-poker.app';
      const customUsername = (user as any)[`${namespace}/username`];
      const displayName = customUsername || (user as any).username || user.nickname || user.name || user.email?.split('@')[0] || user.email || '';

      const userId = user.sub || generateId();
      const finalUserName = displayName;
      const avatarUrl = user.picture || undefined;
      
      const userObj = {
        id: userId,
        name: finalUserName,
        avatarUrl,
        isSpectator: false
      };

      // Save user and password to localStorage
      const userData: any = { ...userObj };
      if (isPasswordProtected && password.trim()) {
        userData.roomPassword = password.trim();
      }
      localStorage.setItem('planningPokerUser', JSON.stringify(userData));

      await joinRoomWithUser(userObj);
      setShowAuthModal(false);
      setPassword('');
    } catch (error) {
      console.error('Join room error:', error);
      setPasswordError('Invalid password. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinAsGuest = async () => {
    if (!guestName.trim() || !joinRoomWithUser) return;
    if (isPasswordProtected && !password.trim()) return;

    setIsJoining(true);
    setPasswordError(''); // Clear any previous error

    try {
      const userId = generateId();
      const finalUserName = guestName.trim();
      
      const userObj = {
        id: userId,
        name: finalUserName,
        avatarUrl: undefined,
        isSpectator: false
      };

      // Save user and password to localStorage
      const userData: any = { ...userObj };
      if (isPasswordProtected && password.trim()) {
        userData.roomPassword = password.trim();
      }
      localStorage.setItem('planningPokerUser', JSON.stringify(userData));

      await joinRoomWithUser(userObj);
      setShowAuthModal(false);
      setGuestName('');
      setPassword('');
    } catch (error) {
      console.error('Join room error:', error);
      // Don't close modal, show error instead
      setPasswordError('Invalid password. Please try again.');
    } finally {
      setIsJoining(false);
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

  if (roomExists === false) {
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
      {room && (
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
                          {(Object.values(CARD_DECKS) as unknown as CardDeck[]).map((deck) => (
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
                        {(Object.values(CARD_DECKS) as unknown as CardDeck[]).find(d => d.id === (room.cardDeckId || 'fibonacci'))?.name || 'Fibonacci'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Timer - Show when there's an active story */}
            {currentStory && (
              <div className="flex items-center">
                <TimerIconButton
                  timer={timerState}
                  onStart={handleStartTimer}
                  onPause={handlePauseTimer}
                  onResume={handleResumeTimer}
                  onStop={handleStopTimer}
                  isOwner={isOwner || false}
                />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <button
                onClick={copyRoomUrl}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
                  copied 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                    : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
                title="Copy room link"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Leave Room</span>
              </button>
            </div>
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
              selectedDeck={room.cardDeckId || 'fibonacci'}
              currentVote={votes.find(v => v.userId === currentUser?.id)?.value || null}
              onVote={handleVote}
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

                    {/* Remove button for room owner (not themselves) */}
                    {room.ownerId === currentUser?.id && !isCurrentUser && (
                      <button
                        onClick={() => handleRemoveUser(participant.id)}
                        className="absolute -top-1 -left-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 ring-2 ring-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title={`Remove ${participant.name} from room`}
                      >
                        <X className="w-3 h-3" />
                      </button>
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
    

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Join Room</h2>
              <p className="text-sm text-gray-600">Choose how you'd like to join this planning poker session</p>
            </div>
            
            <div className="space-y-4">
              {isAuthenticated ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Welcome back! Join as:</p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <img 
                      src={user?.picture} 
                      alt={user?.name} 
                      className="w-8 h-8 rounded-full"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                    <span className="font-medium">{user?.name || user?.email}</span>
                  </div>
                  
                  {isPasswordProtected && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Room Password</label>
                      <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <span className="font-medium">⚠️ Password Required:</span> This room requires a password to join.
                        </p>
                      </div>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter room password"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && password.trim()) {
                            handleJoinAsAuthenticated();
                          }
                        }}
                      />
                      {passwordError && (
                        <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={handleJoinAsAuthenticated}
                    disabled={isJoining || (isPasswordProtected && !password.trim())}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join as Authenticated User'
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => loginWithRedirect({
                      appState: {
                        returnTo: window.location.pathname
                      }
                    })}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    Login to Join
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Continue as Guest</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={50}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && (!isPasswordProtected || password.trim())) {
                          handleJoinAsGuest();
                        }
                      }}
                    />
                  </div>

                  {isPasswordProtected && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Password</label>
                      <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <span className="font-medium">⚠️ Password Required:</span> This room requires a password to join.
                        </p>
                      </div>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter room password"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && guestName.trim() && password.trim()) {
                            handleJoinAsGuest();
                          }
                        }}
                      />
                      {passwordError && (
                        <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={handleJoinAsGuest}
                    disabled={isJoining || !guestName.trim() || (isPasswordProtected && !password.trim())}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join as Guest'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )}
    </div>
  );
};

export default RoomPage;
