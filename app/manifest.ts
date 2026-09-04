import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kvisl',
    short_name: 'Kvisl',
    description: 'Ideas begin by branching. Independent essays on nature, culture and human thought.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f4ed',
    theme_color: '#181816',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
  };
}
