import crypto from 'crypto';

// Ensure your encryption key is exactly 32 bytes (256 bits) long
// Add ENCRYPTION_KEY="a-secure-32-character-string..." to your .env.local file
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; 
const ALGORITHM = 'aes-256-gcm';

export function encryptSecret(text: string): string {
    if (ENCRYPTION_KEY.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 32 characters long.');
    }

    // IV (Initialization Vector) ensures the same secret looks different every time it is saved
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');

    // Combine IV, Auth Tag, and Encrypted Text using colons so they can be saved in one DB field
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSecret(encryptedData: string): string {
    if (ENCRYPTION_KEY.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 32 characters long.');
    }

    const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) {
        throw new Error('Invalid encrypted data format.');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}
