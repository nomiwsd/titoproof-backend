/**
 * API Routes for verification endpoints
 */

import { Router, Request, Response } from 'express';
import {
  generateVerificationToken,
  verifyDomain,
  getVerificationStatus,
} from '../verificationService';
import { verifyEmailDomain } from '../engines/email';
import { VerificationRequest, EmailVerificationRequest, VerificationMethod } from '../types';

const router = Router();

/**
 * POST /api/verify/generate-token
 * Generate a new verification token for a domain
 *
 * Request body:
 * {
 *   "domain": "example.com",
 *   "methods": ["DNS_TXT", "HTML_META"]  // optional, defaults to both
 * }
 */
router.post('/generate-token', async (req: Request, res: Response) => {
  try {
    const { domain, methods } = req.body;

    if (!domain) {
      return res.status(400).json({
        error: 'Missing required field: domain',
      });
    }

    // Validate domain format
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain.replace(/^www\./, ''))) {
      return res.status(400).json({
        error: 'Invalid domain format',
      });
    }

    const tokenData = await generateVerificationToken(domain, methods);

    res.status(200).json({
      success: true,
      data: tokenData,
    });
  } catch (error: unknown) {
    const err = error as any;
    res.status(500).json({
      error: err.message || 'Failed to generate token',
    });
  }
});

/**
 * POST /api/verify/verify-domain
 * Verify domain ownership using a token
 *
 * Request body:
 * {
 *   "domain": "example.com",
 *   "method": "DNS_TXT" or "HTML_META",
 *   "token": "titoproof_..."
 * }
 */
router.post('/verify-domain', async (req: Request, res: Response) => {
  try {
    const { domain, method, token } = req.body as VerificationRequest;

    if (!domain || !method || !token) {
      return res.status(400).json({
        error: 'Missing required fields: domain, method, token',
      });
    }

    if (!(['DNS_TXT', 'HTML_META'] as const).includes(method)) {
      return res.status(400).json({
        error: 'Invalid verification method',
      });
    }

    const proof = await verifyDomain({ domain, method, token });

    if (!proof) {
      return res.status(401).json({
        error: 'Verification failed - token not found in domain',
      });
    }

    res.status(200).json({
      success: true,
      data: proof,
    });
  } catch (error: unknown) {
    const err = error as any;
    res.status(500).json({
      error: err.message || 'Verification failed',
    });
  }
});

/**
 * GET /api/verify/status/:domain
 * Get verification status for a domain
 */
router.get('/status/:domain', async (req: Request, res: Response) => {
  try {
    const { domain } = req.params;

    const proof = await getVerificationStatus(domain);

    if (!proof) {
      return res.status(404).json({
        verified: false,
        message: 'Domain not verified',
      });
    }

    res.status(200).json({
      verified: true,
      data: proof,
    });
  } catch (error: unknown) {
    const err = error as any;
    res.status(500).json({
      error: err.message || 'Failed to get verification status',
    });
  }
});

/**
 * POST /api/verify/email-domain
 * Verify that an email domain matches a verified website
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "domain": "example.com"
 * }
 */
router.post('/email-domain', async (req: Request, res: Response) => {
  try {
    const { email, domain } = req.body as EmailVerificationRequest;

    if (!email || !domain) {
      return res.status(400).json({
        error: 'Missing required fields: email, domain',
      });
    }

    const result = await verifyEmailDomain(email, domain);

    res.status(result.verified ? 200 : 400).json({
      success: result.verified,
      data: result,
    });
  } catch (error: unknown) {
    const err = error as any;
    res.status(500).json({
      error: err.message || 'Email verification failed',
    });
  }
});

export default router;
