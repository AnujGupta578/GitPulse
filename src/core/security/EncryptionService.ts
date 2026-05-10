import crypto from 'node:crypto';

export interface EncryptedPayload {
    iv: string;
    content: string;
    authTag: string;
}

export class EncryptionService {
    private readonly key: Buffer;
    private readonly algorithm = 'aes-256-gcm';

    /**
     * @param key A 32-byte symmetric encryption key. Defaults to process.env.ENCRYPTION_KEY
     */
    constructor(key?: Buffer | string) {
        let finalKey: Buffer;

        if (key) {
            finalKey = typeof key === 'string' ? Buffer.from(key, 'utf8') : key;
        } else if (process.env.ENCRYPTION_KEY) {
            finalKey = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
        } else {
            throw new Error('No encryption key provided and ENCRYPTION_KEY is not set in environment.');
        }

        if (finalKey.length !== 32) {
            throw new Error(`Encryption key must be exactly 32 bytes (256 bits). Received ${finalKey.length} bytes.`);
        }
        
        this.key = finalKey;
    }

    /**
     * Encrypts a JSON-serializable payload.
     */
    public encrypt(payload: any): EncryptedPayload {
        const iv = crypto.randomBytes(12); // Recommended 12 bytes for GCM
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();

        return {
            iv: iv.toString('hex'),
            content: encrypted,
            authTag: authTag.toString('hex')
        };
    }

    /**
     * Decrypts an encrypted payload back into its object form.
     */
    public decrypt<T>(encryptedPayload: EncryptedPayload): T {
        const decipher = crypto.createDecipheriv(
            this.algorithm, 
            this.key, 
            Buffer.from(encryptedPayload.iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(encryptedPayload.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedPayload.content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted) as T;
    }
}
