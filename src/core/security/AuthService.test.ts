import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AuthService } from './AuthService.js';

describe('AuthService', () => {
    const secret = 'super-secret-jwt-key';
    
    test('should generate and verify a valid JWT', () => {
        const auth = new AuthService(secret);
        const payload = { userId: '123', role: 'admin' };
        
        const token = auth.generateToken(payload, 3600); // 1 hour validity
        assert.ok(token);

        const decoded = auth.verifyToken<{ userId: string; role: string }>(token);
        assert.strictEqual(decoded.userId, '123');
        assert.strictEqual(decoded.role, 'admin');
    });

    test('should fail verification if token is tampered', () => {
        const auth = new AuthService(secret);
        const token = auth.generateToken({ userId: '123' }, 3600);
        
        const parts = token.split('.');
        // Tamper with payload
        const fakePayload = Buffer.from(JSON.stringify({ userId: 'admin' })).toString('base64url');
        const tamperedToken = `${parts[0]}.${fakePayload}.${parts[2]}`;

        assert.throws(() => {
            auth.verifyToken(tamperedToken);
        }, /Invalid token signature/);
    });

    test('should fail verification if token is expired', () => {
        const auth = new AuthService(secret);
        // Generate a token that expired 1 second ago
        const token = auth.generateToken({ userId: '123' }, -1);

        assert.throws(() => {
            auth.verifyToken(token);
        }, /Token has expired/);
    });
});
