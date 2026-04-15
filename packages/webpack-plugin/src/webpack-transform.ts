import * as path from 'node:path';
import { preprocess, chonkyBabelPlugin } from '@chonky/transpiler';

/**
 * Standalone transform function for use in custom loader setups.
 */
export function chonkyWebpackLoader(
  source: string,
  filename: string,
  options: { projectRoot: string; mode: string },
): { code: string; map?: unknown } | null {
  if (filename.includes('node_modules')) return null;

  let code = source;
  let hadMachineAssert = false;

  if (code.includes('machine:assert')) {
    const result = preprocess(code, filename);
    if (result.hadTransforms) {
      code = result.code;
      hadMachineAssert = true;
    }
  }

  const needsTransform =
    hadMachineAssert ||
    code.includes('defineRequirement') ||
    (options.mode !== 'production' && /\.(tsx|jsx)$/.test(filename));

  if (!needsTransform) return null;

  try {
    const babel = require('@babel/core');
    const result = babel.transformSync(code, {
      filename,
      plugins: [
        [chonkyBabelPlugin, { projectRoot: options.projectRoot, mode: options.mode }],
      ],
      presets: [
        ['@babel/preset-typescript', { isTSX: filename.endsWith('.tsx'), allExtensions: true }],
      ],
      sourceMaps: true,
    });

    if (result?.code) {
      return { code: result.code, map: result.map };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[chonky/webpack] Error: ${path.relative(options.projectRoot, filename)}: ${message}`);
  }

  return null;
}
