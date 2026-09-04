import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'Kvisl accessibility standards, measures, limitations and feedback process.'
};

export default function AccessibilityPage() {
  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">Accessibility</p>
        <h1>Reading should not depend on a particular body, browser or input device.</h1>
        <p>Last reviewed: 5 September 2026.</p>
      </header>

      <div className="prose narrow">
        <h2>Conformance target</h2>
        <p>
          <span className="notranslate" translate="no">Kvisl</span> is designed and maintained against the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as its baseline. We also adopt relevant WCAG 2.2 improvements where they strengthen keyboard access, focus visibility, target sizing and authentication accessibility.
        </p>
        <p>
          Our implementation is intended to support the accessibility requirements and principles relevant to the European Accessibility Act and EN 301 549 in the European Union, and the Americans with Disabilities Act and Section 508 in the United States where those frameworks apply. This statement describes our engineering target; it is not a third-party certification or legal guarantee of compliance in every jurisdiction.
        </p>

        <h2>Measures built into the site</h2>
        <ul>
          <li>Semantic page landmarks, headings, article structure, lists, labels and native form controls wherever practical.</li>
          <li>A keyboard-accessible skip link, navigation, search, newsletter controls and visible focus indicators.</li>
          <li>Touch and pointer controls sized and spaced to reduce accidental activation on mobile devices.</li>
          <li>Text and layouts designed to resize and reflow at narrow widths without requiring two-dimensional scrolling for ordinary reading content.</li>
          <li>Light, dark and eye-comfort themes that preserve text and interface contrast rather than relying on colour alone to communicate state.</li>
          <li>Reduced-motion support and no essential task that depends on animation, drag gestures or hover-only interaction.</li>
          <li>Alternative-text support for editorial cover images, decorative-image handling, and descriptive labels for icon-only controls.</li>
          <li>Programmatic form labels, native email validation, clear status announcements and error feedback that can be exposed to assistive technology.</li>
          <li>Support for forced-colour and increased-contrast user preferences where the browser exposes them.</li>
        </ul>

        <h2>Content and editorial practice</h2>
        <p>Editors are expected to provide meaningful alternative text for images that carry editorial information, preserve a logical heading hierarchy, use descriptive link text, avoid conveying meaning through colour alone, and provide text equivalents when non-text material is necessary to understand an article.</p>

        <h2>Known limits</h2>
        <p>Accessibility is an ongoing engineering and editorial process. Third-party destinations, linked media and user-supplied descriptions can vary in quality. We prioritise defects that block reading, navigation, subscription, search or other core tasks.</p>

        <h2>Feedback and accommodation</h2>
        <p>If you encounter a barrier, email <a href="mailto:distributary@kvisl.com">distributary@kvisl.com</a> with the page URL and a short description of the problem. If useful, include the browser, operating system or assistive technology involved. We will use that information to investigate the barrier and, where practical, provide an accessible alternative while it is being corrected.</p>
      </div>
    </article>
  );
}
