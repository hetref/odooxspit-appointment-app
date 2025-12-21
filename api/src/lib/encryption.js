const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY_LENGTH = 32; // AES-256 requires 32 bytes

function getEncryptionKey() {
    let key = process.env.BOLNA_ENCRYPTION_KEY;
    
    if (!key) {
        // Use a default key for development (not recommended for production)
        console.warn('BOLNA_ENCRYPTION_KEY not set. Using default key.');
        key = 'default-bolna-encryption-key-32!';
    }
    
    // Hash the key to ensure it's exactly 32 bytes
    // This allows any length key to work
    return crypto.createHash('sha256').update(key).digest();
}

function encrypt(text) {
    if (!text) return null;
    
    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Format: iv:authTag:encryptedData
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Failed to encrypt data');
    }
}

function decrypt(encryptedText) {
    if (!encryptedText) return null;
    
    try {
        const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
        
        if (!ivHex || !authTagHex || !encrypted) {
            throw new Error('Invalid encrypted data format');
        }
        
        const key = getEncryptionKey();
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        return null;
    }
}

module.exports = { encrypt, decrypt };
