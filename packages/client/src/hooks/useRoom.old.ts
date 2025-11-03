import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { 
  Room, 
  User, 
  Story, 
  SOCKET_EVENTS 
} from '@planning-poker/shared';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';

export const useRoom = (roomId: string) => {
  const { socket, isConnected } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Single effect that handles everything
  useEffect(() => {
    // Prevent double execution in StrictMode
    if (!socket || !isConnected || !roomId || hasInitialized.current) {
      return;
    }

    console.log('🚀 useRoom: Initializing room:', roomId);
    hasInitialized.current = true;

    // Get user from localStorage
    const savedUser = localStorage.getItem('planningPokerUser');
    if (!savedUser) {
      console.log('❌ No user found, redirecting');
      window.location.href = '/';
      return;
    }

    const userData = JSON.parse(savedUser);
    const user: User = {
      id: userData.id,
      name: userData.name,
      isSpectator: false
    };
    setCurrentUser(user);
    console.log('👤 Current user set:', user.name);

    // Set up socket event listeners SYNCHRONOUSLY (these will persist through the effect)
    console.log('🎧 Registering socket event listeners');

    const handleRoomJoined = (joinedRoom: Room) => {
      console.log('✅ ROOM_JOINED received:', joinedRoom.name);
      setRoom(joinedRoom);
      setIsLoading(false);
      toast.success('Joined room successfully');
    };

    const handleRoomUpdated = (updatedRoom: Room) => {
      console.log('✅ ROOM_UPDATED received:', updatedRoom.name);
      setRoom(updatedRoom);
    };

    const handleError = (error: { message: string }) => {
      console.log('❌ ERROR received:', error.message);
      toast.error(error.message);
      setIsLoading(false);
    };

    // Register listeners BEFORE any async operations
    socket.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    socket.on(SOCKET_EVENTS.ERROR, handleError);
    console.log('✅ Socket listeners registered');

    // Initialize room (async operation happens AFTER listeners are registered)
    const initialize = async () => {
      try {
        console.log('📡 Fetching room from API');
        const roomData = await apiClient.getRoom(roomId);
        if (roomData) {
          setRoom(roomData);
          console.log('✅ Room data loaded from API');
        }

        // Join via socket
        console.log('� Emitting JOIN_ROOM');
        socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId, user);
        console.log('✅ JOIN_ROOM emitted');
      } catch (error) {
        console.error('❌ Failed to initialize:', error);
        toast.error('Failed to load room');
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup function
    return () => {
      console.log('🧹 useRoom: Cleanup');
      socket.off(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
      
      if (hasInitialized.current) {
        console.log('� Emitting LEAVE_ROOM');
        socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId, user.id);
        hasInitialized.current = false;
      }
    };
  }, [socket, isConnected, roomId]);

  // Action methods
  const submitVote = async (value: string) => {
    if (!socket || !currentUser || !room?.currentStory) return;

    try {
      const vote = {
        userId: currentUser.id,
        value
      };

      socket.emit(SOCKET_EVENTS.VOTE_SUBMITTED, room.currentStory.id, vote);
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