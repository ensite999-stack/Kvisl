import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Kvisl handles reader data, subscriptions and privacy.'
};

export default function PrivacyPage() {
  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">Privacy Policy</p>
        <h1>Read without being profiled.</h1>
        <p>Last updated: 4 September 2026.</p>
      </header>
      <div className="prose narrow">
        <p>Kvisl is designed to collect as little personal information as reasonably possible. We do not use advertising pixels, cross-site trackers, behavioural advertising systems or third-party marketing analytics.</p>
        <h2>Information we process</h2>
        <p>When you subscribe to email updates, we process the email address you provide so that we can maintain the subscription list. When you contact us, we process the information contained in your message in order to respond. Our hosting provider may process ordinary network and security information needed to deliver and protect the site.</p>
        <h2>Analytics and hosting</h2>
        <p>Kvisl uses Vercel for hosting, security and first-party web analytics. We do not add Google Analytics, Meta Pixel or comparable third-party advertising analytics. We configure the site to avoid sending article body text, email addresses or admin routes as custom analytics events.</p>
        <h2>Cookies and local storage</h2>
        <p>The public reading experience does not rely on Kvisl advertising or tracking cookies. Your selected visual theme is stored locally in your browser. The private editorial admin area uses a strictly necessary session cookie for authentication.</p>
        <h2>Legal bases and purposes</h2>
        <p>Where the GDPR or UK GDPR applies, subscription processing is based on your consent; correspondence is processed to answer your request and, where relevant, to take steps at your request; site security and limited operational analytics are processed for legitimate interests in operating a secure and useful publication.</p>
        <h2>Retention</h2>
        <p>Subscription addresses are retained until you unsubscribe or ask us to delete them. Correspondence is retained only as long as reasonably necessary for the purpose for which it was received, subject to legal or record-keeping requirements.</p>
        <h2>Your rights</h2>
        <p>Depending on where you live, you may have rights to access, correct, delete, restrict or object to processing, withdraw consent, receive a portable copy of certain data, or appeal a privacy decision. Residents covered by applicable US state privacy laws may also have rights concerning access, deletion and correction. Kvisl does not sell personal information or share it for cross-context behavioural advertising.</p>
        <h2>International processing</h2>
        <p>Infrastructure providers may process data in multiple countries. Where legally required, appropriate transfer mechanisms and contractual safeguards should be maintained by the relevant service provider and by Kvisl.</p>
        <h2>Children</h2>
        <p>Kvisl is a general-audience publication and is not directed to children under the age at which parental consent is required by applicable law.</p>
        <h2>Contact</h2>
        <p>Privacy requests can be sent to <a href="mailto:distributary@kvisl.com">distributary@kvisl.com</a>. Please write “Privacy” in the subject line.</p>
        <p className="fine-print">This policy describes the site configuration supplied with Kvisl. Legal obligations can vary by jurisdiction and by future service choices; review the policy when infrastructure or publishing practices change.</p>
      </div>
    </article>
  );
}
