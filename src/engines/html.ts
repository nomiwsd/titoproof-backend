/**
 * HTML meta tag verification engine
 * Verifies domain ownership by checking for meta tag in HTML
 */

import axios, { AxiosError } from 'axios';

/**
 * Meta tag name for verification
 * Domain owners are expected to add: <meta name="titoproof-token" content="<token>" />
 */
const META_TAG_NAME = 'titoproof-token';

/**
 * Get the HTML meta tag that should be added to the domain
 */
export function getMetaTag(token: string): string {
  return `<meta name="${META_TAG_NAME}" content="${token}" />`;
}

/**
 * Extract meta tag value from HTML
 */
function extractMetaTagFromHtml(html: string, metaTagName: string): string | null {
  const regex = new RegExp(
    `<meta\\s+name=["']${metaTagName}["']\\s+content=["']([^"']+)["']`,
    'i'
  );
  const match = html.match(regex);
  return match ? match[1] : null;
}

/**
 * Verify domain ownership via HTML meta tag
 * @param domain The domain to verify
 * @param token The verification token
 * @returns Promise resolving to verification result
 */
export async function verifyHtmlMetaTag(
  domain: string,
  token: string
): Promise<{ verified: boolean; url?: string; foundToken?: string }> {
  try {
    // Ensure domain has protocol
    const url = domain.startsWith('http') ? domain : `https://${domain}`;

    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'TitoProof/1.0 (+https://titoproof.io)',
      },
    });

    const foundToken = extractMetaTagFromHtml(response.data, META_TAG_NAME);

    if (!foundToken) {
      return {
        verified: false,
        url,
      };
    }

    return {
      verified: foundToken === token,
      url,
      foundToken: foundToken === token ? foundToken : undefined,
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    // Domain is unreachable or invalid
    return {
      verified: false,
      url: domain.startsWith('http') ? domain : `https://${domain}`,
    };
  }
}

/**
 * Get human-readable HTML meta tag setup instructions
 */
export function getHtmlSetupInstructions(domain: string, token: string): string {
  const metaTag = getMetaTag(token);
  return `
To verify ownership of ${domain} via HTML meta tag:

1. Add this line to the <head> section of your website's home page:
   ${metaTag}

2. Ensure the meta tag is accessible at:
   https://${domain.replace(/^https?:\/\//, '')}
   or
   http://${domain.replace(/^https?:\/\//, '')}

3. After adding the tag, call the verification endpoint

Example HTML structure:
<!DOCTYPE html>
<html>
<head>
  <title>Your Site</title>
  ${metaTag}
  ...
</head>
<body>
  ...
</body>
</html>
`;
}
