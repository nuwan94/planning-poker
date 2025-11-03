import { Room as IRoom, User as IUser, Story as IStory, generateRoomId } from '@planning-poker/shared';
import { Room, IRoom as IRoomDoc } from '../models/Room';
import { User, IUser as IUserDoc } from '../models/User';
import { Story, IStory as IStoryDoc } from '../models/Story';

export class RoomService {
  async createRoom(name: string, description?: string, owner?: IUser): Promise<IRoom> {
    console.log(`[RoomService] Creating room: ${name}`);
    
    // Generate a unique room ID
    let roomId = generateRoomId();
    let existingRoom = await Room.findOne({ id: roomId });
    
    // Regenerate if collision occurs (very rare with 6-character alphanumeric)
    while (existingRoom) {
      roomId = generateRoomId();
      existingRoom = await Room.findOne({ id: roomId });
    }
    
    let ownerId: string;
    let participantIds: string[] = [];
    
    if (owner) {
      console.log(`[RoomService] Creating room with owner: ${owner.name}`);
      // Create or update the owner user
      await User.findOneAndUpdate(
        { id: owner.id },
        owner,
        { upsert: true, new: true }
      );
      ownerId = owner.id;
      participantIds = [owner.id];
    } else {
      console.log('[RoomService] Creating room without owner');
      // Create room without owner - owner will be set when first user joins
      ownerId = '';
    }

    const room = new Room({
      id: roomId,
      name,
      description,
      ownerId,
      participantIds,
      isVotingActive: false
    });

    await room.save();
    console.log(`[RoomService] Room created: ${roomId}`);
    return this.populateRoom(room);
  }

  async getRoomById(roomId: string): Promise<IRoom | null> {
    console.log(`[RoomService] Getting room by ID: ${roomId}`);
    
    const room = await Room.findOne({ id: roomId });
    if (!room) {
      console.log(`[RoomService] Room not found: ${roomId}`);
      return null;
    }
    
    const populatedRoom = await this.populateRoom(room);
    console.log(`[RoomService] Room found: ${populatedRoom.name} with ${populatedRoom.participants.length} participants`);
    return populatedRoom;
  }

  async getAllRooms(): Promise<IRoom[]> {
    const rooms = await Room.find().sort({ createdAt: -1 });
    return Promise.all(rooms.map(room => this.populateRoom(room)));
  }

  async updateRoom(roomId: string, updates: Partial<Pick<IRoom, 'name' | 'description' | 'cardDeckId'>>): Promise<IRoom | null> {
    const room = await Room.findOneAndUpdate(
      { id: roomId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    
    if (!room) return null;
    return this.populateRoom(room);
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    // Delete all stories for this room
    await Story.deleteMany({ roomId });
    
    // Delete the room
    const result = await Room.deleteOne({ id: roomId });
    return result.deletedCount > 0;
  }

  async addParticipant(roomId: string, user: IUser): Promise<IRoom | null> {
    console.log(`[RoomService] Adding participant ${user.name} to room ${roomId}`);
    
    // Create or update user
    await User.findOneAndUpdate(
      { id: user.id },
      user,
      { upsert: true, new: true }
    );
    console.log(`[RoomService] User ${user.name} saved to database`);

    // Get the room first to check if it needs an owner
    const existingRoom = await Room.findOne({ id: roomId });
    if (!existingRoom) {
      console.log(`[RoomService] Room ${roomId} not found`);
      return null;
    }

    // If room has no owner or empty ownerId, make this user the owner
    const updateData: any = { $addToSet: { participantIds: user.id } };
    if (!existingRoom.ownerId || existingRoom.ownerId === '') {
      console.log(`[RoomService] Setting ${user.name} as room owner`);
      updateData.ownerId = user.id;
    }

    const room = await Room.findOneAndUpdate(
      { id: roomId },
      updateData,
      { new: true }
    );

    if (!room) {
      console.log(`[RoomService] Failed to update room ${roomId}`);
      return null;
    }
    
    const populatedRoom = await this.populateRoom(room);
    console.log(`[RoomService] Participant added successfully. Total participants: ${populatedRoom.participants.length}`);
    return populatedRoom;
  }

  async removeParticipant(roomId: string, userId: string): Promise<IRoom | null> {
    console.log(`[RoomService] Removing participant ${userId} from room ${roomId}`);
    
    const room = await Room.findOneAndUpdate(
      { id: roomId },
      { $pull: { participantIds: userId } },
      { new: true }
    );

    if (!room) return null;
    return this.populateRoom(room);
  }

  async setCurrentStory(roomId: string, storyId?: string): Promise<IRoom | null> {
    const room = await Room.findOneAndUpdate(
      { id: roomId },
      { currentStoryId: storyId },
      { new: true }
    );

    if (!room) return null;
    return this.populateRoom(room);
  }

  async setVotingActive(roomId: string, isActive: boolean): Promise<IRoom | null> {
    const room = await Room.findOneAndUpdate(
      { id: roomId },
      { isVotingActive: isActive },
      { new: true }
    );

    if (!room) return null;
    return this.populateRoom(room);
  }

  async getStoryHistory(roomId: string): Promise<IStory[]> {
    console.log(`[RoomService] Getting story history for room: ${roomId}`);
    
    // Get all stories for the room, sorted by creation date (newest first)
    const stories = await Story.find({ roomId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[RoomService] Found ${stories.length} stories`);
    
    return stories.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      acceptanceCriteria: story.acceptanceCriteria,
      finalEstimate: story.finalEstimate,
      votes: story.votes,
      isRevealed: story.isRevealed,
      createdAt: story.createdAt
    }));
  }

  private async populateRoom(room: IRoomDoc): Promise<IRoom> {
    // Fetch all participants
    const participants = await User.find({
      id: { $in: room.participantIds }
    }).lean();

    // Fetch current story if exists
    let currentStory: IStory | undefined;
    if (room.currentStoryId) {
      const storyDoc = await Story.findOne({ id: room.currentStoryId }).lean();
      if (storyDoc) {
        currentStory = {
          id: storyDoc.id,
          title: storyDoc.title,
          description: storyDoc.description,
          acceptanceCriteria: storyDoc.acceptanceCriteria,
          finalEstimate: storyDoc.finalEstimate,
          votes: storyDoc.votes,
          isRevealed: storyDoc.isRevealed,
          createdAt: storyDoc.createdAt
        };
      }
    }

    // Fetch story history (all finalized stories, sorted by newest first)
    const storyDocs = await Story.find({ 
      roomId: room.id,
      finalEstimate: { $exists: true, $ne: null }
    })
      .sort({ createdAt: -1 })
      .limit(20) // Limit to last 20 stories
      .lean();

    const storyHistory = storyDocs.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      acceptanceCriteria: story.acceptanceCriteria,
      finalEstimate: story.finalEstimate,
      votes: story.votes,
      isRevealed: story.isRevealed,
      createdAt: story.createdAt
    }));

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      ownerId: room.ownerId,
      participants: participants.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        avatarUrl: p.avatarUrl,
        isSpectator: p.isSpectator
      })),
      currentStory,
      storyHistory,
      cardDeckId: room.cardDeckId || 'fibonacci',
      isVotingActive: room.isVotingActive,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    };
  }
}

export const roomService = new RoomService();
