import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f3f0e8',
          color: '#11110f',
          padding: '76px 84px',
          fontFamily: 'Georgia, serif'
        }}
      >
        <div style={{ fontSize: 42, letterSpacing: '0.08em' }}>KVISL</div>
        <div style={{ fontSize: 82, lineHeight: 1.02, maxWidth: 880 }}>A branch is only the beginning.</div>
        <div style={{ fontSize: 28, fontFamily: 'Arial, sans-serif' }}>Nature · Culture · Human thought</div>
      </div>
    ),
    size
  );
}
