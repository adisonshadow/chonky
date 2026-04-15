import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';

/** Minimal manifest fields used for search / agent-friendly output. */
export interface RequirementSearchHit {
  id: string;
  name?: string;
  description?: string;
  sourceFile?: string;
  manifestPath: string;
  origin?: string;
  implementationStatus?: string;
  verificationStatus?: string;
  dependsOn?: string[];
}

export function registerRequirementsCommand(program: Command): void {
  const requirements = program
    .command('requirements')
    .description('Inspect compiled requirement manifests (.chonky/requirements/)');

  requirements
    .command('search')
    .description(
      'Search requirements by id, text fields, triggers, conditions, side effects (JSON output for agents)',
    )
    .argument('[terms...]', 'Terms that must all match (case-insensitive), or use --all')
    .option('--root <path>', 'Project root directory', '.')
    .option('--json', 'Print a single JSON object to stdout (for LLM / CI)', false)
    .option('--all', 'List every requirement (ignore terms)', false)
    .option('--limit <n>', 'Maximum matches', '100')
    .action(
      async (
        terms: string[] | undefined,
        opts: { root: string; json: boolean; all: boolean; limit: string },
      ) => {
        const projectRoot = path.resolve(process.cwd(), opts.root);
        const limit = Math.max(1, parseInt(opts.limit, 10) || 100);
        const termList = normalizeTerms(terms);

        if (!opts.all && termList.length === 0) {
          console.error(
            '  Usage: chonky requirements search <term> [term...]\n' +
              '         chonky requirements search --all\n' +
              '  Tip: run `chonky build` first so manifests exist under .chonky/requirements/.\n',
          );
          process.exit(1);
        }

        const manifests = loadRequirementManifests(projectRoot);
        if (manifests.length === 0) {
          const msg =
            'No requirement manifests found. Run `chonky build` (or your bundler with the Chonky plugin) from the project root.';
          if (opts.json) {
            console.log(
              JSON.stringify(
                {
                  projectRoot,
                  terms: opts.all ? [] : termList,
                  all: opts.all,
                  count: 0,
                  results: [],
                  error: msg,
                },
                null,
                2,
              ),
            );
          } else {
            console.error(`  ${msg}\n`);
          }
          process.exit(1);
        }

        const haystackById = new Map<string, { hit: RequirementSearchHit; haystack: string }>();
        for (const { manifestPath, data } of manifests) {
          const hit = manifestToHit(manifestPath, data);
          haystackById.set(hit.id, { hit, haystack: buildHaystack(data) });
        }

        let results: RequirementSearchHit[];
        if (opts.all) {
          results = [...haystackById.values()].map((x) => x.hit).sort((a, b) => a.id.localeCompare(b.id));
        } else {
          results = [...haystackById.values()]
            .filter(({ haystack }) => matchesAllTerms(haystack, termList))
            .map((x) => x.hit)
            .sort((a, b) => a.id.localeCompare(b.id));
        }

        const truncated = results.length > limit;
        results = results.slice(0, limit);

        if (opts.json) {
          console.log(
            JSON.stringify(
              {
                projectRoot,
                terms: opts.all ? [] : termList,
                all: opts.all,
                count: results.length,
                truncated,
                limit,
                results,
              },
              null,
              2,
            ),
          );
          return;
        }

        const label = opts.all ? 'all requirements' : `matches for ${termList.map((t) => JSON.stringify(t)).join(' + ')}`;
        console.log(`\n  chonky requirements search — ${results.length}${truncated ? ` (limit ${limit})` : ''} ${label}\n`);
        for (const r of results) {
          const title = r.name ? `${r.id}  ${r.name}` : r.id;
          console.log(`  ${title}`);
          if (r.description) {
            console.log(`    ${r.description}`);
          }
          if (r.sourceFile) {
            console.log(`    source: ${r.sourceFile}`);
          }
          console.log(`    manifest: ${r.manifestPath}`);
          const meta = [r.origin, r.implementationStatus, r.verificationStatus].filter(Boolean).join(' · ');
          if (meta) {
            console.log(`    ${meta}`);
          }
          console.log('');
        }
        if (truncated) {
          console.log(`  (truncated; use --limit to raise the cap)\n`);
        }
      },
    );
}

function normalizeTerms(terms: string[] | undefined): string[] {
  if (!terms || terms.length === 0) {
    return [];
  }
  return terms.map((t) => t.trim()).filter(Boolean);
}

function loadRequirementManifests(
  projectRoot: string,
): Array<{ manifestPath: string; data: Record<string, unknown> }> {
  const requirementsDir = path.join(projectRoot, '.chonky', 'requirements');
  if (!fs.existsSync(requirementsDir)) {
    return [];
  }
  const out: Array<{ manifestPath: string; data: Record<string, unknown> }> = [];
  for (const file of fs.readdirSync(requirementsDir)) {
    if (!file.endsWith('.json') || file === 'index.json') {
      continue;
    }
    const full = path.join(requirementsDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(full, 'utf-8')) as Record<string, unknown>;
      if (typeof data.id !== 'string' || !data.id) {
        continue;
      }
      out.push({
        manifestPath: path.relative(projectRoot, full).split(path.sep).join('/'),
        data,
      });
    } catch {
      /* skip corrupt */
    }
  }
  return out;
}

function buildHaystack(data: Record<string, unknown>): string {
  const parts: string[] = [];
  const stringKeys = [
    'id',
    'name',
    'description',
    'sourceFile',
    'origin',
    'implementationStatus',
    'verificationStatus',
  ] as const;
  for (const key of stringKeys) {
    const v = data[key];
    if (typeof v === 'string') {
      parts.push(v);
    }
  }
  for (const key of ['triggers', 'preconditions', 'postconditions', 'sideEffects', 'dependsOn'] as const) {
    const v = data[key];
    if (v !== undefined && v !== null) {
      parts.push(JSON.stringify(v));
    }
  }
  if (data.metadata !== undefined && data.metadata !== null) {
    parts.push(JSON.stringify(data.metadata));
  }
  return parts.join(' ').toLowerCase();
}

function matchesAllTerms(haystack: string, terms: string[]): boolean {
  for (const t of terms) {
    const n = t.toLowerCase();
    if (!haystack.includes(n)) {
      return false;
    }
  }
  return true;
}

function manifestToHit(
  manifestPath: string,
  data: Record<string, unknown>,
): RequirementSearchHit {
  const id = data.id as string;
  const hit: RequirementSearchHit = {
    id,
    manifestPath,
  };
  if (typeof data.name === 'string') {
    hit.name = data.name;
  }
  if (typeof data.description === 'string') {
    hit.description = data.description;
  }
  if (typeof data.sourceFile === 'string') {
    hit.sourceFile = data.sourceFile.split(path.sep).join('/');
  }
  if (typeof data.origin === 'string') {
    hit.origin = data.origin;
  }
  if (typeof data.implementationStatus === 'string') {
    hit.implementationStatus = data.implementationStatus;
  }
  if (typeof data.verificationStatus === 'string') {
    hit.verificationStatus = data.verificationStatus;
  }
  if (Array.isArray(data.dependsOn) && data.dependsOn.every((x) => typeof x === 'string')) {
    hit.dependsOn = data.dependsOn as string[];
  }
  return hit;
}
