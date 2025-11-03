import { Server as SocketIOServer, Socket } from 'socket.io';
import { SOCKET_EVENTS, User, Vote } from '@planning-poker/shared';
import { roomService } from '../services/roomService';
import { storyService } from '../services/storyService';

const userSockets = new Map<string, Socket>();

export const setupSocketHandlers = (io: SocketIOServer) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Setting up Socket.IO handlers');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  io.on('connection', (socket: Socket) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔌 New client connected');
    console.log('  Socket ID:', socket.id);
    console.log('  Transport:', socket.conn.transport.name);
    console.log('  Time:', new Date().toISOString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (roomId: string, user: User) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 JOIN_ROOM event received');
      console.log('  Socket ID:', socket.id);
      console.log('  Room ID:', roomId);
      console.log('  User:', JSON.stringify(user, null, 2));
      console.log('  Time:', new Date().toISOString());
      
      try {
        // Check if user is already in the room
        const rooms = Array.from(socket.rooms);
        console.log('  Current socket rooms:', rooms);
        
        if (rooms.includes(roomId)) {
          console.log('⚠️ User is already in room, sending existing room data');
          const room = await roomService.getRoomById(roomId);
          if (room) {
            console.log('  Emitting ROOM_JOINED to socket:', socket.id);
            socket.emit(SOCKET_EVENTS.ROOM_JOINED, room);
            console.log('✅ ROOM_JOINED emitted successfully');
          } else {
            console.log('❌ Room not found in database');
          }
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return;
        }

        console.log('  Joining socket to room:', roomId);
        socket.join(roomId);
        console.log('  Socket joined room successfully');
        
        console.log('  Storing user socket mapping');
        userSockets.set(user.id, socket);
        console.log('  Current userSockets size:', userSockets.size);

        console.log('  Adding participant to room in database');
        const room = await roomService.addParticipant(roomId, user);
        
        if (room) {
          console.log('✅ Participant added successfully');
          console.log('  Room participants count:', room.participants.length);
          console.log('  Emitting ROOM_JOINED to socket:', socket.id);
          console.log('  Event name:', SOCKET_EVENTS.ROOM_JOINED);
          console.log('  Socket connected:', socket.connected);
          console.log('  Socket rooms:', Array.from(socket.rooms));
          
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, room);
          console.log('  ✅ ROOM_JOINED emitted');
          
          console.log('  Emitting ROOM_UPDATED to room:', roomId);
          console.log('  Event name:', SOCKET_EVENTS.ROOM_UPDATED);
          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
          console.log('  ✅ ROOM_UPDATED emitted');
          
          console.log('✅ User successfully joined room');
        } else {
          console.log('❌ Room not found in database');
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
        }
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Error joining room');
        console.error('  Error:', error);
        console.error('  Message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('  Stack:', error instanceof Error ? error.stack : undefined);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join room' });
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 LEAVE_ROOM event received');
      console.log('  Socket ID:', socket.id);
      console.log('  Room ID:', roomId);
      console.log('  User ID:', userId);
      console.log('  Time:', new Date().toISOString());
      
      try {
        console.log('  Removing socket from room:', roomId);
        socket.leave(roomId);
        console.log('  Removing user from socket mapping');
        userSockets.delete(userId);
        console.log('  Current userSockets size:', userSockets.size);

        console.log('  Removing participant from room in database');
        const room = await roomService.removeParticipant(roomId, userId);
        if (room) {
          console.log('✅ Participant removed successfully');
          console.log('  Room participants count:', room.participants.length);
          console.log('  Emitting ROOM_UPDATED to room:', roomId);
          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
          console.log('✅ User successfully left room');
        } else {
          console.log('⚠️ Room not found (may have been deleted)');
        }
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Error leaving room');
        console.error('  Error:', error);
        console.error('  Message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    socket.on('disconnect', (reason) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔌 Client disconnected');
      console.log('  Socket ID:', socket.id);
      console.log('  Reason:', reason);
      console.log('  Time:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  });
};
