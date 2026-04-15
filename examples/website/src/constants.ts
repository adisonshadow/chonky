export const SITE_ORIGIN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  'https://www.rollyarn.com';

export const SKILL_MD_RAW_URL =
  'https://raw.githubusercontent.com/adisonshadow/chonky/main/.cursor/skills/chonky-development/SKILL.md';

export const SKILL_MD_BLOB_URL =
  'https://github.com/adisonshadow/chonky/blob/main/.cursor/skills/chonky-development/SKILL.md';

export const GITHUB_REPO_URL = 'https://github.com/adisonshadow/chonky';

/** Public repos always have /issues; Discussions may be disabled (404 on /discussions). */
export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;
