import crypto from 'crypto';
export function hashUsername(username: string): string {
  return crypto
    .createHash('sha256')
    .update(username.toLowerCase())
    .digest('hex');
}
