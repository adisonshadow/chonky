import { defineRequirement } from '@chonkylang/runtime';

export const skillPlaybookStripRequirement = defineRequirement({
  id: 'REQ-SITE-SKILL-01',
  name: 'Agent SKILL.md strip',
  description:
    'The landing page must surface SKILL.md as the canonical machine-first playbook for AI assistants above the main navigation.',
  triggers: [
    {
      type: 'UI_EVENT',
      target: 'Region#agent-skill-strip',
      event: 'mount',
    },
  ],
  expectedOutcomes: [
    {
      condition: 'visible',
      actions: ['expose_raw_skill_md_url', 'offer_copy_and_open_actions'],
    },
  ],
});

export const localeToggleRequirement = defineRequirement({
  id: 'REQ-SITE-LOCALE-01',
  name: 'Locale toggle',
  description: 'Visitors can switch between English (default) and Chinese routes.',
  triggers: [
    {
      type: 'UI_EVENT',
      target: 'Link#locale-toggle',
      event: 'click',
    },
  ],
  expectedOutcomes: [
    {
      condition: 'success',
      actions: ['navigate_between_/ and_/zh'],
    },
  ],
});

export const primaryCtaRequirement = defineRequirement({
  id: 'REQ-SITE-CTA-01',
  name: 'Primary repository CTA',
  description: 'Hero exposes a clear call-to-action to the public GitHub repository.',
  triggers: [
    {
      type: 'UI_EVENT',
      target: 'Button#github-cta',
      event: 'click',
    },
  ],
  expectedOutcomes: [
    {
      condition: 'success',
      actions: ['open_github_repository'],
    },
  ],
});
