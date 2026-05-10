import { test, describe } from 'node:test';
import assert from 'node:assert';
import { EncryptionService } from './EncryptionService.js';

describe('EncryptionService', () => {
    // 32-byte key for AES-256
    const testKey = Buffer.from('12345678901234567890123456789012');

    test('should encrypt and decrypt an object successfully', () => {
        const service = new EncryptionService(testKey);
        const payload = { sensitive: 'data', processId: 'abc' };

        const encrypted = service.encrypt(payload);
        assert.ok(encrypted.iv);
        assert.ok(encrypted.authTag);
        assert.ok(encrypted.content);
        assert.notDeepStrictEqual(encrypted.content, JSON.stringify(payload));

        const decrypted = service.decrypt<typeof payload>(encrypted);
        assert.deepStrictEqual(decrypted, payload);
    });

    test('should fail to decrypt if auth tag is tampered', () => {
        const service = new EncryptionService(testKey);
        const encrypted = service.encrypt({ test: 'fail' });

        // Tamper with the auth tag
        encrypted.authTag = Buffer.from('tampered').toString('hex');

        assert.throws(() => {
            service.decrypt(encrypted);
        }, /Unsupported state or unable to authenticate data/);
    });
});
