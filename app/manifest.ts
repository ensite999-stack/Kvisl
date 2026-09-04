import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kvisl',
    short_name: 'Kvisl',
    description: 'Sparking Thought, Growing Wild. Independent essays on nature, culture and human thought.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f1ec',
    theme_color: '#171714',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
  };
}
