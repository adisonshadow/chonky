import { useEffect } from 'react';
import type { SiteMessages } from '../types/messages';
import { SITE_ORIGIN, SKILL_MD_RAW_URL } from '../constants';

type Locale = 'en' | 'zh';

type SeoHeadProps = {
  locale: Locale;
  messages: SiteMessages;
};

function setContent(selector: string, value: string) {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) el.setAttribute('content', value);
}

export function SeoHead({ locale, messages }: SeoHeadProps) {
  useEffect(() => {
    const path = locale === 'zh' ? '/zh' : '/';
    const pageUrl = `${SITE_ORIGIN}${path}`;
    const description = `${messages.meta.description} SKILL.md raw: ${SKILL_MD_RAW_URL}`;

    document.title = messages.meta.title;
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';

    setContent('meta[name="description"]', description);
    setContent('meta[property="og:url"]', pageUrl);
    setContent('meta[property="og:title"]', messages.meta.title);
    setContent('meta[property="og:description"]', description);
    setContent('meta[name="twitter:title"]', messages.meta.title);
    setContent('meta[name="twitter:description"]', description);

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', pageUrl);
  }, [locale, messages]);

  return null;
}
