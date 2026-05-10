import 'dotenv/config';
const key = process.env.ENCRYPTION_KEY || 'default-32-byte-encryption-key-for-dev';
console.log(`Key: ${key}`);
console.log(`Key Length: ${key.length}`);
process.exit(0);
