import { createHash, createHmac, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';

export const runtime = 'nodejs';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const maxFileSize = 12 * 1024 * 1024;

function sha256(data: string | Uint8Array) {
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key: string | Buffer, value: string) {
  return createHmac('sha256', key).update(value).digest();
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl: publicUrl.replace(/\/+$/, '')
  };
}

async function putR2Object(file: File, key: string) {
  const config = r2Config();
  if (!config) {
    throw new Error('R2_NOT_CONFIGURED');
  }

  const body = new Uint8Array(await file.arrayBuffer());
  const payloadHash = sha256(body);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${encodePathSegment(config.bucket)}/${key
    .split('/')
    .map(encodePathSegment)
    .join('/')}`;
  const canonicalHeaders = [
    `content-type:${file.type}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`
  ].join('\n') + '\n';
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest)
  ].join('\n');

  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, service);
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate
    },
    body
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    console.error(`Cloudflare R2 upload failed (${response.status}): ${detail}`);
    throw new Error('R2_UPLOAD_FAILED');
  }

  const publicPath = key.split('/').map(encodePathSegment).join('/');
  return `${config.publicUrl}/${publicPath}`;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  if (!r2Config()) {
    return NextResponse.json({ message: 'Cloudflare R2 is not configured.' }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No file supplied.' }, { status: 400 });
  }
  if (!allowed.has(file.type) || file.size > maxFileSize) {
    return NextResponse.json({ message: 'Use JPG, PNG, WebP, AVIF or GIF up to 12 MB.' }, { status: 400 });
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-100) || 'image';
  const key = `editorial/${Date.now()}-${randomUUID()}-${safe}`;

  try {
    const url = await putR2Object(file, key);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof Error && error.message === 'R2_NOT_CONFIGURED') {
      return NextResponse.json({ message: 'Cloudflare R2 is not configured.' }, { status: 503 });
    }
    return NextResponse.json({ message: 'Image upload failed.' }, { status: 502 });
  }
}
