import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'gitpulse-dev-secret-change-in-prod';

/** Hash a password using scrypt */
export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

/** Verify a password against a stored hash */
export function verifyPassword(password: string, stored: string): boolean {
    try {
        const [salt, hash] = stored.split(':');
        const hashBuf = Buffer.from(hash, 'hex');
        const derived = scryptSync(password, salt, 64);
        return timingSafeEqual(hashBuf, derived);
    } catch {
        return false;
    }
}

/** Create a simple signed token */
export function createToken(payload: object): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 7 })).toString('base64url');
    const sig = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${sig}`;
}

/** Verify a signed token */
export function verifyToken(token: string): any | null {
    try {
        const [header, body, sig] = token.split('.');
        const expected = createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
        if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
}
