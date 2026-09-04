import type { Metadata } from 'next';
import { CopyAddress } from './copy-address';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Kvisl with USDC on Base or Arbitrum One.'
};

const address = '0xFc71525c448cD9a7DDA6995F2898a8cB7959763A';

export default function DonatePage() {
  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">Support Kvisl</p>
        <h1>Keep independent thought independent.</h1>
        <p>Reader support helps fund editing, publishing and the quiet infrastructure behind Kvisl.</p>
      </header>
      <div className="prose narrow">
        <h2>USDC</h2>
        <p>We accept USDC to the same address on <strong>Base</strong> and <strong>Arbitrum One</strong>.</p>
        <div className="donation-address">
          <code>{address}</code>
          <CopyAddress value={address} />
        </div>
        <p className="fine-print">Send only USDC on Base or Arbitrum One. Blockchain transfers are generally irreversible; verify the network, asset and address before sending. Kvisl does not provide financial or tax advice.</p>
      </div>
    </article>
  );
}
