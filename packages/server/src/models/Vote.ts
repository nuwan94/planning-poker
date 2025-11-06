import mongoose, { Schema } from 'mongoose';
import { Vote as SharedVote } from '@planning-poker/shared';

export interface IVote extends SharedVote {}

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
});

export const Vote = VoteSchema;