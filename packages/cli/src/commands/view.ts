import { Command } from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { toSemanticView } from '@chonkylang/transpiler';

export function registerViewCommand(program: Command): void {
  program
    .command('view <file>')
    .description('Display a semantic, human-readable view of a Chonky source file')
    .option('--root <path>', 'Project root directory', '.')
    .option('-o, --output <path>', 'Write output to file instead of stdout')
    .option('--no-color', 'Disable syntax highlighting')
    .action(async (file: string, opts: { root: string; output?: string; color: boolean }) => {
      const projectRoot = path.resolve(process.cwd(), opts.root);
      const filePath = path.resolve(process.cwd(), file);

      if (!fs.existsSync(filePath)) {
        console.error(`  Error: file not found — ${file}`);
        process.exit(1);
      }

      const source = fs.readFileSync(filePath, 'utf-8');
      const result = toSemanticView(source, filePath, {
        projectRoot,
        includeManifestComments: true,
        stripChonkyIds: true,
      });

      if (opts.output) {
        const outPath = path.resolve(process.cwd(), opts.output);
        const outDir = path.dirname(outPath);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        fs.writeFileSync(outPath, result.code, 'utf-8');
        console.log(`\n  Semantic view written to: ${path.relative(process.cwd(), outPath)}`);
      } else {
        const output = opts.color ? highlight(result.code) : result.code;
        console.log('');
        console.log(output);
      }

      if (result.requirementIds.length > 0) {
        console.log(`\n  Requirements found: ${result.requirementIds.join(', ')}\n`);
      }
    });
}

const KEYWORD_RE = /\b(import|export|from|const|let|var|function|return|if|else|for|while|switch|case|break|continue|default|class|extends|implements|interface|type|enum|async|await|new|throw|try|catch|finally|typeof|instanceof|void|null|undefined|true|false|this|super|as|in|of|yield|static|readonly|public|private|protected|abstract|declare|module|namespace|require)\b/g;
const STRING_RE = /(["'`])(?:(?!\1|\\).|\\.)*\1/g;
const COMMENT_LINE_RE = /\/\/.*$/gm;
const COMMENT_BLOCK_RE = /\/\*[\s\S]*?\*\//g;
const NUMBER_RE = /\b\d+(?:\.\d+)?\b/g;
const MACHINE_ASSERT_RE = /\bmachine\s*:\s*assert\b/g;

function highlight(code: string): string {
  let chalk: typeof import('chalk') | null = null;
  try {
    chalk = require('chalk');
  } catch {
    return code;
  }

  const c = chalk as unknown as {
    blue: (s: string) => string;
    green: (s: string) => string;
    gray: (s: string) => string;
    yellow: (s: string) => string;
    magenta: (s: string) => string;
  };

  const tokens: Array<{ start: number; end: number; replace: string }> = [];

  function collect(re: RegExp, transform: (match: string) => string) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, replace: transform(m[0]) });
    }
  }

  collect(COMMENT_BLOCK_RE, (s) => c.gray(s));
  collect(COMMENT_LINE_RE, (s) => c.gray(s));
  collect(STRING_RE, (s) => c.green(s));
  collect(MACHINE_ASSERT_RE, (s) => c.magenta(s));
  collect(KEYWORD_RE, (s) => c.blue(s));
  collect(NUMBER_RE, (s) => c.yellow(s));

  // Sort by start; resolve overlaps by priority (comments > strings > keywords)
  tokens.sort((a, b) => a.start - b.start || b.end - a.end);

  const result: string[] = [];
  let pos = 0;
  const used = new Set<number>();

  for (const token of tokens) {
    let overlaps = false;
    for (let i = token.start; i < token.end; i++) {
      if (used.has(i)) { overlaps = true; break; }
    }
    if (overlaps) continue;

    if (token.start > pos) {
      result.push(code.slice(pos, token.start));
    }
    result.push(token.replace);
    for (let i = token.start; i < token.end; i++) {
      used.add(i);
    }
    pos = token.end;
  }

  if (pos < code.length) {
    result.push(code.slice(pos));
  }

  return result.join('');
}
