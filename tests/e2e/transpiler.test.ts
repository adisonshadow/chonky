import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { transformSync } from '@babel/core';
import {
  preprocess,
  chonkyBabelPlugin,
  loadChonkyConfig,
  toSemanticView,
  fromSemanticView,
} from '@chonkylang/transpiler';

const FIXTURES = path.resolve(__dirname, '../fixtures');

function readFixture(name: string): string {
  return fs.readFileSync(path.join(FIXTURES, name), 'utf-8');
}

// -------------------------------------------------------------------
// Test 1: defineRequirement full pipeline
// -------------------------------------------------------------------
describe('Test 1: defineRequirement full pipeline', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chonky-test-req-'));
    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    const fixture = readFixture('sample-requirement.ts');
    fs.writeFileSync(path.join(tmpDir, 'src', 'login.req.ts'), fixture);
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('preprocessor passes through non-assert code unchanged', () => {
    const source = readFixture('sample-requirement.ts');
    const result = preprocess(source);
    expect(result.hadTransforms).toBe(false);
    expect(result.code).toBe(source);
  });

  test('babel plugin extracts defineRequirement and generates manifest', () => {
    const source = readFixture('sample-requirement.ts');
    const filename = path.join(tmpDir, 'src', 'login.req.ts');

    const result = transformSync(source, {
      filename,
      plugins: [[chonkyBabelPlugin, { projectRoot: tmpDir, mode: 'development' }]],
      presets: [['@babel/preset-typescript', { allExtensions: true }]],
    });

    expect(result?.code).toBeDefined();
    // defineRequirement() call should be stripped (replaced with object literal)
    expect(result!.code).not.toContain('defineRequirement({');
    expect(result!.code).not.toContain('defineRequirement({\n');

    // Manifest JSON should be written
    const manifestPath = path.join(tmpDir, '.chonky', 'requirements', 'REQ-USER-LOGIN-01.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.id).toBe('REQ-USER-LOGIN-01');
    expect(manifest.name).toBe('User Login');
    expect(manifest.triggers).toHaveLength(1);
    expect(manifest.sourceFile).toContain('login.req.ts');
    expect(manifest._chonky.version).toBe('1.0');

    // Index should be written
    const indexPath = path.join(tmpDir, '.chonky', 'requirements', 'index.json');
    expect(fs.existsSync(indexPath)).toBe(true);
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    expect(index.requirements).toHaveLength(1);
    expect(index.requirements[0].id).toBe('REQ-USER-LOGIN-01');
  });
});

// -------------------------------------------------------------------
// Test 2: machine:assert full pipeline
// -------------------------------------------------------------------
describe('Test 2: machine:assert full pipeline', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chonky-test-assert-'));
    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('preprocessor converts machine:assert to __chonky_assert__', () => {
    const source = readFixture('sample-assert.ts');
    const result = preprocess(source);

    expect(result.hadTransforms).toBe(true);
    expect(result.code).toContain('__chonky_assert__("REQ-USER-LOGIN-01"');
    expect(result.code).toContain('"Valid login succeeds"');
    expect(result.code).toContain('"Empty username fails"');
    expect(result.code).not.toContain('machine:assert');
  });

  test('babel plugin generates test files from __chonky_assert__', () => {
    const source = readFixture('sample-assert.ts');
    const preprocessed = preprocess(source);
    const filename = path.join(tmpDir, 'src', 'login-assert.ts');
    fs.writeFileSync(filename, preprocessed.code);

    const result = transformSync(preprocessed.code, {
      filename,
      plugins: [[chonkyBabelPlugin, { projectRoot: tmpDir, mode: 'development' }]],
      presets: [['@babel/preset-typescript', { allExtensions: true }]],
    });

    expect(result?.code).toBeDefined();
    // __chonky_assert__ should be removed from output
    expect(result!.code?.trim()).toBe('');

    // Test file should be generated
    const testFile = path.join(tmpDir, 'src', '__tests__', 'REQ-USER-LOGIN-01.test.ts');
    expect(fs.existsSync(testFile)).toBe(true);

    const testContent = fs.readFileSync(testFile, 'utf-8');
    expect(testContent).toContain('@chonkylang-generated');
    expect(testContent).toContain('REQ-USER-LOGIN-01');
    expect(testContent).toContain('Valid login succeeds');
    expect(testContent).toContain('Empty username fails');
    expect(testContent).toContain("from '@chonkylang/runtime/test'");
  });
});

// -------------------------------------------------------------------
// Test 3: JSX data-chonky-id injection
// -------------------------------------------------------------------
describe('Test 3: JSX data-chonky-id injection', () => {
  test('babel plugin injects data-chonky-id on JSX elements in dev mode', () => {
    const source = readFixture('sample-jsx.tsx');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chonky-test-jsx-'));

    try {
      const result = transformSync(source, {
        filename: path.join(tmpDir, 'src', 'LoginForm.tsx'),
        plugins: [[chonkyBabelPlugin, { projectRoot: tmpDir, mode: 'development' }]],
        presets: [
          ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      });

      expect(result?.code).toBeDefined();
      expect(result!.code).toContain('data-chonky-id');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('babel plugin skips data-chonky-id in production mode', () => {
    const source = readFixture('sample-jsx.tsx');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chonky-test-jsx-prod-'));

    try {
      const result = transformSync(source, {
        filename: path.join(tmpDir, 'src', 'LoginForm.tsx'),
        plugins: [[chonkyBabelPlugin, { projectRoot: tmpDir, mode: 'production' }]],
        presets: [
          ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      });

      expect(result?.code).toBeDefined();
      expect(result!.code).not.toContain('data-chonky-id');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

// -------------------------------------------------------------------
// Test 4: Ambiguity resolution
// -------------------------------------------------------------------
describe('Test 4: Ambiguity resolution', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chonky-test-ambiguity-'));
    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    // Copy policy manifest
    const pm = readFixture('pm-requirement.json');
    fs.writeFileSync(path.join(tmpDir, 'pm-requirement.json'), pm);
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('detects excluded imports and APIs, generates ambiguity report', () => {
    const source = readFixture('sample-ambiguity.ts');
    const filename = path.join(tmpDir, 'src', 'legacy.ts');

    // Should not throw (severity is "warning")
    const consoleSpy: string[] = [];
    const origWarn = console.warn;
    console.warn = (msg: string) => consoleSpy.push(msg);

    try {
      transformSync(source, {
        filename,
        plugins: [[chonkyBabelPlugin, { projectRoot: tmpDir, mode: 'development' }]],
        presets: [['@babel/preset-typescript', { allExtensions: true }]],
      });
    } finally {
      console.warn = origWarn;
    }

    // Warnings should have been logged
    expect(consoleSpy.some((m) => m.includes('RULE-NO-LEGACY'))).toBe(true);
    expect(consoleSpy.some((m) => m.includes('legacy-module'))).toBe(true);

    // Report should be generated
    const reportPath = path.join(tmpDir, '.chonky', 'ambiguity-report.json');
    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    expect(report.totalViolations).toBeGreaterThanOrEqual(1);
    expect(report.violations[0].ruleId).toBe('RULE-NO-LEGACY');
  });
});

// -------------------------------------------------------------------
// Test 5: view / revert roundtrip
// -------------------------------------------------------------------
describe('Test 5: view / revert roundtrip', () => {
  test('toSemanticView restores machine:assert blocks', () => {
    const source = readFixture('sample-assert.ts');
    const preprocessed = preprocess(source);

    const viewResult = toSemanticView(preprocessed.code, 'test.ts', {});
    expect(viewResult.code).toContain('machine:assert');
    expect(viewResult.code).toContain('REQ-USER-LOGIN-01');
    expect(viewResult.requirementIds).toContain('REQ-USER-LOGIN-01');
  });

  test('fromSemanticView converts machine:assert back to __chonky_assert__', () => {
    const source = readFixture('sample-assert.ts');
    const revertResult = fromSemanticView(source, 'test.ts');

    expect(revertResult.hadTransforms).toBe(true);
    expect(revertResult.code).toContain('__chonky_assert__');
    expect(revertResult.code).not.toContain('machine:assert');
  });

  test('view->revert roundtrip preserves __chonky_assert__ content', () => {
    // Start from preprocessed code (machine format)
    const original = readFixture('sample-assert.ts');
    const preprocessed = preprocess(original);

    // view: machine -> human
    const viewResult = toSemanticView(preprocessed.code, 'test.ts');
    expect(viewResult.code).toContain('machine:assert');

    // revert: human -> machine
    const revertResult = fromSemanticView(viewResult.code, 'test.ts');
    expect(revertResult.code).toContain('__chonky_assert__');
    expect(revertResult.code).toContain('REQ-USER-LOGIN-01');
    expect(revertResult.code).toContain('Valid login succeeds');
    expect(revertResult.code).toContain('Empty username fails');
  });
});

// -------------------------------------------------------------------
// Test 6: CLI integration (lightweight — verifies commands exist)
// -------------------------------------------------------------------
describe('Test 6: CLI integration', () => {
  test('CLI creates all expected commands', async () => {
    // Import createCli dynamically to avoid full CLI bootstrap
    const { createCli } = await import('@chonkylang/cli');
    const cli = createCli();

    const commandNames = cli.commands.map((c) => c.name());
    expect(commandNames).toContain('init');
    expect(commandNames).toContain('dev');
    expect(commandNames).toContain('build');
    expect(commandNames).toContain('graph');
    expect(commandNames).toContain('optimize');
    expect(commandNames).toContain('view');
    expect(commandNames).toContain('revert');
    expect(commandNames).toContain('requirements');

    const requirementsCmd = cli.commands.find((c) => c.name() === 'requirements');
    const subNames = requirementsCmd?.commands.map((c) => c.name()) ?? [];
    expect(subNames).toContain('search');
  });
});
