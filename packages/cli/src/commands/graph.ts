import { Command } from 'commander';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { ensureDir, resolveOutputDir } from '@chonky/transpiler';

interface DependencyNode {
  id: string;
  type: 'requirement' | 'component' | 'module';
  file: string;
  dependsOn: string[];
  dependedBy: string[];
}

interface DependencyGraph {
  nodes: Record<string, DependencyNode>;
  totalNodes: number;
  totalEdges: number;
  generatedAt: string;
}

export function registerGraphCommand(program: Command): void {
  program
    .command('graph')
    .description('Generate requirement dependency graph')
    .option('--root <path>', 'Project root directory', '.')
    .option('--format <format>', 'Output format (json | dot | mermaid)', 'json')
    .option('-o, --output <path>', 'Output file path')
    .action(async (opts: { root: string; format: string; output?: string }) => {
      const projectRoot = path.resolve(process.cwd(), opts.root);

      console.log('\n  chonky graph');
      console.log(`  Scanning requirements in ${projectRoot}...\n`);

      const graph = buildGraph(projectRoot);

      console.log(`  Found ${graph.totalNodes} node(s), ${graph.totalEdges} edge(s).`);

      let output: string;
      let ext: string;

      switch (opts.format) {
        case 'dot':
          output = toDot(graph);
          ext = '.dot';
          break;
        case 'mermaid':
          output = toMermaid(graph);
          ext = '.mmd';
          break;
        default:
          output = JSON.stringify(graph, null, 2);
          ext = '.json';
      }

      const outPath =
        opts.output ??
        path.join(resolveOutputDir(projectRoot), `dependency-graph${ext}`);
      ensureDir(path.dirname(outPath));
      fs.writeFileSync(outPath, output, 'utf-8');
      console.log(`  Output: ${path.relative(projectRoot, outPath)}\n`);
    });
}

function buildGraph(projectRoot: string): DependencyGraph {
  const requirementsDir = path.join(projectRoot, '.chonky', 'requirements');
  const nodes: Record<string, DependencyNode> = {};
  let totalEdges = 0;

  if (!fs.existsSync(requirementsDir)) {
    return { nodes, totalNodes: 0, totalEdges: 0, generatedAt: new Date().toISOString() };
  }

  // Load all requirement manifests
  const files = fs.readdirSync(requirementsDir).filter((f) => f.endsWith('.json') && f !== 'index.json');

  for (const file of files) {
    try {
      const content = JSON.parse(
        fs.readFileSync(path.join(requirementsDir, file), 'utf-8'),
      );
      const id = content.id as string;
      if (!id) continue;

      nodes[id] = {
        id,
        type: 'requirement',
        file: content.sourceFile ?? file,
        dependsOn: (content.dependsOn as string[]) ?? [],
        dependedBy: [],
      };
    } catch { /* skip corrupt manifests */ }
  }

  // Build reverse edges
  for (const node of Object.values(nodes)) {
    for (const depId of node.dependsOn) {
      if (nodes[depId]) {
        nodes[depId].dependedBy.push(node.id);
        totalEdges++;
      }
    }
  }

  return {
    nodes,
    totalNodes: Object.keys(nodes).length,
    totalEdges,
    generatedAt: new Date().toISOString(),
  };
}

function toDot(graph: DependencyGraph): string {
  const lines = ['digraph ChonkyDeps {', '  rankdir=LR;'];
  for (const node of Object.values(graph.nodes)) {
    lines.push(`  "${node.id}" [label="${node.id}"];`);
    for (const dep of node.dependsOn) {
      lines.push(`  "${node.id}" -> "${dep}";`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

function toMermaid(graph: DependencyGraph): string {
  const lines = ['graph LR'];
  for (const node of Object.values(graph.nodes)) {
    lines.push(`  ${sanitizeMermaidId(node.id)}["${node.id}"]`);
    for (const dep of node.dependsOn) {
      lines.push(`  ${sanitizeMermaidId(node.id)} --> ${sanitizeMermaidId(dep)}`);
    }
  }
  return lines.join('\n');
}

function sanitizeMermaidId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}
