import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { 
  Room, 
  User, 
  Story, 
  Vote, 
  SOCKET_EVENTS 
} from '@planning-poker/shared';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';

export const useRoom = (roomId: string) => {
  const { socket, isConnected } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentVote, setCurrentVote] = useState<string | null>(null);
  const hasJoinedRef = useRef(false);
  const initializingRef = useRef(false);

  // Initialize user and join room
  useEffect(() => {
    console.log('useRoom effect: socket:', !!socket, 'isConnected:', isConnected, 'roomId:', roomId, 'hasJoined:', hasJoinedRef.current);
    
    if (!socket || !isConnected || !roomId || hasJoinedRef.current || initializingRef.current) {
      return;
    }

    // Get user from localStorage or create new one
    const savedUser = localStorage.getItem('planningPokerUser');
    let user: User;
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      user = {
        id: userData.id,
        name: userData.name,
        isSpectator: false
      };
    } else {
      // Redirect to home if no user data
      window.location.href = '/';
      return;
    }

    setCurrentUser(user);
    
    // First try to get room data from API
    const initializeRoom = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        console.log('useRoom: Fetching room data...');
        const roomData = await apiClient.getRoom(roomId);
        console.log('useRoom: Room data received:', roomData);
        if (roomData) {
          setRoom(roomData);
        }
        
        // Join the room via socket
        console.log('useRoom: Emitting JOIN_ROOM event');
        socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId, user);
        hasJoinedRef.current = true;
        console.log('useRoom: Setting isLoading to false');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize room:', error);
        setIsLoading(false);
        toast.error('Failed to load room');
      } finally {
        initializingRef.current = false;
      }
    };

    initializeRoom();

    return () => {
      console.log('useRoom cleanup: hasJoined:', hasJoinedRef.current);
      if (socket && user && hasJoinedRef.current) {
        console.log('useRoom cleanup: Emitting LEAVE_ROOM');
        socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId, user.id);
        hasJoinedRef.current = false;
      }
    };
  }, [socket, isConnected, roomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = (joinedRoom: Room) => {
      console.log('useRoom: ROOM_JOINED event received', joinedRoom);
      setRoom(joinedRoom);
      // Check if current user has voted in the current story
      if (joinedRoom.currentStory && currentUser) {
        const userVote = joinedRoom.currentStory.votes.find(v => v.userId === currentUser.id);
        setHasVoted(!!userVote);
        setCurrentVote(userVote?.value || null);
        setVotes(joinedRoom.currentStory.votes);
      }
      // Only show toast if we haven't shown it before
      if (hasJoinedRef.current) {
        toast.success('Joined room successfully');
      }
    };

    const handleRoomUpdated = (updatedRoom: Room) => {
      console.log('useRoom: ROOM_UPDATED event received', updatedRoom);
      setRoom(updatedRoom);
      // Check if current user has voted in the current story
      if (updatedRoom.currentStory && currentUser) {
        const userVote = updatedRoom.currentStory.votes.find(v => v.userId === currentUser.id);
        setHasVoted(!!userVote);
        setCurrentVote(userVote?.value || null);
        setVotes(updatedRoom.currentStory.votes);
      }
    };

    const handleRoomLeft = () => {
      setRoom(null);
      setCurrentUser(null);
      toast.success('Left room successfully');
    };

    const handleVotingStarted = (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setVotes([]);
      setHasVoted(false);
      setCurrentVote(null);
      if (updatedRoom.currentStory) {
        toast.success(`Voting started for: ${updatedRoom.currentStory.title}`);
      }
    };

    const handleVoteSubmitted = (updatedStory: Story) => {
      if (room) {
        const updatedRoom = { ...room, currentStory: updatedStory };
        setRoom(updatedRoom);
        setVotes(updatedStory.votes);
        
        // Check if current user voted
        if (currentUser) {
          const userVote = updatedStory.votes.find(v => v.userId === currentUser.id);
          if (userVote && userVote.value !== currentVote) {
            setHasVoted(true);
            setCurrentVote(userVote.value);
          }
        }
      }
    };

    const handleVotesRevealed = (revealedStory: Story) => {
      if (room) {
        const updatedRoom = { ...room, currentStory: revealedStory };
        setRoom(updatedRoom);
        setVotes(revealedStory.votes);
        toast.success('Votes revealed!');
      }
    };

    const handleVotesCleared = (clearedStory: Story) => {
      if (room) {
        const updatedRoom = { ...room, currentStory: clearedStory, isVotingActive: false };
        setRoom(updatedRoom);
        setVotes([]);
        setHasVoted(false);
        setCurrentVote(null);
        toast.success('Votes cleared');
      }
    };

    const handleStoryCreated = (newStory: Story) => {
      toast.success(`New story created: ${newStory.title}`);
    };

    const handleStoryUpdated = (updatedStory: Story) => {
      if (room && room.currentStory?.id === updatedStory.id) {
        const updatedRoom = { ...room, currentStory: updatedStory };
        setRoom(updatedRoom);
      }
      toast.success('Story updated');
    };

    const handleFinalEstimateSet = (updatedStory: Story) => {
      if (room && room.currentStory?.id === updatedStory.id) {
        const updatedRoom = { ...room, currentStory: updatedStory };
        setRoom(updatedRoom);
        toast.success(`Final estimate set: ${updatedStory.finalEstimate}`);
      }
    };

    const handleError = (error: { message: string }) => {
      toast.error(error.message || 'An error occurred');
    };

    // Register event listeners
    socket.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    socket.on(SOCKET_EVENTS.ROOM_LEFT, handleRoomLeft);
    socket.on(SOCKET_EVENTS.VOTING_STARTED, handleVotingStarted);
    socket.on(SOCKET_EVENTS.VOTE_SUBMITTED, handleVoteSubmitted);
    socket.on(SOCKET_EVENTS.VOTES_REVEALED, handleVotesRevealed);
    socket.on(SOCKET_EVENTS.VOTES_CLEARED, handleVotesCleared);
    socket.on(SOCKET_EVENTS.STORY_CREATED, handleStoryCreated);
    socket.on(SOCKET_EVENTS.STORY_UPDATED, handleStoryUpdated);
    socket.on(SOCKET_EVENTS.FINAL_ESTIMATE_SET, handleFinalEstimateSet);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
      socket.off(SOCKET_EVENTS.ROOM_LEFT, handleRoomLeft);
      socket.off(SOCKET_EVENTS.VOTING_STARTED, handleVotingStarted);
      socket.off(SOCKET_EVENTS.VOTE_SUBMITTED, handleVoteSubmitted);
      socket.off(SOCKET_EVENTS.VOTES_REVEALED, handleVotesRevealed);
      socket.off(SOCKET_EVENTS.VOTES_CLEARED, handleVotesCleared);
      socket.off(SOCKET_EVENTS.STORY_CREATED, handleStoryCreated);
      socket.off(SOCKET_EVENTS.STORY_UPDATED, handleStoryUpdated);
      socket.off(SOCKET_EVENTS.FINAL_ESTIMATE_SET, handleFinalEstimateSet);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
    };
  }, [socket, room, currentUser, currentVote]);

  // Actions
  const submitVote = async (value: string) => {
    if (!socket || !currentUser || hasVoted || !room?.currentStory) return;

    try {
      const vote = {
        userId: currentUser.id,
        value
      };

      // Submit vote via Socket.IO for real-time updates
      socket.emit(SOCKET_EVENTS.VOTE_SUBMITTED, room.currentStory.id, vote);
      
      setHasVoted(true);
      setCurrentVote(value);
      toast.success('Vote submitted');
    } catch (error) {
      console.error('Failed to submit vote:', error);
      toast.error('Failed to submit vote');
    }
  };

  const startVoting = (story: Story) => {
    if (!socket || !roomId) return;
    socket.emit(SOCKET_EVENTS.VOTING_STARTED, roomId, story.id);
  };

  const revealVotes = () => {
    if (!socket || !roomId || !room?.currentStory) return;
    socket.emit(SOCKET_EVENTS.VOTES_REVEALED, roomId, room.currentStory.id);
  };

  const clearVotes = () => {
    if (!socket || !roomId || !room?.currentStory) return;
    socket.emit(SOCKET_EVENTS.VOTES_CLEARED, roomId, room.currentStory.id);
  };

  const updateStory = (storyUpdate: Partial<Story>) => {
    if (!socket || !room?.currentStory) return;
    socket.emit(SOCKET_EVENTS.STORY_UPDATED, room.currentStory.id, storyUpdate);
  };

  const createStory = async (storyData: { title: string; description?: string; acceptanceCriteria?: string[] }) => {
    if (!socket || !roomId) return;
    
    try {
      socket.emit(SOCKET_EVENTS.STORY_CREATED, roomId, storyData);
    } catch (error) {
      console.error('Failed to create story:', error);
      toast.error('Failed to create story');
    }
  };

  const setFinalEstimate = (estimate: string) => {
    if (!socket || !room?.currentStory) return;
    socket.emit(SOCKET_EVENTS.FINAL_ESTIMATE_SET, room.currentStory.id, estimate);
  };

  return {
    room,
    currentUser,
    isLoading,
    votes,
    hasVoted,
    currentVote,
    isConnected,
    actions: {
      submitVote,
      startVoting,
      revealVotes,
      clearVotes,
      updateStory,
      createStory,
      setFinalEstimate
    }
  };
};