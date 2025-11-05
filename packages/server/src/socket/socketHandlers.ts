import { Server as SocketIOServer, Socket } from 'socket.io';
import { SOCKET_EVENTS, User, Vote } from '@planning-poker/shared';
import { roomService } from '../services/roomService';
import { storyService } from '../services/storyService';

const userSockets = new Map<string, Socket>();
const disconnectTimeouts = new Map<string, NodeJS.Timeout>();
const userRooms = new Map<string, string>();

export const setupSocketHandlers = (io: SocketIOServer) => {
  console.log('[Socket] Setting up Socket.IO handlers');
  
  io.on('connection', (socket: Socket) => {
    console.log('[Socket] New client connected:', socket.id);

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (roomId: string, user: User) => {
      console.log(`[Socket] JOIN_ROOM: user ${user.name} joining room ${roomId}`);
      
      try {
        // Clear any existing disconnect timeout for this user
        if (disconnectTimeouts.has(user.id)) {
          clearTimeout(disconnectTimeouts.get(user.id)!);
          disconnectTimeouts.delete(user.id);
          console.log(`[Socket] Cleared disconnect timeout for reconnected user ${user.id}`);
        }
        // Check if user is already in the room
        const rooms = Array.from(socket.rooms);
        
        if (rooms.includes(roomId)) {
          console.log(`[Socket] User already in room ${roomId}, sending existing room data`);
          const room = await roomService.getRoomById(roomId);
          if (room) {
            socket.emit(SOCKET_EVENTS.ROOM_JOINED, room);
            console.log(`[Socket] ROOM_JOINED emitted to ${socket.id}`);
          } else {
            console.log(`[Socket] Room ${roomId} not found`);
            socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
          }
          return;
        }

        // Join the socket room
        socket.join(roomId);
        console.log(`[Socket] Socket ${socket.id} joined room ${roomId}`);
        
        // Store user socket mapping
        userSockets.set(user.id, socket);

        // Store user room mapping
        userRooms.set(user.id, roomId);

        // Add participant to room in database
        const room = await roomService.addParticipant(roomId, user);
        
        if (room) {
          console.log(`[Socket] User ${user.name} added to room ${room.name} (${room.participants.length} participants)`);
          
          // Emit to the joining user
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, room);
          console.log(`[Socket] ROOM_JOINED emitted to ${socket.id}`);
          
          // Notify all users in the room about the update
          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
          console.log(`[Socket] ROOM_UPDATED broadcasted to room ${roomId}`);
        } else {
          console.log(`[Socket] Room ${roomId} not found in database`);
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
        }
      } catch (error) {
        console.error('[Socket] Error in JOIN_ROOM:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join room' });
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (roomId: string, userId: string) => {
      console.log(`[Socket] LEAVE_ROOM: user ${userId} leaving room ${roomId}`);
      
      try {
        socket.leave(roomId);
        userSockets.delete(userId);
        userRooms.delete(userId);

        const room = await roomService.removeParticipant(roomId, userId);
        
        if (room) {
          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
          console.log(`[Socket] User ${userId} removed from room ${roomId}`);
        }
      } catch (error) {
        console.error('[Socket] Error in LEAVE_ROOM:', error);
      }
    });

    socket.on(SOCKET_EVENTS.REMOVE_USER, async (roomId: string, userIdToRemove: string, requestingUserId: string) => {
      console.log(`[Socket] REMOVE_USER: ${requestingUserId} requesting to remove ${userIdToRemove} from room ${roomId}`);
      
      try {
        // Check if the requesting user is the room owner
        const room = await roomService.getRoomById(roomId);
        if (!room) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
          return;
        }

        if (room.ownerId !== requestingUserId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only room owner can remove users' });
          return;
        }

        // Cannot remove yourself
        if (userIdToRemove === requestingUserId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Cannot remove yourself from the room' });
          return;
        }

        // Remove the user from the room
        const updatedRoom = await roomService.removeParticipant(roomId, userIdToRemove);
        
        if (updatedRoom) {
          // Clear any disconnect timeout for this user
          if (disconnectTimeouts.has(userIdToRemove)) {
            clearTimeout(disconnectTimeouts.get(userIdToRemove)!);
            disconnectTimeouts.delete(userIdToRemove);
            console.log(`[Socket] Cleared disconnect timeout for manually removed user ${userIdToRemove}`);
          }

          // Disconnect the user's socket if they're connected
          const userSocket = userSockets.get(userIdToRemove);
          if (userSocket) {
            userSocket.leave(roomId);
            userSockets.delete(userIdToRemove);
            userRooms.delete(userIdToRemove);
            console.log(`[Socket] Disconnected socket for removed user ${userIdToRemove}`);
          }

          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, updatedRoom);
          console.log(`[Socket] User ${userIdToRemove} removed from room ${roomId} by owner ${requestingUserId}`);
        }
      } catch (error) {
        console.error('[Socket] Error in REMOVE_USER:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to remove user' });
      }
    });

    socket.on(SOCKET_EVENTS.VOTING_STARTED, async (roomId: string, storyId: string) => {
      console.log(`[Socket] VOTING_STARTED: story ${storyId} in room ${roomId}`);
      
      try {
        await roomService.setVotingActive(roomId, true);
        await roomService.setCurrentStory(roomId, storyId);
        
        const story = await storyService.getStoryById(storyId);
        if (story) {
          io.to(roomId).emit(SOCKET_EVENTS.VOTING_STARTED, story);
          console.log(`[Socket] Voting started for story ${storyId}, broadcasted to room`);
          
          // Also broadcast room update to sync all participants
          const room = await roomService.getRoomById(roomId);
          if (room) {
            io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
            console.log(`[Socket] Room updated broadcasted after voting started`);
          }
        }
      } catch (error) {
        console.error('[Socket] Error in VOTING_STARTED:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to start voting' });
      }
    });

    socket.on(SOCKET_EVENTS.VOTE_SUBMITTED, async (storyId: string, vote: Vote) => {
      console.log(`[Socket] VOTE_SUBMITTED: user ${vote.userId} voting ${vote.value} on story ${storyId}`);
      
      try {
        const storyDoc = await storyService.getStoryDocument(storyId);
        if (!storyDoc) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Story not found' });
          return;
        }

        const story = await storyService.addVote(storyId, vote);
        if (story) {
          io.to(storyDoc.roomId).emit(SOCKET_EVENTS.VOTE_SUBMITTED, story);
          console.log(`[Socket] Vote submitted for story ${storyId}`);
        }
      } catch (error) {
        console.error('[Socket] Error in VOTE_SUBMITTED:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to submit vote' });
      }
    });

    socket.on(SOCKET_EVENTS.VOTES_REVEALED, async (roomId: string, storyId: string) => {
      console.log(`[Socket] VOTES_REVEALED: story ${storyId} in room ${roomId}`);
      
      try {
        const story = await storyService.revealVotes(storyId);
        if (story) {
          io.to(roomId).emit(SOCKET_EVENTS.VOTES_REVEALED, story);
          console.log(`[Socket] Votes revealed for story ${storyId}`);
        }
      } catch (error) {
        console.error('[Socket] Error in VOTES_REVEALED:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to reveal votes' });
      }
    });

    socket.on(SOCKET_EVENTS.VOTES_CLEARED, async (roomId: string, storyId: string) => {
      console.log(`[Socket] VOTES_CLEARED (Revote): story ${storyId} in room ${roomId}`);
      
      try {
        const story = await storyService.clearVotes(storyId);
        if (story) {
          io.to(roomId).emit(SOCKET_EVENTS.VOTES_CLEARED, story);
          console.log(`[Socket] Votes cleared (Revote) for story ${storyId} - final estimate removed`);
          
          // Broadcast room update to refresh story history since final estimate was removed
          const room = await roomService.getRoomById(roomId);
          if (room) {
            io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
            console.log(`[Socket] Room updated broadcasted after revote`);
          }
        }
      } catch (error) {
        console.error('[Socket] Error in VOTES_CLEARED:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to clear votes' });
      }
    });

    socket.on(SOCKET_EVENTS.STORY_CREATED, async (roomId: string, story: any) => {
      console.log(`[Socket] STORY_CREATED: ${story.title} in room ${roomId}`);
      
      try {
        io.to(roomId).emit(SOCKET_EVENTS.STORY_CREATED, story);
      } catch (error) {
        console.error('[Socket] Error in STORY_CREATED:', error);
      }
    });

    socket.on(SOCKET_EVENTS.STORY_UPDATED, async (storyId: string, updates: any) => {
      console.log(`[Socket] STORY_UPDATED: story ${storyId}`);
      
      try {
        const story = await storyService.updateStory(storyId, updates);
        if (story) {
          const storyDoc = await storyService.getStoryDocument(storyId);
          if (storyDoc) {
            io.to(storyDoc.roomId).emit(SOCKET_EVENTS.STORY_UPDATED, story);
            console.log(`[Socket] Story ${storyId} updated`);
          }
        }
      } catch (error) {
        console.error('[Socket] Error in STORY_UPDATED:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to update story' });
      }
    });

    socket.on(SOCKET_EVENTS.FINAL_ESTIMATE_SET, async (roomId: string, storyId: string, estimate: string) => {
      console.log(`[Socket] FINAL_ESTIMATE_SET: ${estimate} for story ${storyId}`);
      
      try {
        const story = await storyService.setFinalEstimate(storyId, estimate);
        if (story) {
          io.to(roomId).emit(SOCKET_EVENTS.FINAL_ESTIMATE_SET, story);
          console.log(`[Socket] Final estimate set for story ${storyId}`);
          
          // Broadcast room update to refresh story history for all participants
          const room = await roomService.getRoomById(roomId);
          if (room) {
            io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
            console.log(`[Socket] Room updated broadcasted with new story history`);
          }
        }
      } catch (error: any) {
        console.error('[Socket] Error in FINAL_ESTIMATE_SET:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message || 'Failed to set final estimate' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id}, reason: ${reason}`);
      
      // Find the user ID for this socket
      let disconnectedUserId: string | null = null;
      for (const [userId, userSocket] of userSockets.entries()) {
        if (userSocket.id === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        // Get the room ID for this user
        const roomId = userRooms.get(disconnectedUserId);
        
        // Clean up user socket and room mapping
        userSockets.delete(disconnectedUserId);
        userRooms.delete(disconnectedUserId);
        console.log(`[Socket] Removed user ${disconnectedUserId} from socket and room mapping`);

        // Set timeout to remove user from room after 30 seconds
        const timeout = setTimeout(async () => {
          console.log(`[Socket] Removing disconnected user ${disconnectedUserId} from room after timeout`);
          
          if (roomId) {
            try {
              const updatedRoom = await roomService.removeParticipant(roomId, disconnectedUserId!);
              if (updatedRoom) {
                io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, updatedRoom);
                console.log(`[Socket] User ${disconnectedUserId} removed from room ${roomId} due to disconnect timeout`);
              }
            } catch (error) {
              console.error(`[Socket] Error removing user ${disconnectedUserId} from room ${roomId}:`, error);
            }
          }
          
          disconnectTimeouts.delete(disconnectedUserId);
        }, 30000); // 30 seconds

        disconnectTimeouts.set(disconnectedUserId, timeout);
        console.log(`[Socket] Set disconnect timeout for user ${disconnectedUserId}`);
      }
    });
  });
};
