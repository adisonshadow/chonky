import * as crypto from 'node:crypto';
import * as path from 'node:path';
import * as fs from 'node:fs';

const REQ_ID_PATTERN = /^REQ-[A-Z][A-Z0-9-]*-\d{2,}$/;

export function isValidRequirementId(id: string): boolean {
  return REQ_ID_PATTERN.test(id);
}

export function generateChonkyId(
  componentName: string,
  sourceFile: string,
  sourceLine: number,
): string {
  const abbrev = componentName.toLowerCase().slice(0, 6).replace(/[^a-z]/g, '');
  const hash = crypto
    .createHash('md5')
    .update(`${sourceFile}:${sourceLine}:${componentName}`)
    .digest('hex')
    .slice(0, 6);
  return `${abbrev || 'el'}_${hash}`;
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function resolveOutputDir(projectRoot: string, ...segments: string[]): string {
  return path.resolve(projectRoot, '.chonky', ...segments);
}
