/**
 * Email domain verification engine
 * Verifies that an email domain matches a previously verified website
 */

import { database } from '../database';
import { Proof, EmailVerificationRequest } from '../types';

/**
 * Extract domain from email address
 */
export function extractEmailDomain(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) {
    throw new Error('Invalid email format');
  }
  return parts[1];
}

/**
 * Verify email domain against verified website
 * @param email The email to verify
 * @param verifiedDomain The domain that should match the email domain
 * @returns Promise resolving to verification result
 */
export async function verifyEmailDomain(
  email: string,
  verifiedDomain: string
): Promise<{
  verified: boolean;
  emailDomain?: string;
  verifiedDomain?: string;
  proof?: Proof;
}> {
  try {
    const emailDomain = extractEmailDomain(email);

    // Normalize domains for comparison (remove www.)
    const normalizedEmailDomain = emailDomain.replace(/^www\./, '');
    const normalizedVerifiedDomain = verifiedDomain.replace(/^www\./, '');

    // Check if domains match
    if (normalizedEmailDomain !== normalizedVerifiedDomain) {
      return {
        verified: false,
        emailDomain,
        verifiedDomain,
      };
    }

    // Get the latest verified proof for the domain
    const proof = await Promise.resolve(database.getLatestVerifiedProof(verifiedDomain));

    if (!proof) {
      return {
        verified: false,
        emailDomain,
        verifiedDomain,
      };
    }

    return {
      verified: true,
      emailDomain,
      verifiedDomain,
      proof: {
        id: proof.id,
        domain: proof.domain,
        method: proof.method,
        token: proof.token,
        verified: proof.verified,
        hash: proof.hash,
        timestamp: proof.timestamp,
        expiresAt: proof.expiresAt,
        metadata: proof.metadata ? JSON.parse(proof.metadata) : undefined,
      },
    };
  } catch (error: unknown) {
    const err = error as any;
    return {
      verified: false,
      emailDomain: err.message === 'Invalid email format' ? undefined : extractEmailDomain(email),
      verifiedDomain,
    };
  }
}
