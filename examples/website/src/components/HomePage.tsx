import type { SiteMessages } from '../types/messages';
import { CodeBlock } from './CodeBlock';
import { GITHUB_REPO_URL } from '../constants';

type HomePageProps = {
  messages: SiteMessages;
};

export function HomePage({ messages }: HomePageProps) {
  return (
    <div className="home">
      <section className="section hero">
        <p className="eyebrow">{messages.hero.badge}</p>
        <h1 className="hero__title">{messages.hero.title}</h1>
        <p className="hero__subtitle">{messages.hero.subtitle}</p>
        <div className="hero__actions">
          <a
            id="github-cta"
            className="btn btn--accent"
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
          >
            {messages.hero.ctaGithub}
          </a>
          <a className="btn btn--ghost" href={GITHUB_REPO_URL}>
            {messages.hero.ctaDocsRepo}
          </a>
        </div>
        <div className="hero__commands">
          <CodeBlock code={messages.hero.npmCreate} label="npm" language="bash" />
          <CodeBlock code={messages.hero.npmInstall} label="npm" language="bash" />
        </div>
      </section>

      <section className="section">
        <h2>{messages.compare.title}</h2>
        <div className="compare">
          <div className="compare__headers">
            <span>{messages.compare.leftHeader}</span>
            <span>{messages.compare.rightHeader}</span>
          </div>
          <ul className="compare__rows">
            {messages.compare.rows.map((row) => (
              <li key={row.traditional} className="compare__row">
                <span>{row.traditional}</span>
                <span>{row.chonky}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <h2>{messages.features.title}</h2>
        <ol className="feature-grid">
          {messages.features.items.map((item, index) => (
            <li key={item.title} className="feature-card">
              <span className="feature-card__index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
        <div className="snippet-grid">
          <CodeBlock
            code={messages.snippets.defineRequirement}
            label="defineRequirement"
            language="typescript"
          />
          <CodeBlock
            code={messages.snippets.machineAssert}
            label="machine:assert"
            language="typescript"
          />
          <CodeBlock code={messages.snippets.renderMeta} label="Render metadata" language="json" />
          <CodeBlock code={messages.snippets.ambiguity} label="Ambiguity policy" language="json" />
        </div>
      </section>

      <section className="section">
        <h2>{messages.quickstart.title}</h2>
        <p className="lede">{messages.quickstart.intro}</p>
        <ol className="steps">
          {messages.quickstart.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="muted">{messages.quickstart.tsconfigHint}</p>
        <p className="muted">{messages.quickstart.fileHint}</p>
      </section>

      <section className="section">
        <h2>{messages.audience.title}</h2>
        <ul className="bullets">
          {messages.audience.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section philosophy">
        <h2>{messages.philosophy.title}</h2>
        <blockquote className="pullquote">{messages.philosophy.quote}</blockquote>
        <p>{messages.philosophy.body}</p>
      </section>

      <section className="section">
        <h2>{messages.roadmap.title}</h2>
        <ul className="bullets">
          {messages.roadmap.phases.map((phase) => (
            <li key={phase}>{phase}</li>
          ))}
        </ul>
        <a className="text-link" href={messages.roadmap.linkHref}>
          {messages.roadmap.linkLabel}
        </a>
      </section>

      <section className="section">
        <h2>{messages.contributing.title}</h2>
        <p className="lede">{messages.contributing.intro}</p>
        <ul className="bullets">
          {messages.contributing.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>{messages.contributing.footer}</p>
        <div className="link-row">
          <a className="text-link" href={messages.contributing.contributingHref}>
            CONTRIBUTING.md
          </a>
          <a className="text-link" href={messages.contributing.issuesHref}>
            {messages.nav.issues}
          </a>
        </div>
      </section>
    </div>
  );
}
