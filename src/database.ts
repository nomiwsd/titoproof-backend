/**
 * Database abstraction layer
 * Supports both in-memory and MongoDB storage
 */

import { StoredProof } from './types';
import { ProofModel, TokenModel } from './models';

export type DatabaseMode = 'memory' | 'mongodb';

/**
 * Database interface for consistent API across storage backends
 */
interface IDatabase {
  saveProof(proof: StoredProof): Promise<void> | void;
  getProofById(id: string): Promise<StoredProof | null> | StoredProof | null;
  getProofsByDomain(domain: string): Promise<StoredProof[]> | StoredProof[];
  getLatestVerifiedProof(domain: string): Promise<StoredProof | null> | StoredProof | null;
  saveToken(token: string, domain: string, expiresAt: string): Promise<void> | void;
  isTokenValid(token: string, domain: string): Promise<boolean> | boolean;
  deleteToken(token: string): Promise<void> | void;
  cleanupExpiredTokens(): Promise<void> | void;
}

/**
 * In-memory database implementation
 */
class InMemoryDatabase implements IDatabase {
  private proofs: Map<string, StoredProof> = new Map();
  private tokens: Map<string, { domain: string; expiresAt: string }> = new Map();

  saveProof(proof: StoredProof): void {
    this.proofs.set(proof.id, proof);
  }

  getProofById(id: string): StoredProof | null {
    return this.proofs.get(id) || null;
  }

  getProofsByDomain(domain: string): StoredProof[] {
    return Array.from(this.proofs.values()).filter(
      (proof) => proof.domain === domain
    );
  }

  getLatestVerifiedProof(domain: string): StoredProof | null {
    const proofs = this.getProofsByDomain(domain)
      .filter((p) => p.verified)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    return proofs.length > 0 ? proofs[0] : null;
  }

  saveToken(token: string, domain: string, expiresAt: string): void {
    this.tokens.set(token, { domain, expiresAt });
  }

  isTokenValid(token: string, domain: string): boolean {
    const tokenRecord = this.tokens.get(token);
    if (!tokenRecord) return false;
    if (tokenRecord.domain !== domain) return false;
    if (new Date(tokenRecord.expiresAt) < new Date()) return false;
    return true;
  }

  deleteToken(token: string): void {
    this.tokens.delete(token);
  }

  cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, record] of this.tokens.entries()) {
      if (new Date(record.expiresAt) < now) {
        this.tokens.delete(token);
      }
    }
  }
}

/**
 * MongoDB database implementation
 */
class MongoDatabase implements IDatabase {
  async saveProof(proof: StoredProof): Promise<void> {
    await ProofModel.findOneAndUpdate(
      { proofId: proof.id },
      {
        proofId: proof.id,
        domain: proof.domain,
        method: proof.method,
        token: proof.token,
        verified: proof.verified,
        hash: proof.hash,
        timestamp: new Date(proof.timestamp),
        expiresAt: proof.expiresAt ? new Date(proof.expiresAt) : undefined,
        metadata: proof.metadata ? JSON.parse(proof.metadata) : undefined,
      },
      { upsert: true, new: true }
    );
  }

  async getProofById(id: string): Promise<StoredProof | null> {
    const proof = await ProofModel.findOne({ proofId: id });
    return proof ? this.toStoredProof(proof) : null;
  }

  async getProofsByDomain(domain: string): Promise<StoredProof[]> {
    const proofs = await ProofModel.find({ domain }).sort({ timestamp: -1 });
    return proofs.map(this.toStoredProof);
  }

  async getLatestVerifiedProof(domain: string): Promise<StoredProof | null> {
    const proof = await ProofModel.findOne({ domain, verified: true }).sort({
      timestamp: -1,
    });
    return proof ? this.toStoredProof(proof) : null;
  }

  async saveToken(token: string, domain: string, expiresAt: string): Promise<void> {
    await TokenModel.findOneAndUpdate(
      { token },
      { token, domain, expiresAt: new Date(expiresAt) },
      { upsert: true, new: true }
    );
  }

  async isTokenValid(token: string, domain: string): Promise<boolean> {
    const tokenRecord = await TokenModel.findOne({ token });
    if (!tokenRecord) return false;
    if (tokenRecord.domain !== domain) return false;
    if (new Date(tokenRecord.expiresAt) < new Date()) return false;
    return true;
  }

  async deleteToken(token: string): Promise<void> {
    await TokenModel.deleteOne({ token });
  }

  async cleanupExpiredTokens(): Promise<void> {
    // MongoDB TTL index handles this automatically
    // This is kept for interface compatibility
    await TokenModel.deleteMany({ expiresAt: { $lt: new Date() } });
  }

  private toStoredProof(doc: any): StoredProof {
    return {
      id: doc.proofId,
      domain: doc.domain,
      method: doc.method,
      token: doc.token,
      verified: doc.verified,
      hash: doc.hash,
      timestamp: doc.timestamp.toISOString(),
      expiresAt: doc.expiresAt?.toISOString(),
      metadata: doc.metadata ? JSON.stringify(doc.metadata) : undefined,
    };
  }
}

/**
 * Database factory to get appropriate database instance
 */
class DatabaseFactory {
  private static memoryInstance: InMemoryDatabase | null = null;
  private static mongoInstance: MongoDatabase | null = null;
  private static currentMode: DatabaseMode = 'memory';

  static setMode(mode: DatabaseMode): void {
    this.currentMode = mode;
    console.log(`📦 Database mode set to: ${mode}`);
  }

  static getMode(): DatabaseMode {
    return this.currentMode;
  }

  static getInstance(): IDatabase {
    if (this.currentMode === 'mongodb') {
      if (!this.mongoInstance) {
        this.mongoInstance = new MongoDatabase();
      }
      return this.mongoInstance;
    }
    if (!this.memoryInstance) {
      this.memoryInstance = new InMemoryDatabase();
    }
    return this.memoryInstance;
  }
}

// Export database instance getter
export const getDatabase = () => DatabaseFactory.getInstance();
export const setDatabaseMode = (mode: DatabaseMode) => DatabaseFactory.setMode(mode);
export const getDatabaseMode = () => DatabaseFactory.getMode();

// For backward compatibility, export a proxy that delegates to the current database
export const database = new Proxy({} as IDatabase, {
  get(_, prop: keyof IDatabase) {
    const db = DatabaseFactory.getInstance();
    const value = db[prop];
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  },
});
