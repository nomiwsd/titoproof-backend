/**
 * Main verification service orchestrator
 * Coordinates between different verification engines and database
 */

import { v4 as uuidv4 } from 'uuid';
import { database } from './database';
import { generateToken, generateProofHash, getTokenExpiration } from './utils';
import { verifyDnsTxtRecord, getDnsSetupInstructions } from './engines/dns';
import { verifyHtmlMetaTag, getHtmlSetupInstructions } from './engines/html';
import {
  Proof,
  VerificationMethod,
  VerificationRequest,
  VerificationToken,
  StoredProof,
} from './types';

/**
 * Generate a new verification token for a domain
 * @param domain The domain to generate token for
 * @param methods The verification methods to support
 * @returns The verification token object with instructions
 */
export async function generateVerificationToken(
  domain: string,
  methods: VerificationMethod[] = ['DNS_TXT', 'HTML_META']
): Promise<VerificationToken & {
  setupInstructions: Record<VerificationMethod, string>;
}> {
  const token = generateToken();
  const expiresAt = getTokenExpiration(24);

  const setupInstructions: Record<VerificationMethod, string> = {
    DNS_TXT: getDnsSetupInstructions(domain, token),
    HTML_META: getHtmlSetupInstructions(domain, token),
  };

  // Save token to database
  await Promise.resolve(database.saveToken(token, domain, expiresAt));

  return {
    token,
    domain,
    methods,
    expiresAt,
    createdAt: new Date().toISOString(),
    setupInstructions,
  };
}

/**
 * Verify domain ownership and create a proof record
 * @param request The verification request
 * @returns The proof object if verification succeeds
 */
export async function verifyDomain(
  request: VerificationRequest
): Promise<Proof | null> {
  // Validate token
  const isValid = await Promise.resolve(database.isTokenValid(request.token, request.domain));
  if (!isValid) {
    throw new Error('Invalid or expired token');
  }

  let verificationResult: { verified: boolean; [key: string]: any };

  // Run appropriate verification engine
  if (request.method === 'DNS_TXT') {
    verificationResult = await verifyDnsTxtRecord(request.domain, request.token);
  } else if (request.method === 'HTML_META') {
    verificationResult = await verifyHtmlMetaTag(request.domain, request.token);
  } else {
    throw new Error(`Unknown verification method: ${request.method}`);
  }

  if (!verificationResult.verified) {
    return null;
  }

  // Create proof object
  const proof: Proof = {
    id: uuidv4(),
    domain: request.domain,
    method: request.method,
    token: request.token,
    verified: true,
    hash: '', // Will be set below
    timestamp: new Date().toISOString(),
    metadata: verificationResult as any,
  };

  // Generate hash of the proof
  const proofString = JSON.stringify({
    id: proof.id,
    domain: proof.domain,
    method: proof.method,
    verified: proof.verified,
    timestamp: proof.timestamp,
  });
  proof.hash = generateProofHash(proofString);

  // Store in database
  const storedProof: StoredProof = {
    ...proof,
    metadata: proof.metadata ? JSON.stringify(proof.metadata) : undefined,
  };
  await Promise.resolve(database.saveProof(storedProof));

  // Delete token after successful verification
  await Promise.resolve(database.deleteToken(request.token));

  return proof;
}

/**
 * Get verification status for a domain
 * @param domain The domain to check
 * @returns The latest proof if domain is verified, null otherwise
 */
export async function getVerificationStatus(domain: string): Promise<Proof | null> {
  const storedProof = await Promise.resolve(database.getLatestVerifiedProof(domain));

  if (!storedProof) {
    return null;
  }

  return {
    id: storedProof.id,
    domain: storedProof.domain,
    method: storedProof.method,
    token: storedProof.token,
    verified: storedProof.verified,
    hash: storedProof.hash,
    timestamp: storedProof.timestamp,
    expiresAt: storedProof.expiresAt,
    metadata: storedProof.metadata ? JSON.parse(storedProof.metadata) : undefined,
  };
}
