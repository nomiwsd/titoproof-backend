/**
 * Core types for the TitoProof verification engine
 */

/**
 * Supported verification methods
 */
export type VerificationMethod = 'DNS_TXT' | 'HTML_META';

/**
 * Proof object representing verification results
 */
export interface Proof {
  id: string;
  domain: string;
  method: VerificationMethod;
  token: string;
  verified: boolean;
  hash: string;
  timestamp: string;
  expiresAt?: string;
  metadata?: {
    dnsRecord?: string;
    htmlTagFound?: boolean;
    email?: string;
  };
}

/**
 * Verification token request/response
 */
export interface VerificationToken {
  token: string;
  domain: string;
  methods: VerificationMethod[];
  expiresAt: string;
  createdAt: string;
}

/**
 * Verification request
 */
export interface VerificationRequest {
  domain: string;
  method: VerificationMethod;
  token: string;
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  email: string;
  domain: string;
}

/**
 * Database record for stored proofs
 */
export interface StoredProof {
  id: string;
  domain: string;
  method: VerificationMethod;
  token: string;
  verified: boolean;
  hash: string;
  timestamp: string;
  expiresAt?: string;
  metadata?: string; // JSON stringified
}
