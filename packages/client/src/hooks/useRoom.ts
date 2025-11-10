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
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  useEffect(() => {
    if (!roomId || !socket || !isConnected) {
      return;
    }

    const handleRoomJoined = (joinedRoom: Room) => {
      setRoom(joinedRoom);
      setIsLoading(false);
      
      // Only show toast if we haven't joined before
      if (!hasJoinedRoom) {
        setHasJoinedRoom(true);
        toast.success(`Joined ${joinedRoom.name}`);
      }
    };

    const handleRoomUpdated = (updatedRoom: Room) => {
      setRoom(updatedRoom);
    };

    const handleError = (error: { message: string; type?: string }) => {
      if (error.type === 'password_required') {
        // Don't show error toast for password required - let the password modal handle it
        console.log('[useRoom] Password required for room access');
      } else {
        toast.error(error.message);
      }
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
        // First check if room exists and get basic info
        const roomData = await apiClient.getRoom(roomId);
        if (!roomData) {
          setRoomExists(false);
          setIsLoading(false);
          return;
        }

        setRoomExists(true);
        setIsPasswordProtected(roomData.isPasswordProtected || false);

        // Check if authentication is required
        const savedUser = localStorage.getItem('planningPokerUser');
        const hasSavedPassword = savedUser ? JSON.parse(savedUser).roomPassword : false;

        if (!savedUser) {
          // No saved user - require authentication
          setAuthRequired(true);
          setIsLoading(false);
          return;
        }

        if (roomData.isPasswordProtected && !hasSavedPassword) {
          // Room requires password but user doesn't have one saved - require authentication
          console.log('[useRoom] Room requires password, showing auth modal');
          setAuthRequired(true);
          setIsLoading(false);
          return;
        }

        // User exists and has required password (or room doesn't need password) - proceed with join
        setAuthRequired(false);

        const userData = JSON.parse(savedUser);
        const user: User = {
          id: userData.id,
          name: userData.name,
          avatarUrl: userData.avatarUrl,
          isSpectator: false
        };
        setCurrentUser(user);

        // Room is not password-protected or we have a saved password, attempt join
        socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId, user, hasSavedPassword || undefined);
      } catch (error) {
        console.error('Failed to load room:', error);
        setRoomExists(false);
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
      
      // Only emit leave room if we have a current user
      if (currentUser) {
        socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomId, currentUser.id);
      }
      
      // Reset join flag when cleaning up
      setHasJoinedRoom(false);
    };
  }, [socket, isConnected, roomId]);

  // Reset join flag when roomId changes
  useEffect(() => {
    setHasJoinedRoom(false);
  }, [roomId]);
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

  const joinRoomWithUser = async (user: User): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected || !roomId) {
        reject(new Error('Socket not connected'));
        return;
      }

      setCurrentUser(user);
      setAuthRequired(false);
      setIsLoading(true);

      // Get password from localStorage
      const savedUser = localStorage.getItem('planningPokerUser');
      const password = savedUser ? JSON.parse(savedUser).roomPassword : undefined;

      const handleRoomJoined = (joinedRoom: Room) => {
        setRoom(joinedRoom);
        setIsLoading(false);
        toast.success(`Joined ${joinedRoom.name}`);
        resolve();
      };

      const handleRoomUpdated = (updatedRoom: Room) => {
        setRoom(updatedRoom);
      };

      const handleError = (error: { message: string; type?: string }) => {
        setIsLoading(false);
        if (error.type === 'password_required') {
          reject(new Error('Invalid password'));
        } else {
          reject(new Error(error.message || 'Failed to join room'));
        }
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

      socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId, user, password);
    });
  };

  return {
    room,
    currentUser,
    isLoading,
    authRequired,
    roomExists,
    isPasswordProtected,
    joinRoomWithUser,
    votes: room?.currentStory?.votes || [],
    hasVoted: false,
    currentVote: undefined,
    actions: {}
  };
};
