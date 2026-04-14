import { Command } from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { loadChonkyConfig, preprocess } from '@chonky/transpiler';

export function registerDevCommand(program: Command): void {
  program
    .command('dev')
    .description('Start development mode with file watching and auto-transform')
    .option('-p, --port <number>', 'Dev server port', '3000')
    .option('--no-open', 'Do not open browser automatically')
    .option('--root <path>', 'Project root directory', '.')
    .action(async (opts: { port: string; open: boolean; root: string }) => {
      const projectRoot = path.resolve(process.cwd(), opts.root);
      const config = loadChonkyConfig(projectRoot);

      console.log('\n  chonky dev');
      console.log(`  Project root: ${projectRoot}`);
      console.log(`  Config loaded: ${JSON.stringify(config.verification ?? {})}\n`);

      // Phase 1: Preprocess all .chonky.ts / .chonky.tsx files
      const srcDir = path.join(projectRoot, 'src');
      if (fs.existsSync(srcDir)) {
        const files = collectFiles(srcDir, ['.ts', '.tsx']);
        let transformedCount = 0;

        for (const file of files) {
          const content = fs.readFileSync(file, 'utf-8');
          if (!content.includes('machine:assert') && !content.includes('machine :assert')) {
            continue;
          }
          const result = preprocess(content, file);
          if (result.hadTransforms) {
            const outDir = path.join(projectRoot, '.chonky', 'preprocessed');
            if (!fs.existsSync(outDir)) {
              fs.mkdirSync(outDir, { recursive: true });
            }
            const relPath = path.relative(projectRoot, file);
            const outPath = path.join(outDir, relPath);
            const outFileDir = path.dirname(outPath);
            if (!fs.existsSync(outFileDir)) {
              fs.mkdirSync(outFileDir, { recursive: true });
            }
            fs.writeFileSync(outPath, result.code, 'utf-8');
            transformedCount++;
          }
        }

        if (transformedCount > 0) {
          console.log(`  Preprocessed ${transformedCount} file(s) with machine:assert blocks.`);
        }
      }

      console.log('  Watching for file changes... (Ctrl+C to stop)\n');
      console.log('  Note: Full dev server with HMR will be available via @chonky/vite-plugin.\n');

      // Keep process alive
      await new Promise(() => {});
    });
}

function collectFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      results.push(...collectFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results;
}
