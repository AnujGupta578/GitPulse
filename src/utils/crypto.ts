import crypto from 'crypto';

// AES-256 requires a 32-byte key. 
// We slice or pad the environment variable to ensure it's exactly 32 bytes.
const RAW_KEY = process.env.ENCRYPTION_KEY || 'gitpulse-default-secure-key-32b'; 
const ENCRYPTION_KEY = Buffer.alloc(32, RAW_KEY).slice(0, 32); 
const IV_LENGTH = 16;

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    // Backward compatibility: If no colon, it's likely unencrypted legacy data
    if (!text || !text.includes(':')) {
        return text;
    }

    try {
        const textParts = text.split(':');
        const ivHex = textParts.shift();
        if (!ivHex) return text;
        
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        
        // Final safety check on IV length
        if (iv.length !== IV_LENGTH) return text;

        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        console.error('[Crypto] Decryption failed:', err);
        return text; // Fallback to raw text if decryption fails
    }
}
