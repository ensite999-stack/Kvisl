import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'Kvisl accessibility goals, standards and contact information.'
};

export default function AccessibilityPage() {
  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">Accessibility</p>
        <h1>Reading should not depend on a particular body, browser or input device.</h1>
        <p>Last reviewed: 4 September 2026.</p>
      </header>
      <div className="prose narrow">
        <p>Kvisl aims to meet WCAG 2.2 Level AA and to support the accessibility principles reflected in the European Accessibility Act, EN 301 549, the Americans with Disabilities Act and Section 508 where those frameworks apply.</p>
        <h2>Measures built into the site</h2>
        <ul>
          <li>Semantic headings, landmarks and article structure.</li>
          <li>Keyboard-operable navigation, visible focus states and a skip link.</li>
          <li>Text that can be resized and reflowed without requiring horizontal scrolling at ordinary mobile widths.</li>
          <li>Light, dark and eye-comfort reading modes with strong contrast targets.</li>
          <li>Reduced-motion support and no essential interaction that depends on animation.</li>
          <li>Alternative text fields for editorial images and decorative-image handling.</li>
          <li>Form labels, status announcements and error messaging designed for assistive technology.</li>
        </ul>
        <h2>Known limits</h2>
        <p>Accessibility is an ongoing engineering and editorial process. User-supplied image descriptions and third-party material can vary in quality. We review issues as they are found and prioritise barriers that prevent reading, navigation or submission.</p>
        <h2>Feedback</h2>
        <p>If you encounter a barrier, email <a href="mailto:distributary@kvisl.com">distributary@kvisl.com</a> with the page URL and a short description of the problem. If useful, include the browser, operating system or assistive technology involved.</p>
      </div>
    </article>
  );
}
