import { issueSignedToken } from '@vercel/blob';
import { handleUploadPresigned, type HandleUploadPresignedBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';

const allowedContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif'
];

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadPresignedBody;
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!(await isAdminAuthenticated())) throw new Error('Unauthorized.');
        const validUntil = Date.now() + 10 * 60 * 1000;
        return {
          token: await issueSignedToken({
            pathname,
            operations: ['put'],
            allowedContentTypes,
            maximumSizeInBytes: 50 * 1024 * 1024,
            validUntil
          }),
          urlOptions: {
            allowedContentTypes,
            maximumSizeInBytes: 50 * 1024 * 1024,
            validUntil,
            addRandomSuffix: true,
            allowOverwrite: false,
            cacheControlMaxAge: 30 * 24 * 60 * 60
          }
        };
      }
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 400 }
    );
  }
}
