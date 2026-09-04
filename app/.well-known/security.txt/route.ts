export function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://kvisl.com';
  return new Response(`Contact: mailto:distributary@kvisl.com
Canonical: ${base}/.well-known/security.txt
Preferred-Languages: en
Policy: ${base}/privacy
Expires: 2027-09-04T00:00:00.000Z
`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
