import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Room, User, SOCKET_EVENTS } from '@planning-poker/shared';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';

export const useRoom = (roomId: string) => {
  const { socket, isConnected } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    if (!roomId || !socket || !isConnected) {
      return;
    }

    const savedUser = localStorage.getItem('planningPokerUser');
    if (!savedUser) {
      setAuthRequired(true);
      setIsLoading(false);
      return;
    }

    setAuthRequired(false);

    const userData = JSON.parse(savedUser);
    const user: User = {
      id: userData.id,
      name: userData.name,
      avatarUrl: userData.avatarUrl,
      isSpectator: false
    };
    setCurrentUser(user);

    const handleRoomJoined = (joinedRoom: Room) => {
      setRoom(joinedRoom);
      setIsLoading(false);
      toast.success(`Joined ${joinedRoom.name}`);
    };

    const handleRoomUpdated = (updatedRoom: Room) => {
      setRoom(updatedRoom);
    };

    const handleError = (error: { message: string }) => {
      toast.error(error.message);
      setIsLoading(false);
    };

    socket.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    const initialize = async () => {
      try {
        const roomData = await apiClient.getRoom(roomId);
        if (roomData) {
          setRoom(roomData);
        }
        socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId, user);
      } catch (error) {
        console.error('Failed to load room:', error);
        toast.error('Room not found');
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId, user.id);
    };
  }, [socket, isConnected, roomId]);

  const joinRoomWithUser = async (user: User) => {
    if (!socket || !isConnected || !roomId) return;

    setCurrentUser(user);
    setAuthRequired(false);
    setIsLoading(true);

    const handleRoomJoined = (joinedRoom: Room) => {
      setRoom(joinedRoom);
      setIsLoading(false);
      toast.success(`Joined ${joinedRoom.name}`);
    };

    const handleRoomUpdated = (updatedRoom: Room) => {
      setRoom(updatedRoom);
    };

    const handleError = (error: { message: string }) => {
      toast.error(error.message);
      setIsLoading(false);
    };

    socket.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    socket.on(SOCKET_EVENTS.ERROR, handleError);

    try {
      const roomData = await apiClient.getRoom(roomId);
      if (roomData) {
        setRoom(roomData);
      }
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId, user);
    } catch (error) {
      console.error('Failed to load room:', error);
      toast.error('Room not found');
      setIsLoading(false);
    }
  };

  return {
    room,
    currentUser,
    isLoading,
    authRequired,
    joinRoomWithUser,
    votes: room?.currentStory?.votes || [],
    hasVoted: false,
    currentVote: undefined,
    actions: {}
  };
};
