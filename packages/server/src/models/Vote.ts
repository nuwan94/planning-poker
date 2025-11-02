import mongoose, { Schema, Document, Model } from 'mongoose';
import { Vote as SharedVote } from '@planning-poker/shared';

export interface IVote extends SharedVote, Document {
  _id: mongoose.Types.ObjectId;
}

const VoteSchema = new Schema<IVote>({
  userId: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false,
  toJSON: {
    transform: (doc: any, ret: any) => {
      delete ret._id;
      return ret;
    }
  }
});

export const Vote = VoteSchema;