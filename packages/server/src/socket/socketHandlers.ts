import { Server as SocketIOServer, Socket } from 'socket.io';
import { SOCKET_EVENTS, User, Vote } from '@planning-poker/shared';
import { roomService } from '../services/roomService';
import { storyService } from '../services/storyService';

const userSockets = new Map<string, Socket>();

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (roomId: string, user: User) => {
      try {
        console.log(`JOIN_ROOM event: user ${user.name} (${user.id}) joining room ${roomId}`);
        
        // Check if user is already in the room
        const rooms = Array.from(socket.rooms);
        if (rooms.includes(roomId)) {
          console.log(`User ${user.name} is already in room ${roomId}, skipping join`);
          // Still send room data in case they need it
          const room = await roomService.getRoomById(roomId);
          if (room) {
            socket.emit(SOCKET_EVENTS.ROOM_JOINED, room);
          }
          return;
        }

        socket.join(roomId);
        userSockets.set(user.id, socket);

        const room = await roomService.addParticipant(roomId, user);
        if (room) {
          // Notify the joining user that they successfully joined
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, room);
          // Notify all users about the updated room state
          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
          console.log(`User ${user.name} successfully joined room ${roomId}`);
        } else {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join room' });
      }
    });

    socket.on(SOCKET_EVENTS.VOTING_STARTED, async (roomId: string, storyId: string) => {
      try {
        console.log(`VOTING_STARTED event: story ${storyId} in room ${roomId}`);
        
        // Set room voting active and current story
        await roomService.setVotingActive(roomId, true);
        await roomService.setCurrentStory(roomId, storyId);
        
        const room = await roomService.getRoomById(roomId);
        if (room) {
          io.to(roomId).emit(SOCKET_EVENTS.VOTING_STARTED, room);
          console.log(`Voting started for story ${storyId} in room ${roomId}`);
        }
      } catch (error) {
        console.error('Error starting voting:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to start voting' });
      }
    });

    socket.on(SOCKET_EVENTS.VOTE_SUBMITTED, async (storyId: string, vote: Vote) => {
      try {
        console.log(`VOTE_SUBMITTED event: user ${vote.userId} voting ${vote.value} on story ${storyId}`);
        
        // Get the story document to access roomId
        const storyDoc = await storyService.getStoryDocument(storyId);
        if (!storyDoc) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Story not found' });
          return;
        }

        const story = await storyService.addVote(storyId, vote);
        if (story) {
          io.to(storyDoc.roomId).emit(SOCKET_EVENTS.VOTE_SUBMITTED, story);
          console.log(`Vote submitted for story ${storyId}`);
        }
      } catch (error) {
        console.error('Error submitting vote:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to submit vote' });
      }
    });

    socket.on(SOCKET_EVENTS.VOTES_REVEALED, async (roomId: string, storyId: string) => {
      try {
        console.log(`VOTES_REVEALED event: story ${storyId} in room ${roomId}`);
        
        const story = await storyService.revealVotes(storyId);
        if (story) {
          io.to(roomId).emit(SOCKET_EVENTS.VOTES_REVEALED, story);
          console.log(`Votes revealed for story ${storyId}`);
        }
      } catch (error) {
        console.error('Error revealing votes:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to reveal votes' });
      }
    });

    socket.on(SOCKET_EVENTS.VOTES_CLEARED, async (roomId: string, storyId: string) => {
      try {
        console.log(`VOTES_CLEARED event: story ${storyId} in room ${roomId}`);
        
        const story = await storyService.clearVotes(storyId);
        if (story) {
          io.to(roomId).emit(SOCKET_EVENTS.VOTES_CLEARED, story);
          console.log(`Votes cleared for story ${storyId}`);
        }
      } catch (error) {
        console.error('Error clearing votes:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to clear votes' });
      }
    });

    socket.on(SOCKET_EVENTS.STORY_CREATED, async (roomId: string, storyData: { title: string; description?: string; acceptanceCriteria?: string[] }) => {
      try {
        console.log(`STORY_CREATED event: creating story in room ${roomId}`);
        
        const story = await storyService.createStory(
          roomId,
          storyData.title,
          storyData.description,
          storyData.acceptanceCriteria
        );
        
        if (story) {
          io.to(roomId).emit(SOCKET_EVENTS.STORY_CREATED, story);
          console.log(`Story created in room ${roomId}: ${story.title}`);
        }
      } catch (error) {
        console.error('Error creating story:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to create story' });
      }
    });

    socket.on(SOCKET_EVENTS.STORY_UPDATED, async (storyId: string, updates: Partial<{ title: string; description: string; acceptanceCriteria: string[] }>) => {
      try {
        console.log(`STORY_UPDATED event: updating story ${storyId}`);
        
        // Get the story document to access roomId
        const storyDoc = await storyService.getStoryDocument(storyId);
        if (!storyDoc) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Story not found' });
          return;
        }

        const story = await storyService.updateStory(storyId, updates);
        if (story) {
          io.to(storyDoc.roomId).emit(SOCKET_EVENTS.STORY_UPDATED, story);
          console.log(`Story updated: ${storyId}`);
        }
      } catch (error) {
        console.error('Error updating story:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to update story' });
      }
    });

    socket.on(SOCKET_EVENTS.FINAL_ESTIMATE_SET, async (storyId: string, estimate: string) => {
      try {
        console.log(`FINAL_ESTIMATE_SET event: setting estimate ${estimate} for story ${storyId}`);
        
        // Get the story document to access roomId
        const storyDoc = await storyService.getStoryDocument(storyId);
        if (!storyDoc) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Story not found' });
          return;
        }

        const story = await storyService.updateStory(storyId, { finalEstimate: estimate });
        if (story) {
          io.to(storyDoc.roomId).emit(SOCKET_EVENTS.FINAL_ESTIMATE_SET, story);
          console.log(`Final estimate set for story ${storyId}: ${estimate}`);
        }
      } catch (error) {
        console.error('Error setting final estimate:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to set final estimate' });
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (roomId: string, userId: string) => {
      try {
        console.log(`LEAVE_ROOM event: user ${userId} leaving room ${roomId}`);
        
        socket.leave(roomId);
        userSockets.delete(userId);

        const room = await roomService.removeParticipant(roomId, userId);
        if (room) {
          // Notify all remaining users about the updated room state
          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
          console.log(`User ${userId} left room ${roomId}`);
        }
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
