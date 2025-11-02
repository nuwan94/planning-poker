import { Server as SocketIOServer, Socket } from 'socket.io';
import { SOCKET_EVENTS, User } from '@planning-poker/shared';
import { roomService } from '../services/roomService';

const userSockets = new Map<string, Socket>();

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (roomId: string, user: User) => {
      try {
        socket.join(roomId);
        userSockets.set(user.id, socket);

        const room = await roomService.addParticipant(roomId, user);
        if (room) {
          // Notify the joining user that they successfully joined
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, room);
          // Notify all users about the updated room state
          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
          console.log(`User ${user.name} joined room ${roomId}`);
        } else {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join room' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
