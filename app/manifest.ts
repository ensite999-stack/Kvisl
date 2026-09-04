import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kvisl',
    short_name: 'Kvisl',
    description: 'Independent essays on nature, culture and human thought.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f0e8',
    theme_color: '#11110f',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
  };
}
