/**
 * MongoDB Schema for verification tokens
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IToken extends Document {
  token: string;
  domain: string;
  expiresAt: Date;
  createdAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // No index here - TTL index below handles it
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete expired tokens
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenModel = mongoose.model<IToken>('Token', TokenSchema);
