import * as path from 'node:path';
import { preprocess, chonkyBabelPlugin, loadChonkyConfig } from '@chonky/transpiler';
import type { ChonkyConfig } from '@chonky/transpiler';

interface ChonkyVitePluginOptions {
  projectRoot?: string;
  mode?: 'development' | 'production';
}

export function chonkyVitePlugin(options: ChonkyVitePluginOptions = {}) {
  const projectRoot = options.projectRoot ?? process.cwd();
  let resolvedMode: string = options.mode ?? 'development';
  let config: ChonkyConfig;

  return {
    name: 'chonky',
    enforce: 'pre' as const,

    configResolved(resolvedConfig: { mode: string }) {
      resolvedMode = options.mode ?? resolvedConfig.mode;
      config = loadChonkyConfig(projectRoot);
    },

    transform(code: string, id: string) {
      if (!/\.[jt]sx?$/.test(id)) return null;
      if (id.includes('node_modules')) return null;

      let processedCode = code;
      let hadMachineAssert = false;

      // Step 1: Preprocess machine:assert blocks
      if (code.includes('machine:assert')) {
        const result = preprocess(code, id);
        if (result.hadTransforms) {
          processedCode = result.code;
          hadMachineAssert = true;
        }
      }

      // Step 2: Check if file needs Babel transform
      const needsTransform =
        hadMachineAssert ||
        processedCode.includes('defineRequirement') ||
        (resolvedMode !== 'production' && /\.(tsx|jsx)$/.test(id));

      if (!needsTransform) return null;

      try {
        const babel = require('@babel/core');
        const result = babel.transformSync(processedCode, {
          filename: id,
          plugins: [
            [chonkyBabelPlugin, { projectRoot, mode: resolvedMode }],
          ],
          presets: (() => {
            const p: [string, Record<string, unknown>][] = [
              ['@babel/preset-typescript', { isTSX: id.endsWith('.tsx'), allExtensions: true }],
            ];
            if (/\.(tsx|jsx)$/.test(id)) {
              p.push(['@babel/preset-react', { runtime: 'automatic' }]);
            }
            return p;
          })(),
          sourceMaps: true,
        });

        if (result?.code) {
          return {
            code: result.code,
            map: result.map,
          };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[chonky/vite] Error transforming ${path.relative(projectRoot, id)}: ${message}`);
      }

      return null;
    },
  };
}

export default chonkyVitePlugin;
