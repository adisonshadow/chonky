import { Command } from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { loadChonkyConfig, ensureDir, resolveOutputDir } from '@chonkylang/transpiler';
import type { ChonkyConfig, SilentModeConfig } from '@chonkylang/transpiler';

interface OptimizationSuggestion {
  type: string;
  file: string;
  description: string;
  autoApplicable: boolean;
  estimatedSaving?: string;
}

export function registerOptimizeCommand(program: Command): void {
  program
    .command('optimize')
    .description('Analyze and optimize project assets')
    .option('--root <path>', 'Project root directory', '.')
    .option('--silent', 'Run in silent mode (auto-apply safe optimizations)')
    .option('--dry-run', 'Show suggestions without applying them')
    .option('--report', 'Generate optimization report')
    .action(async (opts: { root: string; silent: boolean; dryRun: boolean; report: boolean }) => {
      const projectRoot = path.resolve(process.cwd(), opts.root);
      const config = loadChonkyConfig(projectRoot);
      const silentMode = opts.silent || config.optimizer?.silentMode?.all;

      console.log('\n  chonky optimize');
      console.log(`  Mode: ${silentMode ? 'silent' : 'interactive'}`);
      console.log(`  Dry run: ${opts.dryRun}\n`);

      const suggestions = analyze(projectRoot, config);

      if (suggestions.length === 0) {
        console.log('  No optimization suggestions found.\n');
        return;
      }

      console.log(`  Found ${suggestions.length} suggestion(s):\n`);

      for (const suggestion of suggestions) {
        const marker = suggestion.autoApplicable ? '✓' : '?';
        const saving = suggestion.estimatedSaving ? ` (~${suggestion.estimatedSaving})` : '';
        console.log(`  [${marker}] ${suggestion.type}: ${suggestion.description}${saving}`);
        console.log(`      ${suggestion.file}`);
      }

      if (silentMode && !opts.dryRun) {
        const applicable = suggestions.filter((s) => s.autoApplicable);
        console.log(`\n  Auto-applying ${applicable.length} safe optimization(s)...`);
        // Actual optimization logic will be implemented per type
        console.log('  Done.');
      }

      if (opts.report || config.ambiguity?.generateReport) {
        const reportDir = resolveOutputDir(projectRoot);
        ensureDir(reportDir);
        const reportPath = path.join(reportDir, 'optimize-report.json');
        fs.writeFileSync(
          reportPath,
          JSON.stringify({ timestamp: new Date().toISOString(), suggestions }, null, 2),
          'utf-8',
        );
        console.log(`\n  Report saved: ${path.relative(projectRoot, reportPath)}`);
      }

      console.log('');
    });
}

function analyze(projectRoot: string, config: ChonkyConfig): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  const silentConfig: SilentModeConfig = config.optimizer?.silentMode ?? {};

  // Image format analysis
  if (silentConfig.imageFormatConversion !== false) {
    suggestions.push(...analyzeImages(projectRoot));
  }

  // Unused asset detection
  if (silentConfig.unusedAssetRemoval) {
    suggestions.push(...findUnusedAssets(projectRoot));
  }

  return suggestions;
}

function analyzeImages(projectRoot: string): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  const publicDir = path.join(projectRoot, 'public');
  const srcDir = path.join(projectRoot, 'src');

  for (const dir of [publicDir, srcDir]) {
    if (!fs.existsSync(dir)) continue;
    const images = collectFilesByExt(dir, ['.png', '.jpg', '.jpeg', '.bmp', '.gif']);

    for (const img of images) {
      const stat = fs.statSync(img);
      const relPath = path.relative(projectRoot, img);
      const ext = path.extname(img).toLowerCase();

      if (['.png', '.jpg', '.jpeg', '.bmp'].includes(ext) && stat.size > 50 * 1024) {
        suggestions.push({
          type: 'image-format',
          file: relPath,
          description: `Convert ${ext} to WebP for better compression`,
          autoApplicable: true,
          estimatedSaving: `${Math.round(stat.size * 0.3 / 1024)}KB`,
        });
      }
    }
  }

  return suggestions;
}

function findUnusedAssets(projectRoot: string): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  const publicDir = path.join(projectRoot, 'public');
  if (!fs.existsSync(publicDir)) return suggestions;

  const assets = collectFilesByExt(publicDir, [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.woff', '.woff2', '.ttf', '.eot',
  ]);

  const srcDir = path.join(projectRoot, 'src');
  if (!fs.existsSync(srcDir)) return suggestions;

  const sourceFiles = collectFilesByExt(srcDir, ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss']);
  const allSourceContent = sourceFiles.map((f) => fs.readFileSync(f, 'utf-8')).join('\n');

  for (const asset of assets) {
    const basename = path.basename(asset);
    if (!allSourceContent.includes(basename)) {
      suggestions.push({
        type: 'unused-asset',
        file: path.relative(projectRoot, asset),
        description: `Asset "${basename}" appears unused in source files`,
        autoApplicable: false,
      });
    }
  }

  return suggestions;
}

function collectFilesByExt(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      results.push(...collectFilesByExt(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.toLowerCase().endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results;
}
