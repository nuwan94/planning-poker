import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { 
  Room, 
  User, 
  Story, 
  Vote, 
  SOCKET_EVENTS 
} from '@planning-poker/shared';
import toast from 'react-hot-toast';

export const useRoom = (roomId: string) => {
  const { socket, isConnected } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentVote, setCurrentVote] = useState<string | null>(null);

  // Initialize user and join room
  useEffect(() => {
    if (!socket || !isConnected) return;

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
    
    // Join the room
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId, user);
    setIsLoading(false);

    return () => {
      if (socket && user) {
        socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId, user.id);
      }
    };
  }, [socket, isConnected, roomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdated = (updatedRoom: Room) => {
      setRoom(updatedRoom);
      // Check if current user has voted in the current story
      if (updatedRoom.currentStory && currentUser) {
        const userVote = updatedRoom.currentStory.votes.find(v => v.userId === currentUser.id);
        setHasVoted(!!userVote);
        setCurrentVote(userVote?.value || null);
      }
    };

    const handleUserJoined = (user: User) => {
      toast.success(`${user.name} joined the room`);
    };

    const handleUserLeft = (userId: string) => {
      const leftUser = room?.participants.find(p => p.id === userId);
      if (leftUser) {
        toast.success(`${leftUser.name} left the room`);
      }
    };

    const handleStartVoting = (story: Story) => {
      setVotes([]);
      setHasVoted(false);
      setCurrentVote(null);
      toast.success(`Voting started for: ${story.title}`);
    };

    const handleVoteSubmitted = (userId: string) => {
      const user = room?.participants.find(p => p.id === userId);
      if (user && user.id !== currentUser?.id) {
        toast.success(`${user.name} voted`);
      }
    };

    const handleVotesRevealed = (revealedVotes: Vote[]) => {
      setVotes(revealedVotes);
      toast.success('Votes revealed!');
    };

    const handleVotesCleared = () => {
      setVotes([]);
      setHasVoted(false);
      setCurrentVote(null);
      toast.success('Votes cleared');
    };

    const handleStoryUpdated = (_story: Story) => {
      toast.success('Story updated');
    };

    const handleError = (message: string) => {
      toast.error(message);
    };

    // Register event listeners
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
    socket.on(SOCKET_EVENTS.START_VOTING, handleStartVoting);
    socket.on(SOCKET_EVENTS.VOTE_SUBMITTED, handleVoteSubmitted);
    socket.on(SOCKET_EVENTS.VOTES_REVEALED, handleVotesRevealed);
    socket.on(SOCKET_EVENTS.VOTES_CLEARED, handleVotesCleared);
    socket.on(SOCKET_EVENTS.STORY_UPDATED, handleStoryUpdated);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
      socket.off(SOCKET_EVENTS.START_VOTING, handleStartVoting);
      socket.off(SOCKET_EVENTS.VOTE_SUBMITTED, handleVoteSubmitted);
      socket.off(SOCKET_EVENTS.VOTES_REVEALED, handleVotesRevealed);
      socket.off(SOCKET_EVENTS.VOTES_CLEARED, handleVotesCleared);
      socket.off(SOCKET_EVENTS.STORY_UPDATED, handleStoryUpdated);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
    };
  }, [socket, room, currentUser]);

  // Actions
  const submitVote = (value: string) => {
    if (!socket || !currentUser || hasVoted) return;

    const vote: Omit<Vote, 'submittedAt'> = {
      userId: currentUser.id,
      value
    };

    socket.emit(SOCKET_EVENTS.SUBMIT_VOTE, vote);
    setHasVoted(true);
    setCurrentVote(value);
    toast.success('Vote submitted');
  };

  const startVoting = (story: Story) => {
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.START_VOTING, story);
  };

  const revealVotes = () => {
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.REVEAL_VOTES);
  };

  const clearVotes = () => {
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.CLEAR_VOTES);
  };

  const updateStory = (storyUpdate: Partial<Story>) => {
    if (!socket) return;
    socket.emit(SOCKET_EVENTS.UPDATE_STORY, storyUpdate);
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
      updateStory
    }
  };
};