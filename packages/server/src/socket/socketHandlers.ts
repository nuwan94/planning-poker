import { Server as SocketIOServer, Socket } from 'socket.io';
import { 
  SOCKET_EVENTS, 
  User, 
  Room, 
  Story, 
  Vote,
  SocketEvents
} from '@planning-poker/shared';

// In-memory storage for rooms and users
const rooms = new Map<string, Room>();
const userSockets = new Map<string, Socket>();

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle joining a room
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId: string, user: User) => {
      try {
        // Leave any previous rooms
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join the new room
        socket.join(roomId);
        userSockets.set(user.id, socket);

        // Get or create room
        let room = rooms.get(roomId);
        if (!room) {
          room = {
            id: roomId,
            name: `Room ${roomId}`,
            ownerId: user.id,
            participants: [],
            isVotingActive: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }

        // Add user to room if not already present
        const existingUser = room.participants.find(p => p.id === user.id);
        if (!existingUser) {
          room.participants.push(user);
          room.updatedAt = new Date();
          rooms.set(roomId, room);

          // Notify other users in the room
          socket.to(roomId).emit(SOCKET_EVENTS.USER_JOINED, user);
        }

        // Send current room state to the joining user
        socket.emit(SOCKET_EVENTS.ROOM_UPDATED, room);

        console.log(`User ${user.name} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit(SOCKET_EVENTS.ERROR, 'Failed to join room');
      }
    });

    // Handle leaving a room
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (roomId: string, userId: string) => {
      try {
        socket.leave(roomId);
        userSockets.delete(userId);

        const room = rooms.get(roomId);
        if (room) {
          room.participants = room.participants.filter(p => p.id !== userId);
          room.updatedAt = new Date();
          
          if (room.participants.length === 0) {
            rooms.delete(roomId);
          } else {
            rooms.set(roomId, room);
            // Notify remaining users
            socket.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, userId);
            socket.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
          }
        }

        console.log(`User ${userId} left room ${roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
        socket.emit(SOCKET_EVENTS.ERROR, 'Failed to leave room');
      }
    });

    // Handle starting voting for a story
    socket.on(SOCKET_EVENTS.START_VOTING, (story: Story) => {
      try {
        const roomId = Array.from(socket.rooms)[1]; // First room after socket.id
        if (!roomId) return;

        const room = rooms.get(roomId);
        if (!room) return;

        // Reset votes for new voting session
        story.votes = [];
        story.isRevealed = false;
        
        room.currentStory = story;
        room.isVotingActive = true;
        room.updatedAt = new Date();
        rooms.set(roomId, room);

        // Notify all users in the room
        io.to(roomId).emit(SOCKET_EVENTS.START_VOTING, story);
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);

        console.log(`Voting started for story: ${story.title} in room ${roomId}`);
      } catch (error) {
        console.error('Error starting voting:', error);
        socket.emit(SOCKET_EVENTS.ERROR, 'Failed to start voting');
      }
    });

    // Handle vote submission
    socket.on(SOCKET_EVENTS.SUBMIT_VOTE, (vote: Omit<Vote, 'submittedAt'>) => {
      try {
        const roomId = Array.from(socket.rooms)[1];
        if (!roomId) return;

        const room = rooms.get(roomId);
        if (!room || !room.currentStory || !room.isVotingActive) return;

        // Add timestamp to vote
        const fullVote: Vote = {
          ...vote,
          submittedAt: new Date()
        };

        // Remove any existing vote from this user
        room.currentStory.votes = room.currentStory.votes.filter(v => v.userId !== vote.userId);
        
        // Add the new vote
        room.currentStory.votes.push(fullVote);
        room.updatedAt = new Date();
        rooms.set(roomId, room);

        // Notify all users that a vote was submitted (without revealing the value)
        io.to(roomId).emit(SOCKET_EVENTS.VOTE_SUBMITTED, vote.userId);

        console.log(`Vote submitted by user ${vote.userId} in room ${roomId}`);
      } catch (error) {
        console.error('Error submitting vote:', error);
        socket.emit(SOCKET_EVENTS.ERROR, 'Failed to submit vote');
      }
    });

    // Handle revealing votes
    socket.on(SOCKET_EVENTS.REVEAL_VOTES, () => {
      try {
        const roomId = Array.from(socket.rooms)[1];
        if (!roomId) return;

        const room = rooms.get(roomId);
        if (!room || !room.currentStory) return;

        room.currentStory.isRevealed = true;
        room.updatedAt = new Date();
        rooms.set(roomId, room);

        // Send all votes to all users
        io.to(roomId).emit(SOCKET_EVENTS.VOTES_REVEALED, room.currentStory.votes);
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);

        console.log(`Votes revealed in room ${roomId}`);
      } catch (error) {
        console.error('Error revealing votes:', error);
        socket.emit(SOCKET_EVENTS.ERROR, 'Failed to reveal votes');
      }
    });

    // Handle clearing votes
    socket.on(SOCKET_EVENTS.CLEAR_VOTES, () => {
      try {
        const roomId = Array.from(socket.rooms)[1];
        if (!roomId) return;

        const room = rooms.get(roomId);
        if (!room || !room.currentStory) return;

        room.currentStory.votes = [];
        room.currentStory.isRevealed = false;
        room.isVotingActive = true;
        room.updatedAt = new Date();
        rooms.set(roomId, room);

        // Notify all users
        io.to(roomId).emit(SOCKET_EVENTS.VOTES_CLEARED);
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);

        console.log(`Votes cleared in room ${roomId}`);
      } catch (error) {
        console.error('Error clearing votes:', error);
        socket.emit(SOCKET_EVENTS.ERROR, 'Failed to clear votes');
      }
    });

    // Handle story updates
    socket.on(SOCKET_EVENTS.UPDATE_STORY, (storyUpdate: Partial<Story>) => {
      try {
        const roomId = Array.from(socket.rooms)[1];
        if (!roomId) return;

        const room = rooms.get(roomId);
        if (!room || !room.currentStory) return;

        // Update the current story
        Object.assign(room.currentStory, storyUpdate);
        room.updatedAt = new Date();
        rooms.set(roomId, room);

        // Notify all users
        io.to(roomId).emit(SOCKET_EVENTS.STORY_UPDATED, room.currentStory);
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);

        console.log(`Story updated in room ${roomId}`);
      } catch (error) {
        console.error('Error updating story:', error);
        socket.emit(SOCKET_EVENTS.ERROR, 'Failed to update story');
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      try {
        // Find user by socket and remove from all rooms
        for (const [userId, userSocket] of userSockets.entries()) {
          if (userSocket.id === socket.id) {
            userSockets.delete(userId);
            
            // Remove user from all rooms
            for (const [roomId, room] of rooms.entries()) {
              const userIndex = room.participants.findIndex(p => p.id === userId);
              if (userIndex !== -1) {
                room.participants.splice(userIndex, 1);
                room.updatedAt = new Date();
                
                if (room.participants.length === 0) {
                  rooms.delete(roomId);
                } else {
                  rooms.set(roomId, room);
                  socket.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, userId);
                  socket.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, room);
                }
              }
            }
            break;
          }
        }

        console.log(`User disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};