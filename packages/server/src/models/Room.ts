import mongoose, { Schema, Document, Model } from 'mongoose';
import { Room as SharedRoom } from '@planning-poker/shared';

export interface IRoom extends Document {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  participantIds: string[];
  currentStoryId?: string;
  cardDeckId?: string;
  isVotingActive: boolean;
  password?: string; // Encrypted password for protected rooms
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  ownerId: {
    type: String,
    required: true
  },
  participantIds: [{
    type: String,
    required: true
  }],
  currentStoryId: {
    type: String
  },
  cardDeckId: {
    type: String,
    default: 'fibonacci'
  },
  isVotingActive: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      delete ret._id;
      delete ret.__v;
      delete ret.participantIds;
      delete ret.currentStoryId;
      return ret;
    }
  }
});

// Indexes
RoomSchema.index({ id: 1 }, { unique: true });
RoomSchema.index({ ownerId: 1 });
RoomSchema.index({ createdAt: -1 });

export const Room: Model<IRoom> = mongoose.model<IRoom>('Room', RoomSchema);