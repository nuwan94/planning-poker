import { Room as IRoom, User as IUser, Story as IStory, generateRoomId } from '@planning-poker/shared';
import { Room, IRoom as IRoomDoc } from '../models/Room';
import { User, IUser as IUserDoc } from '../models/User';
import { Story, IStory as IStoryDoc } from '../models/Story';

export class RoomService {
  async createRoom(name: string, description?: string, owner?: IUser): Promise<IRoom> {
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
      // Create or update the owner user
      await User.findOneAndUpdate(
        { id: owner.id },
        owner,
        { upsert: true, new: true }
      );
      ownerId = owner.id;
      participantIds = [owner.id];
    } else {
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
    return this.populateRoom(room);
  }

  async getRoomById(roomId: string): Promise<IRoom | null> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 RoomService: Getting room by ID');
    console.log('  Room ID:', roomId);
    
    const room = await Room.findOne({ id: roomId });
    if (!room) {
      console.log('❌ Room not found in database');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return null;
    }
    
    console.log('✅ Room found in database');
    const populatedRoom = await this.populateRoom(room);
    console.log('  Populated room participants:', populatedRoom.participants.length);
    console.log('  Room:', JSON.stringify(populatedRoom, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return populatedRoom;
  }

  async getAllRooms(): Promise<IRoom[]> {
    const rooms = await Room.find().sort({ createdAt: -1 });
    return Promise.all(rooms.map(room => this.populateRoom(room)));
  }

  async updateRoom(roomId: string, updates: Partial<Pick<IRoom, 'name' | 'description'>>): Promise<IRoom | null> {
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 RoomService: Adding participant');
    console.log('  Room ID:', roomId);
    console.log('  User:', JSON.stringify(user, null, 2));
    
    // Create or update user
    console.log('  Creating/updating user in database');
    await User.findOneAndUpdate(
      { id: user.id },
      user,
      { upsert: true, new: true }
    );
    console.log('  User saved to database');

    // Get the room first to check if it needs an owner
    console.log('  Finding room in database');
    const existingRoom = await Room.findOne({ id: roomId });
    if (!existingRoom) {
      console.log('❌ Room not found');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return null;
    }

    console.log('  Existing room found');
    console.log('  Current owner ID:', existingRoom.ownerId);
    console.log('  Current participants:', existingRoom.participantIds);

    // If room has no owner or empty ownerId, make this user the owner
    const updateData: any = { $addToSet: { participantIds: user.id } };
    if (!existingRoom.ownerId || existingRoom.ownerId === '') {
      console.log('  Setting user as room owner');
      updateData.ownerId = user.id;
    }

    console.log('  Updating room with participant');
    const room = await Room.findOneAndUpdate(
      { id: roomId },
      updateData,
      { new: true }
    );

    if (!room) {
      console.log('❌ Failed to update room');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return null;
    }
    
    console.log('✅ Participant added successfully');
    console.log('  Updated participant IDs:', room.participantIds);
    const populatedRoom = await this.populateRoom(room);
    console.log('  Final participants count:', populatedRoom.participants.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return populatedRoom;
  }

  async removeParticipant(roomId: string, userId: string): Promise<IRoom | null> {
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

  async setOwner(roomId: string, userId: string): Promise<IRoom | null> {
    const room = await Room.findOneAndUpdate(
      { id: roomId },
      { ownerId: userId },
      { new: true }
    );

    if (!room) return null;
    return this.populateRoom(room);
  }

  private async populateRoom(roomDoc: IRoomDoc): Promise<IRoom> {
    // Get participants
    const participants = await User.find({ id: { $in: roomDoc.participantIds } });
    
    // Get current story if exists
    let currentStory: IStory | undefined;
    if (roomDoc.currentStoryId) {
      const storyDoc = await Story.findOne({ id: roomDoc.currentStoryId });
      if (storyDoc) {
        currentStory = storyDoc.toJSON() as IStory;
      }
    }

    return {
      id: roomDoc.id,
      name: roomDoc.name,
      description: roomDoc.description,
      ownerId: roomDoc.ownerId,
      participants: participants.map(p => p.toJSON() as IUser),
      currentStory,
      isVotingActive: roomDoc.isVotingActive,
      createdAt: roomDoc.createdAt,
      updatedAt: roomDoc.updatedAt
    };
  }
}

export const roomService = new RoomService();