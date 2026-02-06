/**
 * Token generation and validation utilities
 */

import { randomUUID } from 'crypto';
import crypto from 'crypto';

/**
 * Generate a verification token
 * Format: titoproof_<uuid>_<timestamp>
 */
export function generateToken(): string {
  const uuid = randomUUID();
  const timestamp = Date.now();
  return `titoproof_${uuid}_${timestamp}`;
}

/**
 * Generate SHA-256 hash of a proof object (serialized)
 */
export function generateProofHash(proofData: string): string {
  return crypto.createHash('sha256').update(proofData).digest('hex');
}

/**
 * Calculate token expiration time (24 hours from now)
 */
export function getTokenExpiration(hoursFromNow: number = 24): string {
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + hoursFromNow);
  return expirationTime.toISOString();
}
