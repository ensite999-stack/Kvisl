import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1536 1536">
        <rect width="1536" height="1536" fill="#fbfaf5" />
        <path
          d="M869 170 234 502 234 1039 841 1366 1301 1129 290 769 1300 408Z"
          fill="#000000"
        />
      </svg>
    ),
    {
      width: 512,
      height: 512,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  );
}
