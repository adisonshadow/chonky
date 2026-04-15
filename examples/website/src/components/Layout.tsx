import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { SiteMessages } from '../types/messages';
import { AgentPlaybookStrip } from './AgentPlaybookStrip';
import { GITHUB_ISSUES_URL, GITHUB_REPO_URL } from '../constants';

const LOGO_URL =
  'https://raw.githubusercontent.com/adisonshadow/chonky/main/docs/logo.png';

type Locale = 'en' | 'zh';

type LayoutProps = {
  locale: Locale;
  messages: SiteMessages;
  children: ReactNode;
};

export function Layout({ locale, messages, children }: LayoutProps) {
  const otherPath = locale === 'en' ? '/zh' : '/';
  const otherLabel = locale === 'en' ? messages.nav.localeGoZh : messages.nav.localeGoEn;

  return (
    <div className="site">
      <AgentPlaybookStrip messages={messages} />
      <header className="site-header">
        <div className="site-header__brand">
          <img className="site-header__logo" src={LOGO_URL} alt="" width={48} height={48} />
          <div>
            <div className="site-header__org">{messages.org.name}</div>
            <div className="site-header__product">Chonky</div>
          </div>
        </div>
        <nav className="site-header__nav" aria-label="Primary">
          <a className="nav-link" href={GITHUB_REPO_URL}>
            {messages.nav.github}
          </a>
          <a className="nav-link" href={GITHUB_ISSUES_URL}>
            {messages.nav.issues}
          </a>
          <a
            className="nav-link"
            href="https://github.com/adisonshadow/chonky/blob/main/docs/ROADMAP.md"
          >
            {messages.nav.roadmap}
          </a>
          <NavLink id="locale-toggle" className="nav-link nav-link--pill" to={otherPath}>
            {otherLabel}
          </NavLink>
        </nav>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <p>{messages.footer.productNote}</p>
        <p className="site-footer__meta">
          <span>{messages.license.line}</span>
          <span aria-hidden="true"> · </span>
          <span>{messages.footer.site}</span>
        </p>
      </footer>
    </div>
  );
}
