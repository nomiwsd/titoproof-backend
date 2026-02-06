/**
 * Public verification result routes
 * Shows verified status for public access
 */

import { Router, Request, Response } from 'express';
import { getVerificationStatus } from '../verificationService';

const router = Router();

/**
 * GET /verify/:domain
 * Public verification status page
 * Shows verification status, timestamp, and method used
 */
router.get('/:domain', async (req: Request, res: Response) => {
  try {
    const { domain } = req.params;

    const proof = await getVerificationStatus(domain);

    if (!proof) {
      return res.status(200).json({
        verified: false,
        domain,
        message: 'Domain is not verified',
      });
    }

    // Parse timestamp to human-readable format
    const verificationDate = new Date(proof.timestamp);
    const formattedDate = verificationDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });

    // Map method to readable name
    const methodNames: Record<string, string> = {
      DNS_TXT: 'DNS TXT Record',
      HTML_META: 'HTML Meta Tag',
    };

    res.status(200).json({
      verified: true,
      domain,
      verificationMethod: methodNames[proof.method] || proof.method,
      verifiedAt: proof.timestamp,
      formattedDate,
      proofId: proof.id,
      proofHash: proof.hash,
      details: {
        method: proof.method,
        timestamp: proof.timestamp,
        metadata: proof.metadata,
      },
    });
  } catch (error: unknown) {
    const err = error as any;
    res.status(500).json({
      error: err.message || 'Failed to get verification status',
    });
  }
});

export default router;
