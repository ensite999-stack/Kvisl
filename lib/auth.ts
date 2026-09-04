import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'kvisl_admin';

function sessionValue() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) return null;
  return createHmac('sha256', secret).update(`kvisl:${password}`).digest('hex');
}

export async function isAdminAuthenticated() {
  const expected = sessionValue();
  if (!expected) return false;
  const store = await cookies();
  const actual = store.get(COOKIE_NAME)?.value;
  if (!actual || actual.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function createAdminSession() {
  const value = sessionValue();
  if (!value) throw new Error('Admin authentication environment variables are missing.');
  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
}

export function verifyPassword(value: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || value.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}
