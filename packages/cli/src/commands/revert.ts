import { Command } from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fromSemanticView, loadChonkyConfig, chonkyBabelPlugin } from '@chonkylang/transpiler';

export function registerRevertCommand(program: Command): void {
  program
    .command('revert <file>')
    .description('Reverse-compile a human-readable semantic file back to machine-optimized format')
    .option('--root <path>', 'Project root directory', '.')
    .option('-o, --output <path>', 'Write output to a different file (default: overwrite in-place)')
    .option('--dry-run', 'Show what would change without writing files')
    .option('--apply-babel', 'Also run the Chonky Babel plugin after reverting', false)
    .action(async (file: string, opts: { root: string; output?: string; dryRun: boolean; applyBabel: boolean }) => {
      const projectRoot = path.resolve(process.cwd(), opts.root);
      const filePath = path.resolve(process.cwd(), file);

      if (!fs.existsSync(filePath)) {
        console.error(`  Error: file not found — ${file}`);
        process.exit(1);
      }

      const source = fs.readFileSync(filePath, 'utf-8');

      console.log('\n  chonky revert');
      console.log(`  Input: ${path.relative(process.cwd(), filePath)}`);

      const result = fromSemanticView(source, filePath, {
        projectRoot,
        compact: true,
      });

      let finalCode = result.code;

      // Optionally apply Babel plugin to regenerate manifests/test files
      if (opts.applyBabel) {
        try {
          const babel = require('@babel/core');
          const config = loadChonkyConfig(projectRoot);
          const babelResult = babel.transformSync(finalCode, {
            filename: filePath,
            plugins: [
              [chonkyBabelPlugin, { projectRoot, mode: 'development' }],
            ],
            presets: [
              ['@babel/preset-typescript', {
                isTSX: filePath.endsWith('.tsx'),
                allExtensions: true,
              }],
            ],
          });
          if (babelResult?.code) {
            finalCode = babelResult.code;
          }
          console.log('  Babel plugin applied (manifests/tests regenerated).');
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`  Warning: Babel transform failed — ${message}`);
        }
      }

      if (!result.hadTransforms && finalCode === source) {
        console.log('  No changes needed — file is already in machine format.\n');
        return;
      }

      if (opts.dryRun) {
        console.log('  [dry-run] Changes detected but not written.\n');
        console.log(finalCode);
        return;
      }

      const outPath = opts.output
        ? path.resolve(process.cwd(), opts.output)
        : filePath;

      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(outPath, finalCode, 'utf-8');
      console.log(`  Output: ${path.relative(process.cwd(), outPath)}`);
      console.log('  Done.\n');
    });
}
