import crypto from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET || 'brainvare-hrm-secret-change-in-production';
export const ACCESS_TTL = 15 * 60;
export const REFRESH_TTL = 7 * 24 * 3600;

function b64url(s: string) {
  return Buffer.from(s).toString('base64url');
}

function sign(header: string, payload: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
}

export function createToken(payload: object, ttl = ACCESS_TTL): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + ttl }));
  return `${header}.${body}.${sign(header, body)}`;
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;
    if (sign(header, body) !== sig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
