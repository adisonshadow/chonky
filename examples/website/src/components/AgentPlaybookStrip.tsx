import { useCallback, useState } from 'react';
import type { SiteMessages } from '../types/messages';
import { SKILL_MD_BLOB_URL, SKILL_MD_RAW_URL } from '../constants';

type AgentPlaybookStripProps = {
  messages: SiteMessages;
};

export function AgentPlaybookStrip({ messages }: AgentPlaybookStripProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SKILL_MD_RAW_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <section
      id="agent-skill-strip"
      className="agent-strip"
      aria-labelledby="agent-skill-strip-title"
      role="region"
    >
      <div className="agent-strip__inner">
        <p id="agent-skill-strip-title" className="agent-strip__title">
          {messages.agentStrip.title}
        </p>
        <p className="agent-strip__body">
          {messages.agentStrip.body}{' '}
          <span className="agent-strip__mono" translate="no">
            SKILL.md
          </span>{' '}
          <a className="agent-strip__link" href={SKILL_MD_RAW_URL}>
            {SKILL_MD_RAW_URL}
          </a>
        </p>
        <div className="agent-strip__actions">
          <button type="button" className="btn btn--ghost" onClick={onCopy}>
            {copied ? messages.agentStrip.copied : messages.agentStrip.copyUrl}
          </button>
          <a
            className="btn btn--accent"
            href={SKILL_MD_BLOB_URL}
            target="_blank"
            rel="noreferrer"
          >
            {messages.agentStrip.openNewTab}
          </a>
        </div>
      </div>
    </section>
  );
}
