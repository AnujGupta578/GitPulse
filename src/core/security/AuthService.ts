import crypto from 'node:crypto';

export class AuthService {
    private readonly secret: string;

    constructor(secret?: string) {
        const finalSecret = secret || process.env.JWT_SECRET;
        if (!finalSecret) {
            throw new Error('No JWT secret provided and JWT_SECRET is not set in environment.');
        }
        this.secret = finalSecret;
    }

    /**
     * Generates a simple JWT-like token natively without third-party libraries.
     * @param payload The data to embed in the token.
     * @param expiresInSeconds Time until expiration.
     */
    public generateToken(payload: object, expiresInSeconds: number): string {
        const header = { alg: 'HS256', typ: 'JWT' };
        const now = Math.floor(Date.now() / 1000);
        const jwtPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload));

        const signature = this.sign(`${encodedHeader}.${encodedPayload}`);
        
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    /**
     * Verifies the token signature and expiration.
     * @param token The JWT token to verify.
     */
    public verifyToken<T>(token: string): T {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }

        const [encodedHeader, encodedPayload, signature] = parts as [string, string, string];
        const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`);

        if (signature !== expectedSignature) {
            throw new Error('Invalid token signature');
        }

        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
        
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            throw new Error('Token has expired');
        }

        return payload as T;
    }

    private base64UrlEncode(str: string): string {
        return Buffer.from(str).toString('base64url');
    }

    private sign(data: string): string {
        return crypto
            .createHmac('sha256', this.secret)
            .update(data)
            .digest('base64url');
    }
}
