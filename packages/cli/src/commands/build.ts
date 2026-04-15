import { Command } from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { transformSync } from '@babel/core';
import { loadChonkyConfig, preprocess, chonkyBabelPlugin } from '@chonkylang/transpiler';

export function registerBuildCommand(program: Command): void {
  program
    .command('build')
    .description('Build project with Chonky transformations')
    .option('--root <path>', 'Project root directory', '.')
    .option('--mode <mode>', 'Build mode', 'production')
    .option('--outDir <path>', 'Output directory', 'dist')
    .action(async (opts: { root: string; mode: string; outDir: string }) => {
      const projectRoot = path.resolve(process.cwd(), opts.root);
      const config = loadChonkyConfig(projectRoot);
      const outDir = path.resolve(projectRoot, opts.outDir);

      console.log('\n  chonky build');
      console.log(`  Mode: ${opts.mode}`);
      console.log(`  Project root: ${projectRoot}`);
      console.log(`  Output: ${outDir}\n`);

      const srcDir = path.join(projectRoot, 'src');
      if (!fs.existsSync(srcDir)) {
        console.error('  Error: src/ directory not found.');
        process.exit(1);
      }

      const files = collectSourceFiles(srcDir);
      let processed = 0;
      let errors = 0;

      for (const file of files) {
        try {
          let code = fs.readFileSync(file, 'utf-8');

          // Preprocess machine:assert syntax
          if (code.includes('machine:assert')) {
            const preprocessed = preprocess(code, file);
            if (preprocessed.hadTransforms) {
              code = preprocessed.code;
            }
          }

          // Apply Babel plugin
          const result = transformSync(code, {
            filename: file,
            plugins: [
              [chonkyBabelPlugin, { projectRoot, mode: opts.mode }],
            ],
            presets: [
              ['@babel/preset-typescript', { isTSX: file.endsWith('.tsx'), allExtensions: true }],
            ],
            sourceMaps: true,
          });

          if (result?.code) {
            const relPath = path.relative(srcDir, file);
            const outPath = path.join(outDir, relPath.replace(/\.tsx?$/, '.js'));
            const outFileDir = path.dirname(outPath);
            if (!fs.existsSync(outFileDir)) {
              fs.mkdirSync(outFileDir, { recursive: true });
            }
            fs.writeFileSync(outPath, result.code, 'utf-8');
            if (result.map) {
              fs.writeFileSync(outPath + '.map', JSON.stringify(result.map), 'utf-8');
            }
            processed++;
          }
        } catch (err) {
          errors++;
          const message = err instanceof Error ? err.message : String(err);
          const relFile = path.relative(projectRoot, file);
          console.error(`  Error processing ${relFile}: ${message}`);
        }
      }

      console.log(`\n  Build complete: ${processed} file(s) processed, ${errors} error(s).`);

      if (config.ambiguity?.generateReport) {
        const reportPath = path.resolve(
          projectRoot,
          config.ambiguity.reportPath ?? '.chonky/ambiguity-report.json',
        );
        if (fs.existsSync(reportPath)) {
          console.log(`  Ambiguity report: ${path.relative(projectRoot, reportPath)}`);
        }
      }

      console.log('');

      if (errors > 0) {
        process.exit(1);
      }
    });
}

function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__tests__' || entry.name.startsWith('.')) continue;
      results.push(...collectSourceFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }

  return results;
}
