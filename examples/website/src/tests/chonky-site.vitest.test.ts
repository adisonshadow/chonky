import { describe, expect, it } from 'vitest';
import { GITHUB_REPO_URL, SITE_ORIGIN, SKILL_MD_RAW_URL } from '../constants';

describe('Chonky website policy (REQ-SITE-*)', () => {
  it('exposes a stable SKILL.md raw URL', () => {
    expect(SKILL_MD_RAW_URL).toContain('SKILL.md');
    expect(SKILL_MD_RAW_URL).toContain('raw.githubusercontent.com');
  });

  it('uses documented locale paths', () => {
    expect('/').toBe('/');
    expect('/zh').toBe('/zh');
  });

  it('points the primary CTA at the public GitHub repository', () => {
    expect(GITHUB_REPO_URL).toContain('github.com/adisonshadow/chonky');
  });

  it('uses the production site origin', () => {
    expect(SITE_ORIGIN).toBe('https://www.rollyarn.com');
  });
});
