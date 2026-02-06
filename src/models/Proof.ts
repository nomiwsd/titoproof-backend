/**
 * MongoDB Schema for Proof documents
 */

import mongoose, { Schema, Document } from 'mongoose';
import { VerificationMethod } from '../types';

export interface IProof extends Document {
  proofId: string; // Our custom ID (titoproof_...)
  domain: string;
  method: VerificationMethod;
  token: string;
  verified: boolean;
  hash: string;
  timestamp: Date;
  expiresAt?: Date;
  metadata?: {
    dnsRecord?: string;
    htmlTagFound?: boolean;
    email?: string;
  };
}

const ProofSchema = new Schema<IProof>(
  {
    proofId: {
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
    method: {
      type: String,
      enum: ['DNS_TXT', 'HTML_META'],
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    hash: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    metadata: {
      dnsRecord: String,
      htmlTagFound: Boolean,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
ProofSchema.index({ domain: 1, verified: 1, timestamp: -1 });

export const ProofModel = mongoose.model<IProof>('Proof', ProofSchema);
