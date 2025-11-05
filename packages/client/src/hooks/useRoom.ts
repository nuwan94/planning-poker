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

    const handleUserStatusUpdate = (data: { userId: string; status: 'online' | 'reconnecting' | 'offline' }) => {
      setRoom(prevRoom => {
        if (!prevRoom) return prevRoom;
        
        const updatedParticipants = prevRoom.participants.map(participant => {
          if (participant.id === data.userId) {
            return { ...participant, status: data.status };
          }
          return participant;
        });
        
        return { ...prevRoom, participants: updatedParticipants };
      });
    };

    socket.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    socket.on(SOCKET_EVENTS.ERROR, handleError);
    socket.on(SOCKET_EVENTS.USER_STATUS_UPDATE, handleUserStatusUpdate);

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

    // Debug: Log all USER_STATUS_UPDATE events
    socket.on(SOCKET_EVENTS.USER_STATUS_UPDATE, (data) => {
      console.log(`[useRoom] DEBUG: USER_STATUS_UPDATE received:`, data);
    });

    // Debug: Log heartbeat acknowledgments
    socket.on('heartbeat_ack', (data) => {
      console.log(`[useRoom] Heartbeat acknowledged:`, data);
    });

    initialize();

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
      socket.off(SOCKET_EVENTS.ERROR, handleError);
      socket.off(SOCKET_EVENTS.USER_STATUS_UPDATE, handleUserStatusUpdate);
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId, user.id);
    };
  }, [socket, isConnected, roomId]);

  // Send periodic heartbeats to indicate user is active
  useEffect(() => {
    if (!currentUser || !socket || !isConnected) {
      return;
    }

    const heartbeatInterval = setInterval(() => {
      console.log(`[useRoom] Sending heartbeat for user ${currentUser.id}`);
      console.log(`[useRoom] Socket connected: ${socket.connected}, isConnected: ${isConnected}`);
      socket.emit(SOCKET_EVENTS.HEARTBEAT, currentUser.id, (ack: any) => {
        console.log(`[useRoom] Heartbeat acknowledged:`, ack);
      });
      console.log(`[useRoom] Heartbeat emitted`);
    }, 25000); // Send heartbeat every 25 seconds

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [currentUser, socket, isConnected]);

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

    const handleUserStatusUpdate = (data: { userId: string; status: 'online' | 'reconnecting' | 'offline' }) => {
      setRoom(prevRoom => {
        if (!prevRoom) return prevRoom;
        
        const updatedParticipants = prevRoom.participants.map(participant => {
          if (participant.id === data.userId) {
            return { ...participant, status: data.status };
          }
          return participant;
        });
        
        return { ...prevRoom, participants: updatedParticipants };
      });
    };

    socket.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdated);
    socket.on(SOCKET_EVENTS.ERROR, handleError);
    socket.on(SOCKET_EVENTS.USER_STATUS_UPDATE, handleUserStatusUpdate);

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
