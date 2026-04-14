import * as path from 'node:path';
import { preprocess, chonkyBabelPlugin, loadChonkyConfig } from '@chonky/transpiler';
import type { ChonkyConfig } from '@chonky/transpiler';

interface ChonkyWebpackPluginOptions {
  projectRoot?: string;
  mode?: 'development' | 'production';
}

interface WebpackCompiler {
  options: { mode?: string };
  hooks: {
    compilation: {
      tap: (name: string, callback: (compilation: unknown) => void) => void;
    };
  };
}

/**
 * Webpack plugin that integrates Chonky transformations into the build pipeline.
 * Uses a custom Webpack loader under the hood.
 */
export class ChonkyWebpackPlugin {
  private options: ChonkyWebpackPluginOptions;

  constructor(options: ChonkyWebpackPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: WebpackCompiler) {
    const projectRoot = this.options.projectRoot ?? process.cwd();
    const mode = this.options.mode ?? compiler.options.mode ?? 'development';
    const _config = loadChonkyConfig(projectRoot);

    compiler.hooks.compilation.tap('ChonkyWebpackPlugin', () => {
      // Plugin registered — loader handles per-file transformations
    });

    // Inject our loader at the start of the rule chain
    const loaderPath = require.resolve('./loader');
    const webpackOptions = compiler.options as unknown as {
      module?: { rules?: Array<{ test?: RegExp; use?: unknown[] }> };
    };

    if (!webpackOptions.module) {
      (webpackOptions as Record<string, unknown>).module = { rules: [] };
    }
    if (!webpackOptions.module!.rules) {
      webpackOptions.module!.rules = [];
    }

    webpackOptions.module!.rules.unshift({
      test: /\.[jt]sx?$/,
      use: [
        {
          loader: loaderPath,
          options: { projectRoot, mode },
        },
      ],
    });
  }
}

export default ChonkyWebpackPlugin;

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
