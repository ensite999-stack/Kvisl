import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Kvisl, an independent magazine exploring nature, culture and human thought.'
};

export default function AboutPage() {
  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">About Kvisl</p>
        <h1>A branch is only the beginning.</h1>
      </header>
      <div className="prose narrow">
        <p className="standfirst">“Kvisl” comes from the Old Norse <em>kvísl</em>: a fork in a branch, or a distributary in a river.</p>
        <p>We believe that an accidental meeting of ideas, a small divergence in thought, can become the beginning of a much wider exploration. Kvisl exists to look for those beginnings and for the possibilities that extend from them.</p>
        <p>We work at the meeting point of nature, culture and the human spirit. We turn away from the pressure of noisy algorithms and disposable information, and focus instead on carefully made essays and long-form writing that offer readers a more immersive, reflective and poetic place to think.</p>
        <p>Here, a passing curiosity may grow as freely as a wild plant. A quiet reflection may lead inward, outward, or somewhere unexpected. We are interested in the small idea and the large horizon, and in the paths between them.</p>
        <h2>Editorial position</h2>
        <p>Kvisl is independent. We do not sell behavioural profiles, use advertising trackers, or shape editorial decisions around engagement-maximising systems. We publish for readers rather than dashboards.</p>
        <h2>Contact</h2>
        <p>Editorial, submissions and general correspondence: <a href="mailto:distributary@kvisl.com">distributary@kvisl.com</a>.</p>
      </div>
    </article>
  );
}
