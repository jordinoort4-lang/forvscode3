import crypto from 'node:crypto';

export function signBody(body: string, secret: string) {
  const h = crypto.createHmac('sha256', secret).update(body).digest('base64');
  return `sha256=${h}`;
}
