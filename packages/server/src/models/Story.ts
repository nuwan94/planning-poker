import mongoose, { Schema, Document, Model } from 'mongoose';
import { Story as SharedStory } from '@planning-poker/shared';
import { Vote } from './Vote';

export interface IStory extends Omit<SharedStory, 'id'>, Document {
  id: string; // Override the Document id with our string id
  _id: mongoose.Types.ObjectId;
  roomId: string;
}

const StorySchema = new Schema<IStory>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  acceptanceCriteria: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  finalEstimate: {
    type: String,
    trim: true
  },
  votes: [Vote],
  isRevealed: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: (doc: any, ret: any) => {
      delete ret._id;
      delete ret.__v;
      delete ret.roomId;
      return ret;
    }
  }
});

// Indexes
StorySchema.index({ id: 1 }, { unique: true });
StorySchema.index({ roomId: 1 });
StorySchema.index({ roomId: 1, createdAt: -1 });

export const Story: Model<IStory> = mongoose.model<IStory>('Story', StorySchema);