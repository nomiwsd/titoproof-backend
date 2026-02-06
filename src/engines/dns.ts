/**
 * DNS TXT record verification engine
 * Verifies domain ownership by checking for TXT record
 */

import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

/**
 * DNS TXT record name pattern for verification
 * Domain owners are expected to add: _titoproof.<domain> TXT "<token>"
 */
const TXT_RECORD_PREFIX = '_titoproof';

/**
 * Generate the DNS TXT record name that should be created
 * @param domain The domain to verify
 * @returns The full DNS TXT record name
 */
export function getDnsRecordName(domain: string): string {
  // Remove www. if present
  const cleanDomain = domain.replace(/^www\./, '');
  return `${TXT_RECORD_PREFIX}.${cleanDomain}`;
}

/**
 * Verify domain ownership via DNS TXT record
 * @param domain The domain to verify
 * @param token The verification token
 * @returns Promise resolving to verification result
 */
export async function verifyDnsTxtRecord(
  domain: string,
  token: string
): Promise<{ verified: boolean; recordName?: string; foundRecords?: string[] }> {
  try {
    const recordName = getDnsRecordName(domain);
    const records = await resolveTxt(recordName);

    // Flatten the nested array of TXT records
    const flattenedRecords = records.map((record) => record.join(''));

    // Check if token exists in any of the records
    const tokenExists = flattenedRecords.some((record) =>
      record.includes(token)
    );

    return {
      verified: tokenExists,
      recordName,
      foundRecords: tokenExists ? flattenedRecords : undefined,
    };
  } catch (error: unknown) {
    // DNS lookup failed (record doesn't exist)
    const err = error as any;
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return {
        verified: false,
        recordName: getDnsRecordName(domain),
      };
    }
    throw error;
  }
}

/**
 * Get human-readable DNS setup instructions
 */
export function getDnsSetupInstructions(
  domain: string,
  token: string
): string {
  const recordName = getDnsRecordName(domain);
  return `
To verify ownership of ${domain} via DNS:

1. Access your domain's DNS settings (usually with your domain registrar)
2. Add a new TXT record:
   - Name/Host: ${recordName}
   - Value: ${token}
3. Wait for DNS propagation (usually 5-30 minutes)
4. Call the verification endpoint

Example with common registrars:
- GoDaddy: DNS Management > Add Record > Type: TXT
- Cloudflare: DNS > Add Record > Type: TXT
- Route53: Create Record Set > Type: TXT
`;
}
