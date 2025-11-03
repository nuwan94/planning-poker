import { Server as SocketIOServer, Socket } from 'socket.io';
import { SOCKET_EVENTS, User, Vote } from '@planning-poker/shared';
import { roomService } from '../services/roomService';
import { storyService } from '../services/storyService';

const userSockets = new Map<string, Socket>();

export const setupSocketHandlers = (io: SocketIOServer) => {
  console.log('[Socket] Setting up Socket.IO handlers');
  
  io.on('connection', (socket: Socket) => {
    console.log('[Socket] New client connected:', socket.id);

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (roomId: string, user: User) => {
      console.log(`[Socket] JOIN_ROOM: user ${user.name} joining room ${roomId}`);
      
      try {
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

        const room = await roomService.removeParticipant(roomId, userId);
        
        if (room) {
          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
          console.log(`[Socket] User ${userId} removed from room ${roomId}`);
        }
      } catch (error) {
        console.error('[Socket] Error in LEAVE_ROOM:', error);
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
      
      // Clean up user socket mapping
      for (const [userId, userSocket] of userSockets.entries()) {
        if (userSocket.id === socket.id) {
          userSockets.delete(userId);
          console.log(`[Socket] Removed user ${userId} from socket mapping`);
          break;
        }
      }
    });
  });
};
