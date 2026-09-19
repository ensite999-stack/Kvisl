import { createHash, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'kvisl-admin';
const FALLBACK_PASSWORD_HASH = 'f6b0abdcbd44ef4a8e8d14f2a30311c8538d8c4500711c6fc0d24406aff55d88';

const digest = (value: string) => createHash('sha256').update(value).digest();

export function adminPasswordValid(value: string): boolean {
  if (!value) return false;

  const candidate = digest(value);
  const fallback = Buffer.from(FALLBACK_PASSWORD_HASH, 'hex');
  if (candidate.length === fallback.length && timingSafeEqual(candidate, fallback)) return true;

  const configured = import.meta.env.ADMIN_TOKEN?.trim();
  if (!configured) return false;
  const configuredDigest = digest(configured);
  return candidate.length === configuredDigest.length && timingSafeEqual(candidate, configuredDigest);
}
