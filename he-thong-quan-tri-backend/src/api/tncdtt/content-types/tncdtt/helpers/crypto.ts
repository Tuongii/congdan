import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.FIELD_ENCRYPTION_KEY || 'default-military-secret-key-qk2-2026';

// Tạo khóa 32-byte từ chuỗi khóa cấu hình (bằng thuật toán băm sha256)
const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

/**
 * Mã hóa chuỗi ký tự bằng thuật toán AES-256-GCM
 */
export function encrypt(text: string | null | undefined): string | null {
  if (!text) return null;
  
  const textStr = String(text).trim();
  if (!textStr) return null;

  // Tránh việc mã hóa lặp nếu đã được mã hóa trước đó
  if (textStr.startsWith('enc:')) {
    return textStr;
  }

  try {
    const iv = crypto.randomBytes(12); // Vector khởi tạo 12-byte cho GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(textStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Trả về định dạng: enc:iv:authTag:ciphertext
    return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Lỗi khi mã hóa dữ liệu:', error);
    return textStr; // Trả về text gốc nếu lỗi
  }
}

/**
 * Giải mã chuỗi ký tự được mã hóa bằng AES-256-GCM
 */
export function decrypt(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return null;
  
  const encStr = String(encryptedText).trim();
  if (!encStr) return null;

  // Nếu không phải là chuỗi đã mã hóa thì trả về trực tiếp (giúp tương thích dữ liệu cũ)
  if (!encStr.startsWith('enc:')) {
    return encStr;
  }

  try {
    const parts = encStr.split(':');
    if (parts.length !== 4) {
      return encStr;
    }

    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const ciphertext = parts[3];

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Lỗi khi giải mã dữ liệu:', error);
    return encStr; // Trả về chuỗi gốc nếu giải mã thất bại
  }
}
