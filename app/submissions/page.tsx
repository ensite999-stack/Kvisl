import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submissions',
  description: 'Pitch essays and long-form work to Kvisl.'
};

export default function SubmissionsPage() {
  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">Submissions</p>
        <h1>Send us a branch worth following.</h1>
      </header>
      <div className="prose narrow">
        <p>We welcome original essays and long-form work at the meeting point of nature, culture and human thought.</p>
        <p>Send a short pitch, a brief note about why the piece belongs at Kvisl, and relevant links or attachments to <a href="mailto:distributary@kvisl.com?subject=Submission%20to%20Kvisl">distributary@kvisl.com</a>.</p>
        <p>Please state whether the work is unpublished and whether it is under consideration elsewhere.</p>
        <h2>What we look for</h2>
        <p>We are especially interested in writing that moves patiently between observation and argument, and that opens a larger question through a precise detail, place, idea, object or encounter.</p>
        <p>Nature, history, philosophy, science, art, language, technology and lived experience are all welcome when treated with care, originality and intellectual independence.</p>
      </div>
    </article>
  );
}
