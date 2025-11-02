import mongoose, { Schema, Document, Model } from 'mongoose';
import { User as SharedUser } from '@planning-poker/shared';

export interface IUser extends Omit<SharedUser, 'id'>, Document {
  id: string; // Override the Document id with our string id
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
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
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  isSpectator: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any)._id;
      delete (ret as any).__v;
      delete (ret as any).createdAt;
      delete (ret as any).updatedAt;
      return ret;
    }
  }
});

// Indexes
UserSchema.index({ id: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { sparse: true });

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);