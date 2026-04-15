import { loadChonkyConfig } from '@chonkylang/transpiler';

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

export { chonkyWebpackLoader } from './webpack-transform';
